---
title: "Architecture"
date: 2022-12-28T21:48:04+01:00
weight: 1
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 1
---
## 1. Présentation
### 1.1. Disposition

![infra](images/infra-1.svg)

### 1.2. Topologie réseaux (Global)
![infra](images/infra-network-1.png)

### 1.3. Topologie réseaux (Interface)
![infra](images/infra-network-2.png)

## 2. Webserver Pool
- Inventaires:
  <span style="color:orange">**2**</span> intel nuc celeron
- Roles: 
  - <span style="color:orange;font-weight:Bold">Webserver</span>
  - <span style="color:orange;font-weight:Bold">Proxy</span>
  - <span style="color:orange;font-weight:Bold">Reverse-proxy</span>
  - <span style="color:orange;font-weight:Bold">Gestion de certificates</span>
- Interfaces réseaux:
  - <span style="color:#59AE01">**public-network**</span>
  - <span style="color:#17EAD9">**gateway-network**</span>
## 3. Gateway Pool
- Inventaires:
  <span style="color:orange">**5**</span> intel nuc celeron
- Roles:
  - <span style="color:orange;font-weight:Bold">Proxy</span>
  - <span style="color:orange;font-weight:Bold">Reverse-proxy</span>
  - <span style="color:orange;font-weight:Bold">Server DHCP</span>
  - <span style="color:orange;font-weight:Bold">NAT Gateway</span>
  - <span style="color:orange;font-weight:Bold">Kubernetes services</span>
  - <span style="color:orange;font-weight:Bold">Monitoring</span>
- Interfaces réseaux:
  - <span style="color:#17EAD9">**gateway-network**</span>
  - <span style="color:#FA6400">**box-network**</span>
## 4. Database Pool
- Inventaires:
  <span style="color:orange">**3**</span> intel nuc celeron
- Roles:
  - <span style="color:orange;font-weight:Bold">Servers de base de données</span>
- Interfaces réseaux:
  - <span style="color:#FA6400">**box-network**</span>
## 5. Search-engine Pool
- Inventaires:
  <span style="color:orange">**3**</span> intel nuc celeron
- Roles:
  - <span style="color:orange;font-weight:Bold">Moteur de recherche</span>
- Interfaces réseaux:
  - <span style="color:#FA6400">**box-network**</span>
## 6. Nodes
- Inventaires:
  <span style="color:orange">**2**</span> intel nuc celeron
- Roles:
  - <span style="color:orange;font-weight:Bold">Server d'applications</span>
- Interfaces réseaux:
  - <span style="color:#FA6400">**box-network**</span>
## 7. Master Pool
- Inventaires:
  <span style="color:orange">**3**</span> intel nuc celeron
- Roles:
  - <span style="color:orange;font-weight:Bold">Management Cluster Kubernetes</span>
  - <span style="color:orange;font-weight:Bold">Management Cluster applicatif</span>
  - <span style="color:orange;font-weight:Bold">Stockage de backup</span>
- Interfaces réseaux:
  - <span style="color:#FA6400">**box-network**</span>
## 8. Supervisor

- Inventaires:
  <span style="color:orange">**1**</span> intel nuc i3
- Roles:
  - <span style="color:orange;font-weight:Bold">Bastion</span>
  - <span style="color:orange;font-weight:Bold">Stockage de backup</span>
  - <span style="color:orange;font-weight:Bold">Containers Registry</span>
  - <span style="color:orange;font-weight:Bold">Usine logiciel</span>
- Interfaces réseaux:
  - <span style="color:#FA6400">**box-network**</span>