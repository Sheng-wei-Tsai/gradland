---
title: "CAP Theorem"
date: "2026-06-22"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["Choose 2 of 3"]
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      CA["CA: RDBMS"]
      CP["CP: MongoDB"]
      AP["AP: DynamoDB"]
      
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

The CAP Theorem states that distributed systems can guarantee only two of three properties: consistency (uniform data across nodes), availability (system responsiveness), and partition tolerance (resilience to network splits). It matters because it reveals the fundamental trade-offs in distributed design—you must choose which two properties matter most for your use case rather than hoping for all three.
