---
title: "How OAuth 2.0 Works"
date: "2026-06-17"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant App as Client App
      participant AuthSvr as Auth Server
      participant ResSvr as Resource Server
      
      User->>App: 1. Click Login
      App->>AuthSvr: 2. Redirect to authorize
      AuthSvr->>User: 3. Show login & consent
      User->>AuthSvr: 4. Submit credentials
      AuthSvr->>App: 5. Redirect + auth code
      App->>AuthSvr: 6. Exchange code for token
      AuthSvr->>App: 7. Return access token
      App->>ResSvr: 8. Request data + token
      ResSvr->>App: 9. Return protected data
      App->>User: 10. Logged in!
---

OAuth 2.0 is an authorization protocol that lets users grant applications access to their resources on another service without sharing passwords. It matters because it decouples authentication from credential exposure, enables granular permission control, and provides the standardized foundation for secure third-party integrations.
