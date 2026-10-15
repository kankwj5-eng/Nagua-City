class FrameBudget35 {
 constructor(){this.ratio=1;this.samples=[];this.lastDecision=0;this.good=0;this.decisions=0;this.p50=0;this.p90=0;}
 reset(now=0){this.samples.length=0;this.lastDecision=now;this.good=0;}
 observe(ms,now,target=30){
  if(!Number.isFinite(ms)||ms<2||ms>350)return null;
  this.samples.push(ms);if(this.samples.length>120)this.samples.shift();
  if(this.samples.length<24||now-this.lastDecision<4000)return null;
  const sorted=this.samples.slice().sort((a,b)=>a-b);this.p50=sorted[Math.floor(sorted.length*.5)];this.p90=sorted[Math.floor(sorted.length*.9)];this.samples.length=0;this.lastDecision=now;
  const budget=1000/target;let next=this.ratio;
  // Hysteresis: react to sustained load; restore quality only after two good windows.
  if(this.p50>budget*1.14){next=Math.max(.85,this.ratio-.05);this.good=0;}
  else if(this.p90<budget*.90){this.good++;if(this.good>=2){next=Math.min(1,this.ratio+.035);this.good=0;}}
  else this.good=0;
  if(Math.abs(next-this.ratio)<.001)return null;this.ratio=next;this.decisions++;return next;
 }
}
