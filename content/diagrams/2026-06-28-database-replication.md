---
title: "Database Replication"
date: "2026-06-28"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart TB
      App["App"]
      Primary["Primary DB"]
      R1["Replica 1"]
      R2["Replica 2"]
      
      App -->|Write| Primary
      Primary -->|Async replicate| R1
      Primary -->|Async replicate| R2
      App -->|Read| R1
      App -->|Read| R2
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from one database instance to one or more other instances in real-time or near real-time. It matters because it enables high availability, fault tolerance, and geographic distribution—if one database fails, others contain the same data, and users in different regions can read from nearby copies.
