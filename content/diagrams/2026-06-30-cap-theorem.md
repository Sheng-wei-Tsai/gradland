---
title: "CAP Theorem"
date: "2026-06-30"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      TITLE["CAP Theorem<br/>Pick 2 of 3"]
      
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CA["CA<br/>Fail-Stop"]
      AP["AP<br/>Eventual"]
      CP["CP<br/>Resilient"]
      
      TITLE --> C
      TITLE --> A
      TITLE --> P
      
      C --> CA
      A --> CA
      A --> AP
      P --> AP
      C --> CP
      P --> CP
      
      style TITLE fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee at most two of three properties: consistency (all nodes see the same data), availability (system responds to requests), and partition tolerance (system survives network splits). This matters because it forces you to consciously choose which trade-offs fit your application's needs rather than assuming you can have everything.
