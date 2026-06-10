---
title: "ACID Database Transactions"
date: "2026-06-10"
topic: "Databases"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      Start["Transfer $100<br/>A to B"]
      A["Atomicity<br/>Both or Neither"]
      C["Consistency<br/>Total Same"]
      I["Isolation<br/>No Conflicts"]
      D["Durability<br/>Permanent"]
      Result["Committed"]
      
      Start --> A
      A --> C
      C --> I
      I --> D
      D --> Result
      
      style Start fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

ACID transactions are database operations that guarantee Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent operations don't interfere), and Durability (committed data persists). They matter because they prevent data corruption, race conditions, and partial failures that would otherwise leave your database in an inconsistent state when failures occur.
