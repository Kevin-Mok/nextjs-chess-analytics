import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const managedProcesses = new Set<number>();

function isRunning(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function isZombie(pid: number) {
  const result = spawnSync("ps", ["-o", "stat=", "-p", String(pid)], {
    encoding: "utf8",
  });

  return result.status === 0 && result.stdout.trim().startsWith("Z");
}

async function waitForExit(pid: number, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (!isRunning(pid) || isZombie(pid)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Process ${pid} did not exit within ${timeoutMs}ms`);
}

async function waitForProcessExit(child: ReturnType<typeof spawn>, timeoutMs = 5000) {
  const exitPromise = once(child, "exit");
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Process ${child.pid ?? "unknown"} did not emit exit within ${timeoutMs}ms`));
    }, timeoutMs);
  });

  await Promise.race([exitPromise, timeoutPromise]);
}

function readSingleChunk(stream: NodeJS.ReadableStream) {
  return new Promise<Buffer>((resolve, reject) => {
    stream.once("data", (chunk: string | Buffer) => {
      resolve(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.once("error", reject);
  });
}

afterEach(() => {
  for (const pid of managedProcesses) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Process already exited.
    }
  }

  managedProcesses.clear();
});

describe("live site start helpers", () => {
  it("strips pnpm's forwarded delimiter before calling next start", () => {
    const result = spawnSync(
      "pnpm",
      ["start", "--", "--hostname", "127.0.0.1", "--port", "3003"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          CHESS_START_NEXT_DRY_RUN: "1",
        },
      },
    );

    expect(result.status).toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      "next start <--hostname> <127.0.0.1> <--port> <3003>",
    );
    expect(`${result.stdout}${result.stderr}`).not.toContain("<-->");
  });

  it("stops child processes when terminating a managed runner", async () => {
    const parent = spawn(
      "bash",
      ["-lc", 'nohup sleep 300 >/dev/null 2>&1 & child=$!; echo "$child"; wait'],
      {
        cwd: repoRoot,
        stdio: ["ignore", "pipe", "inherit"],
      },
    );

    const parentPid = parent.pid;
    expect(parentPid).toBeTypeOf("number");
    managedProcesses.add(parentPid);

    const parentStdout = parent.stdout;
    if (parentStdout === null) {
      throw new Error("Expected the managed parent process to expose stdout");
    }

    const childChunk = await readSingleChunk(parentStdout);
    const childPid = Number.parseInt(childChunk.toString("utf8").trim(), 10);
    expect(Number.isNaN(childPid)).toBe(false);
    managedProcesses.add(childPid);

    expect(isRunning(parentPid)).toBe(true);
    expect(isRunning(childPid)).toBe(true);

    const stopResult = spawnSync(
      "bash",
      ["-lc", `source scripts/update-live-site.sh; stop_pid ${parentPid}`],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    );

    expect(stopResult.status).toBe(0);

    await waitForProcessExit(parent);
    await waitForExit(childPid);

    managedProcesses.delete(parentPid);
    managedProcesses.delete(childPid);
  });

  it("rejects overlapping live-site update runs", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "chess-live-site-lock-"));
    const holder = spawn(
      "bash",
      [
        "-lc",
        [
          "source scripts/update-live-site.sh",
          `LOG_DIR="${logDir}"`,
          'LOCK_FILE="$LOG_DIR/live-site.lock"',
          'mkdir -p "$LOG_DIR"',
          "acquire_update_lock",
          "echo locked",
          "read -r _",
        ].join("; "),
      ],
      {
        cwd: repoRoot,
        stdio: ["pipe", "pipe", "inherit"],
      },
    );

    const holderPid = holder.pid;
    expect(holderPid).toBeTypeOf("number");
    managedProcesses.add(holderPid);

    const holderStdout = holder.stdout;
    if (holderStdout === null) {
      throw new Error("Expected the lock holder process to expose stdout");
    }

    const lockChunk = await readSingleChunk(holderStdout);
    expect(lockChunk.toString("utf8")).toContain("locked");

    const contender = spawnSync(
      "bash",
      [
        "-lc",
        [
          "source scripts/update-live-site.sh",
          `LOG_DIR="${logDir}"`,
          'LOCK_FILE="$LOG_DIR/live-site.lock"',
          'mkdir -p "$LOG_DIR"',
          "acquire_update_lock",
        ].join("; "),
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    );

    expect(contender.status).toBe(1);
    expect(`${contender.stdout}${contender.stderr}`).toContain(
      "Another live-site update is already running",
    );

    holder.stdin?.write("release\n");
    await waitForProcessExit(holder);
    managedProcesses.delete(holderPid);
  });
});
