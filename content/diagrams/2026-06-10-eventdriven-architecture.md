---
title: "Event-Driven Architecture"
date: "2026-06-10"
topic: "System Design"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      P1["Producer A<br/>Order"]
      P2["Producer B<br/>Payment"]
      P3["Producer C<br/>Inventory"]
      
      Bus["Event Bus"]
      
      C1["Consumer A<br/>Email"]
      C2["Consumer B<br/>Analytics"]
      C3["Consumer C<br/>Notification"]
      
      P1 -->|emit| Bus
      P2 -->|emit| Bus
      P3 -->|emit| Bus
      
      Bus -->|route| C1
      Bus -->|route| C2
      Bus -->|route| C3
      
      style Bus fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Event-Driven Architecture is a design pattern where independent services communicate by emitting and reacting to events asynchronously rather than calling each other directly. This decoupling lets components scale independently, respond dynamically to state changes, and be modified without breaking dependent services.
