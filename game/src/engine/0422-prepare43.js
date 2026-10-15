async function prepare43(){
 const el=$('asset-actor-motion'),raw=JSON.parse(new TextDecoder().decode(await inflate(bytes(el.textContent))));el.remove();actors43.models=raw.length;actors43.actions=Object.keys(raw[0].clips).length;actors43.clips=Object.keys(raw[0].clips);
 // Keyframes are immutable. Share them across people with the same skeleton;
 // targets and interpolation scratch storage remain local to each actor.
 const sharedKeys43=new Map();const baked=raw.map(pack=>{const map=new Map();for(const [name,c] of Object.entries(pack.clips))for(const [bone,values] of Object.entries(c.tracks))for(const kind of ['rotation','translation'])map.set(name+'|'+bone+'|'+kind,packKeys45(values[kind],kind,sharedKeys43));return map;});
 for(const p of [player,...pedestrians,...city.actors,...polish26.riders.map(r=>r.p)]){
  const model=(p.uniform28?2:0)+p.bodyType,pack=raw[model],targets=new Map(p.clips.Idle.tracks.map(t=>[t.target.name.replace(/^h\d+_/,''),t.target]));
  for(const [name,c] of Object.entries(pack.clips)){const tracks=[];for(const bone of Object.keys(c.tracks)){const target=targets.get(bone);if(!target)continue;for(const [kind,property] of [['rotation','rotationQuaternion'],['translation','position']])tracks.push({target,property,keys:baked[model].get(name+'|'+bone+'|'+kind)});}p.clips[name]={from:0,to:c.frames,duration:c.duration,tracks};}
  p.sole40=pack.soleCurves;p.strides43=pack.stride;p.foot43=pack.footCurves;p.footMin43={};for(const name of ['Walk','Run'])p.footMin43[name]=[0,1].map(side=>Math.min(...pack.footCurves[name].map(frame=>frame[side][1])));resetGraph43(p);actors43.people++;
 }
 humanWalk=human43;updateEquipmentPose=hands43;
 const reset=resetPose;resetPose=function(p){reset(p);resetGraph43(p);};
 const ride=humanRide;humanRide=function(p,v){ride(p,v);if(p.graph43){p.graph43.lastPosition=null;p.graph43.wasAir=false;p.graph43.landing=0;}};
 for(const material of scene.materials)if(material instanceof B.PBRMaterial&&/Cristal oscuro opaco31/.test(material.name)){material.alpha=.32;material.transparencyMode=B.PBRMaterial.PBRMATERIAL_ALPHABLEND;material.backFaceCulling=true;}
 scene.onBeforeRenderObservable.add(()=>{
  if(driving&&!current.bike){const p=player,v=current;v.root.setEnabled(true);p.root.setEnabled(true);p.helmet.setEnabled(false);p.equipment?.setEnabled(false);for(const m of p.nearMeshes)m.setEnabled(true);for(const m of p.lodMeshes)m.setEnabled(false);sampleLayer43(p,'Drive',(gameplayTime/1.66)%1,1);p.visual.position.y=0;p.root.position.set(0,0,0);p.root.rotation.set(0,0,0);v.root.computeWorldMatrix(true);p.root.computeWorldMatrix(true);const nodes=cacheRig41(p).nodes,pelvis=nodes.get('pelvis'),head=nodes.get('head');if(pelvis&&head){pelvis.computeWorldMatrix(true);head.computeWorldMatrix(true);const inverse=v.root.getWorldMatrix().clone().invert(),local=B.Vector3.TransformCoordinates(pelvis.getAbsolutePosition(),inverse),height=head.getAbsolutePosition().y-pelvis.getAbsolutePosition().y+.20,seat=v.meta.seat||[.4,.8,-.1],maxHip=(v.meta.height||1.8)-height-.06;p.root.position.set(seat[0]-local.x,Math.min(seat[1],maxHip)-local.y,seat[2]-local.z);p.root.computeWorldMatrix(true);const hands=v.meta.hands||[.35,1.15,-.42];for(const side of ['l','r']){const target=B.Vector3.TransformCoordinates(V(seat[0]+(side==='l'?.14:-.14),hands[1],hands[2]),v.root.getWorldMatrix());solveHand30(p,side,target);}}
  }
  else if(!driving&&story42.dialogue){story42.actorTime43=(story42.actorTime43||0)+Math.min(.1,engine.getDeltaTime()/1000);const words=$('storyLines42')?.textContent||'',name=/conector|Interruptor abajo|bombilla|cobre/.test(words)?'Repair':'Talk',duration=player.clips[name].duration||3,phase=(story42.actorTime43/duration)%1;sampleLayer43(player,name,phase,1);player.visual.position.y=.003-ground43(player,name,phase);player.equipment?.setEnabled(false);for(const t of cacheRig41(player).tracks)t.value.copyFrom(t.target[t.property]);}
  else if(!driving&&player.equipment)player.equipment.setEnabled(true);
 });
}

// Technical-only changes: identical assets, radii, resolution, lighting and poses.
