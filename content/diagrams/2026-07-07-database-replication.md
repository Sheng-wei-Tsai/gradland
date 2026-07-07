---
title: "Database Replication"
date: "2026-07-07"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client App"]
      Primary["Primary DB"]
      R1["Replica 1"]
      R2["Replica 2"]
      
      Client -->|Write| Primary
      Client -->|Read| R1
      Client -->|Read| R2
      Primary -->|Async Replicate| R1
      Primary -->|Async Replicate| R2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from a primary database to one or more replica databases in real-time or near-real-time, keeping them synchronized. It enables high availability by providing failover when the primary fails, improves read performance by distributing queries across replicas, and protects against data loss.
