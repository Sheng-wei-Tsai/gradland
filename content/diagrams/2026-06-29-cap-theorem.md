---
title: "CAP Theorem"
date: "2026-06-29"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["CAP Theorem: Pick 2"]
      C["Consistency"]
      A["Availability"]
      P["Partition Tolerance"]
      CA["CA: Traditional RDBMS"]
      CP["CP: Strong Consistency"]
      AP["AP: Always Available"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      C --- CA
      A --- CA
      C --- CP
      P --- CP
      A --- AP
      P --- AP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee only two of three properties: Consistency (all nodes see the same data), Availability (system responds to requests), and Partition tolerance (system works despite network splits). Understanding this tradeoff is crucial because every distributed system design decision depends on which guarantee you prioritize based on your use case.
