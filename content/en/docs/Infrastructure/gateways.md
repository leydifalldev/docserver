---
title: "Gateways Pool"
date: 2022-12-28T21:48:04+01:00
weight: 4
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 4
---
## 1. Présentation
Gateway pool est un ensemble de hosts répliqués qui servent essentiellement de proxy entre gateway-network et box-network mais aussi permettent d'exposer les NodeIP du cluster Kubernetes. Ces serveurs sont des noeuds Kubernetes auxquelles les services exposent les pods

## 2. Roles
Sur chaque serveur est répliqué HAProxy qui route le traffic. Ce tyoe d'architecture permet de protèger le réseau principal de la box.
C'est la police aux frontières entre **box-network** et **cluster-gateway**. Un service ou API n'est utilisé par les webserveurs seulement s'il est déclaré sur le gateway

![infra](images/gateway-pool-archi.png)

Gateway Pool est scindé en 2 groupe:

## 3. kube-gateway-pool
### 3.1. Roles
Ce groupe est un composant du cluster Kubernetes permettant à ce dernier d'exposer ses services.
En effet l'exposition des services du cluster aux webserver passe par ce groupe de machines et uniquement.

![infra](images/kube-gateway-archi.jpg)

### 3.2. Networking
![infra](images/kube-gateway-network-archi.png)

- Interfaces réseaux:
  - <span style="color:#17EAD9">**gateway-network**</span>
  - <span style="color:#FA6400">**box-network**</span>
### 3.3. Volumes
![infra](images/kube-gateway-volume.png)
### 3.4. Installation 
Pour former le groupe, il faut le déclarer dans l'inventory principale

```yaml
    kube_gateway_pool:
      hosts:
        gateway-1:
        gateway-2:
        gateway-3:
```
### 3.5. Routage
Les services Kubernetes ne peuvent franchir les gateways que s'ils sont déclarés dans :

![infra](images/kube-gateway-dir.png)

Déclaration:
- inventory principale

``` yaml
    app:
      arogcd:
        port: XXXXX
      pgadmin4:
        port: XXXXX
      dash:
        port: XXXXX
      keycloak:
        port: XXXXX
      kibana:
        port: XXXXX
      v-admin:
        port: XXXXX
```

- Declaration dans group vars (Magics variables)

```yaml
proxies:
  target:
    group: kube_gateway_pool 
  routes:
    pgadmin4:
      mode: http
      address: "*"
      port: "{{ app.pgadmin4.port }}"
      destination:
        group:
          name: kube_gateway_pool
          port: "{{ app.pgadmin4.port }}"
        balance: roundrobin
        options:
          - httplog

    argocd:
      mode: http
      address: "*"
      port: "{{ app.arogcd.port }}"
      destination:
        group:
          name: kube_gateway_pool
          port: "{{ app.arogcd.port }}"
        balance: roundrobin
        options:
          - httplog
    
    dash:
      mode: http
      address: "*"
      port: "{{ app.dash.port }}"
      destination:
        group:
          name: kube_gateway_pool
          port: "{{ app.dash.port }}"
        balance: roundrobin
        options:
          - httplog

    keycloak:
      mode: http
      address: "*"
      port: "{{ app.keycloak.port }}"
      destination:
        group:
          name: kube_gateway_pool
          port: "{{ app.keycloak.port }}"
        balance: roundrobin
        options:
          - httplog

    kibana:
      mode: http
      address: "*"
      port: "{{ app.kibana.port }}"
      destination:
        group:
          name: kube_gateway_pool
          port: "{{ app.kibana.port }}"
        balance: roundrobin
        options:
          - httplog

    v-admin:
      mode: http
      address: "*"
      port: "{{ app.v-admin.port }}"
      destination:
        group:
          name: kube_gateway_pool
          port: "{{ app.v-admin.port }}"
        balance: roundrobin
        options:
          - httplog
```
### 3.6. Haute disponibilité
La haute disponibilité est assurée par la réplication. On dispose de 3 machines disposant plus ou moins de la même configuration

![infra](images/kube-gateway-ha.png)
### 3.7. Sécurité
  - iptables: géré par kubernetes

### 3.8. Applications
- <span style="color:orange">**HAProxy**</span> pour router le trafic
- <span style="color:orange">**GlusterFS**</span> pour clusteriser les volumes
- <span style="color:orange">**Kubernetes services**</span> pour exposer les déploiements
- <span style="color:orange">**Containerd**</span> comme containers runtime
## 4. nat-gateway-pool
### 3.1. Roles

Ce groupe sert principalement:
- à acheminer les requêtes vers internet (<span style="color:orange;font-weight:Bold">Iptables, Netplan</span>)
- à servir les applications internes du boitier précisément les applications utilisées uniquement pour le fonctionnement du boitier
- à assurer le monitoring de l'infrastructure (<span style="color:orange;font-weight:Bold">Prometheus, Grafana</span>) et des services (<span style="color:orange;font-weight:Bold">Consul</span>). En effet c'est le seul groupe qui a accès aux divers réseaux, ce qui lui donne la légitimité de surveiller l'ensemble des unités logiques de linfrastructure

![infra](images/nat-gateway-archi.png)
### 3.2. Networking
![infra](images/nat-gateway-network.png)

- Interfaces réseaux:
  - <span style="color:#17EAD9">**gateway-network**</span>
  - <span style="color:#FA6400">**box-network**</span>
  
### 3.3. Volumes
![infra](images/gateway-shared-volume.png)
### 3.4. Installation 
```yaml
    nat_gateway_pool:
      vars:
        output_interface: gateway-network
        input_interface: box-network
        vips:
          box-network:
            virtual_router_id: 5
            vip: 192.168.1.254
      hosts:
        gateway-4:
          box-network:
            priority: 200
            state: MASTER
        gateway-5:
          box-network:
            priority: 100
            state: BACKUP
```
### 3.5. Routage
Chaque machine de nat-gateway-pool a principalement comme role de router le trafic vers les services fonctionnels du boitier, c'est à dire les applications servant à manager ou surveiller le bon fonctionnement du cluster. Parmi les application on peut citer **Grafana**, **Prometheus**, **Consult**, **Gitlab**

### 3.6. Haute disponibilité
![infra](images/nat-gateway-ha.png)
### 3.7. Sécurité
- iptables (à compléter)
### 3.8. Applications
- <span style="color:orange;font-weight:Bold">Grafana</span>
- <span style="color:orange;font-weight:Bold">Prometheus</span> 
- <span style="color:orange;font-weight:Bold">Consul</span>
- <span style="color:orange;font-weight:Bold">Gitlab</span>

