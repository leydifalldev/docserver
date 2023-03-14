---
title: "Nodespyder"
date: 2022-12-28T21:48:04+01:00
weight: 2
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 5
---
## 1. Présentation
Nodespyder est un logiciel de gestion d'infrastructure conçu dans le cadre de ce projet. Il est développé en Golang et se base principalement sur le protocole gRPC. Il comporte 2 systèmes dont:

- <span style="color:orange;font-weight:Bold">spyder</span> (<a href="https://gitlab.com/nodespyder/spyder" target="blank">Code source</a>) qui est une API Rest coté client et gRPC coté cluster
- <span style="color:orange;font-weight:Bold" >spyvisor</span> (<a href="https://gitlab.com/nodespyder/spyvisor/-/tree/master" target="blank">Code source</a>) est un agent installé sur divers serveurs et interagit avec spyder

## 2. Fonctionnalités
Nodespyder est conçu pour gerer des infrastructures IT. Il fonctionne sur le principe de master/agent. L'API est installée sur une machine (pour le moment, clustering en mode réplica dans l'avenir) et des agents sur les machines avec lesquelles on interagit. Il permet de:

- <span style="color:orange;font-weight:Bold">Collecter des données métriques (charge CPU, RAM, Disque etc)</span> à partir des serveurs de l'infrastructure via l'agent
- <span style="color:orange;font-weight:Bold">Lancer des processus CI/CD (Pipeline)</span> pour déployer des environnements dans l'univers cloud
- <span style="color:orange;font-weight:Bold">D'interagir avec des cluster Kubernetes</span> pour executer des opérations telles que la consultation des logs, lister objets kubernetes etc.
- <span style="color:orange;font-weight:Bold">D'interagir avec des Container Registry</span> pour consulter du contenu
- <span style="color:orange;font-weight:Bold">D'installer des outils sur des serveurs distants</span> telque Nginx, HAProxy etc et d'assurer leur configuration
- <span style="color:orange;font-weight:Bold">Former des clusters applicatifs à partir d'interfaces web</span>

## 3. Architecture
![infra](images/nodespyder-archi-2.png)

## 4. Network
![infra](images/nodespyder-arch-1.png)

