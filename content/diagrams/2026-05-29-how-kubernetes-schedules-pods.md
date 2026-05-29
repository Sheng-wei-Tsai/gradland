---
title: "How Kubernetes Schedules Pods"
date: "2026-05-29"
topic: "DevOps"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      User["User: kubectl apply"]
      API["API Server<br/>PENDING"]
      Sch["Scheduler<br/>selection"]
      Bind["Bind to Node"]
      Kub["Kubelet<br/>watches"]
      Start["Pull image<br/>& run"]
      Running["✅ RUNNING"]
      
      User -->|manifest| API
      API -->|pending pods| Sch
      Sch -->|bind pod| Bind
      Bind -->|assigned pod| Kub
      Kub -->|create container| Start
      Start -->|status update| Running
      
      style API fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Kubernetes scheduling is the process where the control plane assigns pods to nodes based on resource requests, affinity rules, and node availability. Understanding how this works matters because it directly impacts your application's resilience, resource efficiency, and ability to handle scale without manual intervention.
