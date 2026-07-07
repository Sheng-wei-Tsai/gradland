---
title: "CAP Theorem"
date: "2026-07-07"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      THEOREM["CAP Theorem<br/>Pick 2 of 3"]
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      CA["CA:<br/>SQL"]
      CP["CP:<br/>HBase"]
      AP["AP:<br/>DynamoDB"]
      
      THEOREM --> C
      THEOREM --> A
      THEOREM --> P
      
      C -.-> CA
      A -.-> CA
      C -.-> CP
      P -.-> CP
      A -.-> AP
      P -.-> AP
      
      style THEOREM fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee at most two of three properties: Consistency (all nodes see the same data), Availability (always responsive), and Partition tolerance (works despite network failures). It matters because every system design requires tradeoffs between these three, and knowing which to sacrifice guides architectural decisions for databases and services.
