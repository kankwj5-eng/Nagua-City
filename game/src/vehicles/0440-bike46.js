function bike46(v){
 if(!v.bike||v.bicycle||v.art46)return;const sport=['pulsar','yamaha','trail'].includes(v.name),family=sport?'sport':'work';let proto=bikePrototypes46.get(family);
 if(!proto){const paint=assetMats.red,metal=pbr('Aleación cepillada moto46','#788488',.38,.83),black=pbr('Polímero de moto46','#1c2429',.86),lens=pbr('Óptica de moto46','#d3e3df',.15,.12),seat=assetMats.seat;paint.clearCoat.isEnabled=true;paint.clearCoat.intensity=.95;paint.clearCoat.roughness=.13;lens.emissiveColor=B.Color3.FromHexString('#101414');metal.bumpTexture=normalGrain25('Metal cepillado46','wood');metal.bumpTexture.level=.06;
  proto={};const body=[];body.push(loft46('Tanque esculpido46',[[-.45,.013,.025,.80],[-.39,.13,.10,.80],[-.29,.19,.145,.81],[-.12,sport?.235:.20,sport?.18:.145,.81],[.055,.20,.13,.81],[.19,.13,.075,.79],[.245,.014,.012,.78]],paint));
  body.push(loft46('Asiento tapizado46',[[.12,.02,.012,.84],[.19,.13,.033,.84],[.48,.14,.035,.85],[.71,.11,.038,.87],[.78,.01,.009,.87]],seat));
  body.push(loft46('Colín modelado46',[[.26,.08,.035,.76],[.45,.125,.055,.77],[.64,.13,.068,.81],[.80,.025,.020,.85]],paint));
  for(let i=0;i<9;i++)body.push(shape46('CreateCylinder',{diameter:.238-i*.003,height:.012,tessellation:32},metal,V(0,.49+i*.021,.01)));
  for(const side of [-1,1]){const m=shape46('CreateSphere',{diameter:1,segments:20},metal,V(side*.115,.412,.035),V(.055,.184,.210));body.push(m);const pipe=B.MeshBuilder.CreateTube('Escape curvo46',{path:[V(side*.10,.56,-.05),V(side*.15,.34,-.14),V(side*.20,.28,.26),V(side*.22,.38,.71)],radius:side>0?.026:.018,tessellation:12},scene);pipe.material=metal;body.push(pipe);}
  const cap=shape46('CreateCylinder',{diameter:.064,height:.009,tessellation:28},metal,V(0,.982,-.13));body.push(cap);
  const seam=B.MeshBuilder.CreateTube('Costura del asiento46',{path:[V(-.13,.862,.20),V(-.14,.877,.49),V(-.11,.902,.70),V(0,.91,.76),V(.11,.902,.70),V(.14,.877,.49),V(.13,.862,.20)],radius:.0018,tessellation:5},scene);seam.material=black;body.push(seam);
  proto.body=merge46('bike46_body_',body);for(const m of proto.body)m.name=m.material===paint?'bike46_body_paint_':'bike46_body_detail_';
  const steer=[],pivot=V(0,.9,-.48);
  if(sport){steer.push(loft46('Máscara de faro46',[[-.79,.005,.02,1.005],[-.76,.094,.123,1.005],[-.68,.115,.13,1.005],[-.61,.033,.03,1.005]],black,32));const face=shape46('CreateSphere',{diameter:1,segments:24},lens,V(0,1.012,-.777),V(.155,.170,.016));steer.push(face);}
  else{for(const [d,h,mat,z] of [[.232,.105,metal,-.71],[.218,.016,lens,-.767],[.224,.010,lens,-.780]]){const m=shape46('CreateCylinder',{diameter:d,height:h,tessellation:48},mat,V(0,1.014,z));m.rotation.x=Math.PI/2;steer.push(m);}}
  for(const side of [-1,1]){const m=shape46('CreateSphere',{diameter:1,segments:16},black,V(side*.13,1.137,-.485),V(.08,.05,.095));steer.push(m);}
  const fp=[],fu=[],fi=[];for(let i=0;i<=32;i++){const a=(.15+i/32*.70)*Math.PI,w=.060-.014*Math.abs(i/16-1);for(const x of [-w,w]){fp.push(x,.30+Math.sin(a)*.348,-.6815+Math.cos(a)*.348);fu.push(x<0?0:1,i/32);}}for(let i=0;i<32;i++){const k=i*2;fi.push(k,k+1,k+2,k+1,k+3,k+2);}const fn=[];B.VertexData.ComputeNormals(fp,fi,fn);steer.push(meshData('Guardabarro contorneado46',fp,fn,fu,fi,null,paint,null));
  proto.steering=merge46('bike46_optics_',steer);for(const m of proto.steering)if(m.material===paint)m.name='bike46_optics_paint_';for(const m of proto.steering){const p=m.getVerticesData(B.VertexBuffer.PositionKind).slice();for(let k=0;k<p.length;k+=3){p[k]-=pivot.x;p[k+1]-=pivot.y;p[k+2]-=pivot.z;}m.setVerticesData(B.VertexBuffer.PositionKind,p);}
  const wheels=[];const tire=shape46('CreateTorus',{diameter:.51,thickness:.09,tessellation:64},assetMats.rubber,V());tire.rotation.z=Math.PI/2;wheels.push(tire);const rim=shape46('CreateTorus',{diameter:.47,thickness:.021,tessellation:64},metal,V());rim.rotation.z=Math.PI/2;wheels.push(rim);
  for(const side of [-1,1])for(let i=0;i<(sport?5:32);i++){const a=i/(sport?5:32)*Math.PI*2,points=sport?[V(side*.025,Math.sin(a)*.035,Math.cos(a)*.035),V(side*.026,Math.sin(a+.17)*.14,Math.cos(a+.17)*.14),V(side*.030,Math.sin(a+.28)*.23,Math.cos(a+.28)*.23)]:[V(side*.036,Math.sin(a)*.05,Math.cos(a)*.05),V(side*.022,Math.sin(a+.19)*.23,Math.cos(a+.19)*.23)];const m=B.MeshBuilder.CreateTube('Rayo de rin46',{path:points,radius:sport?.013:.0025,tessellation:sport?8:5},scene);m.material=metal;wheels.push(m);}
  const rotor=shape46('CreateCylinder',{diameter:.255,height:.007,tessellation:48},metal,V(.048,0,0));rotor.rotation.z=Math.PI/2;wheels.push(rotor);for(let i=0;i<16;i++){const a=i/16*Math.PI*2,m=shape46('CreateCylinder',{diameter:.010,height:.008,tessellation:6},black,V(.054,Math.sin(a)*.104,Math.cos(a)*.104));m.rotation.z=Math.PI/2;wheels.push(m);}
  proto.wheel=merge46('bike46_wheel_',wheels);for(const list of Object.values(proto))for(const m of list)m.setEnabled(false);bikePrototypes46.set(family,proto);
 }
 for(const m of v.parts.body.getChildMeshes())if(/_(?:paint|red|seat)_/.test(m.name))m.setEnabled(false);
 for(const m of v.parts.steering.getChildMeshes()){const box=m.getBoundingInfo().boundingBox,head=box.center.z<-.68&&box.center.y>.80&&box.center.y<1.25&&box.extendSize.y<.18&&Math.abs(box.center.x)<.04;if(head||/_(?:paint|trim37|lens37|glass)_/.test(m.name)&&box.extendSize.length()>.055)m.setEnabled(false);}
 for(const [part,list] of [['body',proto.body],['steering',proto.steering],['wheel_front',proto.wheel],['wheel_rear',proto.wheel]]){
  const root=v.parts[part];if(!root)continue;
  if(part.startsWith('wheel'))for(const m of root.getChildMeshes())if(!/46/.test(m.name))m.setEnabled(false);
  for(const m of list){const copy=m.name.includes('_paint_')?m.clone(m.name+v.id,null):m.createInstance(m.name+v.id);copy.parent=root;copy.setEnabled(true);copy.receiveShadows=true;copy.isPickable=false;if(part.startsWith('wheel'))copy.scaling.setAll(v.radius/.30);}
 }
 v.art46=true;art46.bikes++;
}
