---
title: "How OAuth 2.0 Works"
date: "2026-05-01"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      autonumber
      participant User
      participant App as Client App
      participant Auth as Auth Server
      participant API as Resource Server
      
      User->>App: Click login
      App->>Auth: Redirect + client_id
      Auth->>User: Show login screen
      User->>Auth: Submit credentials
      Auth->>User: Consent screen
      User->>Auth: Approve access
      Auth->>App: Authorization code
      App->>Auth: Exchange code
      Auth->>App: Access token
      App->>API: Request with token
      API->>App: Protected resource
      App->>User: Logged in ✓
---

OAuth 2.0 is an authorization protocol that lets users grant third-party applications access to their resources on another service without sharing passwords directly. It matters because it decouples authentication from authorization, limits credential exposure, and enables seamless single-sign-on while reducing the blast radius if any application is compromised.
