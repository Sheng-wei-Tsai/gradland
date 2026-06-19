---
title: "CAP Theorem"
date: "2026-06-19"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["CAP Theorem<br/>Pick 2 of 3"]
      
      CA["CA<br/>Consistency<br/>Availability<br/>PostgreSQL"]
      CP["CP<br/>Consistency<br/>Partition Tolerance<br/>MongoDB"]
      AP["AP<br/>Availability<br/>Partition Tolerance<br/>DynamoDB"]
      
      CAP --> CA
      CAP --> CP
      CAP --> AP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that distributed systems can guarantee only two of three properties: Consistency (all nodes see the same data), Availability (system remains operational), and Partition tolerance (survives network failures). Understanding CAP helps you make intentional tradeoffs when designing systems—you cannot have all three, so you must choose which two matter most for your use case.
