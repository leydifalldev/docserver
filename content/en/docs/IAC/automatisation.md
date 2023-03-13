---
title: "Protodeploy"
date: 2022-12-28T21:48:04+01:00
weight: 1
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 1
---

## 1. Présentation
L'installation de l'infrastructure partant de l'adhésion des serveurs au déploiement des applications est gérer par notre <span style="color:orange;font-weight:Bold">framework Protobox</span>. Protobox est framework statefull conçu à base de <span style="color:orange;font-weight:Bold">Ansible</span>. C'est un outil permettant de déployer des infrastructures à partir d'un schéma d'architecture défini dans l'inventaire principale. 

## 2. Développement de Protobox
C'est un projet initié en 2019, aujourd'hui il a atteint une certaine maturité et sous peu de temps sera publique et en <span style="color:orange;font-weight:Bold">OpenSource</span>.

## 3. Usages
La 1e étape de la mise en place du schéma est la déclaration des unités logiques de l'infrastructure.

```yml
 -----------
 | EXEMPLE |
 -----------
all:
  hosts:
  ...
    supervisor-2:
      arch: x86_64
      os: ubuntu_22.04
      model: nuc
      ansible_host: 192.168.1.7
      roles:
        - supervisor
      networks_interfaces:
        box-network:
          dhcp: false
          network_manager: netplan
          ip: 192.168.1.7
          ether: 88:ae:dd:xx:xx:xx
          gateways:
            - to: default
              via: 192.168.1.254
        private-gateway:
          dhcp: false
          network_manager: netplan
          ip: 192.168.0.37
          ether: 00:0e:c6:xx:xx:xx

    master-1:
      arch: x86_64
      os: ubuntu_22.04
      model: nuc
      ansible_host: 192.168.1.21
      ip: 192.168.1.21
      access_ip: 192.168.1.21
      roles:
        - master
      networks_interfaces:
        box-network:
          dhcp: false
          network_manager: netplan
          ip: 192.168.1.21
          ether: 1c:69:7a:xx:xx:xx
          gateways:
            - to: default
              via: 192.168.1.254
    ...
```

En plus de ses capacité à déployer des infrastructures, Protobox permet d'effectuer diverses opérations tel que:

- <span style="color:orange;font-weight:Bold">La configuration réseau</span>
 ```yaml
 -----------
 | EXEMPLE |
 -----------
supervisor-2:
  arch: x86_64
  os: ubuntu_22.04
  model: nuc
  ansible_host: 192.168.1.7
  roles:
    - supervisor
  networks_interfaces:
    box-network: <------- box-deploy interface
      dhcp: false
      network_manager: netplan
      ip: 192.168.1.7
      ether: 88:ae:dd:xx:xx:xx
      gateways:
        - to: default
          via: 192.168.1.254
    private-gateway: <------- private-gateway interface
      dhcp: false
      network_manager: netplan
      ip: 192.168.0.37
      ether: 00:0e:c6:xx:xx:xx
 ```

 - <span style="color:orange;font-weight:Bold">Installation d'un LoadBalancer sous un FloatingIP</span>

 ```yaml
 -----------
 | EXEMPLE |
 -----------
kube_master:
vars:
  vips:
    - name: box-network
      master: master-1
      interface: box-network 
      virtual_router_id: 3
      vip: "{{ loadbalancer_apiserver.address }}"
hosts:
  master-1:
    box-network:
      priority: 200
      state: MASTER
  master-2:
    box-network:
      priority: 100
      state: BACKUP
  master-3:
    box-network:
      priority: 50
      state: BACKUP   
 ```
 - <span style="color:orange;font-weight:Bold">Déploiement de Elasticsearch et Kibana dans le cluster Kubernetes</span>
 ```yml
-----------
| EXEMPLE |
-----------
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
kibana:
  hosts:
    gateway-1:
 ```
### 4. Roles
Ce schema d'architecture est interprété et traité par diverses roles dont:

| Roles      | Groupe | Runtime |
| ---------- | ------------ |-------------|
|<span style="color:orange;font-weight:Bold">factory/jenkins</span>| <span style="color:#8ED6FB;font-weight:Bold">CI/CD</span> | **systemd / docker-compose** |
|<span style="color:orange;font-weight:Bold">factory/gitlab</span>|<span style="color:#8ED6FB;font-weight:Bold">CI/CD</span>|**systemd / docker-compose**|
|<span style="color:orange;font-weight:Bold">DNSMASQ</span>| <span style="color:#8ED6FB;font-weight:Bold">Network</span> | **systemd**|
|<span style="color:orange;font-weight:Bold">network-setup</span>| <span style="color:#8ED6FB;font-weight:Bold">Network</span> | **netplan**|
|<span style="color:orange;font-weight:Bold">Docker</span>| <span style="color:#8ED6FB;font-weight:Bold">Docker</span> |**systemd**|
|<span style="color:orange;font-weight:Bold">docker-compose</span>|<span style="color:#8ED6FB;font-weight:Bold">Docker</span> | **Executable**|
|<span style="color:orange;font-weight:Bold">Docker Registry</span>|<span style="color:#8ED6FB;font-weight:Bold">Docker</span>|**systemd / docker-compose**|
|<span style="color:orange;font-weight:Bold">Gateway (HAProxy/Nginx)</span>|<span style="color:#8ED6FB;font-weight:Bold">Network</span>|**systemd / docker-compose**|
|<span style="color:orange;font-weight:Bold">KeepAlived</span>|<span style="color:#8ED6FB;font-weight:Bold">Network</span> |**systemd**|
|<span style="color:orange;font-weight:Bold">GlusterFS</span>|<span style="color:#8ED6FB;font-weight:Bold">Volume</span>|**systemd**|
|<span style="color:orange;font-weight:Bold">set-hostname</span>|<span style="color:#8ED6FB;font-weight:Bold">OS</span>|**linux**|
|<span style="color:orange;font-weight:Bold">monitoring/consul</span>|<span style="color:#8ED6FB;font-weight:Bold">Monitoring</span>|**systemd / docker-compose**|
|<span style="color:orange;font-weight:Bold">monitoring/prometheus</span>|<span style="color:#8ED6FB;font-weight:Bold">Monitoring</span>|**docker-compose**|
|<span style="color:orange;font-weight:Bold">monitoring/grafana</span>|<span style="color:#8ED6FB;font-weight:Bold">Monitoring</span>|**docker-compose**|
|<span style="color:orange;font-weight:Bold">monitoring/kiosk</span>|<span style="color:#8ED6FB;font-weight:Bold">Monitoring</span>|**wayland/xserver/chromium-headless**|
|<span style="color:orange;font-weight:Bold">monitoring/nodeexporter</span>|<span style="color:#8ED6FB;font-weight:Bold">Monitoring</span>|**systemd**|
|<span style="color:orange;font-weight:Bold">kubernetes/cluster-setup</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/cni</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/dashboard</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/deploy-app</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/kubectl-setup</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/kubespray</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/kustomize-install</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/loadbalancer</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">kubernetes/registry</span>|<span style="color:#8ED6FB;font-weight:Bold">Kubernetes</span>|**Kubernetes**|
|<span style="color:orange;font-weight:Bold">ldap</span>|<span style="color:#8ED6FB;font-weight:Bold">Auth</span>|**systemd / docker-compose**|