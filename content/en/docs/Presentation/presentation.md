---
title: "Presentation"
date: 2022-12-28T21:48:04+01:00
weight: 1
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 1
---
## 1. Introduction

Protobox est un projet on-premise cloud initié en 2019.
En effet Protobox est un nano datacenter cloud permettant d'héberger des containers d'applications et orchestré par la technologie **Kubernetes**.
Protobox est également un framework maison à base de la technologie **Ansible** permettant de manager totalement l'infrastructure et d'automatiser les actions souhaitées.

Elle a été conçue avec des normes de haute disponibilité et sécurité rendant son usage polyvalent (Environnement de preprod, test dev ou production)

Elle comporte en moyenne d'une vingtaine de machines **Intel NUC** à consommation relativement faible. Chaque machine est taillée en fonction de son role dans le box. 
Ce sont des machines similaires en desing et se distinguent parfois de leurs caractéristiques.
## 2. Usages
### 2.1. Environnement de test 
Son usage comme environnement de test développement permet aux professionnelles de pousser leurs codes afin de tester leurs applications. En effet l'infrastructure embarque une plateforme d'usine logicielle (**Gitlab server**, **Container Registry**, **ArgoCD**) pour déployer facilement des applications conteneuriseés dans le cluster **Kubernetes** du boitier. Ainsi les testeurs peuvent analyser et valider les fonctionnalités attendues.

![infra](images/presentation-env-2.png)

### 2.2. Environnement de production 
L'usage de ce boitier peut s'étendre à la production. En effet il a été conçu avec des normes de sécurité et de haute disponibilité lui permettant d'exposer ses services hors réseaux privés.

![infra](images/presentation-env-1.png)

## 3. Infrastructure
L'infrastructure est un semble d'intel NUC interconnectés et cloisonnés dans des réseaux privés en fonction de leur appartenance.

![infra](images/protobox.png)

### 3.1. Intel NUC
Les kits, mini PC et éléments Intel® NUC offrent les outils pour créer des conceptions novatrices, de la productivité d'entreprise aux solutions visuelles et aux jeux extrêmes.
Conçus pour une grande gamme de charges de travail avec la qualité et la fiabilité que vous pouvez attendre d'Intel, les produits Intel® NUC permettent de développer vos offres commerciales uniques.

<!-- ![infra](/intel-nuc/intel-nuc.png) -->

![infra](images/intel-nuc.png)

Dans l'infrastructure Protobox chaque intel NUC représente une unité logique du système.

![infra](images/intel-nuc/intel-proc.png)

Dans l'infra on distingue 2 types de machine en fonction de leur processeurs. Les machines peu consommatrices de ressources sont équipées de processeur Celeron tandis que celles qui font tourner des applications lourdes en execution fonctionnent avec de Intel i5

### 3.2. Boitier conteneur
Ce boitier est amenagé pour contenir au maximum 18 machines et 2 écrans 13 pouces repartis en étagère plexiglass

![infra](images/intel-nuc/thermaltake-boitier-level.jpeg)

### 3.3. Point de vue réseau

![infra](images/infra.png)

## 4. IAC 
Le déploiement du boitier repose sur de l'IAC (Infra As Code). 2 logiciels ont été conçu pour cette fonctionnalité. 
- <a href="/docs/iac/automatisation/">Protodeploy</a>
- <a href="/docs/iac/nodespyder/">Nodespyder</a>
### Déclaration et intégration d'un host dans l'infra
La déclaration d'une machine se fait dans le fichier inventory du framework protobox.

Exemple d'inventory d'un host
``` yaml
gateway-1:
  arch: x86_64
  os: ubuntu_22.04
  model: nuc
  ansible_host: 192.168.1.11
  roles:
    - gateway
  networks_interfaces:
    box-network:
      dhcp: true
      network_manager: netplan
      ether: xx:xx:dd:01:4a:xx
    cluster-gateway:
      dhcp: false
      network_manager: netplan
      ip: 192.168.2.11
      ether: 28:xx:xx:xx:5e:xx
      gateways:
        - to: default
          via: 192.168.2.254
```
``` shell
$ play playbook-host-install.yml
```