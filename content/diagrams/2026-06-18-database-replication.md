---
title: "Database Replication"
date: "2026-06-18"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      A["Clients"]
      B["Primary DB"]
      C["Replica 1<br/>Read Only"]
      D["Replica 2<br/>Read Only"]
      
      A -->|Writes| B
      B -->|Async Copy| C
      B -->|Async Copy| D
      A -->|Reads| C
      A -->|Reads| D
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from one database to one or more other databases in real-time or near-real-time, keeping multiple copies synchronized. It enables high availability by allowing queries to be distributed across replicas, prevents data loss if a primary server fails, and improves read performance by spreading traffic across multiple copies.
