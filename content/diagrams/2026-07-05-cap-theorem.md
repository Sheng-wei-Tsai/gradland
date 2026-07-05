---
title: "CAP Theorem"
date: "2026-07-05"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CAP["CAP Theorem:<br/>Pick 2"]
      
      CP["CP<br/>Consistency +<br/>Partition<br/>MongoDB"]
      AP["AP<br/>Availability +<br/>Partition<br/>Cassandra"]
      CA["CA<br/>Consistency +<br/>Availability<br/>SQL"]
      
      C --> CAP
      A --> CAP
      P --> CAP
      
      CAP --> CP & AP & CA
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that distributed systems can guarantee at most two of three properties: Consistency (all nodes see identical data), Availability (always responds), and Partition tolerance (survives network splits). It matters because it forces architectural trade-offs—you must choose which property to sacrifice based on your application's needs.
