// ecosystem.config.cjs
'use strict';

module.exports = {
  apps: [
    // ── 1. SvelteKit web app ──────────────────────────────────────────────────
    {
      name: 'mp3d-web',
      script: 'build/index.js',         // output of `npm run build`
      cwd: '/home/deploy/MP3D-WEBAPP',  // adjust to your deploy path
      interpreter: 'node',
      instances: 1,                      // single instance is fine; no shared state issues
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // All secrets are set in the shell environment or a .env file loaded by PM2
        // Do NOT hardcode secrets here — use `pm2 set` or `env_file` instead
      },
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Logging
      out_file: '/var/log/mp3d/web-out.log',
      error_file: '/var/log/mp3d/web-err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Graceful shutdown — give in-flight requests 10s to finish
      kill_timeout: 10000,
    },

    // ── 2. pg-boss worker ────────────────────────────────────────────────────
    {
      name: 'mp3d-worker',
      script: 'worker.ts',
      cwd: '/home/deploy/MP3D-WEBAPP',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',  // tsx for TypeScript without compile step
      instances: 1,   // Only 1 worker — the C binary is the bottleneck, not Node
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      out_file: '/var/log/mp3d/worker-out.log',
      error_file: '/var/log/mp3d/worker-err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // SIGTERM handling — worker needs time to finish any in-flight STL job.
      // STL_JOB_TIMEOUT_SECONDS is 300 (5 min), so give 360s before SIGKILL.
      kill_timeout: 360000,
      listen_timeout: 8000,
    },

    // ── 3. File cleanup cron ─────────────────────────────────────────────────
    {
      name: 'mp3d-cleanup',
      script: 'scripts/cleanup-expired-files.ts',
      cwd: '/home/deploy/MP3D-WEBAPP',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      // cron_restart: PM2 launches the process on this schedule.
      // The script runs, exits, and PM2 does NOT restart it until the next window.
      cron_restart: '0 3 * * *',   // 3:00 AM server time every day
      autorestart: false,           // Must be false with cron_restart
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
      out_file: '/var/log/mp3d/cleanup-out.log',
      error_file: '/var/log/mp3d/cleanup-err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};