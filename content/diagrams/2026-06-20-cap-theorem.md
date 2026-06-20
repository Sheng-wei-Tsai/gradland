---
title: "CAP Theorem"
date: "2026-06-20"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["CAP Theorem<br/>Pick 2 of 3"]
      
      CA["CA<br/>Consistency +<br/>Availability"]
      CP["CP<br/>Consistency +<br/>Partition Tolerance"]
      AP["AP<br/>Availability +<br/>Partition Tolerance"]
      
      CAP --> CA
      CAP --> CP
      CAP --> AP
      
      style CP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that distributed systems can guarantee at most two of three properties: consistency (all nodes see the same data), availability (system stays responsive), and partition tolerance (system survives network splits). It matters because you must make tradeoffs when designing systems—you can't have all three, so you choose which guarantees matter most for your use case.
