---
title: "CAP Theorem"
date: "2026-06-25"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["CAP Theorem<br/>Pick 2 of 3"]
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      CA["CA<br/>SQL Databases"]
      CP["CP<br/>MongoDB, HBase"]
      AP["AP<br/>DynamoDB, Cassandra"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      C --> CA
      C --> CP
      A --> CA
      A --> AP
      P --> CP
      P --> AP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee only two of three properties: Consistency (all nodes see the same data), Availability (the system remains responsive), and Partition tolerance (the system survives network splits). This matters because every distributed system design involves trade-offs—you must choose which two of the three to prioritize based on your application's needs.
