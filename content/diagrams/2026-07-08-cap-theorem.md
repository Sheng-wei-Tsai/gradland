---
title: "CAP Theorem"
date: "2026-07-08"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      CAP["CAP Theorem<br/>Pick 2"]
      
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CP["CP<br/>Strong<br/>Consistency"]
      AP["AP<br/>Eventual<br/>Consistency"]
      CA["CA<br/>No<br/>Partitions"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      
      C --> CP
      P --> CP
      
      A --> AP
      P --> AP
      
      C --> CA
      A --> CA
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem says distributed databases can only guarantee two of three properties: Consistency, Availability, and network Partition tolerance. It matters because it forces you to consciously trade off one property, ensuring your system design aligns with what your application actually needs.
