---
title: "Database Replication"
date: "2026-06-22"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      App["Client"]
      Primary["Primary DB"]
      Rep1["Replica 1"]
      Rep2["Replica 2"]
      
      App -->|Write| Primary
      Primary -->|Async Replicate| Rep1
      Primary -->|Async Replicate| Rep2
      App -->|Read| Rep1
      App -->|Read| Rep2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication copies data from a primary database to one or more secondary databases in real time or near real time. It matters because it improves availability, enables read scaling, and provides disaster recovery so that if the primary fails, a replica can take over.
