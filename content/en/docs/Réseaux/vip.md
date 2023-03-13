---
title: "FloatingIP"
date: 2022-12-28T21:48:04+01:00
weight: 4
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 4
---
## 1. Présentation
Une FloatingIP connu également sous le nom de "VIP (Virtual IP)" est une adresse static publique qui permet d'exposer des services tel que des hosts, des LoadBalancer etc sous une même ip. En effet une FloatingIP est principalement affectée à une machine (MASTER) tant que cette dernière est en service et bascule sur une autre machine (BACKUP) en cas de panne du MASTER. 

## 2. KeepAlived
KeepAlived est un logiciel de routage permettant des installations simples et robustes pour l'équilibrage de charge qui repose sur le module du noyau Linux <span style="color:orange;font-weight:Bold">IPVS</span> et le protocole <span style="color:orange;font-weight:Bold">VRRP</span>.

### 2.1. Internet Protocol Virtual Server (IPVS)
IPVS est un module du noyau Linux utlisé pour faire des opérations réseaux de bas niveau. En effet ce module est beaucoup utilisé et peu connu à la fois, les iptables s'interfacent avec pour manoeuvrer les firewalls. Dans le contexte de haute disponibilité, ce module permet l'équilibrage de charge du noyau Linux en agissant sur la couche 4 du modèle OSI

### 2.2. Virtual Router Redundancy Protocol (VRRP)
VRRP est un protocole standard dont le but est d'augmenter la disponibilité de la passerelle par défaut des hôtes d'un même réseau. Le principe est de définir la passerelle par défaut pour les hôtes du réseau comme étant une adresse IP virtuelle référençant un groupe de routeurs.

### 2.3. Fonctionnement
Lors de la configuration, 2 paramètres sont attendus pour chaque serveur:
- Le **State** qui spécifie le type c'est à dire MASTER ou BACKUP
- La **Priorité** qui détermine le BACKUP qui prendra la relève en cas de panne du MASTER

### Tous les instances en service
Quand toutes les instances sont en service, le MASTER par défaut porte le FloatingIP

![infra](images/vip-1.png)
### Le MASTER hors service
En cas de panne du MASTER, le FloatingIP bascule sur le BACKUP possèdant la priorité la plus élevée

![infra](images/vip-2.png)

## 3. Installation
Avec le framework protobox, le pool du FloatingIP s'effectue par déclaration du group dans l'inventaire principale.

```yml
----------------------------------------
| path: inventories/protobox/main.yml  |
----------------------------------------
servers_pool:
  vars:
    vips:
      network-1:
        virtual_router_id: 1
        vip: 192.168.1.10
      network-2:
        virtual_router_id: 2
        vip: 192.168.2.10
  hosts:
    host-1:
      network-1:
        priority: 200
        state: MASTER
      network-2:
        priority: 100
        state: BACKUP
    host-2:
      network-1:
        priority: 100
        state: BACKUP
      network-2:
        priority: 200
        state: MASTER
```
### Resultat
Cette déclaration ci-dessus crée 2 FloatingIP sur 2 réseaux différents.
- host-1 est le MASTER sur le réseau network-1 et le BACKUP sur network-2
- host-2 est le MASTER sur le réseau network-2 et le BACKUP sur network-1

![infra](images/vip-3.png)


- **Configuration généré sur le host-1**
```json
-----------------------------------------
| path: /etc/keepalived/keepalived.conf |
| host: host-1                          |
-----------------------------------------
vrrp_instance network-1-host-1 {
    state MASTER
    interface network-1
    virtual_router_id 1
    priority 200
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1988
    }
    virtual_ipaddress {
        192.168.1.10/24
    }
}
vrrp_instance network-2-host-1 {
    state BACKUP
    interface network-2
    virtual_router_id 2
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1988
    }
    virtual_ipaddress {
        192.168.2.10/24
    }
}
```

- **Configuration généré sur le host-2**

```json
-----------------------------------------
| path: /etc/keepalived/keepalived.conf |
| host: host-2                          |
-----------------------------------------
vrrp_instance network-1-host-2 {
    state BACKUP
    interface network-1
    virtual_router_id 1
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1988
    }
    virtual_ipaddress {
        192.168.1.10/24
    }
}
vrrp_instance network-2-host-2 {
    state MASTER
    interface network-2
    virtual_router_id 2
    priority 200
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1988
    }
    virtual_ipaddress {
        192.168.2.10/24
    }
}
```
