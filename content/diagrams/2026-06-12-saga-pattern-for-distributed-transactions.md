---
title: "Saga Pattern for Distributed Transactions"
date: "2026-06-12"
topic: "Distributed Systems"
difficulty: "advanced"
mermaid: |
  flowchart TD
      A["Saga:<br/>Choreography<br/>vs Orchestration"]
      B["Choreography<br/>(Event-Driven)"]
      C["Orchestration<br/>(Coordinator)"]
      D["Execute<br/>Services"]
      E["✓ Commit"]
      F["✗ Rollback"]
      G["Compensating<br/>Transactions"]
      H["Saga Complete"]
      
      A --> B
      A --> C
      B --> D
      C --> D
      D --> E
      D --> F
      F --> G
      E --> H
      G --> H
      
      style A fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A saga is a sequence of local transactions across multiple services where each step publishes an event triggering the next, with rollback transactions to undo failures. It matters because you can't use traditional database transactions across separate services, so sagas maintain consistency when an operation spans multiple databases or microservices.
