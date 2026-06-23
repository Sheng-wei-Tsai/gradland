---
title: "CAP Theorem"
date: "2026-06-23"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      TITLE["CAP Theorem:<br/>Pick Any 2 of 3"]
      
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CA["CA: No Partition"]
      CP["CP: No Availability"]
      AP["AP: No Consistency"]
      
      TITLE --> C
      TITLE --> A
      TITLE --> P
      
      C --> CA
      A --> CA
      A --> AP
      P --> AP
      P --> CP
      C --> CP
      
      style TITLE fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee only two of three properties: Consistency (all nodes see the same data), Availability (the system stays responsive), and Partition tolerance (the system works despite network failures). Understanding CAP forces you to consciously choose which guarantee to sacrifice in your system design, influencing every architectural decision about databases and communication patterns.
