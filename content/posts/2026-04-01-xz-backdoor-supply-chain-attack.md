---
title: "The xz Backdoor: How a Supply Chain Attack Hid in Plain Sight for Two Years"
date: "2026-04-01"
excerpt: "Someone spent two years building trust in an open source project just to ship a backdoor into SSH servers worldwide. Here's exactly how they did it, how it got caught, and what you should actually do about it."
tags: ["Security", "Open Source", "Supply Chain"]
coverEmoji: "🔓"
auto_generated: true
source_url: "https://www.openwall.com/lists/oss-security/2024/03/29/4"
---

In late March 2024, a Microsoft engineer named Andres Freund noticed SSH logins on his Debian machine were taking 500ms longer than expected and consuming slightly more CPU. That yak-shave led him to discover one of the most sophisticated supply chain attacks ever documented — a backdoor embedded in xz/liblzma that had been two years in the making. If he'd been less obsessive about performance anomalies, it would have shipped into every major Linux distribution's SSH daemon.

## How the Attack Actually Worked

The attacker, operating as `JiaT75` (Jia Tan), didn't just submit a malicious commit. They spent roughly two years making legitimate contributions to the xz repository, building a credible commit history, and socially engineering the maintainer — who was clearly burnt out — into granting them co-maintainer status. This is the part most writeups gloss over: the *technical* backdoor is impressive, but the *social* groundwork is what made it viable.

Once they had commit access, the actual backdoor was hidden in the build system, not the C source code. The malicious payload was encoded inside binary test files committed to the repo — `.xz` archives that look innocuous in a diff. The `configure` and `cmake` build scripts were modified to extract and inject this code only during certain build conditions (specifically when building a Debian or RPM package, with certain environment variables set). It wouldn't trigger in a standard developer build.

The injected code patched the `RSA_public_decrypt` function in liblzma at runtime. Since `systemd` links against liblzma, and `sshd` on systemd-based distros links against `libsystemd`, the backdoor ended up in the SSH daemon's process space — without ever touching OpenSSH's source code.

The result: a specific RSA key could authenticate to the SSH server and likely execute arbitrary commands, bypassing normal auth entirely. The exact C2 mechanism wasn't fully reverse-engineered before discovery, but the intent was clear.

## Why Automated Tooling Missed It

This is the uncomfortable part. The attack was specifically designed to evade the things we rely on:

- **Static analysis** of the C source was clean — the malicious logic was injected at build time from binary blobs
- **Code review** of commits looked fine — most changes were legitimate maintenance work
- **Dependency scanners** checking CVEs wouldn't flag a version that hadn't been publicly reported yet
- **Reproducible builds** *would* have caught this — but most distros weren't doing them for this package

The binary test files are the key detail. They're a normal part of compression library repos (you test against known inputs), so nobody flags them. Here's a simplified illustration of what the extraction looked like in the build script:

```bash
# Stripped-down version of the malicious build logic
if test -f "$srcdir/tests/files/bad-3-corrupt_lzma2.xz"; then
  eval `cat $srcdir/tests/files/bad-3-corrupt_lzma2.xz | xz -d | tr '\t ' ' \t'`
fi
```

This runs during `./configure`. Without carefully auditing every build script line against every binary file in the repo, you'd never see it in normal review.

## What This Means for Your Dependency Chain

If you're pulling open source packages into production code — and you are — there are a few concrete things this incident changes:

**Pin and verify.** Lock your dependencies to specific commit SHAs or verified release tags, not just version numbers. For critical libraries, verify signatures. In most ecosystems this is underused:

```bash
# npm — use package-lock.json integrity hashes, don't just trust semver ranges
# cargo — Cargo.lock pins exact versions + checksums by default, use it
# go — go.sum verifies module hashes, commit it to source control
# debian/rpm — prioritise reproducible build verification
```

**Treat new maintainers on old projects as a risk signal.** Not a disqualifier, but worth scrutiny. A project that's been stable for years suddenly getting a new active co-maintainer who starts refactoring build infrastructure deserves a second look.

**Monitor your build outputs, not just inputs.** Tools like `diffoscope` can compare build artifacts across environments and catch injected differences that source review won't find.

**Reproducible builds matter.** The Reproducible Builds project exists exactly for this scenario. If your distro or build pipeline produces bit-for-bit reproducible outputs, injected build-time payloads become detectable.

## What I'd Build With This

**Supply chain diff tool for CI.** A GitHub Action that builds your project in two isolated environments with slightly different configurations and diffs the resulting binaries with `diffoscope`. Any unexpected divergence fails the build. Straightforward to implement, catches an entire class of build-time injection attacks.

**Maintainer activity anomaly detector.** A small tool that watches your dependency repos (via GitHub API) and alerts when there's a sudden spike in commits from a new contributor, especially to build scripts or test fixture files. Combine it with a diff summary so you can review the actual changes. Useful as a scheduled job in any organisation managing a non-trivial dependency tree.

**Binary test file auditor.** A repo scanner that flags any binary blobs (images, archives, compiled objects) committed to source repos you depend on, shows you their history, and highlights any that changed in recent releases without a corresponding source change explanation. The xz attack would have lit this up immediately.

The uncomfortable truth is that this attack was caught by accident, by one person, at the last possible moment before it hit stable releases at scale. The attacker was patient, technically sophisticated, and understood exactly where our review processes have blind spots. We got lucky. Building better tooling around build-time integrity and dependency monitoring is the actual takeaway here — not just "audit your maintainers" as a vibes-based practice.
