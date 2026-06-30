---
title: "Database Replication"
date: "2026-06-30"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client/App"]
      Primary["Primary DB"]
      R1["Replica 1"]
      R2["Replica 2"]
      
      Client -->|Write| Primary
      Primary -->|Async Replicate| R1
      Primary -->|Async Replicate| R2
      Client -->|Read| R1
      Client -->|Read| R2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication copies data across multiple database instances in real-time, keeping them synchronized. It matters because it enables high availability, fault tolerance, and load distribution—if one database fails, others continue serving requests.
