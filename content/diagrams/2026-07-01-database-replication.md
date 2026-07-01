---
title: "Database Replication"
date: "2026-07-01"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      App["Application"]
      Primary["Primary DB"]
      R1["Replica 1"]
      R2["Replica 2"]
      
      App -->|Write| Primary
      Primary -->|Async Replicate| R1
      Primary -->|Async Replicate| R2
      R1 -->|Read| App
      R2 -->|Read| App
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is copying data from a primary database to one or more secondary replicas in real-time, keeping them synchronized. It enables high availability by allowing failover if the primary fails, improves read performance by distributing queries across replicas, and protects against data loss.
