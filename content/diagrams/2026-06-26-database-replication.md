---
title: "Database Replication"
date: "2026-06-26"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client/App"]
      Primary["Primary"]
      R1["Replica 1"]
      R2["Replica 2"]
      
      Client -->|Write| Primary
      Primary -->|Async Replicate| R1
      Primary -->|Async Replicate| R2
      Client -->|Read| R1
      Client -->|Read| R2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is copying data from one database to one or more other databases in real-time or near-real-time so they stay synchronized. This matters because it enables high availability (if one database fails others can serve traffic), geographic distribution (serve users from nearby servers), and read scaling (distribute queries across replicas).
