---
title: "Database Replication"
date: "2026-06-20"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client"]
      Primary["Primary DB"]
      Replica1["Replica 1"]
      Replica2["Replica 2"]
      
      Client -->|Write| Primary
      Client -->|Read| Replica1
      Client -->|Read| Replica2
      Primary -->|Async<br/>Replicate| Replica1
      Primary -->|Async<br/>Replicate| Replica2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from one database (primary) to one or more other databases (replicas) in real-time or near real-time. It matters because it enables high availability, improves read scalability by distributing queries across replicas, and provides disaster recovery by maintaining backup copies in case the primary fails.
