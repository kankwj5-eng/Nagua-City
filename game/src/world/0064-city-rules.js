var CityRules={
 create(){return {health:100,cash:1000,wanted:0,lastCrime:-1000,hiddenTime:0,territoryTime:0,territory:null,block:false,outfit:0,reserve:{pistol:36,rifle:90},purchases:0,incidents:0,job:null,magazines:{pistol:12,rifle:30}};},
 report(s,severity,t){Logic25.report(s,severity,t);},
 advance(s,dt,seen,territory,t){if(s.wanted){s.hiddenTime=seen?0:s.hiddenTime+dt;if(t-s.lastCrime>12&&s.hiddenTime>=25){s.wanted--;s.hiddenTime=0;}}if(territory!==s.territory){s.territory=territory;s.territoryTime=0;}else s.territoryTime=territory?s.territoryTime+dt:0;return s;},
 buy(s,item){if(item.type==='job'&&s.job||item.type==='delivery'&&!s.job)return false;if(!Number.isFinite(item.price)||item.price<0||s.cash<item.price)return false;if(item.type==='food'&&s.health===100)return false;s.cash-=item.price;s.purchases++;if(item.type==='job')s.job={id:'cacao',x:-26,z:90};if(item.type==='delivery'){s.cash+=140;s.job=null;}if(item.type==='food')s.health=Math.min(100,s.health+item.heal);if(item.type==='ammo')s.reserve[item.weapon]+=item.amount;if(item.type==='clothes')s.outfit=item.outfit;return true;},
 damage(s,n){s.health=Math.max(0,s.health-Math.max(0,n));return s.health===0;},
 recover(s){s.health=100;s.cash=Math.max(0,s.cash-150);s.wanted=0;s.hiddenTime=0;s.territory=null;s.territoryTime=0;},
 load(raw){const s=this.create();if(!raw||raw.schema!==1)return s;const v=raw.state;if(!v||!Number.isFinite(v.cash)||!Number.isFinite(v.health))return s;s.cash=Math.max(0,Math.min(100000,v.cash));s.health=Math.max(1,Math.min(100,v.health));s.outfit=Math.max(0,Math.min(8,Math.floor(v.outfit||0)));for(const n of ['pistol','rifle'])if(Number.isFinite(v.reserve?.[n]))s.reserve[n]=Math.max(0,Math.min(1000,Math.floor(v.reserve[n])));for(const n of ['pistol','rifle'])if(Number.isFinite(v.magazines?.[n]))s.magazines[n]=Math.max(0,Math.min(n==='pistol'?12:30,Math.floor(v.magazines[n])));if(v.job?.id==='cacao')s.job={id:'cacao',x:-26,z:90};return s;}
};


// Selector NO destructivo de parcelas: la sustitución de casas se autoriza
// por índice exacto, no por distancia, y nunca elimina mallas automáticamente.
// Quien aplique un plan debe retirar malla visual, streaming, datos y colisión
// de cada vivienda identificada en una misma operación comprobable.
function planUrbanParcel51(site,buildings,colliders,roads=[],protectedSites=[]){
 const fail=(reason,extra={})=>({approved:false,reason,replacements:[],...extra});
 if(!site||![site.x,site.z,site.w,site.d].every(Number.isFinite)||site.w<=0||site.d<=0)return fail('invalid-footprint');
 const buffer=Number.isFinite(site.buffer)?Math.max(0,Math.min(4,site.buffer)):1;
 const lot=[site.x-site.w/2-buffer,site.z-site.d/2-buffer,site.x+site.w/2+buffer,site.z+site.d/2+buffer];
 const intersects=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
 const inside=(a,b)=>a[0]>=b[0]-.01&&a[1]>=b[1]-.01&&a[2]<=b[2]+.01&&a[3]<=b[3]+.01;
 for(const road of roads){
  if(road.axis!=='x'&&road.axis!=='z')return fail('invalid-road');
  const half=(road.width||9)/2;
  const roadRect=road.axis==='x'?[road.min??-10000,road.center-half,road.max??10000,road.center+half]:
   [road.center-half,road.min??-10000,road.center+half,road.max??10000];
  if(intersects(lot,roadRect))return fail('road-conflict');
 }
 for(const landmark of protectedSites){
  const radius=landmark.radius||8;
  if(intersects(lot,[landmark.x-radius,landmark.z-radius,landmark.x+radius,landmark.z+radius]))return fail('protected-landmark');
 }
 const replaceIds=new Set(site.replaceIndices||[]);
 const buildingsHit=[],replacements=[];
 for(let i=0;i<buildings.length;i++){
  const b=buildings[i];
  if(![b.x,b.y,b.w,b.d].every(Number.isFinite)||b.w<=0||b.d<=0)continue;
  const footprint=[b.x-b.w/2,b.y-b.d/2,b.x+b.w/2,b.y+b.d/2];
  if(!intersects(lot,footprint))continue;
  buildingsHit.push(i);
  const isHome=b.type==='casa'||/^vivienda/i.test(String(b.type||''));
  if(!isHome||!replaceIds.has(i))return fail(isHome?'unapproved-home':'other-building',{blockingIndex:i});
  // No house may be half-demolished by a new footprint. Require complete cover.
  if(!inside(footprint,lot))return fail('partial-home',{blockingIndex:i});
  replacements.push({index:i,x:b.x,z:b.y,w:b.w,d:b.d,type:b.type});
 }
 if([...replaceIds].some(i=>!buildingsHit.includes(i)))return fail('unmatched-replacement');
 let blockingColliders=0;
 for(const rect of colliders)if(rect?.length===4&&intersects(lot,rect)){
  const owned=replacements.some(r=>inside(rect,[r.x-r.w/2-.35,r.z-r.d/2-.35,r.x+r.w/2+.35,r.z+r.d/2+.35]));
  if(!owned)blockingColliders++;
 }
 if(blockingColliders)return fail('unowned-collision',{blockingColliders});
 return {approved:true,reason:replacements.length?'explicit-home-replacement':'free-parcel',replacements,footprint:lot};
}
