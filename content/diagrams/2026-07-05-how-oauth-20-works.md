---
title: "How OAuth 2.0 Works"
date: "2026-07-05"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant Client as Client App
      participant AuthSvr as Auth Server
      participant ResSvr as Resource Server
  
      User->>Client: 1. Click "Login"
      Client->>AuthSvr: 2. Redirect + client_id
      AuthSvr->>User: 3. Show consent screen
      User->>AuthSvr: 4. Grant permission
      AuthSvr->>Client: 5. Redirect + auth code
      Client->>AuthSvr: 6. Exchange code + secret
      AuthSvr->>Client: 7. Return access token
      Client->>ResSvr: 8. Request data + token
      ResSvr->>Client: 9. Return user data
      Client->>User: 10. User logged in ✓
---

OAuth 2.0 is a protocol that lets users grant third-party apps access to their resources on another service without sharing passwords, using delegation via access tokens. It matters because it eliminates password sharing, reduces security surface area, and enables users to revoke access instantly without changing credentials.
