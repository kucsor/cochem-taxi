import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolvedAnalyticsPlace,isAnalyticsPlace,analyticsPlaceLabel} from '../src/lib/analytics-destinations.ts';
import {eventSchema} from '../src/lib/event-schema.ts';
const town={id:'place.12345',text:'Mayen'};
const context=[town,{id:'district.1',text:'Mayen-Koblenz'},{id:'region.1',text:'Rheinland-Pfalz',short_code:'DE-RP'},{id:'country.1',text:'Deutschland',short_code:'de'}];
test('unlisted municipalities are identified without collecting the selected address',()=>{
 const key=resolvedAnalyticsPlace({id:'address.789',text:'Private Straße',place_type:['address'],context});
 assert.equal(key,'locality:DE-RP:place.12345:Mayen');
 assert.equal(eventSchema.shape.destination.parse(key),key);
 assert.equal(analyticsPlaceLabel(key),'Mayen · DE-RP');
 assert(!key.includes('Private'));assert(!key.includes('address.789'));
 assert.equal(resolvedAnalyticsPlace({...town,place_type:['place'],context:context.slice(1)}),key);
});
test('parent municipality wins over district and neighbourhood; no address fallback',()=>{
 assert.equal(resolvedAnalyticsPlace({id:'locality.123',text:'Private neighbourhood',place_type:['locality'],context}), 'locality:DE-RP:place.12345:Mayen');
 assert.equal(resolvedAnalyticsPlace({text:'Zeller Straße',place_type:['address'],context:[{id:'district.1',text:'Cochem-Zell'},{id:'place.1',text:'Cochem'}]}),'cochem');
 assert.equal(resolvedAnalyticsPlace({id:'address.1',text:'Hauptstraße 24',place_type:['address'],context:context.slice(1)}),'unknown');
 assert.equal(resolvedAnalyticsPlace({id:'locality.1',text:'Named neighbourhood',place_type:['locality']}),'unknown');
 assert.equal(resolvedAnalyticsPlace(undefined,'hahn'),'airport-hahn');
});
test('place keys retain umlauts and disambiguate same-named towns',()=>{
 const make=(id,area,text)=>resolvedAnalyticsPlace({id,text,place_type:['place'],context:[{id:'region.1',text:'Region',short_code:area},{id:'country.1',text:'Deutschland',short_code:'de'}]});
 assert.equal(make('place.88','DE-BY','München'),'locality:DE-BY:place.88:München');
 assert.equal(make('place.99','DE-BW','Beilstein'),'locality:DE-BW:place.99:Beilstein');
 assert.notEqual(make('place.1','DE-RP','Neustadt'),make('place.2','DE-BY','Neustadt'));
 for(const key of ['Hauptstraße 24','locality:DE:address.1:Private Straße','locality:DE:place.1:Private Straße 24','locality:DE:place.1:<script>']) assert.equal(isAnalyticsPlace(key),false);
});
