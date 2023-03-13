---
title: "Supervisor Pool"
date: 2022-12-28T21:48:04+01:00
weight: 8
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 8
---
## 1. Présentation

Dans l'infra, on dispose de 3 masters qui assurent le clustering de **Kubernetes** ainsi que les masters applicatifs des autres programmes. Cette cohabitation est nommée **Sidecar**

## 2. Roles
Supervisor joue un grand role dans la gestion et le bon fonctionnement de cluster.

- Administration du cluster **Kubernetes** en interagissant avec le **Control plane**
- Stockage des backups via le réseau (**GlusterFS**)
- Commande le versionning et la CI avec **Gitlab Server**
- Management de l'infrastructure avec le logiciel protobox (**Ansible**)
- Joue le role de bastion pour l'accès ssh
- Externalisation de git sur un réseau privé destinée aux développeurs
- Bastion pour vscode

## 3. Networking

### 3.1 Interfaces
  - <span style="color:#FA6400">**box-network**</span>

## 4. Volumes
![supervisor-volumes](images/supervisor-volumes.png)

## 5. Applications
- <span style="color:orange;font-weight:Bold">Gitlab Server</span>
- <span style="color:orange;font-weight:Bold">Gitlab Containers Registry</span>
- <span style="color:orange;font-weight:Bold">Docker</span>
- <span style="color:orange;font-weight:Bold">Kubectl</span>
- <span style="color:orange;font-weight:Bold">Kustomize</span>
- <span style="color:orange;font-weight:Bold">GlusterFS</span>
- <span style="color:orange;font-weight:Bold">Ansible</span>

## 6. Installation

```yaml
- name: Setup supervisor host
  hosts: supervisor-2
  become: true
  user: supervisor
  gather_facts: false
  roles:
    - role: set-hostname
    - {role: network-setup}
    - {role: gateway, iptables: true, nginx_enabled: false, haproxy_enabled: false, iptables: false}
    - role: etc-hosts
    - role: monitoring/node-exporter
    - role: docker
    - role: docker-compose
    - role: dnsmasq
      vars:
        install: true
      vars:
        installation: false
    - {role: ldap, install: false}
    - role: factory/init
    - {role: factory/gitlab, runtime: "systemd", install: true}
    - role: kubernetes/kubectl-setup
      vars:
        distant_host: true
```

## 7. Bilan