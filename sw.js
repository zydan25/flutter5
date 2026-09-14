const CACHE_NAME='takhfeed-sah-cache-v4';
const STATIC_ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./icon.svg','./favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_ASSETS).catch(()=>{})));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null))));self.clients.claim()});

async function bridgeAuth(request){
  const url=new URL(request.url);
  if(url.origin!=='https://whats.alattab.site'||request.method!=='POST') return fetch(request);
  const raw=await request.clone().text();let body={};try{body=JSON.parse(raw||'{}')}catch{}
  let target=null,method='POST';
  if(url.pathname==='/takhfid/api/v2/auth/login-verify'){target=new URL('/takhfid/api/v2/auth/verify-otp',url.origin);body.firstName=body.firstName||'غير مكتمل'}
  else if(url.pathname==='/takhfid/api/v2/auth/complete-profile'){target=new URL('/takhfid/api/v2/me/profile',url.origin);method='PUT'}
  else if(url.pathname==='/takhfid/api/v2/auth/session-revoke'){target=new URL('/takhfid/api/v2/auth/logout',url.origin)}
  if(!target)return fetch(request);
  const headers=new Headers(request.headers);headers.set('Content-Type','application/json');
  const response=await fetch(new Request(target.toString(),{method,headers,body:JSON.stringify(body)}));
  if(url.pathname==='/takhfid/api/v2/auth/login-verify'&&response.ok){
    const data=await response.json();
    const user={...(data.user||{})};
    return new Response(JSON.stringify({...data,needsProfile:!user.firstName||user.firstName==='غير مكتمل',user}),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
  }
  return response;
}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'){e.respondWith(bridgeAuth(e.request));return}e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200&&r.type==='basic')caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request)))})