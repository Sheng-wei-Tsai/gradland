---
title: "How OAuth 2.0 Works"
date: "2026-06-27"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      participant User
      participant App as Client App
      participant Auth as Auth Server
      participant API as Resource Server
  
      User->>App: Click Login
      App->>Auth: Request authorization
      Auth->>User: Consent screen
      User->>Auth: Grant permission
      Auth->>App: Authorization code
      App->>Auth: Exchange code for token
      Auth->>App: Access token
      App->>API: Get protected resource
      API->>App: Resource
      App->>User: Login complete
---

OAuth 2.0 is an authorization protocol that lets users grant third-party apps access to their resources on another service without sharing passwords. It matters because it enables secure, delegated access across services while keeping credentials private and letting users revoke access granularly.
