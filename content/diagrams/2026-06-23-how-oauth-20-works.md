---
title: "How OAuth 2.0 Works"
date: "2026-06-23"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant ClientApp as Client App
      participant AuthServer as Auth Server
      participant ResourceServer as Resource Server
  
      User->>ClientApp: Click login
      ClientApp->>AuthServer: Redirect for auth
      AuthServer->>User: Show login form
      User->>AuthServer: Authenticate & grant
      AuthServer->>ClientApp: Send auth code
      ClientApp->>AuthServer: Exchange code (secret)
      AuthServer->>ClientApp: Return access token
      ClientApp->>ResourceServer: Request user data
      ResourceServer->>ClientApp: Return protected data
      ClientApp->>User: Login complete
---

OAuth 2.0 is an authorization protocol that lets users grant third-party apps access to their resources on another service without sharing passwords, using tokens that can be revoked or scoped to specific permissions. It matters because it's the standard powering single sign-on across the web, reduces credential exposure, and lets developers build integrations without handling sensitive passwords.
