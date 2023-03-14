---
title: "Services"
date: 2022-12-28T21:48:04+01:00
weight: 3
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 3
---

## 1. Types de service
Les services kubernetes servent principalement à exposer les déploiements kubernetes. On distingue 3 types de services dont:

- <span style="color:orange;font-weight:Bold">ClusterIP</span> <br/>
  Ce type de service est utilisé pour les communications internes entre les différents pods
- <span style="color:orange;font-weight:Bold">NodeIP</span> <br/>
  Les NodeIP contrairement aux ClusterIP permettent d'externaliser les services. Ils exposent leur port à tous les nodes du cluster
- <span style="color:orange;font-weight:Bold">LoadBalancer</span> <br/>
  Les loadBalancers sont plus ou moins similaires aux NodeIP mais ne sont fonctionnels qu'à la présence d'un controleur complémentaire qui leur attribut une IP. En effet les loadbalancers font une requête auprès d'un controleur dédié à l'attribution d'un IP.

## 2. Ingress
Un ingress est un élément de kubernetes qui joue le role de serveur web et route le trafic vers d'autres services afin en se basant sur des endpoints. Les ingress sont gérés par un ou des controleurs appelés controleur d'ingress qui maintiennent ce service.

<span style="color:orange;font-weight:Bold">Cas d'usage</span>:
Lorsqu'on expose directement le cluster vers l'exterieur c'est à dire que les requêtes passent directement par point d'entrée du cluster, ce type de service est adapté et oriente les demandes.

<span style="color:orange;font-weight:Bold">Inconvénient</span>:
La réplication de l'ingress n'est pas possible (à ma connaissance). En effet les controleurs d'ingress sont réplicables et lorsque le controleur conteneur de l'ingress est hors service l'instance se perd et le basculement de l'ingress ne s'effectue pas. C'est un système qui crée un point de défaillance au cluster. Dans le cadre de la haute disponilité, aucun point de défaillance n'est pas accepté.

![infra](images/kubernetes/kube-arch-5.png)

## 3. NodeIP
Les NodeIP ont l'avantage de répliquer nativement un service. En effet il expose un service sur toutes les machines du cluster.

<span style="color:orange;font-weight:Bold">Cas d'usage</span>:
Notre cluster actuel utilise ce type de service. En effet l'infrastructure intégre au front (avant le réseau du cluster) un serveur web et un reverse-proxy dans le même réseau privée que les noeuds (gateway-pool) kubernetes, il serait préférable de ne pas réproduire un autre serveur web dans le cluster. Puisqu'un service est répliqué sur toutes les machines de kubernetes, le nginx au front va appliquer un loadbalance sur ces dernières. En terme de sécurité, la communication s'effectue dans un réseau cloisonné, nos noeuds ne sont pas accessible depuis l'exterieur.

## 4. Architecture
Le cluster kubernetes est isolé des serveurs web (<span style="color:orange;font-weight:Bold">Nginx</span>) et communique à travers un reverse-proxy (<span style="color:orange;font-weight:Bold">HAProxy</span>). Cela offre une couche de sécurité importante.

![kube-service-archi](images/kube-service-archi.png)

![kube-service-archi-2](images/kube-service-archi-2.png)

## 5. Haute disponibilité

![infra](images/kubernetes/kube-arch-6.png)

## 6. Externalisation d'un service
Pour exposer un service sur internet, suivre les étapes suivantes:

<span style="color:orange;font-weight:Bold">1. </span> Définir et applique le manifest kubernetes du service<br/>

Exemple: 
```yaml
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: pgadmin
  name: pgadmin
  namespace: postgresql
spec:
  ports:
  - name: padmin-port
    nodePort: 30165
    port: 80
    targetPort: 80
  selector:
    app: pgadmin
  type: NodePort
---
```
<span style="color:orange;font-weight:Bold">2. </span>Déclarer le service dans <span style="color:orange;font-weight:Bold">HAProxy</span> via le groupvars kube_gateway_pool<br/> 

Exemple: 
```yaml
----------------------------------------------------------
| path: inventories/protobox/kube_gateway_pool/proxy.yml |
----------------------------------------------------------
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
```
<span style="color:orange;font-weight:Bold">3. </span>Configuration du server web <span style="color:orange;font-weight:Bold">Nginx</span> via le groupvars webservers_pool<br/>

Exemple: 
```yaml
----------------------------------------------------------
| path: inventories/protobox/webservers_pool/routes.yml |
----------------------------------------------------------
pgadmin4:
  webserver:
    - location: /v-admin/
      params:
        proxy_set_header:
          type: repeat
          values:
            Host: $http_host
            X-Real-IP: $remote_addr
            X-Forwarded-For: $proxy_add_x_forwarded_for
        proxy_pass: 
          values: http://stream_vadmin
  stream:
    name: stream_vadmin
    port: 30164
    group: kube_gateway_pool
```

