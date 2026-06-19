---
title: "Database Replication"
date: "2026-06-19"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      WC["Write Client"]
      Primary["Primary DB"]
      Replica1["Replica 1"]
      Replica2["Replica 2"]
      RC["Read Clients"]
      
      WC -->|Write| Primary
      Primary -->|Async| Replica1
      Primary -->|Async| Replica2
      Replica1 -->|Read| RC
      Replica2 -->|Read| RC
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication copies data from a primary database to replicas in real-time, keeping multiple copies synchronized across different servers or regions. It matters because it increases availability through redundancy, scales read performance by distributing queries across replicas, and enables automatic failover if the primary database fails.
