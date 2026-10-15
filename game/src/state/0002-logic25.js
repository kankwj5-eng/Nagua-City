var Logic25=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 class SpatialGrid {constructor(size=4){this.size=size;this.cells=new Map();}build(items){this.cells.clear();for(const p of items){const k=Math.floor(p.x/this.size)+','+Math.floor(p.z/this.size);if(!this.cells.has(k))this.cells.set(k,[]);this.cells.get(k).push(p);}return this;}near(x,z,r=2){const out=[];for(let a=Math.floor((x-r)/this.size);a<=Math.floor((x+r)/this.size);a++)for(let b=Math.floor((z-r)/this.size);b<=Math.floor((z+r)/this.size);b++)for(const p of this.cells.get(a+','+b)||[])if(Math.hypot(p.x-x,p.z-z)<=r)out.push(p);return out;}}
 class Traffic {constructor(){this.locks=new Map();this.claims=0;this.denied=0;}key(v,c){return v.axis==='x'?c+','+v.center:v.center+','+c;}plan(v,all,people,phase){let desired=v.cruise||6,reason='cruise',moveLimit=Infinity;const along=p=>(v.axis==='x'?p.x:p.z),side=p=>Math.abs((v.axis==='x'?p.z:p.x)-v.lane),coord=along(v),half=v.length/2;
 for(const [key,lock] of this.locks){const owner=all.find(o=>o.id===lock.id);if(!owner||!owner.active||(alongAxis(owner,lock.axis)-lock.cross)*lock.dir>owner.length/2+8.4||Math.abs(alongAxis(owner,lock.axis)-lock.cross)>35)this.locks.delete(key);}
 for(const o of all){if(o.id===v.id||side(o)>v.width/2+transverse(o,v.axis)+.12)continue;const d=(along(o)-coord)*v.dir;if(d<=0)continue;const otherHalf=extent(o,v.axis),gap=d-half-otherHalf;moveLimit=Math.min(moveLimit,Math.max(0,gap-1.5));if(gap<32){const leadSpeed=o.active&&o.axis===v.axis&&o.dir===v.dir?o.speed:0,wantedGap=1.6+v.speed*1.15,safe=Math.sqrt(Math.max(0,leadSpeed*leadSpeed+2*3*(gap-1.5)));desired=Math.min(desired,safe,Math.max(0,leadSpeed+(gap-wantedGap)*.8));if(desired<.3)reason='queue';}}
 for(const p of people){const d=(along(p)-coord)*v.dir;if(d>-half&&d<half+12&&side(p)<v.width/2+.7){const gap=Math.max(0,d-half-1.3);desired=Math.min(desired,Math.sqrt(2*3*gap));moveLimit=Math.min(moveLimit,gap);reason='pedestrian';}}
 for(const c of [-185,-111,-37,37,111,185]){const d=(c-coord)*v.dir;if(d<-half-8.4||d>half+24)continue;const key=this.key(v,c),lock=this.locks.get(key),committed=d<half+7.9&&d>-half-8.4;let allowed=committed&&lock?.id===v.id;
 if(!allowed&&phase(v.axis,c,v.center)==='green'&&(!lock||lock.id===v.id)){
 const exitClear=!all.some(o=>{if(o.id===v.id||side(o)>v.width/2+transverse(o,v.axis)+.15)return false;const forward=(along(o)-c)*v.dir;return forward+extent(o,v.axis)>7.8&&forward-extent(o,v.axis)<8.2+v.length+2&&o.speed<.4;});
 const crossClear=!all.some(o=>{if(o.id===v.id||o.axis===v.axis&&o.dir===v.dir)return false;const x=v.axis==='x'?c:v.center,z=v.axis==='x'?v.center:c;return Math.abs(o.x-x)<7.5+extent(o,'x')&&Math.abs(o.z-z)<7.5+extent(o,'z');});
 if(exitClear&&crossClear){allowed=true;if(d<half+16&&!lock){this.locks.set(key,{id:v.id,axis:v.axis,cross:c,dir:v.dir});this.claims++;}}else reason=exitClear?'crossing':'blocked-exit';
 }
 if(!allowed){if(lock?.id===v.id&&!committed)this.locks.delete(key);const gap=Math.max(0,d-half-8);desired=Math.min(desired,Math.sqrt(2*3*gap));moveLimit=Math.min(moveLimit,gap);if(reason==='cruise')reason=phase(v.axis,c,v.center)==='green'?'crossing':'signal';this.denied++;}
 }
 return {speed:Math.max(0,desired),reason,moveLimit};
 }}
 function extent(p,axis){if(Number.isFinite(p.heading)){const sn=Math.abs(Math.sin(p.heading)),cs=Math.abs(Math.cos(p.heading));return axis==='x'?(sn*p.length+cs*p.width)/2:(cs*p.length+sn*p.width)/2;}return (p.axis&&p.axis!==axis?p.width:p.length)/2;}
 function transverse(p,axis){return extent(p,axis==='x'?'z':'x');}
 function alongAxis(p,axis){return axis==='x'?p.x:p.z;}
 function gangStage(inside,t,provoked=false){return provoked?'attack':!inside?'return':t<2?'warning':t<5?'threat':'attack';}
 function policeStage(wanted,seen,memory,elapsed){if(!wanted)return 'patrol';if(!seen)return memory?'search':'return';if(wanted===1)return elapsed<3?'warning':'detain';return elapsed<(wanted===3?.6:1.8)?'warning':'combat';}
 function report(s,severity,t){const before=s.wanted,repeat=before&&t-s.lastCrime<12&&t-(s.lastEscalation25??s.lastCrime)>=1.5;s.wanted=clamp(Math.max(Math.ceil(severity),before+(repeat?1:0)),0,3);if(!before||s.wanted>before)s.lastEscalation25=t;s.lastCrime=t;s.hiddenTime=0;s.incidents++;}

 return {SpatialGrid,Traffic,extent,transverse,gangStage,policeStage,report,clamp};
})();
