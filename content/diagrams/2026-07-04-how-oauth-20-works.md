---
title: "How OAuth 2.0 Works"
date: "2026-07-04"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant Client as Client App
      participant Auth as Auth Server
      participant Resource as Resource Server
      
      User->>Client: Click Login
      Client->>Auth: Redirect to login
      User->>Auth: Authenticate & consent
      Auth->>Client: Return auth code
      Client->>Auth: Exchange code + secret
      Auth->>Client: Access token
      Client->>Resource: Request resource
      Resource->>Client: Secured resource
---

OAuth 2.0 is an authorization protocol that lets users grant third-party applications access to resources without sharing passwords — the app redirects to an identity provider, the user approves, and gets a token. It matters because it's the standard for secure API delegation, enabling microservices and federated auth while keeping secrets safe from clients.
