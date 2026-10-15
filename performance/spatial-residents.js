// Block 06: retain lightweight placements; build nearby garden instances on demand.
function spatialResidents06(items,build,dispose,show,clock=()=>performance.now()){
 const live=new Map();let queue=[],center={x:0,z:0},radius=0,on=true;
 const stats={placements:items.length,built:0,disposed:0,maxResident:0};
 const distance=o=>(o.x-center.x)**2+(o.z-center.z)**2;
 function create(o){if(live.has(o.id))return;const root=build(o);live.set(o.id,{o,root});stats.built++;stats.maxResident=Math.max(stats.maxResident,live.size);}
 function plan(p,r,enabled=true,initial=false){
  center={x:p.x,z:p.z};radius=r;on=enabled;queue=[];
  for(const [id,e] of live){if(distance(e.o)>(r+100)**2){dispose(e.root);live.delete(id);stats.disposed++;}else show(e.root,on&&distance(e.o)<r*r);}
  if(!on)return;
  const near=items.map(o=>({o,d:distance(o)})).filter(e=>e.d<(r+60)**2).sort((a,b)=>a.d-b.d);
  for(const {o,d} of near){if(live.has(o.id))continue;if(initial||d<r*r)create(o);else queue.push(o);}
  for(const e of live.values())show(e.root,distance(e.o)<r*r);
 }
 function warm(){
  const began=clock();let built=0;
  while(queue.length&&built<2&&clock()-began<8){const o=queue.shift();if(!on||distance(o)>=(radius+60)**2||live.has(o.id))continue;create(o);show(live.get(o.id).root,distance(o)<radius*radius);built++;}
 }
 return {plan,warm,stats,get residents(){return live.size;},get pending(){return queue.length;}};
}
