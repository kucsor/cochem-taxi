// Synthetic browser flow; no production events, Mapbox requests or telephone calls.
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),chrome=require(process.env.CHROMIUM_MODULE||'@sparticuz/chromium');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','9148'],{stdio:'ignore'});
let browser;
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:9148/en')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||await chrome.executablePath(),args:chrome.args,headless:true});
 const p=await browser.newPage({serviceWorkers:'block'}),events=[];
 await p.addInitScript(()=>{localStorage.setItem('cochem-taxi-consent-v2','granted');document.addEventListener('click',e=>{if(e.target.closest?.('a[href^="tel:"]'))e.preventDefault();},true);});
 await p.route('**/api/events',r=>{events.push(r.request().postDataJSON());return r.fulfill({status:204});});
 await p.route('**/geocoding/v5/mapbox.places/**',r=>{
  const url=decodeURIComponent(r.request().url());
  if(url.includes('NoResult')) return r.fulfill({contentType:'application/json',body:'{"features":[]}'});
  if(url.includes('Mayen')) return r.fulfill({contentType:'application/json',body:JSON.stringify({features:[{id:'address.private',text:'Private Straße',address:'24',place_name:'Private Straße 24, Mayen, Deutschland',place_type:['address'],center:[7.22,50.33],context:[{id:'place.12345',text:'Mayen'},{id:'district.1',text:'Mayen-Koblenz'},{id:'region.1',text:'Rheinland-Pfalz',short_code:'DE-RP'},{id:'country.1',text:'Deutschland',short_code:'de'}]}]})});
  const zell=url.includes('/Zell');
  return r.fulfill({contentType:'application/json',body:JSON.stringify({features:[{id:zell?'place.zell':'place.cochem',text:zell?'Zell (Mosel)':'Cochem',place_name:zell?'Zell (Mosel), Cochem-Zell, Deutschland':'Cochem, Cochem-Zell, Deutschland',place_type:['place'],context:[{id:'district.1',text:'Cochem-Zell'}],center:zell?[7.18,50.03]:[7.17,50.14]}]})});
 });
 await p.route('**/api/calculate',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({price:10.47,distance:1.7,duration:5,geometry:null,message:null,hasAnfahrt:false,anfahrtFee:null})}));
 await p.goto('http://127.0.0.1:9148/en');
 await p.locator('#start').fill('Cochem');await p.locator('li').filter({hasText:'Cochem, Cochem-Zell'}).click();
 await p.locator('#end').fill('Zell');await p.locator('li').filter({hasText:'Zell (Mosel), Cochem-Zell'}).click();
 await p.locator('#rechner button[type="submit"]').click();
 for(let i=0;i<50&&!events.some(e=>e.name==='calculator_success');i++)await new Promise(r=>setTimeout(r,100));
 const success=events.find(e=>e.name==='calculator_success');assert(success);assert.equal(success.origin,'cochem');assert.equal(success.destination,'zell-mosel');assert.equal(success.route_version,2);
 await p.locator('a[href^="tel:"]').first().click();
 for(let i=0;i<50&&!events.some(e=>e.name==='click_call_now');i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(events.find(e=>e.name==='click_call_now').after_estimate,1);
 await p.locator('#end').fill('Changed address');await p.locator('a[href^="tel:"]').first().click();
 for(let i=0;i<50&&events.filter(e=>e.name==='click_call_now').length<2;i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(events.filter(e=>e.name==='click_call_now').at(-1).after_estimate,undefined);
 assert(!JSON.stringify(events).includes('Cochem-Zell'));assert(!JSON.stringify(events).includes('Changed address'));
 await p.waitForTimeout(200); // Let the existing delayed blur handler finish after the phone click.
 // Select a previously unlisted town: only the municipality may reach analytics.
 await p.locator('#end').fill('Mayen');await p.locator('li').filter({hasText:'Mayen, 24, Private Straße'}).click();
 let count=events.filter(e=>e.name==='calculator_success').length;
 await p.locator('#rechner button[type="submit"]').click();
 for(let i=0;i<50&&events.filter(e=>e.name==='calculator_success').length===count;i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(events.filter(e=>e.name==='calculator_success').at(-1).destination,'locality:DE-RP:place.12345:Mayen');
 await p.locator('a[href^="tel:"]').first().click();
 for(let i=0;i<50&&!events.some(e=>e.name==='click_call_now'&&e.destination?.includes('Mayen'));i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(events.filter(e=>e.name==='click_call_now').at(-1).destination,'locality:DE-RP:place.12345:Mayen');
 // Submit typed addresses without selecting suggestions.
 await p.locator('#start').fill('Cochem Manual address');
 await p.locator('#end').fill('Mayen Manual address');
 count=events.filter(e=>e.name==='calculator_success').length;
 await p.locator('#rechner button[type="submit"]').click();
 for(let i=0;i<50&&events.filter(e=>e.name==='calculator_success').length===count;i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(events.filter(e=>e.name==='calculator_success').at(-1).origin,'cochem');
 assert.equal(events.filter(e=>e.name==='calculator_success').at(-1).destination,'locality:DE-RP:place.12345:Mayen');
 assert.equal(events.filter(e=>e.name==='use_calculator').at(-1).destination,'locality:DE-RP:place.12345:Mayen');
 assert(!JSON.stringify(events).includes('Private Straße'));
 assert(!JSON.stringify(events).includes('Manual address'));
 assert(!JSON.stringify(events).includes('address.private'));
 await p.locator('#end').fill('NoResult');
 await p.locator('#rechner button[type="submit"]').click();
 for(let i=0;i<50&&!events.some(e=>e.outcome==='geocoding_end');i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(events.filter(e=>e.name==='calculator_error').at(-1).outcome,'geocoding_end');
 await p.goto('http://127.0.0.1:9148/en/flughafen/hahn');
 const before=events.filter(e=>e.name==='calculator_success').length;
 await p.locator('#rechner button[type="submit"]').click();
 for(let i=0;i<50&&events.filter(e=>e.name==='calculator_success').length===before;i++)await new Promise(r=>setTimeout(r,100));
 const preset=events.filter(e=>e.name==='calculator_success').at(-1);assert.equal(preset.origin,'cochem');assert.equal(preset.destination,'airport-hahn');
 console.log('PASS: unlisted municipality, typed-address enrichment, safe error codes and no street/address leakage; structured autocomplete → correct origin/destination → calculation → consented call attribution → edit clears attribution; no address text in events.');
}finally{await browser?.close();server.kill('SIGTERM');}
