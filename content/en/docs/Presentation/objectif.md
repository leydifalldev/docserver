---
title: "Objectif"
date: 2022-12-28T21:48:04+01:00
weight: 3
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 3
---
Ce projet est conçu pour des usages professionnels notamment des services applicatifs. Ses usages sont diversifiés partant d'un environnement de dev à la production. Dans une infrastructure IT, les performances, la sécurité et la haute disponibilité sont des facteurs qui définissent la qualité de service.

## 1. Sécurité
La sécurité d'un système informatique repose sur des principes, conventions et bonnes pratiques. Dans une infrastructure IT les unités sont interconnectées et se transmettent probablement des informations. La plupart des attaques se greffent sur ces échanges pour atteindre leurs cibles. En sécurité informatique, la maitrise en réseau est fondamentale.

### 1.1. Réseau
Dans ce projet, on peut voir différents réseaux. Ces cloisonnements se justifient par la sécurité. En effet l'infrastructure communique principalement par un réseau central et est non accessible directement depuis l'extérieur. Cette topologie réseau protège fortement le système des attaques.

- <a href="/docs/réseaux/networking/" style="color:orange;font-weight:Bold">Chapitre Architecture réseau (Suite)</a>

### 1.2. Certificats et TLS
La communication chiffrée est un des piliers de la sécurité. En effet le chiffrement dans le contexte IT consiste à coder les données échangées entre 2 entités. Ce mécanisme rend difficile l'exploitation de ces données interceptées. Pour cela, nous priviligions les échanges TLS<br/>
- <a href="/docs/réseaux/proxyserve/" style="color:orange;font-weight:Bold">Chapitre Proxiserver (Suite)</a>

### 1.3. Firewalls
Les firewalls représentent plus ou moins la police aux frontières. En effet les firewalls controlent et autorisent les entrées et sorties. Ils sont actifs au sein de chaque serveur et attribut l'accessibilité réseau en fonction des réglès qui lui sont données.


## 2. Haute disponibilité
La haute disponibilité est un facteur essentiel dans l'IT notamment dans des environnement de production. La haute disponibilité trouve sa définition dans la capacité à assurer la disponibilité permanente de service. Elle obéit à des principes et conventions.

### 2.1. Point of failure
Dans un cycle de traitement d'une requête, cette dernière passe par plusieurs points de traitement (webserver, proxy, serveurs etc...). En cas de blocage sur un de ces points, la rêquete peut échouer. Si on raisonne en terme de service, un point de défaillance, plus connu sous le nom de "Point of Failure" est un point dont son dysfonctionnement entraine l'arrêt total ou partiel d'un service. Dans un système informatique, les points de défaillance sont antagonistes à la haute disponibilité. Plus il existe des points de défaillances, plus la haute disponibilité baisse. Ce sont des points impératifs à supprimer. La réplication des instances est un des moyens de les contourner.
Dans ce projet, on peut scinder l'infrastructure en 2:
- Le <span style="color:orange;font-weight:Bold">cluster kubernetes</span> qui permet d'exposer des services (site web, API Rest, dashboard databases etc..) à l'exterieur. Ce type de service ne doit admettre aucun point de défaillance d'où la nécessité de les répliquer.

- Le <span style="color:orange;font-weight:Bold">système de gestion du cluster</span> qui ne sert qu'à gerer l'infrastructure. Parmi les entités de ce système on peut citer les services de monitoring (Grafana, Prometheus, Consul etc) et des systèmes d'usine logiciel (Gitlab, Container Registry, ArgoCD). En effet le dysfonctionnement de ces services n'est pas une fatalité pour l'utilisateur exterieur. Leur panne n'impacte que le personnel (administrateur, développeur etc) qui gère l'infra. Du coup leur haute disponibilité peut être reléguer au second plan.

### 2.2. Réplication physique
La réplication physique des serveurs consiste à dupliquer une machine physique par le biais d'une <a href="/docs/réseaux/vip/">Floating</a><br/>

- <a href="/docs/réseaux/vip/" style="color:orange;font-weight:Bold">Chapitre FloatingIP (Suite)</a>

### 2.3. Réplication d'applications
Une bonne partie des applications modernes fonctionnent en mode clustering, c'est à dire un ensemble d'instances dupliquées et interconnectées pour fournir (relativement) les mêmes services. D'autres applications sont réplicables hors cluster.

### 2.3. Réplication de masters kubernetes
Dans notre infrastructure, on dispose de 3 masters pour assurer la haute disponibilité de notre cluster kubernetes. Ces 3 masters jouent le même role.

- <a href="/docs/kubernetes/master/" style="color:orange;font-weight:Bold">Chapitre Kubernetes Masters (Suite)</a>

### 3. Performance
La performance des systèmes IT est relative à plusieurs facteurs.
Les performances dépendent fortement des ressources attribuées à chaque machine. Nos machines sont calibrées en fonction de l'usage. 
Pour les bases de données et moteurs de recherche, on est dans une grosse configuration et quant aux autres machines on a des serveurs de faibles consommation d'énergie et de ressources un peu limites.
Il n'y a pas que les ressources qui font les performances. Il y'a l'architecture des SI et d'autres éléments qui conditionnent les performances.
