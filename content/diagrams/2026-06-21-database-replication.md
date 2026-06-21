---
title: "Database Replication"
date: "2026-06-21"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  graph LR
      Client["Client"]
      Primary["Primary DB<br/>(Writes)"]
      Replica1["Replica 1<br/>(Reads)"]
      Replica2["Replica 2<br/>(Reads)"]
      
      Client -->|Write| Primary
      Primary -->|Async<br/>Replicate| Replica1
      Primary -->|Async<br/>Replicate| Replica2
      Client -->|Read| Replica1
      Client -->|Read| Replica2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying and maintaining identical copies of data across multiple database servers in real time. It matters because it enables high availability, improves read performance by distributing queries, and provides disaster recovery so that if one database fails, others can take over without losing data.
