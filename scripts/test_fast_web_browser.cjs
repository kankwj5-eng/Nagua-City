"use strict";
// End-to-end check of the actual split PWA, served over HTTP instead of file://.
const fs=require("node:fs"),path=require("node:path"),http=require("node:http"),assert=require("node:assert/strict");
const {chromium}=require("playwright");
const site=path.resolve(__dirname,"../dist/site");
const mime={".html":"text/html; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gz":"application/gzip",".txt":"text/plain; charset=utf-8",".css":"text/css",".js":"text/javascript"};
let requests=0,bytesServed=0,assetRequests=0;
const server=http.createServer((req,res)=>{
 if(req.method!=="GET"){res.writeHead(405).end();return;}
 const url=new URL(req.url,"http://127.0.0.1/");
 const file=path.resolve(site,"."+decodeURIComponent(url.pathname));
 if(file!==site&&!file.startsWith(site+path.sep)){res.writeHead(403).end();return;}
 let stat;try{stat=fs.statSync(file);}catch{res.writeHead(404).end();return;}
 if(!stat.isFile()){res.writeHead(404).end();return;}
 requests++;bytesServed+=stat.size;if(url.pathname.startsWith("/assets/stream/"))assetRequests++;
 res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream","Content-Length":stat.size,"Cache-Control":url.pathname.startsWith("/assets/stream/")?"public,max-age=31536000,immutable":"no-cache"});
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const port=server.address().port,errors=[],failures=[];
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--use-angle=swiftshader","--enable-unsafe-swiftshader","--disable-dev-shm-usage"]});
 try{
  const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  await page.addInitScript(()=>{const report=console.error.bind(console);console.error=(...args)=>{(window.__caughtBootErrors||(window.__caughtBootErrors=[])).push(args.map(x=>x?.stack||String(x)).join(" | "));report(...args);};});
  page.on("pageerror",err=>errors.push(err?.stack||String(err)));const consoleErrors=[];page.on("console",msg=>{if(msg.type()==="error")consoleErrors.push(msg.text());});
  page.on("requestfailed",req=>failures.push(req.url()+": "+req.failure()?.errorText));
  const t=Date.now();
  await page.goto("http://127.0.0.1:"+port+"/Managua.html",{waitUntil:"domcontentloaded",timeout:180000});
  await page.waitForFunction(()=>window.Nicaragua?.ready||document.getElementById("status")?.classList.contains("error"),null,{timeout:210000,polling:200});
  const status=await page.locator("#status").innerText();
  const bootStack=await page.evaluate(()=>window.__caughtBootErrors||[]);
  assert(await page.evaluate(()=>window.Nicaragua?.ready),"Boot error: "+status+"; console: "+consoleErrors.join(" | ")+"; stack: "+bootStack.join(" | "));
  await page.waitForFunction(()=>Nicaragua.playing,null,{timeout:10000});
  const first=await page.evaluate(()=>({startup:Nicaragua.startup48,boot:Nicaragua.boot45,playing:Nicaragua.playing,zones:Nicaragua.zones.size}));
  assert(first.playing,"Game did not auto-enter");
  // Verificar dentro del navegador que el mundo no utiliza NPC/carros anteriores.
  const v4 = await page.evaluate(() => {
    const n=window.Nicaragua;
    const ids=["01_mateo","02_ernesto","03_daniel","04_luis","05_rafael",
      "06_valeria","07_marisol","08_xiomara","09_rosa","10_elena"];
    const vehicles=["hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta"];
    const specs=JSON.parse(document.getElementById("v4-original-specifications")?.textContent||"null");
    const people=[n.player,...n.pedestrians];
    const garage=n.fleet.filter(v=>v.garage);
    return {
      specsCharacters:specs?.characters?.map(v=>v.id)||[],
      specsVehicles:specs?.vehicles?.map(v=>v.id)||[],
      hero:n.player?.v4?.id||null,
      npcs:n.pedestrians.length,
      allPeopleV4:people.every(p=>p.v4&&ids.includes(p.v4.id)),
      npcsUnique:[...new Set(n.pedestrians.map(p=>p.v4?.id))].sort(),
      oldCharacterInstances:people.filter(p=>!p.v4).length,
      fleetTotal:n.fleet.length,
      garageNames:garage.map(v=>v.name),
      allVehiclesV4:n.fleet.every(v=>v.v4&&vehicles.includes(v.v4.id)),
      oldVehicleInstances:n.fleet.filter(v=>!v.v4).length,
      heroMeshCount:n.player.root.getChildMeshes().length,
      heroClips:n.player.v4?.groups?.size||0,
      npcMinMeshCount:Math.min(...n.pedestrians.map(p=>p.root.getChildMeshes().length)),
      npcMinClipCount:Math.min(...n.pedestrians.map(p=>p.v4?.groups?.size||0)),
      garageMeshCounts:garage.map(v=>({id:v.v4?.id,meshes:v.root.getChildMeshes().length,clips:v.v4?.groups?.size||0})),
      modelMeshesInScene:n.scene.meshes.length
    };
  });
  const modelIds=["01_mateo","02_ernesto","03_daniel","04_luis","05_rafael",
    "06_valeria","07_marisol","08_xiomara","09_rosa","10_elena"];
  const vehicleIds=["hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta"];
  assert.deepEqual(v4.specsCharacters,modelIds,"El manifiesto de 10 personas cambió");
  assert.deepEqual(v4.specsVehicles,vehicleIds,"Faltan los seis modelos vehiculares");
  assert.equal(v4.hero,"01_mateo","Mateo debe ser el protagonista real");
  assert(v4.npcs>0,"No se generaron NPC nuevos");
  assert(v4.allPeopleV4,"Se introdujeron personajes del rig antiguo");
  assert.equal(v4.oldCharacterInstances,0);
  assert.deepEqual([...v4.garageNames].sort(),[...vehicleIds].sort(),"El garaje debe ofrecer las 6 variantes");
  assert(v4.allVehiclesV4,"Se introdujeron carros antiguos");
  assert.equal(v4.oldVehicleInstances,0);
  assert(v4.heroMeshCount>0,"Mateo sin malla 3D visible en el grafo de escena");
  assert(v4.heroClips>=5,"Mateo sin animaciones cargadas");
  assert(v4.npcMinMeshCount>0,"Hay NPC V4 sin geometría");
  assert(v4.npcMinClipCount>=5,"Hay NPC V4 sin animaciones");
  for(const car of v4.garageMeshCounts){
    assert(car.meshes>0,"Vehículo V4 sin malla: "+car.id);
    assert(car.clips>=5,"Vehículo V4 sin animaciones: "+car.id);
  }
  await page.screenshot({path:path.join(__dirname,"../dist/v4-browser-ciudad.png")}).catch(e=>console.warn("Screenshot no disponible",String(e)));
  // El motor ha entrado en la ciudad; comprobar la vida local y los asientos
  // en una escena REAL con las mallas GLB, no solo con pruebas simuladas.
  await page.waitForTimeout(1800);
  const life = await page.evaluate(()=>{
    const n=Nicaragua,vehicles=n.fleet.filter(v=>v.streamV4);
    const riders=vehicles.filter(v=>v.bike||v.caponera);
    const active=n.pedestrians.filter(p=>p.lifeV4Active&&p.root.isEnabled());
    const hero=n.player.root.position;
    return {
      heroVisualYaw:n.player.visual.rotation.y,
      pool:vehicles.length,
      models:[...new Set(vehicles.map(v=>v.name))],
      activeTraffic:vehicles.filter(v=>v.traffic&&v.root.isEnabled()).length,
      activePedestrians:active.length,
      nearPedestrians:active.filter(p=>Math.hypot(p.root.position.x-hero.x,p.root.position.z-hero.z)<130).length,
      riderCount:riders.filter(v=>v.trafficRider26&&v.trafficRider26.root.parent===v.root).length,
      riderTotal:riders.length
    };
  });
  assert(Math.abs(life.heroVisualYaw-Math.PI)<.0001,"Mateo mira de espaldas al avanzar");
  assert.equal(life.pool,18,"Tráfico debe reutilizar 18 modelos");
  assert.deepEqual([...life.models].sort(),[...vehicleIds].sort(),"No circulan las seis clases V4");
  assert(life.activeTraffic>=3,"El tráfico no aparece en la zona del jugador");
  assert(life.activePedestrians>=3&&life.nearPedestrians>=3,"No aparecen peatones cercanos");
  assert.equal(life.riderCount,life.riderTotal,"Faltan conductores sobre las motos y caponeras");
  console.log("V4_LOCAL_LIFE_OK "+JSON.stringify(life));
  // Se comprueba también la caponera del garaje con un conductor visible.
  const caponera=await page.evaluate(()=>{
    const n=Nicaragua,v=n.fleet.find(v=>v.garage&&v.caponera);
    if(!v)return {found:false};
    n.inspectDrive40(v);
    return {found:true,mounted:n.driving,visible:n.player.root.isEnabled(),
      attached:n.player.root.parent===v.root,seatHeight:n.player.root.position.y};
  });
  console.log("V4_CAPONERA_DIAGNOSTIC "+JSON.stringify(caponera));
  assert(caponera.found&&caponera.mounted&&caponera.visible&&caponera.attached&&caponera.seatHeight>.5,
    "Mateo debe mostrarse sentado en la caponera al subir");
  console.log("V4_CAPONERA_OK "+JSON.stringify(caponera));
  // Validación estática extra: los paquetes humanos y animaciones viejos no viajan.
  const packaged=fs.readFileSync(path.join(site,"Managua.html"),"utf8");
  for(const deleted of ['asset-humans','asset-animation38','asset-actor-motion','pack48-humans']){
    assert(!new RegExp('<script[^>]*id="'+deleted+'"').test(packaged),
      "Recurso obsoleto publicado: "+deleted);
  }
  for(const id of [...modelIds,...vehicleIds]){
    assert(packaged.includes('id="v4-original-'+id+'"'),"Falta GLB final: "+id);
    // La versión WEB debe entregar los modelos en .glb.gz por separado.
    const pattern=new RegExp('id="v4-original-'+id+'" data-src="\\./assets/stream/([^"]+\\.glb\\.gz)" data-format="glb-gzip"');
    const match=packaged.match(pattern);
    assert(match,"GLB V4 no separado o sin enlace: "+id);
    assert(fs.existsSync(path.join(site,"assets/stream",match[1])),"GLB V4 no publicado: "+id);
  }
  console.log("V4_RUNTIME_OK "+JSON.stringify(v4));
  assert(first.startup.remoteRequests>0,"Expected remote downloads for split resources");
  assert(first.startup.zoneReadsAtEntry<=4,"Too many world zones loaded at entry");
  assert(assetRequests>0,"No on-demand assets requested");
  if(errors.length){
    const html=fs.readFileSync(path.join(site,"Managua.html"),"utf8");
    const lines=html.split("\n");
    for(const error of errors){
      const match=error.match(/Managua\.html:(\d+):(\d+)/);
      if(!match)continue;
      const row=Number(match[1])-1,col=Number(match[2])-1,line=lines[row]||"";
      console.error("RUNTIME_SOURCE_CONTEXT "+JSON.stringify({row:row+1,col:col+1,lineLength:line.length,snippet:line.slice(Math.max(0,col-450),col+450)}));
    }
  }
  assert.deepEqual(errors,[],"Unexpected JavaScript errors");
  assert.deepEqual(failures,[],"Network failures");
  const report={v4,navigationToPlayableMs:Date.now()-t,htmlBytes:fs.statSync(path.join(site,"Managua.html")).size,assetRequests,requests,bytesServed,firstPlayableMs:first.startup.firstPlayableMs,bootStages:first.boot.stages,remoteRequests:first.startup.remoteRequests,remoteBytes:first.startup.remoteBytes,zonesAtEntry:first.startup.zonesAtEntry,errors,failures,passed:true};
  fs.writeFileSync(path.join(__dirname,"../dist/fast-web-browser.json"),JSON.stringify(report,null,2));
  console.log("FAST_WEB_BROWSER_OK "+JSON.stringify({...report,bootStages:undefined}));
  await page.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
