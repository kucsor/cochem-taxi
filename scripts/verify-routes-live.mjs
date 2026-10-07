// Run only against an authorized configured backend. Test data uses a dedicated preview path.
import {spawn} from 'node:child_process';
import {randomBytes,scryptSync} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex'),salt=randomBytes(24).toString('hex');
const origin='http://127.0.0.1:9138',path='/en/analytics-verification-'+randomBytes(5).toString('hex');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','9138'],{env:{...process.env,VERCEL_ENV:'preview',ADMIN_PASSWORD_HASH:`${salt}:${scryptSync(password,salt,64).toString('hex')}`},stdio:['ignore','pipe','pipe']});
let cookie='';
const request=(url,body)=>fetch(origin+url,{method:body===undefined?'GET':'POST',headers:{origin,'content-type':'application/json',cookie,'x-real-ip':`verification-${salt}`},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
try{
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Server startup timeout')),30000);server.stdout.on('data',d=>{if(String(d).includes('Ready')){clearTimeout(t);resolve()}});server.once('exit',()=>{clearTimeout(t);reject(Error('Server exited'))});});
 assert.equal((await request('/api/admin/insights')).status,401);
 const login=await request('/api/admin/login',{username:'kuxor',password});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin'}).format(new Date());
 const url=`/api/admin/insights?from=${today}&to=${today}&environment=preview`;
 const before=await (await request(url)).json();
 const prodBefore=await (await request(url.replace('preview','production'))).json();
 const event={id:crypto.randomUUID(),name:'calculator_success',path,visit:crypto.randomUUID(),origin:'cochem',route_version:2,referrer:'',device:'mobile',source:'calculator',destination:'airport-hahn',passengers:'5-8',tariff:'night',fare:150,distance:45};
 console.log('TEST_PATH',path);
 assert.equal((await request('/api/events',{...event,id:crypto.randomUUID(),name:'use_calculator',fare:undefined,distance:undefined})).status,204);
 assert.equal((await request('/api/events',event)).status,204);
 assert.equal((await request('/api/events',event)).status,204);
 assert.equal((await request('/api/events',{...event,id:crypto.randomUUID(),destination:'private street 123'})).status,400);
 assert.equal((await request('/api/events',{...event,id:crypto.randomUUID(),name:'click_call_now',after_estimate:1,fare:undefined,distance:undefined})).status,204);
 const report=await (await request(url)).json();assert.equal(report.successes,before.successes+1);assert.equal(report.total,before.total+3);assert(report.recent.some(x=>x.path===path&&x.destination==='airport-hahn'));
 const route=report.routeReport.routes.find(r=>r.origin==='cochem'&&r.destination==='airport-hahn');assert(route);const old=before.routeReport.routes.find(r=>r.origin==='cochem'&&r.destination==='airport-hahn');assert.equal(route.calculations,(old?.calculations||0)+1);assert.equal(route.call_clicks,(old?.call_clicks||0)+1);assert.equal(route.sessions,(old?.sessions||0)+1);assert.equal(route.call_sessions,(old?.call_sessions||0)+1);
 const prodAfter=await (await request(url.replace('preview','production'))).json();assert(!prodAfter.recent.some(x=>x.path===path));assert(prodAfter.total>=prodBefore.total);
 assert.equal((await request('/api/admin/stats?environment=production')).status,200);
 assert.equal((await request('/api/admin/insights?from=2026-02-31&to=2026-03-01')).status,400);
 assert.equal((await request('/api/admin/logout',{})).status,200);assert.equal((await request(url)).status,401);cookie='';
 console.log('PASS: authenticated API → live Edge Function → database → private report, duplicate protection, destination privacy validation, environment separation, legacy report and session revocation.');
}finally{if(cookie)await request('/api/admin/logout',{}).catch(()=>{});server.kill('SIGTERM');}
