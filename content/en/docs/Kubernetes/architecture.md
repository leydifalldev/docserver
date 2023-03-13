---
title: "Architecture"
date: 2022-12-28T21:48:04+01:00
weight: 1
menu:
  main:
    title: "how to use menus in templates"
    parent: "templates"
    weight: 1
---

## 1. Présentation
Le cluster kubernetes est la partie centrale de l'infrastructure.

Dans l'infrastructure, on dispose 2 groupes d'applications:
 - Les applications qui joue le role de gestion du cluster
 - Les applications qui fonctionnent au sein du cluster Kubernetes pour des usages externes

## 2. Inventaire

Groupes du cluster

- **master-pool** (3 hosts)
- **datase-pool** (3 hosts)
- **search-engine-pool** (3 hosts)
- **node-pool** (2 hosts)
- **gateway-pool** (3 hosts)
- **supervisor** (1 host)

## 3. Architecture

![infra](images/kube-archi.png)

![infra](images/kube-network-archi.png)


## 4. Applications
  - Apiserver
  - Scheduler
  - Controller-manager
  - Kube-proxy
  - Kubelet
  - CoreDNS
  - Nodelocaldns
  - Calico

## 5. Installation
L'installation du cluster est assuré par 3 roles ansibles définis dans le framework protobox

```yaml
- name: Install master pool
  hosts: supervisor-1
  become: yes
  roles:
    - role: kubernetes/kubespray-init

- name: Install Kubernetes API Server LoadBalancer
  hosts: kube_master
  become: yes
  roles:
    - role: network-setup
      vars:
        netplan_init: true
        netplan_setup: true
        reboot: true
    - role: etc-hosts
    - role: keepalived
    - role: haproxy
      vars:
        cluster: kube_master
        frontend_port: "{{ loadbalancer_apiserver.port }}"
        backend_port: 6443
    - role: reboot

- name: Execute kubespray
  import_playbook: roles/kubernetes/kubespray/cluster.yml

- name: Setup calico
  hosts: master-1
  become: true
  roles:
    - role: kubernetes/cni
    - role: kubernetes/dashboard

- import_playbook: playbooks-proxiserver-pool/proxiserver-reload.yml
```

### Etapes
<span style="color:orange;font-weight:Bold">1.</span> Usage du role <span style="color:orange;font-weight:Bold">kubernetes/kubespray-init</span><br/> permet de cloner kubespray (module offciel ansible pour mettre en place un cluster kubernetes) et l'intégrer également dans le framework protobox

<span style="color:orange;font-weight:Bold">2.</span> Installation du <span style="color:orange;font-weight:Bold">Load-balancer</span> <br/>pour s'interfacer avec apiserver
Le control plane est répliqué sur 3 machines (master-pool) et expose l'api-server. La communication via
un load-balancer répliqué sur chaque master au front de l'api. Pour cela 2 outils permettent cette configuration.
- <span style="color:orange;font-weight:Bold">KeepAlived</span> pour maintenir un floatingIP
- <span style="color:orange;font-weight:Bold">HAProxy</span> pour la mise en place d'un load-balancer

<span style="color:orange;font-weight:Bold">3.</span> Execution de <span style="color:orange;font-weight:Bold">Kubespray</span><br/>
Kubespray se base sur l'inventory pour parametrer l'installation
```yaml
--------------------------------------------------------
path: inventories/protobox/main.yml   
--------------------------------------------------------
...

kube_control_plane:
  hosts:
    master-1:
    master-2:
    master-3:
      
kube_node:
  vars:
    gateway-i: 192.168.1.1
    gateway-o: 192.168.0.33
  hosts:
    gateway-1:
    gateway-2:
    
etcd:
  hosts:
    master-1:
    master-2:
    master-3:
      
k8s_cluster:
  children:
    kube_master:
    kube_node:

calico_rr:
  hosts: {}

...
```

```yaml
--------------------------------------------------------
path: inventories/protobox/group_vars/all/all.yml   
--------------------------------------------------------
bin_dir: /usr/local/bin
apiserver_loadbalancer_domain_name: "kube.plane.box"
loadbalancer_apiserver:
  address: 192.168.1.10
  port: 6442
loadbalancer_apiserver_port: 6443
loadbalancer_apiserver_healthcheck_port: 8081
no_proxy_exclude_workers: false
kube_webhook_token_auth: false
kube_webhook_token_auth_url_skip_tls_verify: false
ntp_enabled: false
ntp_manage_config: false
ntp_servers:
  - "0.pool.ntp.org iburst"
  - "1.pool.ntp.org iburst"
  - "2.pool.ntp.org iburst"
  - "3.pool.ntp.org iburst"
unsafe_show_logs: false
```

```yaml
-----------------------------------------------------------------
path: inventories/protobox/group_vars/k8s-cluster/k8s-cluster.yml   
-----------------------------------------------------------------
kube_config_dir: /etc/kubernetes
kube_script_dir: "{{ bin_dir }}/kubernetes-scripts"
kube_manifest_dir: "{{ kube_config_dir }}/manifests"
kube_cert_dir: "{{ kube_config_dir }}/ssl"
kube_token_dir: "{{ kube_config_dir }}/tokens"
kube_api_anonymous_auth: true
kube_version: v1.25.3
local_release_dir: "/tmp/releases"
retry_stagger: 5
kube_owner: kube
kube_cert_group: kube-cert
kube_log_level: 2
credentials_dir: "{{ inventory_dir }}/credentials"
kube_network_plugin: calico
kube_network_plugin_multus: true
kube_service_addresses: 10.233.0.0/18
kube_pods_subnet: 10.233.64.0/18
kube_network_node_prefix: 24
enable_dual_stack_networks: false
kube_apiserver_ip: "{{ kube_service_addresses|ipaddr('net')|ipaddr(1)|ipaddr('address') }}"
kube_apiserver_port: 6443
kube_proxy_mode: ipvs
kube_proxy_strict_arp: true
kube_proxy_nodeport_addresses: >-
  {%- if kube_proxy_nodeport_addresses_cidr is defined -%}
  [{{ kube_proxy_nodeport_addresses_cidr }}]
  {%- else -%}
  []
  {%- endif -%}
kube_encrypt_secret_data: false
cluster_name: cluster.local
ndots: 2
dns_mode: coredns
enable_nodelocaldns: true
enable_nodelocaldns_secondary: false
nodelocaldns_ip: 169.254.25.10
nodelocaldns_health_port: 9254
nodelocaldns_second_health_port: 9256
nodelocaldns_bind_metrics_host_ip: false
nodelocaldns_secondary_skew_seconds: 5
enable_coredns_k8s_external: false
coredns_k8s_external_zone: k8s_external.local
enable_coredns_k8s_endpoint_pod_names: false
resolvconf_mode: host_resolvconf
deploy_netchecker: false
skydns_server: "{{ kube_service_addresses|ipaddr('net')|ipaddr(3)|ipaddr('address') }}"
skydns_server_secondary: "{{ kube_service_addresses|ipaddr('net')|ipaddr(4)|ipaddr('address') }}"
dns_domain: "{{ cluster_name }}"
container_manager: containerd
kata_containers_enabled: false
kubeadm_certificate_key: "{{ lookup('password', credentials_dir + '/kubeadm_certificate_key.creds length=64 chars=hexdigits') | lower }}"
k8s_image_pull_policy: IfNotPresent
kubernetes_audit: false
default_kubelet_config_dir: "{{ kube_config_dir }}/dynamic_kubelet_dir"
podsecuritypolicy_enabled: false
volume_cross_zone_attachment: false
persistent_volumes_enabled: false
event_ttl_duration: "1h0m0s"
auto_renew_certificates: false
kubeadm_patches:
  enabled: false
  source_dir: "{{ inventory_dir }}/patches"
  dest_dir: "{{ kube_config_dir }}/patches"

```

```yaml
--------------------------------------------------------
path: inventories/protobox/group_vars/all/containerd.yml   
--------------------------------------------------------
containerd_registry_auth:
  - registry: registry.protobox
    username: XXXXX
    password: XXXXX
```

```yaml
--------------------------------------------------------
path: inventories/protobox/group_vars/all/cri-o.yml   
--------------------------------------------------------
crio_insecure_registries:
  - registry.protobox
crio_registry_auth:
  - registry: registry.protobox
    username: XXXXX
    password: XXXXX
```

<span style="color:orange;font-weight:Bold">4.</span> Execution de <span style="color:orange;font-weight:Bold">kubernetes/kubectl-setup</span><br/>
Ce module va effectuer des configurations supplémentaires telque l'intallation de kubectl, kubeadm etc

<span style="color:orange;font-weight:Bold">5.</span> Execution de <span style="color:orange;font-weight:Bold">kubernetes/kubectl-cni</span><br/>
Ce role est utilisé par protobox pour installer le réseau des pods de kubernetes

<span style="color:orange;font-weight:Bold">6.</span> Execution de <span style="color:orange;font-weight:Bold">kubernetes/dashboard</span>


## 6. Bilan