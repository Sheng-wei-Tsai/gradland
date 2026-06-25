---
title: "Database Replication"
date: "2026-06-25"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      Client["Client"]
      Primary["Primary DB<br/>(Writes)"]
      Replica1["Read Replica 1"]
      Replica2["Read Replica 2"]
      
      Client -->|write| Primary
      Primary -->|async<br/>replication| Replica1
      Primary -->|async<br/>replication| Replica2
      Replica1 -->|read| Client
      Replica2 -->|read| Client
      
      style Primary fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication is the process of copying data from a primary database to one or more secondary databases, keeping them synchronized in real-time or near-real-time. It matters because it enables high availability, distributes read load across multiple servers, provides disaster recovery by maintaining backups in different locations, and ensures data resilience if the primary fails.
