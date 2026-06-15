---
title: "CAP Theorem"
date: "2026-06-15"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      CAP["CAP Theorem<br/>Pick 2 of 3"]
      
      CA["CA<br/>No Partitions<br/>PostgreSQL"]
      CP["CP<br/>No Availability<br/>MongoDB"]
      AP["AP<br/>No Consistency<br/>Cassandra"]
      
      CAP --> CA
      CAP --> CP
      CAP --> AP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem says a distributed system can guarantee only two of three properties: Consistency (all nodes see the same data), Availability (always responsive), or Partition tolerance (works despite network failures). Understanding CAP matters because it forces explicit tradeoffs when designing databases—you must choose which two properties matter most for your application, since no system can have all three.
