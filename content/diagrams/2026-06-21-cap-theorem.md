---
title: "CAP Theorem"
date: "2026-06-21"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["CAP Theorem<br/>Pick 2 of 3"]
      
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      
      CP["CP<br/>Postgres"]
      AP["AP<br/>Cassandra"]
      CA["CA<br/>Single Node"]
      
      C --> CP
      A --> AP
      P --> Split["Split:<br/>C or A?"]
      CAP --> CA
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that distributed systems can guarantee at most two of three properties: Consistency (all nodes see the same data), Availability (system always responds), and Partition tolerance (survives network splits). You need to understand this because every distributed system you design requires trading off one property, and the choice defines how your system behaves under failure.
