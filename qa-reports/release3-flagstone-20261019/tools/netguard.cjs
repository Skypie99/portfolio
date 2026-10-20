'use strict';
// Flagstone Version A independent review (2026-10-18): network guard for the owner-authorized review build.
// Copied from 2026-10-18_fable-homepage-rendered-preview-r1/rig/netguard.cjs; only these two comment
// lines and the error text differ.
//
// Preloaded with NODE_OPTIONS="--require <this file>", so Node loads it into the npm process,
// the Next.js build process, its forked processes and its worker threads. It never edits the
// repository. For every outbound socket it appends one JSON line to $NETGUARD_LOG, and it refuses
// any TCP destination other than loopback and the two hosts the owner authorized for this build:
//   fonts.googleapis.com, fonts.gstatic.com
// A refused connection is destroyed with an ENETGUARD error, so an unexpected requirement shows up
// as a failed build (to be reported) instead of silently widening network access.
const net = require('node:net');
const dns = require('node:dns');
const fs = require('node:fs');
let threadId = 0;
try { threadId = require('node:worker_threads').threadId; } catch { /* very old runtimes only */ }

const LOG = process.env.NETGUARD_LOG;
const ALLOW = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
const LOOPBACK = new Set(['localhost', '127.0.0.1', '::1', '::ffff:127.0.0.1']);

function log(record) {
  if (!LOG) return;
  try {
    fs.appendFileSync(LOG, `${JSON.stringify({ t: new Date().toISOString(), pid: process.pid, thread: threadId, ...record })}\n`);
  } catch { /* logging must never break the build */ }
}

const originalLookup = dns.lookup;
dns.lookup = function guardedLookup(hostname, ...rest) {
  const i = rest.findIndex((a) => typeof a === 'function');
  if (i >= 0) {
    const cb = rest[i];
    rest[i] = (err, address, family) => {
      log({ kind: 'dns', host: hostname, address: Array.isArray(address) ? address.map((a) => a.address) : address, error: err ? err.code : null });
      cb(err, address, family);
    };
  }
  return originalLookup.call(this, hostname, ...rest);
};

const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function guardedConnect(...args) {
  let opts = args[0];
  if (Array.isArray(opts)) opts = opts[0]; // Node's internally normalised [options, cb] form
  let host = null;
  let port = null;
  let path = null;
  if (opts && typeof opts === 'object') {
    host = opts.host ?? null;
    port = opts.port ?? null;
    path = opts.path ?? null;
  } else if (typeof opts === 'string' && !/^\d+$/.test(opts)) {
    path = opts;
  } else if (opts != null) {
    port = Number(opts);
    host = typeof args[1] === 'string' ? args[1] : 'localhost';
  }
  if (path) {
    log({ kind: 'ipc', path, verdict: 'allowed' });
    return originalConnect.apply(this, args);
  }
  const h = String(host ?? 'localhost').toLowerCase();
  if (ALLOW.has(h) || LOOPBACK.has(h)) {
    log({ kind: 'tcp', host: h, port, verdict: 'allowed' });
    return originalConnect.apply(this, args);
  }
  log({ kind: 'tcp', host: h, port, verdict: 'BLOCKED' });
  const err = new Error(`netguard: ${h}:${port} is outside the Flagstone review build authorization (fonts.googleapis.com, fonts.gstatic.com only)`);
  err.code = 'ENETGUARD';
  process.nextTick(() => this.destroy(err));
  return this;
};

log({ kind: 'preload', argv: process.argv.slice(1, 3).map((a) => a.replace(/^.*\/node_modules\//, 'node_modules/')).join(' ') });
