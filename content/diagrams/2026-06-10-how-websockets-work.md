---
title: "How WebSockets Work"
date: "2026-06-10"
topic: "Networking"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      participant C as Client
      participant S as Server
      
      C->>S: Upgrade Request
      S->>C: 101 Switching
      
      Note over C,S: Full-Duplex Channel
      C->>S: Data Frame
      S->>C: Data Frame
      C->>S: Ping
      S->>C: Pong
      C->>S: Close
      S->>C: Close Ack
---

WebSockets are a network protocol that establishes a persistent, bidirectional connection between a client and server, allowing both sides to send messages independently without the request-response overhead of HTTP. This makes them essential for real-time features like live notifications, collaborative editing, or multiplayer interactions where low latency and frequent updates are critical.
