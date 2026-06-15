---
title: "How OAuth 2.0 Works"
date: "2026-06-15"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant App as Client App
      participant Auth as Auth Server
      participant API as Resource Server
  
      User->>App: 1. Login
      App->>Auth: 2. Redirect
      User->>Auth: 3. Login & grant
      Auth->>App: 4. Auth code
      App->>Auth: 5. Exchange code
      Auth->>App: 6. Token
      App->>API: 7. Access request
      API->>App: 8. Protected data
      App->>User: 9. Session created
---

OAuth 2.0 is a delegated authorization protocol that lets users grant third-party apps access to their resources on another service without sharing passwords. It eliminates password sharing, reduces your app's liability for storing credentials, and lets users revoke access per-app instead of changing their password.
