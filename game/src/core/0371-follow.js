function follow(dt){
 const k=1-Math.exp(-Math.min(dt,.1)*6),d=Math.atan2(Math.sin(yaw-cameraRig.yaw),Math.cos(yaw-cameraRig.yaw));cameraRig.yaw+=d*k;cameraRig.pitch+=(pitch-cameraRig.pitch)*k;cameraRig.zoom+=(cameraRig.zoomTarget-cameraRig.zoom)*(1-Math.exp(-Math.min(dt,.1)*7));
 if(firstPersonRide())return;if(camMode===3)camMode=0;
 const p=homeMode?current.root.position:driving?current.root.position:player.root.position;let target=p.add(V(0,homeMode?.85:driving&&current.bus?2.1:driving?1.1:1.42,0)),desired;
 if(homeMode&&!homeGarage){const a=Math.sin(time*.025)*.20;target=V(-18,1.8,94);desired=V(-51+a*8,5.2,117+a*6);}
 else if(homeMode){const orbit=-.7+Math.sin(time*.065)*.15,length=(current.bus?11:current.bike?3.4:5.1)*cameraRig.zoom;desired=target.add(V(-Math.cos(orbit)*length,length*.27+.24,Math.sin(orbit)*length));}
 else {const dist=(driving?(current.bus?Math.max(12,current.length*1.3):current.bike?5.4+Math.min(.9,Math.abs(state.speed)*.045):8.2+Math.min(.65,Math.abs(state.speed)*.025)):5.2)*[1,.77,1.5][camMode]*cameraRig.zoom;
 desired=target.add(V(-Math.sin(cameraRig.yaw)*dist,1+cameraRig.pitch*dist,Math.cos(cameraRig.yaw)*dist));if(camMode===2)desired.y+=3.5;const delta=desired.subtract(target),wanted=delta.length();let safe=wanted;
 const visited=new Set();for(const list of cameraCells39(target,desired))for(const b of list){if(visited.has(b))continue;visited.add(b);let enter=0,leave=1;for(const [o,d,lo,hi] of [[target.x,delta.x,b[0]-.2,b[2]+.2],[target.z,delta.z,b[1]-.2,b[3]+.2]]){if(Math.abs(d)<1e-6){if(o<lo||o>hi){enter=2;break;}}else{let a=(lo-o)/d,c=(hi-o)/d;if(a>c)[a,c]=[c,a];enter=Math.max(enter,a);leave=Math.min(leave,c);}}if(enter<=leave&&enter>0&&enter<1&&target.y+delta.y*enter<5.5)safe=Math.min(safe,Math.max(1.15,wanted*enter-.3));}
 cameraDistance+=(safe-cameraDistance)*(1-Math.exp(-Math.min(dt,.1)*(safe<cameraDistance?22:3)));desired=target.add(delta.normalize().scale(cameraDistance));desired.y=Math.max(desired.y,groundAt(desired.x,desired.z)+.60);}
 if(!camera._track){camera._track=target.clone();camera._offset=desired.subtract(target);}
 const track=1-Math.exp(-Math.min(dt,.1)*(homeMode?2.8:driving?6.5:9));camera._track=B.Vector3.Lerp(camera._track,target,track);
 camera._offset=B.Vector3.Lerp(camera._offset,desired.subtract(target),1-Math.exp(-Math.min(dt,.1)*(homeMode?2.6:5.8)));camera.position.copyFrom(camera._track.add(camera._offset));camera.setTarget(camera._track);
 const texel=110/1024;sun.position.set(Math.round(p.x/texel)*texel-65,95,Math.round(p.z/texel)*texel+40);
}

