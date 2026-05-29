---
title: "How a Database Index Works"
date: "2026-05-29"
topic: "Databases"
difficulty: "beginner"
mermaid: |
  flowchart LR
    A["Query: id=5"]
    
    A -->|No Index| B["Scan All Rows<br/>O(n)"]
    A -->|B-tree Index| C["Binary Search<br/>O(log n)"]
    
    B --> D["1M+ checks"]
    C --> E["Log N checks"]
    
    D --> F["❌ Slow"]
    E --> G["✅ Fast"]
    
    style C fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A database index is a data structure that maintains a sorted copy of selected columns, allowing the database to find rows without scanning every table entry. It matters because it dramatically speeds up queries and filters, reducing latency from seconds to milliseconds while increasing throughput for production applications.
