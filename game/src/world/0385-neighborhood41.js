function neighborhood41(){
 const ceramic=pbr('Cerámica de portales41','#ffffff',.88);ceramic.albedoTexture=facadeAtlas41();ceramic.albedoTexture.uScale=3;ceramic.albedoTexture.vScale=1;
 const pot=pbr('Barro cocido de patio41','#a86d49',.93),green=pbr('Vegetación de portal41','#577e39',.97);green.backFaceCulling=false;
 const tileSource=B.MeshBuilder.CreateBox('Fuente zócalo41',{width:1,height:1,depth:1},scene);tileSource.material=ceramic;tileSource.setEnabled(false);
 const potSource=B.MeshBuilder.CreateCylinder('Fuente macetera41',{height:.35,diameterTop:.38,diameterBottom:.26,tessellation:10},scene);potSource.material=pot;potSource.setEnabled(false);
 const leafSource=B.MeshBuilder.CreateSphere('Fuente follaje41',{diameter:.48,segments:6},scene);leafSource.material=green;leafSource.setEnabled(false);
 const roads=[-185,-111,-37,37,111,185],buildings=data.buildings.filter(b=>b.w>3&&b.d>3&&b.w<36&&b.d<36&&(b.h||3)<14).sort((a,b)=>Math.hypot(a.x-spawn.x,a.y-spawn.z)-Math.hypot(b.x-spawn.x,b.y-spawn.z));
 let count=0;for(const house of buildings){
  const x=house.x,z=house.y,nearZ=roads.reduce((a,b)=>Math.abs(a-z)<Math.abs(b-z)?a:b),sideZ=nearZ<z?-1:1,front=sideZ*(house.d/2+.8),sideX=Math.min(house.w*.32,5.5);
  const onRoad=(x,z)=>roads.some(r=>Math.abs(x-r)<7||Math.abs(z-r)<7);if(!Number.isFinite(x)||!Number.isFinite(z)||count>=72)continue;
  const root=new B.TransformNode('Portal con cerámica y plantas41 '+count,scene);root.position.set(x,groundAt(x,z),z);
  let n=0;for(const side of [-1,1]){
   // Reject blocked sites; never plant obstacles in a road or a doorway.
   const px=x+side*sideX,pz=z+front;if(onRoad(px,pz)||blocked(px,pz,.32,null,true))continue;
   const potMesh=potSource.createInstance('Macetera compartida41 '+count+' '+side);potMesh.parent=root;potMesh.position.set(side*sideX,.175,front);potMesh.setEnabled(true);potMesh.isPickable=false;potMesh.receiveShadows=true;
   const plant=leafSource.createInstance('Mata compartida41 '+count+' '+side);plant.parent=root;plant.position.set(side*sideX,.43,front);plant.setEnabled(true);plant.scaling.set(.8,1.3,.8);plant.isPickable=false;plant.receiveShadows=true;n++;
  }
  // Low tiled entrance strip, only on a collision-free exterior surface.
  if(!onRoad(x,z+front)&&!blocked(x,z+front,.20,null,true)){const tile=tileSource.createInstance('Baldosas compartidas41 '+count);tile.parent=root;tile.position.set(0,.018,front);tile.setEnabled(true);tile.scaling.set(2.1,.025,.85);tile.isPickable=false;tile.receiveShadows=true;n++;}
  if(!n){root.dispose();continue;}root.metadata={x31:x,z31:z,r31:85};district31.roots.push(root);stage41.detailRoots.push(root);count++;
 }
}
