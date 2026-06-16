---
title: "CAP Theorem"
date: "2026-06-16"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      Rule["Pick 2 of 3"]
      
      CP["CP<br/>MongoDB, HBase"]
      AP["AP<br/>Cassandra, DynamoDB"]
      CA["CA<br/>MySQL, PostgreSQL"]
      
      C --> Rule
      A --> Rule
      P --> Rule
      
      Rule --> CP
      Rule --> AP
      Rule --> CA
      
      style Rule fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee only two of three properties: consistency (all nodes see the same data), availability (the system always responds), and partition tolerance (the system survives network failures). Understanding CAP forces you to make explicit tradeoffs when designing databases and services—choosing which property to sacrifice when network problems inevitably occur.
