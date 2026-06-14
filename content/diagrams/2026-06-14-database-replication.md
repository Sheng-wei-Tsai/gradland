---
title: "Database Replication"
date: "2026-06-14"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client"]
      Primary["Primary DB"]
      Rep1["Replica 1"]
      Rep2["Replica 2"]
      
      Client -->|Write| Primary
      Primary -->|Async| Rep1
      Primary -->|Async| Rep2
      Client -.->|Read| Rep1
      Client -.->|Read| Rep2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication copies data from one database server (primary) to one or more other servers (replicas) in real-time, keeping them synchronized. This matters because replicas enable read scaling, high availability through failover, and geographic distribution to reduce latency for users worldwide.
