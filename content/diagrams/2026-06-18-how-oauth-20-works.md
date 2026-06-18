---
title: "How OAuth 2.0 Works"
date: "2026-06-18"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant ClientApp as Client App
      participant AuthServer as Auth Server
      participant ResourceServer as Resource Server
      
      User->>ClientApp: Click login
      ClientApp->>AuthServer: Redirect (client_id, scope)
      AuthServer->>User: Show login & consent
      User->>AuthServer: Grant permission
      AuthServer->>ClientApp: Redirect with code
      ClientApp->>AuthServer: Exchange code (backend)
      AuthServer->>ClientApp: Return access token
      ClientApp->>ResourceServer: Request user info
      ResourceServer->>ClientApp: Return user data
      ClientApp->>User: Logged in ✓
---

OAuth 2.0 is a standardized protocol that lets users grant third-party applications access to their resources on another service without sharing their password directly. It matters because it's the foundation of single sign-on, federated identity, and secure API access — reducing security risks while improving user convenience across modern web platforms.
