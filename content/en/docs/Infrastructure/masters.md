---
title: "Masters Pool"
date: 2022-12-28T21:48:04+01:00
weight: 7
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 7
---
## 1. Présentation

Dans l'infra, on dispose de 3 masters qui assurent le clustering de **Kubernetes** ainsi que les masters applicatifs d'autres programmes.

## 2. Roles

![master-1](images/infra/masters/masters-1.png)

Emplacement dans le cluster

![master-1](images/master-pool-position.png)

## 3. Networking

### 3.1. Interfaces
  - <span style="color:#FA6400">**box-network**</span>

## 4. Volumes

![master-sidecar](images/master-volumes-cluster.png)

## 5. Haute disponibilité

La haute disponibilité est mieux décrite dans la section <a href="/docs/kubernetes/architecture/">Kubernetes</a>

## 6. Sécurité
- <span style="color:orange;font-weight:Bold">iptables</span> gérés par kubernetes
- <span style="color:orange;font-weight:Bold">Istio</span> à installer pour les communications TLS internes
## 7. Applications
- <span style="color:orange;font-weight:Bold">Elasticsearch masters</span>
- <span style="color:orange;font-weight:Bold">Kubernetes masters</span>
- <span style="color:orange;font-weight:Bold">Kubeadm</span>
- <span style="color:orange;font-weight:Bold">Kubectl</span>
- <span style="color:orange;font-weight:Bold">Kustomize</span>
- <span style="color:orange;font-weight:Bold">KeepAlived</span>
- <span style="color:orange;font-weight:Bold">HAProxy</span>
- <span style="color:orange;font-weight:Bold">GlusterFS</span>
- <span style="color:orange;font-weight:Bold">Calico</span>

## 8. L'installation
L'installation est décrite en détails dans la section <a href="/docs/kubernetes/architecture/">Kubernetes</a>
