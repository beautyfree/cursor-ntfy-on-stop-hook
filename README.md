# Cursor Hook: ntfy on Stop

Sends a [ntfy](https://ntfy.sh) notification when the Cursor agent finishes (stop hook).

## How it works

- Cursor calls the hook on **stop** and sends a JSON payload to stdin (`status`, `conversation_id`, etc.).
- Script reads `status` (completed / aborted / error), defaults to `"completed"`.
- If `CURSOR_HOOK_NTFY_TOPIC` is set, POSTs to ntfy with **Title:** `Cursor`, **Body:** status, **X-Message-Id:** unique per run (no dedup).

## Install

```bash
npx cursor-hook install beautyfree/cursor-ntfy-on-stop-hook
```

## ntfy

Create a topic (e.g. `cursor-agent`), install the [ntfy app](https://ntfy.sh), subscribe to that topic. Optional: on iPhone, enable ntfy in Watch to get notifications on Apple Watch.

## Test

```bash
export CURSOR_HOOK_NTFY_TOPIC=your-topic
echo '{"status":"completed"}' | node ~/.cursor/hooks/ntfy-on-stop/dist/ntfy-on-stop.js
```

## Update

Re-run the install command; you’ll be prompted for env again (current values as defaults).

## Uninstall

```bash
rm -rf ~/.cursor/hooks/ntfy-on-stop   # or .cursor/hooks/ntfy-on-stop
# Remove the stop entry from hooks.json
```

## Debug

**View → Output → Hooks** in Cursor.

## Refs

- [ntfy](https://ntfy.sh) · [Cursor Hooks](https://cursor.com/docs/agent/hooks) · [cursor-hook](https://github.com/beautyfree/cursor-hook)
