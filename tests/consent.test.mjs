import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setTrackingConsent,trackEvent} from '../src/lib/tracking.ts';
test('consent withdrawal synchronously drops session identifier and stops GA events',()=>{
 const sent=[],ga=[];globalThis.window={gtag:(...a)=>ga.push(a)};globalThis.location={pathname:'/de',hostname:'test.example'};globalThis.document={referrer:''};Object.defineProperty(globalThis,'navigator',{value:{userAgent:'Test',doNotTrack:'0'},configurable:true});globalThis.fetch=(_url,options)=>{sent.push(JSON.parse(options.body));return Promise.resolve({});};
 setTrackingConsent(true);trackEvent('use_calculator');assert(sent.at(-1).visit);assert.equal(ga.filter(x=>x[0]==='event').length,1);
 setTrackingConsent(false);trackEvent('consent_reject');assert.equal(sent.at(-1).visit,null);assert.equal(ga.filter(x=>x[0]==='event').length,1);assert.equal(window['ga-disable-G-R1ZRPLYTDH'],true);
 navigator.doNotTrack='1';const before=sent.length;trackEvent('page_view');assert.equal(sent.length,before);
});
