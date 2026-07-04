---
title: "Database Replication"
date: "2026-07-04"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
    app["Client"]
    primary["Primary<br/>Database"]
    replica1["Replica 1"]
    replica2["Replica 2"]
    
    app -->|Write| primary
    primary -->|Async<br/>Replicate| replica1
    primary -->|Async<br/>Replicate| replica2
    replica1 -->|Read| app
    replica2 -->|Read| app
    
    style primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from one database to one or more replica databases in real-time or near real-time, keeping them synchronized. It matters because it enables read scaling, high availability, and disaster recovery by distributing queries across multiple nodes and ensuring data survives node failures.
