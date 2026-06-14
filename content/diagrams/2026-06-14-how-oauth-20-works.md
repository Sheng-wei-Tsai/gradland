---
title: "How OAuth 2.0 Works"
date: "2026-06-14"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      participant User
      participant Client as Client App
      participant Auth as Auth Server
      participant Resource as Resource Server
  
      autonumber
      User->>Client: Click Login
      Client->>Auth: Redirect to /authorize
      Auth->>User: Show permission dialog
      User->>Auth: Grant permission
      Auth->>Client: Redirect + auth code
      Client->>Auth: POST token exchange
      Auth->>Client: Return access token
      Client->>Resource: GET /user + token
      Resource->>Client: Return user data
      Client->>User: Login complete
---

OAuth 2.0 is an authorization protocol that allows users to grant third-party applications access to their resources on another service without sharing their password. This matters because it enables secure delegation of permissions, reduces password sharing across sites, and forms the foundation for modern single sign-on and API access patterns.
