---
title: "Search Engine Pool"
date: 2022-12-28T21:48:04+01:00
weight: 6
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 6
---

## 1. Présentation
Ce groupe de servers est dédié aux bases de données et possède des ressources matérielles élevées.
Les serveurs search engines consomment sont relativement gourmands en RAM et processeur d'où l'équipement en Intel i5 et 16Go de RAM voir 32Go
Elasticsearch est principalement utilisé comme noeuds de données et execute les recherches sur ses données pendant que la gestion du cluster Elasticsearch est assurée par les masters pool

## 2. Roles
Elasticsearch deploie plusieurs noeuds et classe ces derniers en groupe selon leurs fonctions. Parmi on peut citer:
- Master Nodes: Gestion du cluster\
  Les noeuds masters d'Elasticsearch cohabitent en sidecar avec les masters Kubernetes

- Data Nodes: Gestion des données

![search-engine-side-car](images/infra/search-engines/search-engine-side-car.png)

## 3. networking
Les serveurs search engines sont gérés par **Kubernetes** et sont accéssibles que de puis box-network

![infra](images/infra/search-engines/se-1.png)

Emplacement dans le cluster

![infra](images/search-engine-position.png)

## 4. Volumes
Ce groupe dispose est connecté au volume partagé du cluster pour stocker leurs backups

![infra](images/search-engine-volume.png)

## 5. Haute disponibilité

![infra](images/search-engine-ha.png)

## 6. Sécurité
- <span style="color:orange;font-weight:Bold">iptables</span> gérés par kubernetes
- <span style="color:orange;font-weight:Bold">Istio</span> à installer pour les communications TLS internes

## 7. Applications
- <span style="color:orange;font-weight:Bold">Elasticsearch</span>
- <span style="color:orange;font-weight:Bold">Redis</span> à installer

## 8. Installation
L'installation est automatisée par le framework. La configuration se base sur du déclaratif (Inventory). Les volumes et noeuds sont crées en fonction du paramètrage sur chaque hosts du groups vars

``` yaml
        elasticsearch:
          vars:
            eck:
              version: 8.5.2
            namespace: elastic-system
            app_templates:
              - name: local-storage
              - name: eck-crds
              - name: eck-operator
              - name: eck-es
              - name: kibana
              # - name: eck-local-storage
          hosts:
            webserver-1:
              role: kubectl
            master-1:
              role: master
              volumes:
              - name: elasticsearch-masters-1
                size: 10Gi
            master-2:
              role: master
              volumes:
              - name: elasticsearch-masters-2
                size: 10Gi
            master-3:
              role: master
              volumes:
              - name: elasticsearch-masters-3
                size: 10Gi
            gateway-1:
              role: data
              volumes:
              - name: elasticsearch-data-1
                size: 50Gi
            gateway-2:
              role: data
              volumes:
              - name: elasticsearch-data-2
                size: 50Gi
```

``` yaml
$ play playbook-se-install
```