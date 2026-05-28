---
title: "JWT Authentication Flow"
date: "2026-05-28"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      participant Client
      participant Server
      
      Client->>Server: Login request
      Server->>Client: JWT token issued
      Client->>Client: Store token
      Client->>Server: API + JWT header
      Server->>Server: Validate signature
      Server->>Client: Response OK
---

JWT (JSON Web Token) is a stateless authentication mechanism where the server signs a token containing user claims, and the client sends it with each request without server-side session storage. It matters because it enables scalable, distributed systems where any server can validate tokens independently, critical for microservices and mobile backends.
