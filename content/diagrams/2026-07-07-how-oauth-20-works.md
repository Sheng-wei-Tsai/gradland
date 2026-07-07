---
title: "How OAuth 2.0 Works"
date: "2026-07-07"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant App as Client App
      participant AuthSrv as Auth Server
      participant API as Resource Server
      
      User->>App: 1. Login click
      App->>AuthSrv: 2. Redirect to auth
      AuthSrv->>User: 3. Consent screen
      User->>AuthSrv: 4. Approve
      AuthSrv->>App: 5. Auth code
      App->>AuthSrv: 6. Code + secret
      AuthSrv->>App: 7. Access token
      App->>API: 8. API request
      API->>App: Protected data
      App->>User: Logged in
---

OAuth 2.0 lets users authorize apps to access their data on another service by redirecting them to log in once, then issuing the app a token instead of storing passwords. This matters because it prevents apps from ever seeing passwords, limits what each app can access, and is how social login and third-party integrations securely work today.
