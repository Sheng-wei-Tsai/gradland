---
title: "CAP Theorem"
date: "2026-05-01"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  graph TD
      CAP["CAP Theorem"]
      
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CA["CA:<br/>PostgreSQL"]
      CP["CP:<br/>HBase"]
      AP["AP:<br/>DynamoDB"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      
      C --> CA
      A --> CA
      
      C --> CP
      P --> CP
      
      A --> AP
      P --> AP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can only guarantee two of three properties: Consistency (all nodes see same data), Availability (responsiveness), and Partition tolerance (surviving network failures). Understanding CAP helps you make trade-off decisions when designing databases and services—you must accept that perfect consistency and availability cannot coexist during network outages.
