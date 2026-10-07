import { createClient } from 'npm:@supabase/supabase-js@2.102.0';
// Deployment replaces this with the SHA-256 of the server-only random secret.
const EXPECTED_HASH = '__GATEWAY_SECRET_SHA256__';
Deno.serve(async (request:Request)=>{
 if(request.method!=='POST')return new Response(null,{status:405});
 const secret=request.headers.get('x-analytics-secret')||'';
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret));
 const hash=Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
 // Compare fixed-length digests, never expose credentials or database errors.
 let difference=hash.length^EXPECTED_HASH.length;for(let i=0;i<hash.length;i++)difference|=hash.charCodeAt(i)^EXPECTED_HASH.charCodeAt(i);
 if(difference!==0)return new Response(null,{status:401});
 try{
  const raw=await request.text();if(raw.length>4096)return new Response(null,{status:413});
  const {action,payload:p}=JSON.parse(raw);
  const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');
  const db=createClient(Deno.env.get('SUPABASE_URL')!,keys.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  if(['session_create','session_check','session_delete'].includes(action)){
   if(!/^[a-f0-9]{64}$/.test(p.hash))return new Response(null,{status:400});
   if(action==='session_create'){const {error}=await db.from('analytics_admin_sessions').insert({hash:p.hash,expires_at:new Date(Date.now()+8*3600000).toISOString()});if(error)throw error;return Response.json(true);}
   if(action==='session_delete'){const {error}=await db.from('analytics_admin_sessions').delete().eq('hash',p.hash);if(error)throw error;return Response.json(true);}
   const {data,error}=await db.from('analytics_admin_sessions').select('expires_at').eq('hash',p.hash).gt('expires_at',new Date().toISOString()).maybeSingle();if(error)throw error;return Response.json(!!data);
  }
  if(action==='rate'){
   const {data,error}=await db.rpc('analytics_allow',{p_key:p.key,p_limit:p.limit,p_seconds:p.seconds});if(error)throw error;return Response.json(data);
  }
  if(action==='event'){
   const {error}=await db.from('analytics_events').insert({environment:p.environment,id:p.id,name:p.name,path:p.path,visit:p.visit,language:p.language,referrer:p.referrer,device:p.device,source:p.source,value:p.value,outcome:p.outcome,destination:p.destination,origin:p.origin,route_version:p.route_version,after_estimate:p.after_estimate,passengers:p.passengers,tariff:p.tariff,fare:p.fare,distance:p.distance});
   if(error&&error.code!=='23505')throw error;return Response.json({ok:true});
  }
  if(action==='stats'||action==='insights'){
   if(!/^\d{4}-\d{2}-\d{2}$/.test(p.from)||!/^\d{4}-\d{2}-\d{2}$/.test(p.to)||Date.parse(p.to)-Date.parse(p.from)>(action==='insights'?730:365)*86400000||p.from>p.to)return new Response(null,{status:400});
   const {data,error}=await db.rpc(action==='insights'?'analytics_route_insights':'analytics_report',{p_from:p.from,p_to:p.to,p_language:p.language||'',p_device:p.device||'',p_environment:p.environment||'production'});if(error)throw error;return Response.json(data);
  }
  return new Response(null,{status:400});
 }catch{return Response.json({error:'Service unavailable'},{status:503});}
});
