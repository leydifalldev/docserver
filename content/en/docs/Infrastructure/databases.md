---
title: "Databases Pool"
date: 2022-12-28T21:48:04+01:00
weight: 5
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 5
---
## 1. Présentation
Ce groupe de servers est dédié aux bases de données et possède des ressources matérielles élevées.
Les serveurs de bases de données sont relativement gourmands en RAM et processeur d'où l'équipement en Intel i5 et 16Go de RAM voir 32Go

![infra](images/infra/intel-i5.png)

## 2. Roles
Les machines de ce groupe sont principalement des serveurs de bases de données. Ils sont répliqués pour assurer la haute disponibilité. 


Emplacement dans le cluster 

![infra](images/database-pool-position.png)
## 3. networking

Les serveurs de bases de données sont gérés par **Kubernetes** et sont accéssibles que de puis box-network

![infra](images/infra/databases/databases-1.png)

## 4. Volumes
Ces machines sont rattachées au cluster de volumes central du boitier, ainsi les backups sont partagés et préservés en réplication sur d'autre machines

![infra](images/database-pool-volumes.png)

## 5. Haute disponibilité

![infra](images/database-pool-ha.png)

## 6. Sécurité
- **iptables (à définir)**
- **VirtualService (Service Mesh)**

## 7. Applications

- <span style="color:orange;font-weight:Bold">Postgresql</span>
- <span style="color:orange;font-weight:Bold">Redis (à installer)</span>

## 8. Installation
Ces hosts ne sont pas encore installés du fait du nombre de machines disponibles mais selon mis en place progressivement. Pour le moment postgresql est installé sur les machines gateway le temps d'acquérir ces serveurs physiques

## 9. Bilan