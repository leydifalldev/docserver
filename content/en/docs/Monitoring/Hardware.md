---
title: "Surveillance matériel"
date: 2022-12-28T21:48:04+01:00
weight: 2
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 2
---
## 1. Présentation
La surveillance matériel est géré par un des serveurs de nat_gateway_pool. Diverses données sont recueillies sur chaque serveur du cluster (<span style="color:orange;font-weight:Bold">CPU, RAM, Disques, Réseaux</span> etc) et centralisées sur le serveur de monitoring. Ces données sont utilisés par <span style="color:orange;font-weight:Bold">Prometheus</span> pour stocker, traiter, servir ces données et <span style="color:orange;font-weight:Bold">Grafana</span> pour la visualisation.

## 2. Architecture

![infra](images/monitoring-archi-1.png)

## 3. Node-exporter
Nodeexporter est un agent qui permet d'exposer les métriques d'une machine. C'est une API qui effectue des requêtes sur le host puis s'interfaçe sous forme d'API Rest afin de synchroniser les données avec d'autres système telque Prometheus

### 3.1. Installlation
Tous les serveurs de l'infrastructure embarque Nodeexporter. L'installation s'effectue pendant la phase d'initialisation d'une machine dans l'infrastructure.

```yaml
-------------------------------------------------------
| path: playbook-host-install.yml                      |
-------------------------------------------------------
- name: Install host
  hosts: host-x
  become: true
  user: supervisor
  roles:
    - role: monitoring/node-exporter
```

## 4. Prometheus
Prometheus est un logiciel libre de surveillance informatique et générateur d'alertes. Il enregistre des métriques en temps réel dans une base de données de séries temporelles (avec une capacité d'acquisition élevée) en se basant sur le contenu de point d'entrée exposé à l'aide du protocole HTTP. Ces métriques peuvent ensuite être interrogées à l'aide d'un langage de requête simple (PromQL) et peuvent également servir à générer des alertes. Le projet est écrit en Go et est disponible sous licence Apache 2. Le code source est disponible sur GitHub2, et est un projet maintenu par la Cloud Native Computing Foundation à côté d'autres projets comme Kubernetes et Envoy3. (Ref: <a href="https://fr.wikipedia.org/wiki/Prometheus_(logiciel)" target="blank">Wikipédia</a>)
### 4.1. Installation
```yaml
-------------------------------------------------------
| path: playbook-supervisor-install.yml               |
-------------------------------------------------------
- name: Setup supervisor host
  hosts: supervisor-2
  become: true
  user: supervisor
  gather_facts: false
  roles:
    - role: monitoring/init
    - role: monitoring/prometheus <-------
    - role: monitoring/grafana
    - role: monitoring/kiosk
```
```yaml
---------------------------------------------------------
| path: inventorie/protobox/webservers_pool/routes.yml  |
---------------------------------------------------------
prometheus:
  webserver:
    - location: /prometheus/
      params:
        proxy_pass:
          values: "http://stream_prometheus/prometheus/"
  stream:
    name: stream_prometheus
    port: 9090
    group: nat_gateway_pool
```
![infra](images/prometheus.png)

## 5. Grafana
Grafana est un logiciel libre sous licence GNU Affero General Public License Version 32 (anciennement sous licence Apache 2.0 avant avril 2021) qui permet la visualisation de données. Il permet de réaliser des tableaux de bord et des graphiques depuis plusieurs sources dont des bases de données temporelles comme Graphite (en), InfluxDB et OpenTSDB3. (Ref: <a href="https://fr.wikipedia.org/wiki/Grafana" target="blank">Wikipédia</a>)
### 5.3. Installation

```yaml
-------------------------------------------------------
| path: playbook-supervisor-install.yml               |
-------------------------------------------------------
- name: Setup supervisor host
  hosts: supervisor-2
  become: true
  user: supervisor
  gather_facts: false
  roles:
    - role: monitoring/init
    - role: monitoring/prometheus
    - role: monitoring/grafana <-------
    - role: monitoring/kiosk
```

```yaml
---------------------------------------------------------
| path: inventorie/protobox/webservers_pool/routes.yml  |
---------------------------------------------------------
grafana:        
  webserver:
    - location: /grafana/
      params:
        rewrite: 
          values: ^/grafana/(.*) /$1 break
        proxy_set_header: 
          values: Host $http_host
        proxy_pass: 
          values: "http://stream_grafana/grafana"
    - location: /grafana/api/live/
      params:
        rewrite:
          values: ^/grafana/(.*) /$1 break
        proxy_http_version: 
          values: 1.1
        proxy_set_header:
          type: repeat
          values:
            Upgrade: $http_upgrade
            Connection: $connection_upgrade
            Host: $http_host
        proxy_pass: 
          values: "http://stream_grafana/grafana"
  stream:
    name: stream_grafana
    port: 3000
    group: nat_gateway_pool
```

![infra](images/grafana.png)