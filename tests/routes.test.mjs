import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyDestination,classifyPlace} from '../src/lib/analytics-destinations.ts';
import {setTrackingConsent,trackEvent,clearEstimateAttribution} from '../src/lib/tracking.ts';
import {eventSchema} from '../src/lib/event-schema.ts';
test('district and street names cannot turn a Cochem address into Zell',()=>{
 assert.equal(classifyDestination('Cochem, Cochem-Zell, Rheinland-Pfalz'),'cochem');
 assert.equal(classifyDestination('Cochem-Zell'),'other');
 assert.equal(classifyPlace({text:'Zell',place_type:['address'],context:[{id:'district.1',text:'Cochem-Zell'},{id:'place.1',text:'Cochem'}]}),'cochem');
 assert.equal(classifyPlace({text:'Cochem',place_type:['place'],context:[{id:'district.1',text:'Cochem-Zell'}]}),'cochem');
 assert.equal(classifyPlace({text:'Zell (Mosel)',place_type:['place']}),'zell-mosel');
 assert.equal(classifyPlace({text:'Zeller Straße',place_type:['address']}),'unknown');
 assert.equal(classifyPlace({text:'Bonn',place_type:['place']}),'other');
 assert.equal(classifyPlace(undefined,'hahn'),'airport-hahn');
});
test('call attribution requires consent, expires and clears on edits, failure and withdrawal',()=>{
 const sent=[];globalThis.window={};globalThis.location={pathname:'/de',hostname:'example.test'};globalThis.document={referrer:''};Object.defineProperty(globalThis,'navigator',{value:{userAgent:'Test',doNotTrack:'0'},configurable:true});globalThis.fetch=(_u,o)=>{sent.push(JSON.parse(o.body));return Promise.resolve({});};
 const metrics={origin:'cochem',destination:'zell-mosel',route_version:2,passengers:'1-4',tariff:'day'};
 setTrackingConsent(false);trackEvent('calculator_success',metrics);trackEvent('click_call_now');assert.equal(sent.at(-1).after_estimate,undefined);
 setTrackingConsent(true);trackEvent('calculator_success',metrics);trackEvent('click_call_now');assert.equal(sent.at(-1).after_estimate,1);assert.equal(sent.at(-1).origin,'cochem');assert.equal(eventSchema.safeParse(sent.at(-1)).success,true);
 clearEstimateAttribution();trackEvent('click_call_now');assert.equal(sent.at(-1).after_estimate,undefined);
 for(const event of ['use_calculator','calculator_error']) {trackEvent('calculator_success',metrics);trackEvent(event,metrics);trackEvent('click_call_now');assert.equal(sent.at(-1).after_estimate,undefined);}
 trackEvent('calculator_success',metrics);const now=Date.now;Date.now=()=>now()+31*60_000;trackEvent('click_call_now');Date.now=now;assert.equal(sent.at(-1).after_estimate,undefined);
 trackEvent('calculator_success',metrics);setTrackingConsent(false);trackEvent('click_call_now');assert.equal(sent.at(-1).after_estimate,undefined);assert.equal(sent.at(-1).visit,null);
 assert.equal(eventSchema.safeParse({...sent.at(-1),origin:'private street 12'}).success,false);
});
