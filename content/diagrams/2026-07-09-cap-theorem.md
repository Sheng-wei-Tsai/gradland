---
title: "CAP Theorem"
date: "2026-07-09"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CP["C+P<br/>MongoDB<br/>PostgreSQL"]
      AP["A+P<br/>DynamoDB<br/>Cassandra"]
      
      C --> CP
      P --> CP
      
      A --> AP
      P --> AP
      
      style CP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee only two of three properties: Consistency (all nodes see same data), Availability (the system always responds), and Partition tolerance (systems work despite network splits). Understanding CAP matters because it forces you to make deliberate tradeoffs when designing databases—you cannot have all three, so you choose which two fit best.
