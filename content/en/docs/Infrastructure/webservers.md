---
title: "Webservers Pool"
date: 2022-12-28T21:48:04+01:00
weight: 3
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 3
---
## 1. Présentation
Webservers pool est le point d'entrée public (internet) de l'infra. Ce sont des serveurs répliqués ayant les mêmes fonctions.
Ces serveurs s'interfacent sur 2 réseaux dont le réseau du fournisseur d'accès à internet et celui du réseau cluster-gateway.
En effet ces machines n'ont pas l'accès direct au réseau principal de la box (box-network) pour des raisons de sécurité.
Ces serveurs reçoivent les rêquêtes en provenance d'internet puis les transmettent aux serveurs de proxy (gateway-pool) 

![infra](images/webserver-archi-2.png)

Position dans l'infra

![infra](images/webserver-pool.svg)

## 2. Roles
Les webserveurs ont principalement 3 fonctions:

- serveur d'application avec <span style="color:orange"> **Nginx** </span>
- gestion et renouvellement du certificat utilisé avec <span style="color:orange">**Certbot**</span> et <span style="color:orange">**Let's Encrypt**</span> 
- routage vers internet avec <span style="color:orange">**Netplan**</span>

![infra](images/infra/webservers/webserver-2.png)

## 3. Networking
Ce groupe s'interface sur 2 réseaux:
  - <span style="color:#59AE01">**public-network**</span>
  pour router le trafic sur internet
  - <span style="color:#17EAD9">**gateway-network**</span>
  pour accéder aux services du cluster
## 4. Volumes
Le groupe webserver dispose d'un volume partagé permettant de partager des fichiers de configuration telque:
  - certificats
  - configurations nginx

![infra](images/webserver-volumes.png)

## 5. Haute disponibilité
La haute disponibilité est essentielle à ce niveau et tout point de défaillance est à exclure.
Pour cela 2 floatingIP sont créees:
- **public-floatingIP**: permet de répliquer l'IP utilisée pour les requêtes entrantes
- **private-floatingIP**: gérer la réplication de l'IP interne (cluster-gateway) afin de router avec haute disponibilité le traffic sortant

![infra](images/infra/webservers/webserver-3.png)

## 6. Sécurité
La sécurité de ce groupe est basée principalement sur:
  - iptables
    - port entrant:
      - 80
      - 443
  
  - certificats

## 7. Applications
- <span style="color:orange">**Nginx**</span> comme server applicatif
- <span style="color:orange">**Certbot**</span> pour la gestion des certificats
- <span style="color:orange">**KeepAlived**</span> pour les floatingIP
- <span style="color:orange">**GlusterFS**</span> pour clusteriser les volumes
## 8. Installation
L'installation des ces serveurs est automatisée par le framework. Il suffit de les affecter dans les groups vars de webservers_pool

``` yaml
webservers_pool:
  vars:
    output_interface: public-gateway
    input_interface: cluster-gateway
    # Declaration of floatingIPs
    vips:
      # internet-floatingIP
      public-gateway:
        virtual_router_id: 1
        vip: 192.168.0.33
        # internal-floatingIP
      cluster-gateway:
        virtual_router_id: 2
        vip: 192.168.2.254
  hosts:
    webserver-1:
      public-gateway:
        # used for configuring KeepAlived
        priority: 200
        state: MASTER
      cluster-gateway:
        # used for configuring KeepAlived
        priority: 100
        state: BACKUP
    webserver-2:
      public-gateway:
        # used for configuring KeepAlived
        priority: 100
        state: BACKUP
      cluster-gateway:
        # used for configuring KeepAlived
        priority: 200
        state: MASTER
```
## 9. Bilan

| Application     | Status |
| ----------- | ----------- |
| Installation et mise en service | <span style="color:#59AE01;font-weight:Bold">DONE</span> |
| Nginx   | <span style="color:#59AE01;font-weight:Bold">DONE</span>        |
| Certbot   | <span style="color:#59AE01;font-weight:Bold">DONE</span>        |
| Keepalived   | <span style="color:#59AE01;font-weight:Bold">DONE</span>        |
| GlusterFS   | <span style="color:yellow;font-weight:Bold">TODO</span>        |