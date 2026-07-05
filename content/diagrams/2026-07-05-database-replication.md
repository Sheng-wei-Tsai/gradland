---
title: "Database Replication"
date: "2026-07-05"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client"]
      Primary["Primary<br/>Write"]
      Async["Async<br/>Replication"]
      R1["Replica 1<br/>Read"]
      R2["Replica 2<br/>Read"]
      
      Client -->|Write| Primary
      Primary -->|Replicate| Async
      Async -->|Copy| R1
      Async -->|Copy| R2
      Client -->|Read| R1
      Client -->|Read| R2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from a primary database to one or more secondary databases in real-time or near real-time. It matters because it enables high availability, fault tolerance, and read scalability—if the primary fails, you can fail over to a replica, and you can distribute read traffic across multiple copies.
