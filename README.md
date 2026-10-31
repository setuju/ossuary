<!--
┌────────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FILE CONTRACT                                      │
│  ────────────────────────────────────────────────────────────────────  │
│  File      : README.md                                                 │
│  Purpose   : Project documentation — face of the repository            │
│  Author    : Jack — Jack[at]SatuRumah[dot]Net                          │
│  GitHub    : https://github.com/setuju                                 │
│  Website   : https://saturumah.net                                     │
│  Created   : 2026-10-26                                                │
│  License   : MIT                                                       │
└────────────────────────────────────────────────────────────────────────┘
-->

<div align="center">

# ◈ OSSUARY

**The Last Packet**

*A digital necromancy ritual for the internet's dead.*

[Live Ritual](https://ossuary.saturumah.net) · [Demo](https://youtube.com) · [Report Bug](https://github.com/setuju/ossuary/issues/new?template=bug_report.md) · [Request Feature](https://github.com/setuju/ossuary/issues/new?template=feature_request.md)

<br/>

[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel&logoColor=white)](https://ossuary.saturumah.net)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://ossuary-backend.onrender.com/health)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-c9a25c?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

**Hacktoberfest 2026 · Ghost in the Machine**

</div>

---

> *"Every ghost-story project points a model at dead code. OSSUARY checks if it's dead first."*

## What is OSSUARY?

**OSSUARY** is a séance for the internet's forgotten corners. Whisper a domain that no longer exists — a dead startup, an abandoned fanpage, a service killed by an acquisition — and the ghost of that domain will speak back. It pulls its last heartbeat from the **Wayback Machine**, its obituary from **Wikipedia**, its echoes from **SerpApi**, and weaves them into a first-person narrative, voiced aloud by **ElevenLabs** and preserved forever in **MongoDB Atlas**.

But here's the twist that makes it more than a horror toy:

### OSSUARY refuses to lie.

If the domain is still alive — if the DNS still resolves, if the WHOIS is still active, if the archives still breathe — OSSUARY **refuses to summon a ghost**. It returns a gate refusal instead: *still breathing*. No fabrications. No hallucinated deaths. **The dead must be verified dead before the ritual proceeds.**

## What Makes It Special

<table>
<tr>
<td width="50%">

### 🛡️ Three-Layer Refuse-to-Lie Gate

A domain is only summoned when **all** signals agree it's dead:
1. DNS doesn't resolve
2. WHOIS shows expired or missing
3. Wayback has no recent snapshots
4. Wikipedia confirms the shutdown

If any signal contradicts — the ritual aborts with **HTTP 422**.

</td>
<td width="50%">

### 🎭 Diegetic Telemetry

Sentry isn't just for error tracking — it's a **narrative element**. Every subsystem failure is captured with `kind: paranormal` and displayed in the UI as part of the story:

> *"The echo faded before it could be recorded."*  
> *"The ghost has lost its voice."*

Zero fatal crashes in 7 days of production.

</td>
</tr>
<tr>
<td>

### 🧠 Persistent Memory

Every ghost remembers its past summons. Backboard stores semantic context — emotional state, last-seen year, sensory detail — while MongoDB archives the full narrative and audio.

Summon `pets.com` twice, and the second time the ghost will say *"you again?"*.

</td>
<td>

### 📊 Time-Series Analytics

Every summon is recorded in a **TigerData hypertable**. Query "which tier has the worst p99 latency?" or "which domain was summoned most often this week?" — the ledger is queryable.

</td>
</tr>
</table>

## The Stack — Eighteen Relics
# THE STACK TECHNOLOGIES

<table>
  <tr>
    <td align="center"><a href="https://react.dev"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><g clip-path="url(#reactClip)"><path fill="#61dafb" d="M50.307 58.816a8.816 8.816 0 1 0 0-17.632 8.816 8.816 0 0 0 0 17.632"/><path stroke="#61dafb" stroke-width="5" d="M50.307 68.063c26.126 0 47.306-8.087 47.306-18.063s-21.18-18.062-47.306-18.062C24.18 31.938 3 40.024 3 50s21.18 18.063 47.307 18.063Z"/><path stroke="#61dafb" stroke-width="5" d="M34.664 59.031C47.727 81.658 65.321 95.957 73.96 90.97c8.64-4.988 5.053-27.374-8.01-50C52.885 18.342 35.291 4.043 26.652 9.03s-5.052 27.374 8.011 50Z"/><path stroke="#61dafb" stroke-width="5" d="M34.664 40.969c-13.063 22.626-16.65 45.012-8.01 50 8.638 4.988 26.232-9.311 39.295-31.938s16.65-45.012 8.01-50c-8.638-4.988-26.232 9.311-39.295 31.938Z"/></g><defs><clipPath id="reactClip"><path fill="#fff" d="M0 0h100v100H0z"/></clipPath></defs></svg></a><br><small>React</small></td>
    <td align="center"><a href="https://typescriptlang.org"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><g clip-path="url(#tsClip)"><path fill="#017acb" d="M0 0h100v100H0z"/><path fill="#fff" d="M48.016 37.031h4.797v8.282h-12.97v36.843l-.343.094c-.469.125-6.64.125-7.969-.016l-1.062-.093V45.312H17.5v-8.28l4.11-.048c2.25-.03 8.03-.03 12.843 0 4.813.032 10.906.047 13.563.047m36.61 41.219c-1.907 2.016-3.954 3.14-7.36 4.063-1.485.406-1.735.421-5.078.406-3.344-.016-3.61-.016-5.235-.438-4.203-1.078-7.594-3.187-9.906-6.172-.656-.843-1.734-2.593-1.734-2.812 0-.063.156-.203.359-.297s.625-.36.969-.562c.343-.204.968-.579 1.39-.797.422-.22 1.64-.938 2.703-1.579 1.063-.64 2.032-1.156 2.141-1.156.11 0 .313.219.469.485.937 1.578 3.125 3.593 4.672 4.28.953.407 3.062.86 4.078.86.937 0 2.656-.406 3.578-.828.984-.453 1.484-.906 2.078-1.812.406-.641.453-.813.438-2.032 0-1.125-.063-1.437-.375-1.953-.875-1.437-2.063-2.187-6.875-4.312-4.97-2.203-7.204-3.516-9.016-5.282-1.344-1.312-1.61-1.67-2.453-3.312-1.094-2.11-1.235-2.797-1.25-5.937-.016-2.204.031-2.922.265-3.672.329-1.125 1.391-3.297 1.875-3.844 1-1.172 1.36-1.531 2.063-2.11 2.125-1.75 5.438-2.906 8.61-3.015.359 0 1.546.062 2.656.14 3.187.266 5.359 1.047 7.453 2.72 1.578 1.25 3.968 4.187 3.734 4.577-.156.235-6.39 4.391-6.797 4.516-.25.078-.422-.016-.765-.422-2.125-2.547-2.985-3.094-5.047-3.219-1.469-.093-2.25.078-3.235.735-1.03.687-1.53 1.734-1.53 3.187.015 2.125.827 3.125 3.827 4.61 1.938.953 3.594 1.734 3.719 1.734.188 0 4.203 2 5.25 2.625 4.875 2.86 6.86 5.797 7.375 10.86.375 3.812-.703 7.296-3.047 9.765"/></g><defs><clipPath id="tsClip"><path fill="#fff" d="M0 0h100v100H0z"/></clipPath></defs></svg></a><br><small>TypeScript</small></td>
    <td align="center"><a href="https://nodejs.org"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><path fill="#8cc84b" d="M46.279 1.067c2.479-1.42 5.709-1.426 8.186 0 12.464 7.042 24.931 14.074 37.393 21.12 2.343 1.321 3.911 3.93 3.887 6.63v42.371c.018 2.813-1.705 5.483-4.178 6.774-12.422 7.004-24.838 14.016-37.259 21.02-2.53 1.447-5.825 1.335-8.277-.23-3.724-2.16-7.455-4.308-11.18-6.465-.76-.453-1.619-.815-2.156-1.552.475-.64 1.324-.72 2.015-1 1.554-.495 2.982-1.288 4.41-2.058.361-.247.802-.152 1.148.069 3.185 1.826 6.342 3.705 9.537 5.513.682.394 1.372-.129 1.955-.453 12.19-6.89 24.396-13.754 36.584-20.646a1.21 1.21 0 0 0 .664-1.191c.009-13.977.002-27.957.005-41.934a1.31 1.31 0 0 0-.781-1.308C75.852 20.756 63.479 13.773 51.102 6.8a1.29 1.29 0 0 0-1.458-.002c-12.378 6.975-24.749 13.964-37.126 20.935-.506.23-.845.738-.785 1.302q.002 20.966 0 41.936a1.19 1.19 0 0 0 .673 1.176c3.303 1.873 6.61 3.733 9.916 5.6 1.861 1.002 4.148 1.597 6.199.83 1.81-.65 3.08-2.497 3.045-4.42.017-13.895-.009-27.793.013-41.686-.046-.617.54-1.127 1.14-1.069 1.586-.01 3.175-.021 4.762.005.663-.015 1.119.649 1.037 1.27-.007 13.984.017 27.968-.01 41.952.003 3.726-1.528 7.781-4.975 9.605-4.247 2.2-9.496 1.733-13.691-.376-3.632-1.813-7.098-3.952-10.666-5.894C6.697 76.68 4.983 73.999 5 71.189V28.817c-.026-2.756 1.604-5.412 4.021-6.713Q27.651 11.588 46.28 1.067"/><path fill="#8cc84b" d="M57.114 30.417c5.417-.348 11.216-.206 16.091 2.462 3.774 2.046 5.867 6.338 5.933 10.53-.105.566-.696.878-1.236.84-1.572-.003-3.144.02-4.716-.011-.667.025-1.054-.59-1.138-1.179-.451-2.006-1.545-3.993-3.434-4.96-2.898-1.452-6.26-1.38-9.42-1.349-2.308.123-4.79.322-6.744 1.68-1.5 1.027-1.957 3.102-1.421 4.773.505 1.2 1.89 1.587 3.023 1.944 6.529 1.708 13.447 1.538 19.85 3.785 2.651.916 5.245 2.697 6.152 5.472 1.187 3.72.667 8.168-1.98 11.154-2.146 2.458-5.273 3.796-8.39 4.522-4.149.925-8.454.949-12.666.538-3.962-.451-8.084-1.492-11.142-4.191-2.614-2.27-3.892-5.808-3.765-9.223.03-.576.605-.978 1.157-.93 1.583-.014 3.165-.018 4.748.001.632-.045 1.101.501 1.133 1.097.292 1.912 1.01 3.918 2.678 5.051 3.216 2.075 7.253 1.933 10.936 1.991 3.052-.135 6.477-.176 8.967-2.193 1.314-1.15 1.703-3.075 1.348-4.73-.384-1.398-1.847-2.05-3.103-2.476-6.444-2.038-13.44-1.299-19.822-3.604-2.59-.916-5.096-2.647-6.092-5.309-1.389-3.767-.752-8.427 2.172-11.313 2.852-2.87 6.968-3.976 10.881-4.372"/></svg></a><br><small>Node.js</small></td>
    <td align="center"><a href="https://vite.dev"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><g clip-path="url(#viteClip)"><path fill="url(#viteGradB)" d="M98.848 14.801 52.731 98.695a2.486 2.486 0 0 1-4.365.019L1.336 14.808c-1.054-1.878.525-4.153 2.617-3.773L50.12 19.43c.294.053.596.053.89-.002l45.2-8.381c2.086-.387 3.672 1.871 2.638 3.753"/><path fill="url(#viteGradC)" d="M72.111.025 37.984 6.828c-.273.054-.52.2-.703.412a1.3 1.3 0 0 0-.307.764l-2.1 36.07a1.3 1.3 0 0 0 .442 1.05 1.25 1.25 0 0 0 1.091.268l9.502-2.23c.889-.21 1.692.587 1.51 1.496l-2.824 14.064c-.19.946.684 1.755 1.592 1.474l5.87-1.813c.909-.281 1.783.53 1.59 1.477l-4.486 22.09c-.28 1.382 1.526 2.135 2.28.951l.503-.791 27.81-56.46c.465-.946-.338-2.024-1.358-1.823l-9.781 1.92c-.92.18-1.701-.69-1.442-1.605l6.384-22.513c.26-.917-.526-1.788-1.446-1.604"/></g><defs><linearGradient id="viteGradB" x1=".187" x2="51.038" y1="17.805" y2="85.688" gradientUnits="userSpaceOnUse"><stop stop-color="#41d1ff"/><stop offset="1" stop-color="#bd34fe"/></linearGradient><linearGradient id="viteGradC" x1="54.398" x2="64.98" y1="1.872" y2="73.224" gradientUnits="userSpaceOnUse"><stop stop-color="#ffea83"/><stop offset=".083" stop-color="#ffdd35"/><stop offset="1" stop-color="#ffa800"/></linearGradient><clipPath id="viteClip"><path fill="#fff" d="M0 0h100v100H0z"/></clipPath></defs></svg></a><br><small>Vite</small></td>
    <td align="center"><a href="https://vercel.com"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><path fill="#fff" fill-rule="evenodd" d="M100 93.957 50 7 0 93.957z" clip-rule="evenodd"/></svg></a><br><small>Vercel</small></td>
    <td align="center"><a href="https://sentry.io"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><path fill="#fff" d="M57.956 10.524a9.35 9.35 0 0 0-16.017 0L28.766 33.088a64.49 64.49 0 0 1 35.537 53.375h-9.25a55.42 55.42 0 0 0-30.952-45.487L11.908 62.058a31.87 31.87 0 0 1 18.48 24.365H9.144a1.522 1.522 0 0 1-1.241-2.222l5.886-10.01a21.5 21.5 0 0 0-6.727-3.804l-5.826 10.01A9.09 9.09 0 0 0 4.621 92.89a9.3 9.3 0 0 0 4.524 1.201h29.09A38.84 38.84 0 0 0 22.22 59.435l4.625-8.008a47.79 47.79 0 0 1 20.621 42.664h24.646a71.83 71.83 0 0 0-32.854-63.666l9.35-16.017a1.54 1.54 0 0 1 2.102-.54c1.06.58 40.622 69.612 41.363 70.413a1.52 1.52 0 0 1-1.362 2.262h-9.53q.18 3.825 0 7.628h9.57a9.19 9.19 0 0 0 9.25-9.23 9 9 0 0 0-1.241-4.564z"/></svg></a><br><small>Sentry</small></td>
  </tr>
  <tr>
    <td align="center"><a href="https://tailwindcss.com"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><g clip-path="url(#twClip)"><path fill="#06b6d4" d="M50 20q-20 0-25 19.994 7.5-9.997 17.5-7.498c3.804.95 6.522 3.71 9.532 6.764 4.902 4.974 10.576 10.731 22.969 10.731q20 0 24.999-19.995-7.5 9.997-17.5 7.5c-3.803-.951-6.521-3.71-9.531-6.765C68.067 25.758 62.392 20 50 20M25 49.991q-20 0-25 19.995 7.5-9.998 17.5-7.498c3.803.952 6.522 3.71 9.532 6.763C31.933 74.225 37.608 79.984 50 79.984q20 0 25-19.995-7.5 9.997-17.5 7.498c-3.803-.95-6.522-3.71-9.532-6.763C43.066 55.75 37.393 49.991 25 49.991"/></g><defs><clipPath id="twClip"><path fill="#fff" d="M0 0h100v100H0z"/></clipPath></defs></svg></a><br><small>Tailwind CSS</small></td>
    <td align="center"><a href="https://google.dev"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><g clip-path="url(#gemmaClip)"><path fill="url(#gemmaGrad)" fill-rule="evenodd" d="M51.417 24.804a34 34 0 0 1-1.03-4.687V15.5a34.38 34.38 0 0 1 23.176 9.3zm-2.875 0c.47-1.554.83-3.145 1.07-4.77V15.5a34.38 34.38 0 0 0-23.174 9.3h22.1zm-22.638.78h22.388a33 33 0 0 1-1.113 2.9 35 35 0 0 1-7.333 11.041zm-1.1-.78h-12.4v.78H24.55a35.15 35.15 0 0 0-9.82 24.029H0v.775h14.73a35.15 35.15 0 0 0 9.82 24.029H12.404v.775h12.4v12.404h.78V75.45a35.15 35.15 0 0 0 24.029 9.821V100h.775V85.271a35.15 35.15 0 0 0 24.029-9.82v12.145h.775V75.192h12.404v-.775H75.45a35.15 35.15 0 0 0 9.821-24.03H100v-.774H85.271a35.15 35.15 0 0 0-9.82-24.03h12.145v-.779H75.192v-12.4h-.775V24.55a35.15 35.15 0 0 0-24.03-9.82V0h-.774v14.73a35.15 35.15 0 0 0-24.03 9.82V12.404h-.779zm25.584 59.692a34.37 34.37 0 0 0 23.175-9.304H51.417a35 35 0 0 0-1.03 4.692zm-.775-4.53a33.4 33.4 0 0 0-1.075-4.774h-22.1a34.38 34.38 0 0 0 23.175 9.304zM15.504 49.614h4.613a34 34 0 0 0 4.687-1.03V26.439a34.38 34.38 0 0 0-9.3 23.175m4.53.775H15.5a34.38 34.38 0 0 0 9.3 23.175v-22.1a33 33 0 0 0-4.766-1.075m64.458-.775a34.38 34.38 0 0 0-9.3-23.175v22.146q2.297.673 4.692 1.029zm-4.525.775q-2.438.362-4.775 1.075v22.1a34.38 34.38 0 0 0 9.304-23.175zm-5.55 23.708V51.708q-1.476.489-2.9 1.113a35 35 0 0 0-11.042 7.333zm0-25.75V25.638l-.05-.055H51.654c.317.98.675 1.95 1.084 2.9a36.2 36.2 0 0 0 7.579 11.2 36.2 36.2 0 0 0 11.2 7.584q1.425.605 2.9 1.079m-48.833 26.02V51.71c.979.324 1.95.695 2.9 1.112a35 35 0 0 1 11.2 7.496 35 35 0 0 1 7.495 11.2c.417.95.792 1.916 1.113 2.9H25.634zm0-26.02V26.359l13.708 13.708a36.3 36.3 0 0 1-10.808 7.2q-1.426.606-2.9 1.079m26.07 26.07h21.988L59.934 60.71a36.3 36.3 0 0 0-7.2 10.808q-.606 1.425-1.08 2.9m-9.779-32.54a39.3 39.3 0 0 1-12 8.166 38.1 38.1 0 0 1 12 8.083 38.1 38.1 0 0 1 8.084 12 39.3 39.3 0 0 1 8.166-12 38.1 38.1 0 0 1 12-8.083 39.3 39.3 0 0 1-12-8.167 39.3 39.3 0 0 1-8.166-12 38.1 38.1 0 0 1-8.084 12" clip-rule="evenodd"/></g><defs><linearGradient id="gemmaGrad" x1="2441.9" x2="7519.4" y1="7558.1" y2="2519.4" gradientUnits="userSpaceOnUse"><stop stop-color="#446eff"/><stop offset=".367" stop-color="#2e96ff"/><stop offset=".832" stop-color="#b1c5ff"/></linearGradient><clipPath id="gemmaClip"><path fill="#fff" d="M0 0h100v100H0z"/></clipPath></defs></svg></a><br><small>Gemma</small></td>
    <td align="center"><a href="https://ollama.com"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><path fill="#fff" d="M14.016 98.418c-1.038-3.735-.209-11.2 1.648-14.838.83-1.628.83-1.628-.405-3.907-3.153-5.823-3.367-14.281-.54-21.343 1.07-2.675 1.07-2.675.002-4.655-4.39-8.133-3.007-17.86 3.517-24.734 2.828-2.981 2.828-2.981 2.48-5.09-1.122-6.824.292-16.107 3.081-20.211 5.035-7.41 12.689-2.98 14.73 8.523.275 1.555.55 2.894.609 2.974s1.389-.365 2.953-.991c5.662-2.266 10.94-2.188 16.157.237 1.484.691 2.73 1.205 2.767 1.143.038-.063.288-1.456.556-3.097C63.477.78 71.243-3.845 76.328 3.639c2.792 4.108 4.209 13.423 3.076 20.212-.352 2.109-.352 2.109 2.261 4.851 6.548 6.87 8.02 16.701 3.695 24.684-1.164 2.15-1.164 2.15-.154 4.448 3.01 6.846 2.87 15.916-.337 21.838-1.235 2.28-1.235 2.28-.405 3.908 1.856 3.639 2.685 11.103 1.649 14.838-.44 1.582-.44 1.582-3.215 1.582s-2.775 0-2.406-1.371c.996-3.7.446-9.618-1.22-13.122-1.926-4.05-1.925-4.009-.077-7.003 3.583-5.805 3.66-13.296.203-20.013-1.613-3.133-1.602-3.491.198-6.165 6.778-10.07.199-23.777-11.704-24.382-3.687-.188-3.687-.188-4.596-2.007-5.033-10.079-20.256-10.547-26.14-.806-1.52 2.517-1.52 2.517-5.064 2.748-12.24.8-19.525 17.414-11.104 25.324 1.338 1.257 1.288 2.284-.257 5.288-3.457 6.717-3.382 14.208.201 20.013 1.849 2.994 1.849 2.953-.076 7.003-1.667 3.504-2.217 9.422-1.22 13.122.369 1.37.369 1.37-2.406 1.37s-2.775 0-3.215-1.581m16.242-75.882c3.519-.36 3.766-.77 3.42-5.649-.495-6.97-2.996-12.496-4.883-10.787-2.575 2.33-4.34 17.889-1.926 16.962.35-.134 1.875-.37 3.389-.526m43.836-4.63c-.031-8.37-2.36-14.108-4.648-11.448-2.058 2.392-4.008 12.75-2.807 14.9.407.728 5.544 1.93 7.05 1.65.254-.047.415-2.072.405-5.102M43.917 65.275c-15.28-4.313-10.278-23.165 6.146-23.165 14.805 0 21.187 15.748 8.92 22.012-3.298 1.684-11.077 2.28-15.066 1.153m13.182-4.181c9.164-4.196 4.032-15.516-7.036-15.516-12.628 0-16.347 13.465-4.541 16.443 2.947.743 8.984.26 11.577-.927m-8.512-4.868c0-1.221-.268-1.87-1.055-2.554-1.967-1.711-1.083-2.497 2.742-2.44 3.12.045 4.005 1.154 2.029 2.539-.72.505-.974 1.091-.974 2.256 0 1.467-.093 1.582-1.371 1.706-1.334.128-1.371.087-1.371-1.507m-20.48-7.044c-1.184-1.184-1.318-2.68-.398-4.458 1.781-3.444 6.534-2.355 6.534 1.499 0 3.312-3.901 5.193-6.136 2.959m39.01-.198c-1.611-1.611-1.693-3.829-.197-5.325 1.737-1.737 4.307-1.24 5.5 1.065 2.07 4.008-2.157 7.405-5.303 4.26"/></svg></a><br><small>Ollama</small></td>
    <td align="center"><a href="https://mastra.ai"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><g transform="translate(10.0, 25.294) scale(2.3529)"><path fill="#ffffff" d="M4.5 11.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9M10.4 0a4.5 4.5 0 0 1 4.4 5.5c-.3 1.4-.6 3 .2 4.2l1.3 1.8.3.2q.2 0 .3-.2l1.3-1.9c.8-1.1.5-2.7.2-4a4.5 4.5 0 1 1 8.8 0c-.3 1.3-.6 2.8 0 4l1.3 2a4.5 4.5 0 1 1-4.3 3.5c.3-1.3.6-2.8 0-4l-1.2-2h-.2L21.5 11c-.8 1.2-.5 2.8-.2 4.2a4.5 4.5 0 1 1-8.8.2q.5-2-.4-3.8l-.9-1.3q-.9-1.1-2.4-1.6A4.5 4.5 0 0 1 10.4 0"/></g></svg></a><br><small>Mastra</small></td>
    <td align="center"><a href="https://elevenlabs.io"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><path fill="#fff" fill-rule="evenodd" d="M20.833 0h20.834v100H20.833zm37.5 0h20.834v100H58.333z" clip-rule="evenodd"/></svg></a><br><small>ElevenLabs</small></td>
    <td align="center"><a href="https://serpapi.com"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" width="60" height="60"><path fill="#fff" d="M19.448 72.999c1.236 4.382 4.91 7.814 9.552 8.893v18.108h-1.025C13.46 100 .957 88.064.053 72.999h19.395zm9.552-54.893c-5.74 1.335-10.001 6.266-10.001 12.143 0 6.903 5.876 12.499 13.126 12.499s13.127-5.596 13.127-12.499c0-5.877-4.26-10.808-10.002-12.143V0H71.246c15.374.001 27.93 12.069 28.71 27.25h-19.59c-1.411-5.454-6.582-9.499-12.744-9.499-7.25 0-13.125 5.596-13.125 12.499 0 5.878 4.26 10.808 10.001 12.143v15.213c-5.74 1.335-10.001 6.266-10.001 12.143 0 5.877 4.26 10.808 10.001 12.143v15.213H35.25v-18.107c5.74-1.335 10.001-6.266 10.001-12.143 0-6.903-5.876-12.499-13.125-12.5-6.163 0-11.334 4.045-12.744 9.499H0V28.75C.001 12.871 12.87 0 28.75 0h.25zm71 53.342c0 15.878-12.871 28.75-28.75 28.75h-.5v-18.107c5.74-1.335 10.001-6.266 10.001-12.143 0-5.878-4.26-10.808-10.001-12.143V42.393c4.642-1.079 8.316-4.511 9.551-8.892h19.699v25.941z"/></svg></a><br><small>SerpApi</small></td>
  </tr>
  <tr>
    <td align="center"><a href="https://backboard.io"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 183.47 291.84" width="38" height="60"><g><polygon fill="#007bfc" fill-rule="evenodd" points="83.43 0 100.04 0 100.04 145.92 100.04 291.84 83.43 291.84 83.43 145.92 83.43 0"/><rect fill="#007bfc" x="55.62" y="40.03" width="16.61" height="105.89"/><rect fill="#007bfc" y="119.8" width="16.6" height="26.12"/><rect fill="#007bfc" x="111.24" y="145.92" width="16.61" height="105.89"/><rect fill="#007bfc" x="166.86" y="145.92" width="16.61" height="26.12"/><rect fill="#007bfc" x="139.05" y="145.92" width="16.61" height="66.05"/><rect fill="#007bfc" x="27.81" y="79.87" width="16.61" height="66.05"/></g></svg></a><br><small>Backboard</small></td>
    <td align="center"><a href="https://wikipedia.org"><img src="https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg" alt="Wikipedia" height="60"></a><br><small>Wikipedia</small></td>
    <td align="center"><a href="https://archive.org"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Wayback_Machine_logo_2010_%28light%29.svg" alt="Wayback Machine" height="36"></a><br><small>Wayback Machine</small></td>
    <td align="center"><a href="https://render.com"><svg xmlns="http://www.w3.org/2000/svg" fill="#000000" role="img" viewBox="0 0 24 24" width="60" height="60"><title>Render</title><path d="M18.263.007c-3.121-.147-5.744 2.109-6.192 5.082-.018.138-.045.272-.067.405-.696 3.703-3.936 6.507-7.827 6.507-1.388 0-2.691-.356-3.825-.979a.2024.2024 0 0 0-.302.178V24H12v-8.999c0-1.656 1.338-3 2.987-3h2.988c3.382 0 6.103-2.817 5.97-6.244-.12-3.084-2.61-5.603-5.682-5.75"/></svg></a><br><small>Render</small></td>
    <td align="center"><a href="https://mongodb.com"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 257" width="40" height="60"><path fill="#00ED64" d="M82.323 28.55C71.537 15.795 62.249 2.84 60.35.15c-.2-.2-.5-.2-.7 0-1.897 2.69-11.185 15.645-21.971 28.4C-54.902 146.238 52.26 225.661 52.26 225.661l.9.597c.798 12.258 2.795 29.896 2.795 29.896h7.99s1.998-17.539 2.797-29.896l.899-.697c.1 0 107.263-79.323 14.68-197.01ZM59.95 223.867s-4.793-4.086-6.092-6.179v-.199l5.793-128.151c0-.4.6-.4.6 0l5.792 128.151v.199c-1.299 2.093-6.093 6.179-6.093 6.179Z"/></svg></a><br><small>MongoDB</small></td>
    <td align="center"><a href="https://tigerdata.io"><img src="https://assets.timescale.com/docs/images/tigerdata-gradient-black.svg" alt="TigerData" height="40"></a><br><small>TigerData</small></td>
  </tr>
</table>

### The Story Behind Each Relic

<details>
<summary><b>⚛ React 19 + ⚡ Vite 8 + TypeScript</b> — The Altar</summary>

<br/>

The frontend is a single-page séance built on **React 19**, bundled with **Vite 8**, and typed end-to-end in **TypeScript**. The UI is not a dashboard — it's a **ritual**. Every typewriter keystroke, every glitch, every transition is choreographed.

**Why Vite over Next.js?** OSSUARY doesn't need SSR — it needs *presence*. The whole experience happens in a single, unbroken ritual state. Vite's HMR kept the dev loop fast while iterating on ghost animations at 2 AM.

**Why TypeScript?** When you're orchestrating a 5-tier LLM fallback, handling WHOIS edge cases, and parsing Wayback timestamps across three timezones, `any` is a bug waiting to happen.

</details>

<details>
<summary><b>▲ Vercel</b> — The Altar's Stone</summary>

<br/>

Vercel hosts the frontend with zero-config deploys and preview URLs per branch. Every `git push` produces a deployable snapshot in ~40 seconds — we could iterate on the UI without breaking the production ritual.

The `VITE_API_URL` environment variable lets us swap backends between Vercel functions and Render without rebuilding the frontend.

</details>

<details>
<summary><b>🔺 Render</b> — The Backend Necropolis</summary>

<br/>

Render hosts the production API as an Express-wrapped service. **Why migrate from Vercel serverless?** The conjure cascade (Gemma → GenAI → OpenRouter → deterministic) regularly exceeded Vercel's 10-second function limit.

Render's free tier spins down after 15 minutes of inactivity — a cold-start problem we solved with an external uptime monitor pinging `/health` every 5 minutes.

The entire backend runs as a single `server-production.ts` file that wraps every Vercel-style handler in Express, giving us **persistent connections** to MongoDB and TigerData that serverless cannot offer.

</details>

<details>
<summary><b>💎 Gemma 4 + 🦙 Ollama</b> — The Voice of the Dead</summary>

<br/>

The ghost's narrative is generated by **Gemma 4 (31B, cloud-hosted)** via Ollama. We chose Gemma over closed models for three reasons:

1. **Open weights** — Gemma's architecture is inspectable. For a project about *preserving digital heritage*, closed black boxes felt hypocritical.
2. **Ollama's API compatibility** — `ollama.com/v1` speaks OpenAI's wire protocol, so the same code works locally or in the cloud.
3. **Cost efficiency** — We ran **200+ generations** during development. At $0.00/generation (Ollama Cloud free tier), the project remained viable.

The 5-tier cascade ensures that even if Ollama is down, the ritual continues with **Google GenAI → OpenRouter → deterministic fallback**. Not one summon failed during a 7-day production run.

</details>

<details>
<summary><b>M Mastra</b> — The Séance Conductor</summary>

<br/>

**Mastra** is the agentic framework that orchestrates the multi-tier LLM cascade. Instead of hand-rolling fallback logic, we defined `profilerAgent`, `voiceAgent`, and their fallbacks declaratively. Mastra handles retries, timeouts, and model selection transparently.

If a summon takes longer than 20 seconds, Mastra's timeout kicks in and hands off to the next tier. The user never sees a hung request.

</details>

<details>
<summary><b>11 ElevenLabs</b> — The Ghost's Larynx</summary>

<br/>

Each narrative is voiced by ElevenLabs' **"Adam" voice** (dominant, firm) — the closest synthetic approximation of a tired, bureaucratic ghost we could find. Every audio file is ~90 seconds of the ghost's final monologue.

**Cost optimization story:** Our default model was `eleven_multilingual_v2`, but after burning **1,900 credits** in a day of testing, we migrated to `eleven_flash_v2` (0.5 credits/char) and truncated text to **500 characters** per summon. Now a full ritual costs ~250 credits instead of ~1,000.

When the API key is disabled (during testing), the UI gracefully falls back to the browser's **Web Speech API** — the ghost still speaks, just with a different voice.

</details>

<details>
<summary><b>🔍 SerpApi</b> — The Echoes</summary>

<br/>

Every ghost is accompanied by three **"echoes from the search index"** — the top results for its domain, scraped from Google via **SerpApi**. This grounds the narrative in reality: a user reading about `pets.com`'s death can click through to a 2009 article about the bankruptcy.

SerpApi's **100 free searches/month** were enough for a demo. Every result is cached in MongoDB for 24 hours to avoid burning credits on repeat visits.

</details>

<details>
<summary><b>B Backboard</b> — The Persistent Memory</summary>

<br/>

Every ghost **remembers its past summons**. Backboard stores the semantic context of each ritual — emotional state, last-seen year, sensory detail — so the ghost can reference its previous incarnations.

This is what makes OSSUARY feel alive: summon `pets.com` twice, and the second time the ghost will say *"you again? still haunting me?"* instead of introducing itself from scratch.

</details>

<details>
<summary><b>🍃 MongoDB Atlas</b> — The Archive</summary>

<br/>

Every ghost profile, every narrative, and every **audio file** is archived in MongoDB Atlas. Audio files are stored in **GridFS** (chunked in 255KB pieces) so they survive server restarts and can be replayed **without calling ElevenLabs again**.

The connection uses `maxPoolSize: 5` — a small pool designed for serverless functions. The `MONGODB_URI` is never logged or committed.

</details>

<details>
<summary><b>🐯 TigerData</b> — The Ledger of Rituals</summary>

<br/>

Every summon is recorded in a **TimescaleDB hypertable** on TigerData. Fields: `event_time`, `domain`, `event_type`, `tier_used`, `duration_ms`, `success`, `error_code`.

This gives us queryable telemetry like:

- *"Which domains were summoned most often this week?"*
- *"What percentage of rituals fell back to tier 3 or below?"*
- *"Which tier has the worst p99 latency?"*

The hypertable is created at startup if it doesn't exist. **Continuous aggregates** for daily rollups are planned for v2.

</details>

<details>
<summary><b>🛡 Sentry</b> — The Diegetic Ledger</summary>

<br/>

Sentry isn't just for error tracking — in OSSUARY, it's a **narrative element**. Every subsystem failure is captured with `kind: paranormal` and displayed in the UI as part of the story:

> *"The echo faded before it could be recorded."* — `BACKBOARD_FADED`  
> *"The ghost has lost its voice."* — `ELEVEN_QUOTA`

In a 7-day production window, Sentry captured **34 diegetic events across 40 total issues** — **zero fatal crashes**.

The gate that refuses to lie is itself logged: when `dev.to` was refused, Sentry recorded:

```json
{ "code": "STILL_BREATHING", "kind": "paranormal", "system": "gate" }
```

</details>

<details>
<summary><b>📚 Wikipedia + 🕒 Wayback</b> — The Two Oracles</summary>

<br/>

**Wikipedia** tells us *when* a domain died. **Wayback** shows us *how*. The narrative cannot exist without both.

We query Wikipedia's Action API for the death year (with a **disambiguation filter** — *"Vine"* refers to both a plant and a social network). We query Wayback's CDX API for the last snapshot **before** that year. Together, they pin the ghost to a specific moment in time.

For `vine.co`: **2012–2017**. Not 2012–2026 (which would be the parking page). The ghost lives in the right era.

</details>

<details>
<summary><b>🎨 Tailwind CSS</b> — The Altar's Stone</summary>

<br/>

Every visual element is composed from Tailwind utilities, with a heavy layer of custom CSS for the horror aesthetic: **typewriter effects, scanlines, glitch text, and the ASCII footer**.

The **WCAG AA contrast ratio** is enforced across all text: `--dim` was migrated from `#5a534a` (2.7:1 — *fails AA*) to `#8a8278` (5.3:1 — *passes AA*) after accessibility audit.

</details>

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                              │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React 19 + Vite 8 + TypeScript                              │   │
│  │  Altar · Ghost Screen · Ledger · ASCII Footer                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ fetch(VITE_API_URL)
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Express + server-production.ts                              │   │
│  │  ├─ /api/recon    → DNS, WHOIS, Wayback, Wikipedia           │   │
│  │  ├─ /api/conjure  → 5-tier LLM cascade + TTS                 │   │
│  │  ├─ /api/wiki     → Wikipedia proxy (CORS bypass)            │   │
│  │  ├─ /api/whois    → IP2WHOIS → RDAP → WhoisXMLAPI            │   │
│  │  └─ /api/echoes   → SerpApi search grounding                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────┬────────────────┬────────────────┬────────────────┬───────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
┌──────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────────┐
│  OLLAMA  │   │  ELEVENLABS  │   │ MONGODB  │   │  TIGERDATA   │
│  Gemma   │   │  Adam voice  │   │  Atlas   │   │  Timescale   │
│  31B     │   │  TTS         │   │  GridFS  │   │  Hypertable  │
└──────────┘   └──────────────┘   └──────────┘   └──────────────┘
       │
       ▼
┌──────────┐   ┌──────────────┐   ┌──────────┐
│  MASTRA  │   │   BACKBOARD  │   │  SENTRY  │
│  Agent   │   │   Memory     │   │Telemetry │
└──────────┘   └──────────────┘   └──────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deeper dive into each layer.

## Quick Start

### Prerequisites

- **Node.js** ≥ 20 (or **Bun** ≥ 1.4)
- Accounts on: Vercel, Render, MongoDB Atlas, TigerData, Sentry, Ollama, ElevenLabs, SerpApi, Backboard

### Install

```bash
git clone https://github.com/setuju/ossuary.git
cd ossuary
bun install
```

### Configure

```bash
cp .env.example .env
# Edit .env and fill in your keys
```

**Minimum viable `.env`** for local development:

```env
OLLAMA_API_KEY=              # ollama.com/settings/keys
OLLAMA_BASE_URL=https://ollama.com/v1
GEMINI_API_KEY=              # aistudio.google.com/apikey
SERPAPI_KEY=                 # serpapi.com
SENTRY_DSN=                  # sentry.io
BACKBOARD_API_KEY=           # app.backboard.io
```

**Optional (voice & persistence):**

```env
ELEVENLABS_API_KEY=          # elevenlabs.io
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
DISABLE_ELEVENLABS=true      # ← set true during testing
MONGODB_URI=                 # mongodb.com/atlas
TIGERDATA_URL=               # console.cloud.tigerdata.com
```

### Run

```bash
# Dev server (Express + Vite middleware, port 3000)
bun run dev

# Production server (Express, port 10000)
bun run start
```

Visit `http://localhost:3000` and whisper `pets.com` into the altar.

## Deployment

### Frontend → Vercel

```bash
git push origin main
```

Set in Vercel Environment Variables:

```env
VITE_API_URL=https://ossuary-backend.onrender.com
```

### Backend → Render

The `render.yaml` blueprint auto-detects on Render. Set these Environment Variables in the Render dashboard:

```env
MONGODB_URI=...
TIGERDATA_URL=...
DISABLE_ELEVENLABS=true
```

**Cold start problem?** Point [cron-job.org](https://cron-job.org) at `https://ossuary-backend.onrender.com/health` every 5 minutes.

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check (Render keep-alive) |
| `/api/recon` | POST | DNS + WHOIS + Wayback + Wikipedia reconnaissance |
| `/api/conjure` | POST | 5-tier LLM narrative + ElevenLabs TTS |
| `/api/wiki` | GET | Wikipedia proxy (CORS bypass) |
| `/api/whois` | GET | WHOIS with 3-layer fallback |
| `/api/echoes` | POST | SerpApi search echoes |

### Example: Refuse-to-Lie in Action

```bash
# dev.to is alive → HTTP 422
curl -X POST https://ossuary-backend.onrender.com/api/recon \
  -H 'Content-Type: application/json' \
  -d '{"domain":"dev.to"}'
# → {"error":"still_breathing", ...}

# vine.co is dead (2017) → HTTP 200
curl -X POST https://ossuary-backend.onrender.com/api/recon \
  -H 'Content-Type: application/json' \
  -d '{"domain":"vine.co"}'
# → {"wayback":{"closestTimestamp":"20171231170118",...}, ...}
```

## Roadmap

- [x] Three-layer Refuse-to-Lie gate
- [x] 5-tier LLM cascade via Mastra
- [x] Diegetic Sentry telemetry
- [x] Persistent memory (Backboard + MongoDB)
- [x] Time-series analytics (TigerData)
- [x] WCAG AA contrast compliance
- [ ] Ghost Report export (`.docx` via Paper Instruments)
- [ ] Public ghost gallery (browse recently-summoned ghosts)
- [ ] Webhook subscriptions (get notified when a domain dies)
- [ ] Multi-language ghost narratives

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The short version:

1. Fork the repo.
2. Create a feature branch: `git checkout -b feat/your-idea`
3. Commit: `git commit -m "feat: your idea"`
4. Push and open a PR. **Keep PRs focused — one idea per PR.**

We especially welcome:

- **New dead domains** for the `KNOWN_DEAD_DOMAINS` registry (with sources)
- **Accessibility improvements** (WCAG AA is a floor, not a ceiling)
- **New tier fallbacks** for the LLM cascade
- **Ghost lore suggestions** — a clever narrative prompt is worth 100 code reviews

## License

MIT — see [LICENSE](./LICENSE).

> *The dead belong to everyone.*

## Credits

- **Jack** ([@setuju](https://github.com/setuju)) — Gardener, coder, necromancer. Wrote every line of this project while listening to Górecki's Symphony No. 3 on loop.
- **The Internet Archive** — for refusing to forget.
- **Wikipedia** — for remembering the details we'd rather forget.
- **The ghosts of** `pets.com`, `vine.co`, `geocities.com`, `friendster.com`, `clubpenguin.com`, `megaupload.com`, `grooveshark.com`, `sixdegrees.com`, `boo.com` — for speaking back.

---

<div align="center">

*If you've ever lost a website you loved, this project was built for you.*

**[Whisper a name →](https://ossuary.saturumah.net)**

<sub>Made with sorrow, caffeine, and a refusal to lie.</sub>

</div>
