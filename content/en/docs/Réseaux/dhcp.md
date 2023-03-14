---
title: "Server DHCP"
date: 2022-12-28T21:48:04+01:00
weight: 2
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 2
---
## 1. Présentation
Le server DHCP est un des élements fondamentaux de l'infra. En effet l'ajout de machine passe par l'attribution d'IP et ainsi la machine nouvellement ajoutée est identifiée comme composant de la box.\
Le framework protobox installe dnsmasq (server DNS/DHCP léger) sur toutes les machines classées supervisor-pool.
Dnsmasq ne fonctionne pas en clustering même répliqué, sur chaque machine ce serveur fonctionne indépendammant. Une machine qui intégre le réseau lance un signal pour une demande d'attribution IP ainsi le premier server DHCP recevant l'appel répond systematiquement.

![infra](images/servers-dhcp.png)

## 2. DNSMASQ

Dnsmasq est un serveur léger conçu pour fournir les services DNS, DHCP, Bootstrap Protocol et TFTP pour un petit réseau, voire pour un poste de travail. Il permet d'offrir un service de nommage des machines du réseau interne non intégrées au service de nommage global (i.e. le service DNS d'Internet). Le service de nommage est associé au service d'adressage de telle manière que les machines dont le bail DHCP est fourni par Dnsmasq peuvent avoir automatiquement un nom DNS sur le réseau interne. Le logiciel offre un service DHCP statique ou dynamique.

### 2.1. Installation

Dnsmasq est développé sous forme de role ansible dans le framework protobox et utilisé dans le playbook-supervisor-install

``` yaml
- name: Setup gateway host
  hosts: supervisor_pool
  become: true
  user: supervisor
  gather_facts: false
  roles:
    - role: set-hostname
    - {role: network-setup}
    - role: etc-hosts
    - role: monitoring/node-exporter
    - role: docker
    - role: docker-compose
    - role: gateway-network-setup
      vars:
        installation: true
    - role: dnsmasq <-------------------
      vars:
        install: true
```

Le role dnsmasq parcours les hosts définis dans l'inventory pour extraire les informations dont il a besoin pour référencer toutes les machines. Parmi ces informations on peut citer l'adresse MAC, l'IP et l'interface réseau à l'écoute

```
Template utilisé par le role pour générer la configuration dnsmasq

interface={{ box_network }}
listen-address=0.0.0.0
server=8.8.8.8
server=8.8.4.4
#no-resolv
#domain-needed # Don’t forward short names
bogus-priv
expand-hosts
dhcp-range={{ range_start }},{{ range_end }},{{ refresh_delay }}
{% for host in groups['all'] %}
{% for interface in hostvars[host]['networks_interfaces'] %}
{% if hostvars[host]['networks_interfaces'][interface]['ether'] is defined and interface == box_network %}
dhcp-host={{ hostvars[host]['networks_interfaces'][interface]['ether'] }},{{ host }},{{ hostvars[host]['networks_interfaces'][interface]['ip'] }}
{% endif %}
{% endfor %}
{% endfor %}
```

### 2.2. Activation du DHCP Client pour une demande automatique d'IP

``` yaml
host-1:
  arch: x86_64
  os: ubuntu_22.04
  model: nuc
  ansible_host: 192.168.X.XX
  ip: 192.168.X.XX
  access_ip: 192.168.X.XX
  roles:
    - gateway
  networks_interfaces:
    box-network:
      dhcp: true <-----------------
      network_manager: netplan
      ip: 192.168.X.XX
      ether: 88:ae:dd:XX:XX:XX
```