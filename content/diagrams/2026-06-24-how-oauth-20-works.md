---
title: "How OAuth 2.0 Works"
date: "2026-06-24"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
    participant User
    participant ClientApp as Client App
    participant AuthServer as Auth Server
    participant ResourceServer as Resource Server
  
    User->>ClientApp: Click Login
    ClientApp->>AuthServer: Redirect: /authorize
    AuthServer->>User: Show consent screen
    User->>AuthServer: Approve access
    AuthServer->>ClientApp: Redirect + auth code
    ClientApp->>AuthServer: POST: code + secret
    AuthServer->>ClientApp: Return access token
    ClientApp->>ResourceServer: GET /user (token)
    ResourceServer->>ClientApp: Return user data
    ClientApp->>User: Logged in ✓
---

OAuth 2.0 is an authorization protocol that lets a user grant a third-party application access to their resources on another service without sharing their password, using delegated tokens instead. This eliminates the need to share credentials across services, reduces attack surface if an app is compromised, and enables seamless user experiences like "Sign in with Google."
