---
title : "Monitor"
description: "Prologue Doks."
lead: ""
date: 2020-10-06T08:48:45+00:00
lastmod: 2020-10-06T08:48:45+00:00
draft: false
images: []
weight: 1
---

## 1. Présentation
Le monitoring est essentiel à toute infrastructure IT afin de detecter ou de prévoir d'éventuels incidents.
Ce chapitre traite la surveillance matériel et logiciel de l'infrastructure et des outils utilisés pour assurer le bon fonctionnement du matériel. 

## 2. Architecture

![infra](images/monitoring-archi.png)

### 2.1. Inventaire
Le monitoring est assuré par le groupe de serveurs nat_gateway_pool comportant 2 serveurs intel nuc celeron

![infra](images/monitoring-pool.png)

## 3. Networking

![infra](images/monitoring-archi-1.png)

## 4. Applications

- <span style="color:orange;font-weight:Bold">Prometheus</span>
- <span style="color:orange;font-weight:Bold">Grafana</span>
- <span style="color:orange;font-weight:Bold">Consul</span>
- <span style="color:orange;font-weight:Bold">wpe-webkit-mir-kiosk (Headless Browser)</span>
- <span style="color:orange;font-weight:Bold">Wayland</span>

## 5. Installation
```yaml
- name: Setup Hardware monitor
  hosts: supervisor-1
  become: true
  user: supervisor
  gather_facts: false
  roles:
    - role: monitoring/init
    - role: monitoring/prometheus
    - role: monitoring/grafana
    - role: monitoring/kiosk

- name: Setup software monitor
  hosts: nat_gateway_pool
  become: true
  user: supervisor
  gather_facts: false
  roles:
    - role: monitoring/consul
```