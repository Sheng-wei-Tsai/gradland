---
title: "CAP Theorem"
date: "2026-06-24"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CAP["Pick 2"]
      
      CA["CA<br/>PostgreSQL"]
      AP["AP<br/>DynamoDB"]
      CP["CP<br/>MongoDB"]
      
      C --> CAP
      A --> CAP
      P --> CAP
      
      CAP --> CA
      CAP --> AP
      CAP --> CP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that distributed systems can guarantee only two of three properties: Consistency (all nodes see the same data), Availability (the system responds to requests), and Partition tolerance (the system survives network splits). Understanding CAP forces you to make deliberate tradeoffs when designing databases and services, helping you pick the right tool for your reliability and performance constraints.
