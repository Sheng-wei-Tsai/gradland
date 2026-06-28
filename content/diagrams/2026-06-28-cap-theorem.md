---
title: "CAP Theorem"
date: "2026-06-28"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  graph TD
      THEOREM["Pick 2 of 3"]
      C["Consistency"]
      A["Availability"]
      P["Partition Tolerance"]
      
      CA["CA: PostgreSQL"]
      CP["CP: MongoDB"]
      AP["AP: Cassandra"]
      
      THEOREM --> C
      THEOREM --> A
      THEOREM --> P
      
      C --> CA
      A --> CA
      C --> CP
      P --> CP
      A --> AP
      P --> AP
      
      style THEOREM fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

CAP Theorem says a distributed system can guarantee at most two of three properties: Consistency (all nodes see the same data), Availability (the system responds to requests), and Partition tolerance (system works when networks split). It matters because it forces explicit tradeoffs—you can't have all three, so you must choose which two fit your use case.
