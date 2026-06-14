---
title: "CAP Theorem"
date: "2026-06-14"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      A["CAP Theorem<br/>Pick 2 Props"]
      B["Consistency<br/>+ Availability"]
      C["Consistency<br/>+ Partition-Tol"]
      D["Availability<br/>+ Partition-Tol"]
      E["MySQL"]
      F["MongoDB"]
      G["Cassandra"]
      
      A --> B
      A --> C
      A --> D
      B -->|No P| E
      C -->|No A| F
      D -->|No C| G
      
      style A fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that distributed systems can guarantee only two of three properties: consistency (all nodes have identical data), availability (the system stays online), and partition tolerance (survives network failures). Understanding CAP matters because it forces you to consciously choose which two properties to optimize for, directly shaping design decisions for databases, caching, and replication strategies.
