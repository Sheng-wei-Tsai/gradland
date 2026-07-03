---
title: "CAP Theorem"
date: "2026-07-03"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart LR
    CAP["CAP: Pick 2"]
    
    C["Consistency"]
    A["Availability"]
    P["Partitions"]
    
    CA["CA<br/>PostgreSQL"]
    CP["CP<br/>HBase"]
    AP["AP<br/>DynamoDB"]
    
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

The CAP Theorem states that a distributed system can guarantee only two of three properties: Consistency (all nodes see the same data), Availability (remains operational), or Partition tolerance (survives network splits). Understanding CAP forces you to choose which two properties to optimize for when building databases or services, since you cannot achieve all three simultaneously.
