---
title: "CI (Gitlab CI)"
date: 2022-12-28T21:48:04+01:00
weight: 2
menu:
  main:
    title: ""
    parent: "templates"
    weight: 2
---

## 1. Introduction
La CI est un des piliers de l'usine logiciel. C'est la phase qui construit pour la plupart des cas, le package d'une application. Les applications modernes sont souvent déployer sous forme de conteneurs. Du coup la construction et le stockage de leurs images s'effectuent pendant les étapes de la CI. Pour construire des images conteneurisées, il est impératif d'avoir un dépot git et un registry de conteneurs. Dans ce projet ces 2 éléments sont locaux, l'infrastructure dispose d'un serveur pour les 2 fonctionnalités. Notre choix est porté sur Gitlab Server qui fédére les 2.

## 2. Gitlab server
![infra](images/gitlab-server-supervisor-1.svg)
### 2.1. Installation
L'installation passe par un le role factory/gitlab qui selon le runtime spécifié lance Gitlab en mode container ou systemd
```yml
-------------------------------------------------------------
| path: playbooks-supervisor-pool/install.yml               |
-------------------------------------------------------------
- name: Setup supervisor host
  hosts: supervisor-1
  become: true
  user: supervisor
  gather_facts: false
  roles:
    ...
    - {role: factory/gitlab, runtime: "systemd", install: true}
    ...
```
### 2.2. Configuration
```yml
-------------------------------------------------------------
| path: roles/factory/gitlab/templates/systemd/gitlab.rb.j2 |
-------------------------------------------------------------
external_url 'http://git.protobox/gitlab'
pages_external_url 'http://pages.protobox'
gitlab_rails['initial_root_password'] = 'XXXXXXX'
git_data_dirs({
    "default" => {
        "path" => "/storage/shared/gitlab/data"
    }
})

letsencrypt['enable'] = false

nginx['listen_port'] = 80
```

## 3. Container Registry
Le constainer registry utilisé sur ce projet est celui embarqué dans Gitlab server (Désactivé par défaut). L'activation s'effectue au sein du fichier de configuration.
```yml
-------------------------------------------------------------
| path: roles/factory/gitlab/templates/systemd/gitlab.rb.j2 |
-------------------------------------------------------------
registry_external_url 'https://registry.protobox'
registry_nginx['listen_port'] = 443
registry_nginx['redirect_http_to_https'] = true
registry_nginx['ssl_certificate'] = "{{ tls['registry']['crt'] }}"
registry_nginx['ssl_certificate_key'] = "{{ tls['registry']['key'] }}"
```

## 4. Runners
Les runners sont les agents qui s'executent sur diverses machines pour exécuter des opérations télécommandées par Gitlab server.
Pour l'installer sur un serveur, protobox utilise le role factory/gitlab-runners

### Déclaration (Exemple)
```yml
----------------------------------------------------
| path: playbooks-proxiserver-pool/nat-install.yml |
----------------------------------------------------
- name: Install nat-gateway-pool
  hosts: nat_gateway_pool
  become: true
  user: supervisor
  gather_facts: false
  roles:
    ...
    - {role: factory/gitlab-runners, runtime: "systemd"}
    ...
```
### Configuration générée (Exemple)

```toml
----------------------------------------
| path: /etc/gitlab-runner/config.toml |
----------------------------------------
concurrent = 1
check_interval = 0
shutdown_timeout = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "gateway-3"
  url = "http://git.protobox/gitlab/"
  id = 6
  token = "XXXXXXXXXXXXXX"
  token_obtained_at = 2023-02-20T21:22:03Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "alpine"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
    shm_size = 0
    network_mode = "host"
```
## 5. Kustomize
Dans nos applications **Kustomize** est utilisé pour faire évoluer les versions des images qu'utilise **Kubernetes**. En effet cet outil nous permet également de personnaliser nos objets Kubernetes en fonction du type d'environnement (dev, test, homol, production etc) 

## 6. Pipelines
### 6.1. Configuration
Pour chaque application il faudra créer le répertoire suivant dans lequel il y'a le fichier .gitlab-ci.yml pour définir la pipeline. Ceci est une convention fixée pour l'ensemble de nos applications
```
factory/CD/.gitlab-ci.yml
```
Sur Gitlab server il faut également déclarer ce chemin.
```
project_name > Settings > CI/CD > CI/CD configuration file
```
![infra](images/gitlab-ci-input.png)
### 6.2. Processus
Les processus sont divers et peuvent être relatifs à chaque projet. Cependant la plupart des applications utilisées passent pour la plupart des cas, par ces 3 phases

![infra](images/pipeline-1.png)

### 6.2.1. Build
La phase de build comporte plusieurs étapes. Elle sert principalement à construire l'image du container en question. Pendant cette phase, l'image est également poussée vers le registry.
```yml
build:
  image: docker:stable
  stage: build
  services:
    - docker:dind
  before_script:
    - docker info
    - docker login -u $REGISTRY_USERNAME -p $REGISTRY_PASSWORD $REGISTRY_URL
  script: 
    - docker build -t $CI_REGISTRY_IMAGE/$CI_PROJECT_NAME:$CI_COMMIT_REF_NAME .
    - docker build -t $CI_REGISTRY_IMAGE/$CI_PROJECT_NAME:latest .
    - docker push $CI_REGISTRY_IMAGE/$CI_PROJECT_NAME:$CI_COMMIT_REF_NAME
    - docker push $CI_REGISTRY_IMAGE/$CI_PROJECT_NAME:latest
```
### 6.2.2. Update manifests
Cet étape permet la montée de version de l'image utilisée par **Kubernetes**. En effet lors de cette phase les manifests utilisés sont mise à jour afin qu'ils soient déployés dans le cluster. Pour se faire, le pipeline va solliciter **Kustomize**.
```yml
update_manifests:
  image: alpine:latest
  stage: update_manifests
  variables:
    GIT_STRATEGY: none
  retry: 2
  before_script:
    - apk add --no-cache git curl bash openssh
    - curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
    - mv kustomize /usr/local/bin/
    - cd
    - git clone --single-branch --branch $CI_COMMIT_REF_NAME http://supervisor:$SUPERVISOR_ACCESS_TOKEN@git.protobox/gitlab/protobox1/docserver.git
    - git config --global user.name $REGISTRY_USERNAME
    - git config --global user.email $CI_USER_EMAIL
  script:
    - echo $CI_PROJECT_NAME
    - cd $CI_PROJECT_NAME
    - git fetch --prune
    - git checkout ${ARGO_TARGET_REVISION}
    - cd factory/CD/base
    - kustomize edit set image $CI_REGISTRY_IMAGE/$CI_PROJECT_NAME:$CI_COMMIT_REF_NAME
    - cat kustomization.yaml
    - cat deployment.yml
    - git add .
    - git commit -m '[skip ci] [ARGOCD] ${CI_COMMIT_MESSAGE}'
    - git push origin $ARGO_TARGET_REVISION
```
### 6.2.3. Synchronize ArgoCD
La synchronisation consiste à déclencher indirectement le déploiement en le déléguant à ArgoCD. En effet sur nos applications ArgoCD se synchronisent manuellement (mode auto désactivé). De ce fait, après chaque mise à jour des manifests, le pipeline doit alerter ArgoCD afin que ce dernier puisse les récupérer.
```yml
synchronize_argo:
  image: alpine:latest
  stage: synchronize_argo
  variables:
    GIT_STRATEGY: none
  retry: 2
  before_script:
    - apk add jq curl git delta
    - curl -sSf -L -o /usr/local/bin/argocd "https://github.com/argoproj/argo-cd/releases/download/v${ARGOCD_VERSION}/argocd-linux-amd64"
    - chmod +x /usr/local/bin/argocd
    - argocd login "${ARGO_SERVER_URL}" --insecure --username "${ARGO_USER_ID}" --password "${ARGO_USER_PASSWORD}" --plaintext
  script:
    - argocd app get argo-${CI_PROJECT_NAME} --refresh > /dev/null 2>&1
    - argocd app sync argo-${CI_PROJECT_NAME} --assumeYes
```

## Variables
![infra](images/gitlab-variables.png)

## 7. Mirroir