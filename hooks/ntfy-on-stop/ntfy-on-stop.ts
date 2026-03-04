/**
 * Cursor Hook: run on agent stop. Sends notification via ntfy (https://ntfy.sh).
 * Requires: CURSOR_HOOK_NTFY_TOPIC. Optional: CURSOR_HOOK_NTFY_SERVER (default: https://ntfy.sh).
 */

import { readFileSync } from "node:fs";

const DEFAULT_SERVER = "https://ntfy.sh";
const TITLE = "Cursor";

interface StopPayload {
  status?: string;
  conversation_id?: string;
  generation_id?: string;
  workspace_roots?: string[];
  [key: string]: unknown;
}

function readStdin(): string {
  return readFileSync(0, "utf-8");
}

function parsePayload(input: string): StopPayload {
  try {
    return JSON.parse(input) as StopPayload;
  } catch {
    return {};
  }
}

function uniqueMessageId(): string {
  return `cursor-stop-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function main(): Promise<void> {
  const input = readStdin();
  const payload = parsePayload(input);
  const status = payload.status ?? "completed";

  const topic = process.env.CURSOR_HOOK_NTFY_TOPIC ?? "";
  const server = (process.env.CURSOR_HOOK_NTFY_SERVER ?? DEFAULT_SERVER).replace(
    /\/$/,
    ""
  );

  if (!topic) {
    process.exit(0);
  }

  const url = `${server}/${topic}`;
  const msgId = uniqueMessageId();

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Title: TITLE,
        "X-Message-Id": msgId,
      },
      body: status,
    });
  } catch {
    // Ignore network errors; hook must not fail the agent
  }

  process.exit(0);
}

main();
