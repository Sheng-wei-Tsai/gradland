---
title: "CAP Theorem"
date: "2026-07-04"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      Title["CAP Theorem:<br/>Pick 2 of 3"]
      
      Title --> C["Consistency"]
      Title --> A["Availability"]
      Title --> P["Partition<br/>Tolerance"]
      
      C -->|+ Availability| CA["CA Mode<br/>PostgreSQL"]
      C -->|+ Partition| CP["CP Mode<br/>MongoDB"]
      A -->|+ Partition| AP["AP Mode<br/>Cassandra"]
      
      style Title fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem says distributed systems can guarantee at most two of three properties: Consistency (all nodes see same data), Availability (responds to requests), and Partition tolerance (survives network failures). Understanding CAP forces you to design with explicit tradeoffs—you cannot have all three, so you must choose which two matter most for your application.
