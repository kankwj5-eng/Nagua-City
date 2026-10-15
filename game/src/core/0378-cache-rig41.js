function cacheRig41(p){
 if(p.rig41)return p.rig41;
 const nodes=new Map(p.root.getDescendants().map(n=>[n.name.replace(/^h\d+_/,''),n]));
 const tracks=p.clips.Idle.tracks.map(t=>({target:t.target,property:t.property,value:t.target[t.property].clone()}));
 return p.rig41={nodes,tracks,groundY:0,lastHeading:p.root.rotation.y,turn:0,air:0,landing:0,wasAir:false};
}
