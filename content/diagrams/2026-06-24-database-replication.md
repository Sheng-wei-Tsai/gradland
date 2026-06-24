---
title: "Database Replication"
date: "2026-06-24"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      A["Client"] -->|Write| P["Primary DB"]
      P -->|Async Replicate| R1["Replica 1"]
      P -->|Async Replicate| R2["Replica 2"]
      P -->|Async Replicate| R3["Replica 3"]
      A -->|Read| R1
      A -->|Read| R2
      A -->|Read| R3
      style P fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying and maintaining identical copies of a database across multiple servers or data centers. It matters because it improves system availability, allows distributing read queries across replicas for better performance, and protects against data loss if one database fails.
