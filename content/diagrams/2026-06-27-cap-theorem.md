---
title: "CAP Theorem"
date: "2026-06-27"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  graph TD
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      C --> CA["CA<br/>RDBMS"]
      C --> CP["CP<br/>HBase"]
      
      A --> CA
      A --> AP["AP<br/>DynamoDB"]
      
      P --> CP
      P --> AP
      
      style P fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem says a distributed system can guarantee at most two of three properties: Consistency (all nodes see identical data), Availability (system responds to requests), and Partition tolerance (system survives network failures). This matters because it forces you to choose which two properties to prioritize when designing distributed systems based on your use case.
