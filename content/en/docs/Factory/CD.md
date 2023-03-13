---
title: "CD (GitOps)"
date: 2022-12-28T21:48:04+01:00
weight: 3
menu:
  main:
    title: ""
    parent: "templates"
    weight: 3
---

## 1. Présentation
Notre CD (Continuous Delivery) repose sur le principe de **GitOps**. En effet GitOps est une pratique qui consiste à conceptualiser et planifier les opérations liées à l'évolution d'un environnement applicatif sur la base d'un ou plusieurs repository Git. Notre CD est géré par ArgoCD qui est un outil réputé pour son efficacité.

## 2. ArgoCD
![infra](images/argocd-ui.png)
### 2.1. Installation
Dans le logiciel protobox, le role factory/argocd permet de déployer ArgoCD dans le cluster Kubernetes.
```yml
- name: Setup supervisor host
  hosts: supervisor-1
  become: true
  user: supervisor
  gather_facts: false
  roles:
    ...
    - role: factory/argocd
    ...
```
### 2.2. Configuration d'application
Pour instaurer le mécanisme de déploiement d'une application dans le système ArgoCD, il ajouter créer l'objet Kubernetes de type Application. La déclaration s'effectue dans le repertoire suivant pour chaque projet:

```
factory > CD > argo > application.yml
```
### Exemple d'application

```yml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: argo-docserver
  namespace: argocd
spec:
  project: default
  source:
    repoURL: http://192.168.1.7/gitlab/protobox1/docserver.git
    targetRevision: CD
    path: factory/CD/base
  destination: 
    server: https://kubernetes.default.svc
  syncPolicy:
    syncOptions:
    - CreateNamespace=true
```
![infra](images/argocd-ui-2.png)

### 2.3. Amélioration à apporter
En effet un problème de résolution de DNS se pose actuellement au sein du conteneur argocd-server n'ayant pas la capacité de trouver les nom de domaine des serveurs privés gitlab. Dans l'exemple ci dessus le lien du répository git comporte une ip et non le nom de domaine correspondante. argo-server lance un message
```
dial tcp: lookup git.protobox on 169.254.25.10:53: no such host
```

Pour remédier à ce problème 2 pistes s'offrent à nous (pour le moment en tout cas):

**1e piste**. Combiner CoreDNS à consul ou DNSMASQ pour la résolution DNS de nos repositories git.

```
------------------
| CoreDNS/Consul |
------------------
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    addonmanager.kubernetes.io/mode: EnsureExists
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        <Existing CoreDNS definition>
    }
+   consul {
+     errors
+     cache 30
+     forward . <consul-address>
+   }
```

```
------------------
| CoreDNS/DNSMASQ |
------------------
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    addonmanager.kubernetes.io/mode: EnsureExists
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        <Existing CoreDNS definition>
    }
+   dnsmasq {
+     errors
+     cache 30
+     forward . <-dnsmasq-address>
+   }
```

**2e piste** Cette piste consiste à forcer /etc/hosts de la machine hôte dans le conteneur argocd-server