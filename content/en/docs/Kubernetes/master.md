---
title: "Masters"
date: 2022-12-28T21:48:04+01:00
weight: 2
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 2
---

## 1. Présentation

Les masters sont répliqués pour garantir la haute disponibilité du cluster.
Dans notre infrastructure, on dispose de 3 masters. Ces derniers sont le socle du **Control Plane**

## 2. Composants du Control Plane 
Ref: <a href="https://kubernetes.io/fr/docs/concepts/overview/components/" target="blank">kubernetes documentation</a>
### <span style="color:orange">- kube-apiserver</span>
Composant sur le master qui expose l'API Kubernetes. Il s'agit du front-end pour le plan de contrôle Kubernetes.

Il est conçu pour une mise à l'échelle horizontale, ce qui veut dire qu'il met à l'échelle en déployant des instances supplémentaires. Voir Construire des Clusters en Haute Disponibilité.

### <span style="color:orange">- etcd</span>
Base de données clé-valeur consistante et hautement disponible utilisée comme mémoire de sauvegarde pour toutes les données du cluster.

Si votre cluster Kubernetes utilise etcd comme mémoire de sauvegarde, assurez-vous d'avoir un plan de back up pour ces données.

Vous pouvez trouver plus d'informations à propos d'etcd dans la documentation officielle.

### <span style="color:orange">- kube-scheduler</span>
Composant sur le master qui surveille les pods nouvellement créés qui ne sont pas assignés à un nœud et sélectionne un nœud sur lequel ils vont s'exécuter.

Les facteurs pris en compte pour les décisions de planification (scheduling) comprennent les exigences individuelles et collectives en ressources, les contraintes matérielles/logicielles/politiques, les spécifications d'affinité et d'anti-affinité, la localité des données, les interférences entre charges de travail et les dates limites.

### <span style="color:orange">- kube-controller-manager</span>
Composant du master qui exécute les contrôleurs.

Logiquement, chaque contrôleur est un processus à part mais, pour réduire la complexité, les contrôleurs sont tous compilés dans un seul binaire et s'exécutent dans un seul processus.

Ces contrôleurs incluent :

Node Controller : Responsable de détecter et apporter une réponse lorsqu'un nœud tombe en panne.
Replication Controller : Responsable de maintenir le bon nombre de pods pour chaque objet ReplicationController dans le système.
Endpoints Controller : Remplit les objets Endpoints (c'est-à-dire joint les Services et Pods).
Service Account & Token Controllers : Créent des comptes par défaut et des jetons d'accès à l'API pour les nouveaux namespaces.
cloud-controller-manager
Le cloud-controller-manager exécute les contrôleurs qui interagissent avec les fournisseurs cloud sous-jacents. Le binaire du cloud-controller-manager est une fonctionnalité alpha introduite dans la version 1.6 de Kubernetes.

Le cloud-controller-manager exécute seulement les boucles spécifiques des fournisseurs cloud. Vous devez désactiver ces boucles de contrôleurs dans le kube-controller-manager. Vous pouvez désactiver les boucles de contrôleurs en définissant la valeur du flag --cloud-provider à external lors du démarrage du kube-controller-manager.

Le cloud-controller-manager permet au code du fournisseur cloud et au code de Kubernetes d'évoluer indépendamment l'un de l'autre. Dans des versions antérieures, le code de base de Kubernetes dépendait du code spécifique du fournisseur cloud pour la fonctionnalité. Dans des versions ultérieures, le code spécifique des fournisseurs cloud devrait être maintenu par les fournisseurs cloud eux-mêmes et lié au cloud-controller-manager lors de l'exécution de Kubernetes.

Les contrôleurs suivants ont des dépendances vers des fournisseurs cloud :

Node Controller : Pour vérifier le fournisseur de cloud afin de déterminer si un nœud a été supprimé dans le cloud après avoir cessé de répondre
Route Controller : Pour mettre en place des routes dans l'infrastructure cloud sous-jacente
Service Controller : Pour créer, mettre à jour et supprimer les load balancers des fournisseurs cloud
Volume Controller : Pour créer, attacher et monter des Volumes, et interagir avec le fournisseur cloud pour orchestrer les volumes.

## 3. Architecture
![infra](images/kube-masters-archi.png)

## 2. Roles
- <span style="color:orange;font-weight:Bold">master-pool</span> <br/>
  Ce groupe assure le bon fonctionnement du control plane
- <span style="color:orange;font-weight:Bold">supervisor</span><br/>
  Cette machine interagit avec l'apiserver pour commander le control plane.
  Les manifests destinés au déploiements dans ce host.

## 3. Networking
Interface:
 - <span style="color:orange;font-weight:Bold"> Kubernetes CNI </span>

## 5. Haute disponibilité

### 5.1. Principe de Quorum
Ref: <a href="https://learn.microsoft.com/fr-fr/azure-stack/hci/concepts/quorum" target="blank">Microsoft Learn</a><br/>

Le quorum est conçu pour empêcher les scénarios split-brain qui peuvent se produire lorsqu’il existe une partition au sein du réseau et que les sous-ensembles de nœuds ne peuvent pas communiquer entre eux. Cela peut amener les deux sous-ensembles de nœuds à tenter de s’approprier la charge de travail et à écrire sur le même disque, ce qui peut entraîner de nombreux problèmes. Toutefois, un tel scénario peut être évité grâce au concept de quorum du clustering de basculement, qui force l’exécution d’un seul de ces groupes de nœuds. De cette façon, un seul de ces groupes reste en ligne.

Le quorum détermine le nombre d’échecs que le cluster peut supporter tout en restant en ligne. Le quorum est conçu pour gérer les problèmes de communication entre les sous-ensembles de nœuds du cluster. Il empêche plusieurs serveurs d’héberger simultanément un groupe de ressources et d’écrire sur un même disque en même temps. Grâce à ce concept de quorum, le cluster force le service de cluster à s’arrêter dans l’un des sous-ensembles de nœuds de sorte qu’il n’y ait qu’un seul véritable propriétaire pour chaque groupe de ressources. Une fois que les nœuds qui ont été arrêtés peuvent de nouveau communiquer avec le groupe de nœuds principal, ils rejoignent automatiquement le cluster et démarrent leur service de cluster.

![infra](images/quorum.png)

**Recommandations relatives au quorum de cluster**a<br/>
Si vous avez deux nœuds, il est obligatoire de disposer d’un témoin.
Si vous disposez de trois ou quatre nœuds, le témoin est fortement recommandé.
Si vous avez cinq nœuds ou plus, un témoin n’est pas nécessaire et ne fournit pas de résilience supplémentaire.
Si vous avez accès à Internet, utilisez un témoin de cloud.
Si vous êtes dans un environnement informatique qui comprend d’autres machines et partages de fichiers, utilisez un témoin de partage de fichiers.

### 5.2. Cluster ETCD
ETCD est la base de donnée par défaut de kubernetes. C'est une base de données key/value conçu pour stocker des paramètres de configuration.

ETCD fonctionne en cluster dont la haute disponibilité se base sur <span style="color:orange;font-weight:Bold">Quorum</span>

![infra](images/etcd-cluster.png)

La haute disponibilitê de kubernetes dépend non seulement du nombre de réplica du control plane mais aussi est fortement conditionnée par la haute disponibilité de ETCD

### 5.3 Rapport ETCD/Control Plane
Kubernetes élabore 2 types d'architecture de la relation ETCD/Control Plane:
### 3.3.1. Stacked Etcd Cluster
Sur ce type d'architecture chaque master embarque sa propre base de données. Ainsi le nombre de masters est strictement égal aux instance etcd. Dans ce cas de figure, le principe de <span style="color:orange;font-weight:Bold">quorum</span> s'applique aux nombres de masters

![stacked-etcd-cluster](images/stacked-etcd-cluster.png)

### Condition de disponibilité
Pour 3 noeuds la majorité de quorum est 2. En effet c'est le nombre au dessous duquel le cluster est hors service.

#### Table de quorum pour 3 noeuds
| Noeud en service | Noeud hors service | Majorité | Disponibilité |
| ---------- | ------------ | ------- | ------------- |
|   **3**    |    **0**     | 3 | <span style="color:#59AE01;font-weight:Bold">UP</span>        |
|   **2**    |    **1**     | 2 | <span style="color:#59AE01;font-weight:Bold">UP</span>        |
|   **1**    |    **2**     | 1 | <span style="color:red;font-weight:Bold">Down</span>        |

### 3.3.2. External Etcd Cluster
L'externalisation des bases etcd permet d'extendre le quota de la majorité (le nombre d'instance en service) de <span style="color:orange;font-weight:Bold">quorum</span>. Cette architecture a l'avantage d'agir sur la haute disponibilité sans ajouter des masters supplémentaires. Ce model ajoute une couche de sécurité en même temps la maintenance est plus souple.

Exemple: ETCD avec 3 instances

![external-etcd-cluster](images/external-etcd-cluster.png)

Exemple: ETCD avec 6 instances

![external-etcd-cluster](images/external-etcd-cluster-6.png)
#### Table de quorum pour 6 noeuds
| Noeud en service | Noeud hors service | Majorité | Disponibilité |
| ---------- | ------------ | ------- | ------------- |
|   **6**    |    **0**     | 6 | <span style="color:#59AE01;font-weight:Bold">UP</span> 
|   **5**    |    **1**     | 5 | <span style="color:#59AE01;font-weight:Bold">UP</span>        |
|   **4**    |    **2**     | 4 | <span style="color:#59AE01;font-weight:Bold">UP</span> 
|   **3**    |    **3**     | 3 | <span style="color:#59AE01;font-weight:Bold">UP</span>        |
|   **2**    |    **4**     | 2 | <span style="color:red;font-weight:Bold">Down</span>         |
|   **1**    |    **5**     | 1 | <span style="color:red;font-weight:Bold">Down</span>        |

### 3.3.3. architecture etcd de l'infrastructure
Notre choix est porté sur le stacked etcd cluster qui en terme de haute disponibilité respecte les standards.

### 4. Volumes 
![external-etcd-cluster](images/kube-master-volumes.png)
## 9. Bilan