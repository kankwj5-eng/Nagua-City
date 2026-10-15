function applyPlayerWheels13(v,s,dt){
 v.spin-=s.speed*dt/v.radius;const angles=wheelAngles13(v,s.steer);
 for(const [key,part] of Object.entries(v.parts))if(key.startsWith('wheel')){part.rotation.x=v.spin;if(!v.bike&&!v.name.startsWith('caponera')&&key.includes('front'))part.rotation.y=key.endsWith('_L')?angles.left:angles.right;}
 if(v.bike||v.name.startsWith('caponera'))v.parts.steering.rotation.y=-s.steer;
}
