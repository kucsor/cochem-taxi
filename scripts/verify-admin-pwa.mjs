// Production-browser check: separate app identity, worker scope and private cache isolation.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import http from 'node:http';
function hostRequest(path, host) {
  return new Promise((resolve,reject)=>{
    http.get(base+path,{headers:{host}},r=>{
      let body='';r.on('data',c=>body+=c);r.on('end',()=>resolve(new Response(body,{status:r.statusCode,headers:r.headers})));
    }).on('error',reject);
  });
}
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const chrome = require(process.env.CHROMIUM_MODULE || '@sparticuz/chromium');
const base = 'http://127.0.0.1:9124';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '9124'], { stdio: 'ignore' });
let browser;
try {
  for (let i=0;i<80;i++) { try { if ((await fetch(base+'/admin')).ok) break; } catch {} await new Promise(r=>setTimeout(r,250)); }
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || await chrome.executablePath(), args: chrome.args, headless: true });
  // Production-host routing, without following redirects to the live deployment.
  const taxiAdmin = await hostRequest('/admin','cochem-taxi.de');
  assert.equal(taxiAdmin.status,307);
  assert.equal(taxiAdmin.headers.get('location'),'https://insights.cochem-taxi.de/admin');
  const insightsHome = await hostRequest('/','insights.cochem-taxi.de');
  assert.equal(insightsHome.status,307);
  assert.match(insightsHome.headers.get('location'),/\/admin$/);
  const oldManifest = await (await hostRequest('/admin.webmanifest','cochem-taxi.de')).json();
  assert.equal(oldManifest.name,'Cochem Taxi');
  assert.equal(oldManifest.id,'/');
  const isolated = await browser.newContext();
  const taxi = await isolated.newPage();
  await taxi.goto('http://localhost:9124/de');
  await taxi.waitForFunction(async()=> Boolean((await navigator.serviceWorker.getRegistration('/'))?.active));
  assert.equal(await taxi.locator('link[rel="manifest"]').getAttribute('href'),'/manifest.json');
  const insights = await isolated.newPage();
  await insights.goto('http://127.0.0.1:9124/admin');
  await insights.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/admin-sw.js'));
  assert.equal(await insights.locator('link[rel="manifest"]').getAttribute('href'),'/admin.webmanifest');
  assert.deepEqual(await insights.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).map(r=>new URL(r.scope).pathname)),['/admin']);
  assert.deepEqual(await taxi.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).map(r=>new URL(r.scope).pathname)),['/']);
  await taxi.evaluate(()=>localStorage.setItem('isolation-probe','taxi'));
  assert.equal(await insights.evaluate(()=>localStorage.getItem('isolation-probe')),null);
  const taxiManifest = await taxi.evaluate(async()=>(await (await fetch('/manifest.json')).json()));
  const insightManifest = await insights.evaluate(async()=>(await (await fetch('/admin.webmanifest')).json()));
  assert.notEqual(new URL(taxiManifest.id,taxi.url()).href,new URL(insightManifest.id,insights.url()).href);
  const context = isolated;
  const page = insights;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base+'/admin');
  assert.equal(await page.locator('link[rel="manifest"]').getAttribute('href'), '/admin.webmanifest');
  const manifest = await (await fetch(base+'/admin.webmanifest')).json();
  assert.equal(manifest.id, '/admin'); assert.equal(manifest.start_url, '/admin'); assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) assert.equal((await fetch(base+icon.src)).status,200);
  await page.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/admin-sw.js'));
  const cdp = await context.newCDPSession(page);
  const installability = await cdp.send('Page.getInstallabilityErrors');
  assert.deepEqual(installability.installabilityErrors, []);
  const registration = await page.evaluate(async()=>({scope:(await navigator.serviceWorker.getRegistration(location.href)).scope}));
  assert.equal(registration.scope, base+'/admin');
  assert.equal(await page.evaluate(async()=> (await fetch('/api/admin/insights')).status),401);
  await page.evaluate(()=>{
    const event = new Event('beforeinstallprompt', {cancelable:true});
    event.prompt = async()=>{}; event.userChoice = Promise.resolve({outcome:'dismissed'});
    window.dispatchEvent(event);
  });
  await page.getByRole('button',{name:'Install app',exact:true}).click();
  await page.getByRole('button',{name:'Install app',exact:true}).waitFor({state:'hidden'});
  const privateEntries = await page.evaluate(async()=>{
    const entries = await Promise.all((await caches.keys()).map(async k=>(await (await caches.open(k)).keys()).map(r=>new URL(r.url).pathname)));
    return entries.flat().filter(p=>p==='/admin'||p.startsWith('/admin/')||p.startsWith('/api/'));
  });
  assert.deepEqual(privateEntries,[]);
  await context.setOffline(true);
  assert.equal(await page.evaluate(async()=>{try { await fetch('/api/admin/insights'); return true; } catch { return false; }}),false);
  console.log('PASS: production-host redirects, separate origin identity/storage/workers, dedicated manifest/icons, admin worker control, install dismissal, unauthenticated API protection and no offline private cache.');
} finally { await browser?.close(); server.kill('SIGTERM'); }
