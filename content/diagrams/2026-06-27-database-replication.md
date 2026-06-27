---
title: "Database Replication"
date: "2026-06-27"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      W["Writes"]
      PDB["Primary DB"]
      R1["Replica 1"]
      R2["Replica 2"]
      R3["Replica 3"]
      RD["Reads"]
      
      W --> PDB
      PDB -->|async| R1
      PDB -->|async| R2
      PDB -->|async| R3
      R1 --> RD
      R2 --> RD
      R3 --> RD
      
      style PDB fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Database replication copies data across multiple database servers in real-time so every replica stays synchronized. This protects against failures, enables geographic distribution for faster access, and allows reads to be spread across replicas instead of hitting a single overloaded server.
