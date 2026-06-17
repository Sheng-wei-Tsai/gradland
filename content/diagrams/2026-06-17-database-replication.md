---
title: "Database Replication"
date: "2026-06-17"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client"]
      Primary["Primary DB"]
      R1["Replica 1"]
      R2["Replica 2"]
      
      Client -->|Write| Primary
      Primary -->|Async Replicate| R1
      Primary -->|Async Replicate| R2
      R1 -->|Read| Client
      R2 -->|Read| Client
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from one database to one or more other databases in real-time or near-real-time, keeping them synchronized. It matters because it improves reliability by preventing single points of failure, enables better performance through read scaling, and ensures your system can survive hardware failures or data center outages.
