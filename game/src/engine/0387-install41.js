function install41(){
 humanWalk=locomotion41;finishHumans41();neighborhood41();
 const makeEquipment=equipmentModel;equipmentModel=function(name,parent){return weaponFinish41(name,makeEquipment(name,parent));};
 const equipmentPose=updateEquipmentPose;updateEquipmentPose=function(p,dt){equipmentPose(p,dt);if(!(equipped in ammo)||!p.equipment)return;
 if(reloadWeapon){const duration=equipped==='pistol'?1.25:1.65,progress=clamp(1-(reloadUntil-gameplayTime)/duration,0,1),reach=Math.sin(progress*Math.PI);p.equipment.rotationQuaternion.multiplyInPlace(B.Quaternion.RotationAxis(V(1,0,0),reach*.19));p.equipment.computeWorldMatrix(true);const target=B.Vector3.TransformCoordinates(V(-.02,-.09-reach*.035,equipped==='rifle'?-.10:.045),p.equipment.getWorldMatrix());solveHand30(p,'l',target);}
 else if(equipped==='pistol'&&expansion29.combat.aim){p.equipment.computeWorldMatrix(true);const support=B.Vector3.TransformCoordinates(V(-.035,-.05,.035),p.equipment.getWorldMatrix());solveHand30(p,'l',support);}
 };
 const previousReset=resetPose;resetPose=function(p){previousReset(p);if(p.rig41){p.rig41.walk=0;p.rig41.run=0;p.rig41.air=0;p.rig41.landing=0;p.rig41.wasAir=false;p.rig41.lastHeading=p.root.rotation.y;p.rig41.turn=0;p.rig41.groundY=p.visual.position.y;for(const t of p.rig41.tracks)t.value.copyFrom(t.target[t.property]);}p.visual.rotation.x=p.visual.rotation.z=0;};
 const before=settings;settings=function(){before();for(const r of stage41.detailRoots)r.metadata.r31=quality==='low'?38:quality==='high'?100:70;};
 // Keep simulation HUD useful on a phone without permanently occupying the view.
 const panel=$('optionsPanel')||$('settings').querySelector('.sheet');const section=document.createElement('div');section.className='setting';section.innerHTML='<b>Acabado V41</b><label style="display:block;margin-top:10px"><input id="feet41" type="checkbox" checked style="width:auto"> Adaptar pasos a desniveles</label><label style="display:block;margin-top:10px"><input id="detail41" type="checkbox" checked style="width:auto"> Cerámica y vegetación de portales</label><small>Los detalles comparten geometrías y se ocultan a distancia.</small>';panel.append(section);
 $('feet41').onchange=()=>stage41.settings.feet=$('feet41').checked;
 $('detail41').onchange=()=>{stage41.settings.detail=$('detail41').checked;for(const r of stage41.detailRoots)r.setEnabled(stage41.settings.detail);};
 // Streamer may enable roots again: hide disabled detail roots before each render.
 scene.onBeforeRenderObservable.add(()=>{if(!stage41.settings.detail)for(const r of stage41.detailRoots)if(r.isEnabled())r.setEnabled(false);});
 const dash=$('dashboard'),readout=document.createElement('div');readout.id='dynamics41';readout.style.cssText='font-size:10px;color:#d1dcce;min-width:55px';dash.append(readout);
 const ui=updateUI;updateUI=function(){ui();readout.hidden=!driving;if(driving)readout.textContent=state.shiftTimer41>.22?'CAMBIO':Math.abs((state.speed||0)*(state.yawRate||0)/9.81).toFixed(2)+' G';};
}

// Pure, deterministic mission rules. Story draft and playable guided prototype.
