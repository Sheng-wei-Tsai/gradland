---
title: "Microservices vs Monolith"
date: "2026-05-29"
topic: "System Design"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      M["Monolith"]
      MS["Microservices"]
      
      M_A["Deploy: All<br/>Scale: Vertical"]
      M_B["Comm: In-process<br/>Failure: Cascades"]
      
      MS_A["Deploy: Individual<br/>Scale: Horizontal"]
      MS_B["Comm: Network<br/>Failure: Isolated"]
      
      M --> M_A
      M --> M_B
      MS --> MS_A
      MS --> MS_B
---

A monolith is a single unified codebase handling all features, while microservices split functionality into independent, deployable services. Monoliths are simpler to start but harder to scale; microservices allow independent scaling and updates but introduce complexity in coordination and debugging.
