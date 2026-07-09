---
title: "Database Replication"
date: "2026-07-09"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      A["Application"] -->|Write| P["Primary DB"]
      A -->|Read| R1["Replica 1"]
      A -->|Read| R2["Replica 2"]
      P -->|"Async Replication"| R1
      P -->|"Async Replication"| R2
      style P fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication copies data across multiple database instances or servers in real-time, ensuring the same data exists in multiple places. This matters because it enables high availability (if one database fails, others take over), read scalability (distribute queries across replicas), and disaster recovery, making systems resilient and performant.
