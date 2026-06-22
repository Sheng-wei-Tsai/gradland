---
title: "How OAuth 2.0 Works"
date: "2026-06-22"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      participant User
      participant Client as Client App
      participant Auth as Auth Server
      participant Resource as Resource Server
      
      User->>Client: Click Login
      Client->>Auth: Request auth code
      Auth->>User: Show consent
      User->>Auth: Approve
      Auth->>Client: Send code
      Client->>Auth: Exchange code
      Auth->>Client: Send token
      Client->>Resource: Request data
      Resource->>Client: User profile
      Client->>User: Logged in
---

OAuth 2.0 is an authorization protocol that lets users grant third-party applications access to their data without sharing passwords by delegating to a trusted identity provider. It matters because it powers secure single-sign-on integrations across the web while limiting the blast radius if a user's credentials are compromised.
