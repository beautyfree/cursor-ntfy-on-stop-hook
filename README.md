# Cursor ntfy on Stop Hook

Sends a notification via [ntfy](https://ntfy.sh) when the Cursor AI agent task ends (completed, aborted, or error). Subscribe to your topic in the ntfy app on phone, watch, or desktop to get notified.

## Overview

- **Hook event:** `stop` (runs once per agent run when the task finishes).
- **Channel:** ntfy only (no macOS/system notifications).
- **Config:** Topic (and optional server) via [cursor-hook](https://github.com/beautyfree/cursor-hook) `requiredEnv` at install time, or via shell env / manual `hooks.json`.
- **Uniqueness:** Each notification is sent with a unique `X-Message-Id` so ntfy does not deduplicate them.
- **Runtime:** TypeScript compiled to JavaScript; runs with Node.js (no Bash/curl).

## Features

- Runs on agent **stop** (status: completed / aborted / error).
- **ntfy only** — push to your topic; receive on phone, watch, or desktop.
- Optional custom ntfy server via `CURSOR_HOOK_NTFY_SERVER`.
- No extra runtime dependencies (Node.js built-in `fetch`; TypeScript only for build).
- **requiredEnv** — cursor-hook CLI prompts for topic (and optional server) at install and injects them into the hook command.

## Requirements

| Requirement | Notes |
|------------|------|
| **Node.js** (≥ 18) | For running the hook and native `fetch`. |
| **npm** | For `npm install` and `npm run build` during install. |
| **CURSOR_HOOK_NTFY_TOPIC** | Set via install prompt or shell / manual config. |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `CURSOR_HOOK_NTFY_TOPIC` | Yes | ntfy topic name (e.g. `cursor-agent`). |
| `CURSOR_HOOK_NTFY_SERVER` | No | Custom ntfy server URL; default `https://ntfy.sh`. |

When installing with `npx cursor-hook install ...`, the CLI prompts for these and injects them into the command in `hooks.json`. To change later, re-run install or edit `hooks.json` (or export in shell for manual setup).

## Quick Installation

Using the [cursor-hook](https://github.com/beautyfree/cursor-hook) CLI:

```bash
npx cursor-hook install beautyfree/cursor-ntfy-on-stop-hook
```

From a local path:

```bash
npx cursor-hook install /path/to/app-store-connect-mcp-server/cursor-hook
```

Choose **global** (`~/.cursor/`) or **project** (`.cursor/` in workspace). Enter **CURSOR_HOOK_NTFY_TOPIC** (and optionally **CURSOR_HOOK_NTFY_SERVER**) when prompted.

### What the CLI does

- Copies `hooks/ntfy-on-stop` to `~/.cursor/hooks/ntfy-on-stop` or `.cursor/hooks/ntfy-on-stop`.
- Runs `npm install` and `npm run build` in that directory (installs TypeScript, compiles to `dist/`).
- Merges the `stop` hook (and env injection) into `hooks.json`; the command runs `node .../dist/ntfy-on-stop.js`.

## How It Works

1. When the Cursor agent task ends, Cursor runs the `stop` hook and sends a JSON payload to stdin (e.g. `conversation_id`, `generation_id`, `status`, `workspace_roots`).
2. `ntfy-on-stop.js` reads stdin, parses JSON, and reads `status` (completed / aborted / error); defaults to `"completed"` if missing.
3. If `CURSOR_HOOK_NTFY_TOPIC` is set, the script POSTs to `{CURSOR_HOOK_NTFY_SERVER}/{topic}` with:
   - **Title:** `Cursor`
   - **Body:** the status string
   - **X-Message-Id:** `cursor-stop-<timestamp>-<random>` so each notification is unique and not deduplicated by ntfy.
4. If the topic is not set, the script exits without sending.

## ntfy setup

1. Choose a **topic** name (e.g. `cursor-agent`). Use a random or private name if you want the channel private.
2. Install the ntfy app: [iOS](https://apps.apple.com/app/ntfy/id1625396347) · [Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) · [macOS](https://apps.apple.com/app/ntfy/id1625396347) · [Web](https://ntfy.sh).
3. In the app, **subscribe** to your topic.
4. (Optional) On iPhone, enable ntfy notifications on **Apple Watch** in the Watch app.
5. When installing this hook, enter that topic (and optional server) when the cursor-hook CLI prompts.

### Custom ntfy server

Default is `https://ntfy.sh`. For self-hosted ntfy, set `CURSOR_HOOK_NTFY_SERVER` at install or in your shell.

## File structure (after install)

**Project:**

```
.cursor/
├── hooks.json
└── hooks/
    └── ntfy-on-stop/
        ├── ntfy-on-stop.ts
        ├── package.json
        ├── tsconfig.json
        ├── dist/
        │   └── ntfy-on-stop.js
        └── node_modules/
```

**Global:**

```
~/.cursor/
├── hooks.json
└── hooks/
    └── ntfy-on-stop/
        ├── ntfy-on-stop.ts
        ├── package.json
        ├── tsconfig.json
        ├── dist/
        │   └── ntfy-on-stop.js
        └── node_modules/
```

## Manual setup

Without the cursor-hook CLI:

1. Copy `hooks/ntfy-on-stop` to `~/.cursor/hooks/ntfy-on-stop` (global) or `.cursor/hooks/ntfy-on-stop` (project).
2. In that directory run: `npm install && npm run build`.
3. Add the `stop` hook to `~/.cursor/hooks.json` or `.cursor/hooks.json`:

   ```json
   {
     "version": 1,
     "hooks": {
       "stop": [
         {
           "command": "node $HOME/.cursor/hooks/ntfy-on-stop/dist/ntfy-on-stop.js"
         }
       ]
     }
   }
   ```

   For project install, use a path relative to the workspace, e.g. `node .cursor/hooks/ntfy-on-stop/dist/ntfy-on-stop.js` (from project root).

4. Set env so the script sees the topic (and optional server):
   - In shell: `export CURSOR_HOOK_NTFY_TOPIC=cursor-agent` (and optionally `CURSOR_HOOK_NTFY_SERVER=...`), or
   - In the command: `"command": "CURSOR_HOOK_NTFY_TOPIC=cursor-agent node $HOME/.cursor/hooks/ntfy-on-stop/dist/ntfy-on-stop.js"`

## Testing

```bash
export CURSOR_HOOK_NTFY_TOPIC=your-topic
echo '{"hook_event_name":"stop","status":"completed","workspace_roots":["/tmp"]}' | node ~/.cursor/hooks/ntfy-on-stop/dist/ntfy-on-stop.js
```

You should receive a notification in the ntfy app for `your-topic`.

## Updating

```bash
npx cursor-hook install beautyfree/cursor-ntfy-on-stop-hook
```

(Or the local path.) You will be prompted again for env vars; current `process.env` values are used as defaults.

## Uninstallation

**Project:** Remove the hook directory and the `stop` entry from `.cursor/hooks.json`:

```bash
rm -rf .cursor/hooks/ntfy-on-stop
# Edit .cursor/hooks.json and remove the stop entry for this hook.
```

**Global:** Same, under `~/.cursor/`:

```bash
rm -rf ~/.cursor/hooks/ntfy-on-stop
# Edit ~/.cursor/hooks.json and remove the stop entry.
```

## Debugging

In Cursor: **View → Output** → **Hooks** to see hook invocations and errors.

## License

MIT

## Contributing

Pull requests welcome. For larger changes, open an issue first.

## Links

- [ntfy](https://ntfy.sh) — docs and apps
- [Cursor Hooks](https://cursor.com/docs/agent/hooks)
- [cursor-hook](https://github.com/beautyfree/cursor-hook) — CLI to develop/install Cursor hooks (supports **requiredEnv**)
