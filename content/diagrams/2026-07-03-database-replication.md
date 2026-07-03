---
title: "Database Replication"
date: "2026-07-03"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      App["Application"]
      Primary["Primary DB"]
      Rep1["Replica 1"]
      Rep2["Replica 2"]
      
      App -->|Write| Primary
      Primary -->|Async replicate| Rep1
      Primary -->|Async replicate| Rep2
      App -->|Read| Rep1
      App -->|Read| Rep2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication copies data across multiple database instances so that changes to one database are automatically synchronized to replicas. It matters because it enables high availability by preventing single points of failure, distributes read load across replicas, and protects against data loss.
