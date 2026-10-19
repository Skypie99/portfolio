// QA-only network boundary for the unchanged overflow census.
const fs = require('node:fs');
const pw = require(require.resolve('playwright-core', { paths: [process.cwd()] }));
const originalLaunch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (...args) => {
  const browser = await originalLaunch(...args);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...ctxArgs) => {
    const context = await newContext(...ctxArgs);
    await context.route('**/*', route => {
      const u = new URL(route.request().url());
      if (['127.0.0.1', 'localhost'].includes(u.hostname) || u.protocol === 'data:' || (u.protocol === 'blob:' && /^http:\/\/(127\.0\.0\.1|localhost):/.test(u.origin))) return route.continue();
      if (process.env.LOOPBACK_LOG) fs.appendFileSync(process.env.LOOPBACK_LOG, JSON.stringify({host:u.hostname,method:route.request().method()})+'\n');
      return route.abort();
    });
    return context;
  };
  return browser;
};
