---
title: "CAP Theorem"
date: "2026-06-18"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["CAP Theorem<br/>Choose 2 of 3"]
      
      C["Consistency<br/>All data agrees"]
      A["Availability<br/>Always responds"]
      P["Partition Tolerance<br/>Survives splits"]
      
      CP["CP Databases<br/>MongoDB, HBase<br/>Strong consistency"]
      AP["AP Databases<br/>Cassandra, DynamoDB<br/>High availability"]
      CA["CA Databases<br/>Traditional SQL<br/>No network failure"]
      
      CAP --> C
      CAP --> A  
      CAP --> P
      
      C --> CP
      C --> CA
      A --> AP
      A --> CA
      P --> CP
      P --> AP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee at most two of three properties: consistency (all nodes see the same data), availability (system responds to requests), and partition tolerance (system survives network splits). This tradeoff helps you choose the right database and architecture for your application rather than assuming you can have all three.
