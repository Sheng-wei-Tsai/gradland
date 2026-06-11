---
title: "Circuit Breaker Pattern"
date: "2026-06-11"
topic: "Distributed Systems"
difficulty: "advanced"
mermaid: |
  flowchart TD
      CLOSED["CLOSED<br/>Pass requests"]
      OPEN["OPEN<br/>Reject all"]
      HALF["HALF-OPEN<br/>Test request"]
      
      CLOSED -->|Failures exceed<br/>threshold| OPEN
      OPEN -->|Timeout<br/>elapsed| HALF
      HALF -->|Success| CLOSED
      HALF -->|Failure| OPEN
      
      style OPEN fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The Circuit Breaker Pattern is a mechanism that prevents a service from repeatedly calling a failing external dependency by monitoring failures and temporarily stopping requests when a threshold is reached. It matters because it prevents cascading failures, gives the failing service time to recover, and avoids wasting resources on calls that will inevitably fail.
