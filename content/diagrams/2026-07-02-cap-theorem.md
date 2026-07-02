---
title: "CAP Theorem"
date: "2026-07-02"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      THEOREM["CAP Theorem:<br/>Choose 2 of 3"]
      
      THEOREM --> CA["C + A<br/>ACID Databases"]
      THEOREM --> AP["A + P<br/>Eventual Consistency"]
      THEOREM --> CP["C + P<br/>Partition Priority"]
      
      style THEOREM fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that any distributed database can guarantee at most two of three properties: consistency (all nodes see the same data), availability (the system always responds), and partition tolerance (it survives network splits). It matters because it forces you to make explicit tradeoffs when designing systems—you can't have all three, so you must consciously choose which two match your application's actual needs.
