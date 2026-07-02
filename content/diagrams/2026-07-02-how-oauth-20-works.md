---
title: "How OAuth 2.0 Works"
date: "2026-07-02"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant Client as Client App
      participant AuthSrv as Auth Server
      participant ResrcSrv as Resource Server
  
      User->>Client: 1. Click Login
      Client->>AuthSrv: 2. Redirect + client_id
      AuthSrv->>User: 3. Prompt Authorize?
      User->>AuthSrv: 4. Grant Permission
      AuthSrv->>Client: 5. Redirect + code
      Client->>AuthSrv: 6. code + secret
      AuthSrv->>Client: 7. access_token
      Client->>ResrcSrv: 8. access_token
      ResrcSrv->>Client: 9. User Data
      Client->>User: 10. Login Complete
---

OAuth 2.0 is a standardized protocol that lets users grant third-party applications access to their resources on another service without sharing their password. It eliminates the need to share credentials across services, reduces security risks from password breaches, and enables seamless integrations like "Login with Google" or "Login with GitHub".
