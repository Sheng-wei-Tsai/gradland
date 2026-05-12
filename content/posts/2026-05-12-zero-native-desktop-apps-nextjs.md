---
title: "zero-native: Ship a Desktop App from Your Next.js Codebase"
date: "2026-05-12"
excerpt: "Vercel Labs released a Zig-based desktop shell that uses your existing Next.js frontend as the UI. Credible Electron alternative — tiny binaries, platform WebView, explicit security model."
tags: ["Next.js", "Desktop", "Zig", "Electron Alternative"]
coverEmoji: "🖥️"
auto_generated: true
source_url: "https://github.com/vercel-labs/zero-native"
---

Vercel Labs dropped `zero-native` this week — a Zig-based desktop app shell that uses your existing web frontend (Next.js, React, Svelte, Vue) as the UI layer. Nearly 3,000 stars in the first few days. The `zero-native init my_app --frontend next` onboarding is genuinely smooth. Here's what's actually interesting about it.

## How It Works

The architecture is straightforward: a Zig runtime owns the native window, event loop, and bridge dispatch. Your Next.js app runs inside either the platform WebView (WKWebView on macOS, WebKitGTK on Linux) or a bundled Chromium runtime via CEF.

The critical difference from Electron: **no bundled browser**. System WebView mode ships a native shell of a few hundred KB instead of an 80MB+ Chromium payload. Your Next.js code is the same code you'd deploy to the web — no changes required.

```bash
npm install -g zero-native
zero-native init my_app --frontend next
cd my_app
zig build run
```

That opens a desktop window rendering your Next.js app. The first run installs frontend deps and builds the Zig shell. Rebuilds after that are fast — Zig's compile times on incremental native changes are noticeably quicker than anything pulling in a full Node.js runtime.

## The JS-to-Native Bridge

The part worth understanding is `window.zero.invoke()` — the typed bridge between your JavaScript and Zig code. Every native operation goes through it:

```typescript
// In your Next.js component
const result = await window.zero.invoke('read-file', { path: '/tmp/data.json' });
```

```zig
// In your Zig shell
app.bridge.on("read-file", handleReadFile);
```

Calls are origin-checked, size-limited, and permission-controlled. The app manifest (`app.zon`) declares which bridges are exposed — nothing leaks by accident. This is more explicit than Electron's `ipcRenderer`/`ipcMain` and less footgun-prone. You opt in to capabilities rather than opting out of full Node.js access.

## App Config in `app.zon`

```zig
.{
    .id = "com.example.my-app",
    .name = "my-app",
    .display_name = "My App",
    .version = "0.1.0",
    .web_engine = "system",
    .permissions = .{ "window" },
    .capabilities = .{ "webview", "js_bridge" },
    .security = .{
        .navigation = .{
            .allowed_origins = .{ "zero://app" },
        },
    },
    .windows = .{
        .{ .label = "main", .title = "My App", .width = 960, .height = 640 },
    },
}
```

I'll be honest: writing Zig for the first time feels a bit odd if you've never touched a non-GC systems language. But the surface area is small — mostly bridge handler registration and maybe a native integration or two. The rest is your normal Next.js workflow.

## What I'd Build with This

**Local AI dev tools.** A native wrapper for an LLM-powered code assistant that reads your filesystem directly via the Zig bridge. No server, no cloud — the Next.js UI you already know, with direct filesystem access through explicit bridge calls. No `--allowedPaths` security theatre like you get with MCP.

**Database GUI for Supabase/Postgres.** A desktop SQL editor where the native layer owns the pg connection pool. The WebView renders a Monaco-based query editor. Much lighter than Electron-based alternatives like TablePlus — and you can theme it exactly how you want.

**Internal dev dashboards.** Team tools that need to read local `.env` files, tail logs, or shell out to CLI commands. The explicit bridge model means you expose exactly what's needed without handing the whole Node.js runtime to the WebView.

## My Take

Pre-release caveats apply — `app.zon` format will shift, and CEF/Chromium support is macOS-only right now. Linux and Windows builds exist for the system WebView path but packaging support is still being worked through.

What's interesting about zero-native isn't the Zig choice specifically — it's that someone at Vercel thought carefully about Electron's actual problems (binary size, security model, rebuild speed) and built targeted answers for each. That's more useful than "Electron alternative built in Rust" where the security story is the same and you just swap the runtime.

Whether it unseats Tauri or Electron in practice depends on the Zig learning curve and whether the ecosystem fills out. But for a Next.js developer who already has a polished web app and wants to ship it as a native desktop product — the path from `npm install -g zero-native` to a signed, packaged binary looks shorter here than anywhere I've seen.

Worth a look: [github.com/vercel-labs/zero-native](https://github.com/vercel-labs/zero-native)
