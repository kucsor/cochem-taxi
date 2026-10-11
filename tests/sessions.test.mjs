import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setTrackingConsent,trackEvent} from '../src/lib/tracking.ts';
import {eventSchema} from '../src/lib/event-schema.ts';
test('sessions survive reload, expire, revoke and never break customer interactions',async()=>{
 global.window={};global.location={pathname:'/de',hostname:'cochem-taxi.de'};global.document={referrer:''};
 Object.defineProperty(global,'navigator',{value:{userAgent:'Mobile'},configurable:true});
 const storage=new Map();global.sessionStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const sent=[];global.fetch=async(_,o)=>{sent.push(JSON.parse(o.body));return {};};
 setTrackingConsent(true);trackEvent('page_view');const first=sent.at(-1);assert.ok(first.visit);assert.equal(sent[0].name,'session_start');assert.ok(sent.every(e=>eventSchema.safeParse(e).success));
 const reloaded=await import('../src/lib/tracking.ts?reload');reloaded.setTrackingConsent(true);reloaded.trackEvent('page_view');assert.equal(sent.at(-1).visit,first.visit);assert.equal(sent.filter(e=>e.name==='session_start').length,1);
 const id=crypto.randomUUID();reloaded.trackEvent('calculator_success',{route_version:2,origin:'cochem',destination:'airport-hahn',calculation_id:id});
 const reloadedAgain=await import('../src/lib/tracking.ts?reload2');reloadedAgain.setTrackingConsent(true);reloadedAgain.trackEvent('click_call_now');assert.equal(sent.at(-1).calculation_id,id);assert.equal(sent.at(-1).call_delay_seconds,0);
 const now=Date.now;Date.now=()=>now()+31*60000;reloadedAgain.trackEvent('page_view');assert.notEqual(sent.at(-1).visit,first.visit);Date.now=now;
 reloadedAgain.setTrackingConsent(false);assert.equal(storage.size,0);reloadedAgain.trackEvent('click_call_now');assert.equal(sent.at(-1).visit,null);assert.equal(sent.at(-1).calculation_id,undefined);
 navigator.doNotTrack='1';const count=sent.length;reloadedAgain.trackEvent('page_view');assert.equal(sent.length,count);delete navigator.doNotTrack;
 global.fetch=()=>{throw new Error('blocked')};assert.doesNotThrow(()=>reloadedAgain.trackEvent('click_call_now'));
 global.sessionStorage={getItem(){throw Error('denied')},setItem(){throw Error('denied')},removeItem(){throw Error('denied')}};assert.doesNotThrow(()=>{reloadedAgain.setTrackingConsent(true);reloadedAgain.trackEvent('page_view');reloadedAgain.setTrackingConsent(false)});
});
test('safe target schema excludes queries, raw text and client-supplied country',()=>{
 const base={id:crypto.randomUUID(),name:'navigation_click',path:'/nl',visit:null,referrer:'',source:'navigation',device:'mobile'};
 assert.equal(eventSchema.parse({...base,country:'NL'}).country,undefined);
 for(const target of ['/en#rechner','call-taxi','external:example.com'])assert.ok(eventSchema.safeParse({...base,target}).success);
 for(const target of ['/en?address=private','Private street 12','tel:+490000'])assert.equal(eventSchema.safeParse({...base,target}).success,false);
});
