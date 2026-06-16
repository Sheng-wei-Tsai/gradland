---
title: "Database Replication"
date: "2026-06-16"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      A["Application"]
      B["Primary DB"]
      C["Replica 1"]
      D["Replica 2"]
      
      A -->|Write| B
      B -->|Async Replication| C
      B -->|Async Replication| D
      A -->|Read| C
      A -->|Read| D
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from a primary database to one or more replica databases, keeping them synchronized in real time. It matters because it improves availability, fault tolerance, and read performance by distributing the data across multiple servers.
