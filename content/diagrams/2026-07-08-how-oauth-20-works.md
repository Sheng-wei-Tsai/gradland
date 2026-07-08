---
title: "How OAuth 2.0 Works"
date: "2026-07-08"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant ClientApp as Client App
      participant AuthServer as Auth Server
      participant ResourceServer as Resource<br/>Server
      
      User->>ClientApp: 1. Click "Login"
      ClientApp->>AuthServer: 2. Redirect to /authorize
      AuthServer->>User: 3. Show login & consent
      User->>AuthServer: 4. Authenticate & grant
      AuthServer->>ClientApp: 5. Redirect + auth code
      ClientApp->>AuthServer: 6. Exchange code for token
      AuthServer->>ClientApp: 7. Return access token
      ClientApp->>ResourceServer: 8. Request resource + token
      ResourceServer->>ClientApp: 9. Return protected data
      ClientApp->>User: 10. User logged in ✓
---

OAuth 2.0 is a delegated authorization protocol that lets users grant third-party applications access to their resources on another service without sharing passwords. It matters because it enables secure, user-controlled access delegation across services while maintaining strong security boundaries—eliminating the need to share credentials directly.
