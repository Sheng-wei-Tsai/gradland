---
title: "Pub/Sub vs Message Queue"
date: "2026-06-13"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      P["Producer"]
      
      P -->|Enqueue| Q["Queue"]
      P -->|Publish| T["Topic"]
      
      Q -->|Pull<br/>FIFO| C["Consumer<br/>Group"]
      
      T -->|Fan-out| S1["Subscriber 1"]
      T -->|Fan-out| S2["Subscriber 2"]
      T -->|Fan-out| S3["Subscriber 3"]
      
      style Q fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
      style T fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Pub/Sub broadcasts a single message to multiple subscribers simultaneously, while a message queue stores messages for one consumer to retrieve and process. Use pub/sub to notify many services of an event, and queues when you need durable, load-balanced processing of individual messages.
