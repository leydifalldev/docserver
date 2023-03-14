---
title : "Proxiserver"
description: "Prologue Doks."
lead: ""
date: 2020-10-06T08:48:45+00:00
lastmod: 2020-10-06T08:48:45+00:00
draft: false
images: []
weight: 3
---

### 1. Présentation

Proxiserver est la combinaison des webservers et gateways qui joue un role fondamental dans le système.
Les webservers n'ont pas accès direct au réseau principal et services de l'infrastructure. Pour exposer les applications sur internet ou autres réseaux externes, les serveurs web doivent interroger les services via les gateways. 

### 2. Architecture et Networking

![infra](images/gateway-pool-network.png)

Les webservers et gateways communiquent dans un réseau privé particulier et sont les seuls à y accéder. C'est choix conditionné par la gestion du certificat qu'on étudiera dans le prochain chapitre.

### 3. Exemple de configuration du routage

``` yaml
prometheus:
  gateway:
    mode: http
    address: "*"
    port: 9090
    destination:
      addresses: 
        - name: supervisor-1
          address: 192.168.1.6
          port: 9090
      balance: roundrobin
      options:
        - httplog
  webserver:
    - location: /prometheus/
      params:
        proxy_pass:
          values: "http://{{ gateway_external_vip }}:9090/prometheus/"

grafana:
  gateway:
    mode: http
    address: "*"
    port: 3000
    destination:
      addresses: 
        - name: supervisor-1
          address: 192.168.1.6
          port: 3000
      balance: roundrobin
      options:
        - httplog
```
Configuration HAProxy générée par le framework protobox

![infra](images/proxiserver/haproxy-result.png)

## 4. Certificats
### 4.1. Patterns d'ecryptage

![infra](images/proxiserver/pattern-tls.png)

#### 4.1.1. Pattern EDGE

Ce mode convient aux connexions dans un réseau interne hautement sécurisé où le proxy inverse maintient une connexion sécurisée (HTTP sur TLS) avec les clients tout en communiquant avec l'application en mode HTTP sans TLS. Ce mode de fontionnement permet d'avoir un TLS commun à un ensemble d'applications

#### 4.1.2. Pattern PASSTHROUGH

Ce mode convient aux applications configurées pour fournir leurs propres certificats. Pour éviter d'encrypter 2 fois la communication au détriment des performances, le reverse proxy utilise une communication HTTP pour faire un BYPASS

#### 4.1.3. Pattern RE-ENCRYPT

Ce mode renforce considérablement la sécurité en utilisant 2 encryptages différents. Pour cela 2 certificats sont installés:
- Un certicat front est installé sur le reverse proxy pour encrypter la communication avec le client
- Un certificat back qui établit une connection TLS entre le reverse et le client

### 5. Choix Pattern pour le proxiserver
#### 5.1. Communication HTTP/HTTPS
![infra](images/archi-tls.png)

#### 5.2. Interfaçage réseau
