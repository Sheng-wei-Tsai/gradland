---
title: "Database Replication"
date: "2026-07-08"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client"]
      Primary["Primary DB"]
      R1["Replica 1"]
      R2["Replica 2"]
      R3["Replica 3"]
      
      Client -->|write| Primary
      Primary -->|replicate| R1
      Primary -->|replicate| R2
      Primary -->|replicate| R3
      R1 -->|read| Client
      R2 -->|read| Client
      R3 -->|read| Client
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from one database (the primary) to one or more other databases (the replicas) in real time. This matters because replicas enable read scaling, geographic redundancy, and high availability—if the primary fails, a replica can be promoted to keep the system running.
