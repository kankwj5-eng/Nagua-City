function installLandmarks21(){const a=assetMats,towerStone=pbr('Hormigón de torre','#c4c1b0',.90),shadowGlass=pbr('Vidrio en sombra','#273b41',.24,.30),black=pbr('Acero de silueta','#14191b',.80,.12);const x=57,z=-285;
 const tower=makeDetailGroup('Torre Benjamín Zeledón · aproximación',({box,cylinder,tube})=>{box('Basamento',x,1.4,z,25,2.8,25,towerStone);box('Núcleo de torre',x,32,z,21,58,21,shadowGlass);for(let floor=0;floor<18;floor++){const y=3.2+floor*3.2;for(const side of [-1,1]){box('Banda de losa',x,y,z+side*10.9,23,.20,.62,towerStone);box('Banda de losa lateral',x+side*10.9,y,z,.62,.20,23,towerStone);}}for(let n=0;n<10;n++){const d=-10.2+n*2.27;for(const side of [-1,1]){box('Aleta vertical de fachada',x+d,32,z+side*11.15,.35,58,.66,towerStone);box('Aleta vertical lateral',x+side*11.15,32,z+d,.66,58,.35,towerStone);}}box('Remate de azotea',x,61.0,z,24,.5,24,towerStone);box('Caseta técnica',x,62.5,z,7,2.5,7,a.houseBase);tube('Antena de azotea',[V(x,64,z),V(x,70,z)],.075,a.steel);for(const side of [-1,1])for(let n=0;n<4;n++)cylinder('Pilar de acceso',x-8+n*5.3,1.55,z+side*13,.25,3.1,towerStone);box('Plataforma peatonal',x,.02,z+14,30,.05,7,a.monument);});cityLandmarks.push(tower);addWorldBox(x,z,24,24);data.places.push(['Torre Benjamín Zeledón',x,-270]);stage21Landmarks.tower=true;
 // Original manually drafted contour; silhouette is an approximation, not a scan.
 const outline=[[-2.5,0],[-2.6,.5],[-1.8,1.2],[-1.7,7.4],[-2.3,8.1],[-2.8,10.2],[-2.7,12.6],[-1.9,14.3],[-.9,14.8],[-1.1,15.7],[-1.5,16.3],[-3.1,16.2],[-3.2,16.65],[-1.15,17.05],[-.85,17.95],[.9,18],[1.35,17.1],[3.1,16.9],[3.2,16.45],[1.5,16.4],[1.3,15.65],[.9,15.0],[1.3,14.5],[2.4,13.7],[2.8,11],[3.0,9.25],[2.45,9.0],[2.05,11.7],[1.75,11.8],[1.9,7.4],[1.3,7],[1.65,1.1],[2.3,.45],[2.1,0],[.5,0],[.25,5.4],[-.10,6.8],[-.5,5.0],[-1.1,0]];
 function triangulate(poly){const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);let area=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];area+=a[0]*b[1]-b[0]*a[1];}const ids=poly.map((_,i)=>i);if(area<0)ids.reverse();const out=[];let guard=0;while(ids.length>3&&guard++<1000){let cut=false;for(let k=0;k<ids.length;k++){const ia=ids[(k+ids.length-1)%ids.length],ib=ids[k],ic=ids[(k+1)%ids.length],a=poly[ia],b=poly[ib],c=poly[ic];if(cross(a,b,c)<=1e-9)continue;if(ids.some(n=>n!==ia&&n!==ib&&n!==ic&&cross(a,b,poly[n])>=0&&cross(b,c,poly[n])>=0&&cross(c,a,poly[n])>=0))continue;out.push(ia,ib,ic);ids.splice(k,1);cut=true;break;}if(!cut)throw Error('Contorno del monumento no triangulable');}out.push(...ids);return out;}
 const sx=72,sz=308,sy=groundAt(sx,sz)+.70,points=[],indices=[],N=outline.length;
 for(const side of [-1,1])for(const [px,py] of outline)points.push(sx+px,sy+py,sz+side*.075);const face=triangulate(outline);for(let i=0;i<face.length;i+=3){indices.push(face[i+2],face[i+1],face[i],face[i]+N,face[i+1]+N,face[i+2]+N);}for(let i=0;i<N;i++){const j=(i+1)%N;indices.push(i,j,j+N,i,j+N,i+N);}const normals=[];B.VertexData.ComputeNormals(points,indices,normals);const statue=meshData('Silueta de Sandino · malla propia',points,normals,null,indices,null,black,null);statue.isPickable=false;cityLandmarks.push(statue);const base=makeDetailGroup('Mirador de Tiscapa · aproximación',({box})=>{box('Terreno del mirador',sx,-.13,sz+3,74,.26,58,a.houseBase);box('Plaza del mirador',sx,.005,sz,26,.035,18,a.monument);for(const side of [-1,1]){box('Sendero al mirador',sx+side*17,.005,sz-10,7,.035,26,a.monument);for(let n=0;n<6;n++){const fence=box('Poste de protección',sx+side*34,.55,sz-20+n*9,.10,1.1,.10,a.steel);}}box('Pedestal del monumento',sx,sy-.45,sz,8,.5,4,a.monument);for(let k=0;k<4;k++)box('Grada del mirador',sx,sy-.74+k*.09,sz+3-k*.4,10,.14,1.7-k*.25,a.monument);});cityLandmarks.push(base);addWorldBox(sx,sz,8,4);data.places.push(['Mirador de Tiscapa · Sandino',sx,sz]);stage21Landmarks.sandino=true;
 // Nueva Catedral de Managua: volumen horizontal de Ricardo Legorreta, 63 cúpulas
 // y torre campanario triangular. Interpretación original: el juego no está a escala.
 // En el mapa real del juego los solares del corredor sur pueden estar ya ocupados;
 // buscar un solar disponible en lugar de ocultar silenciosamente el monumento.
 const cathedralW21=26,cathedralD21=28;
 const cathedralCandidates21=[[79,385],[78,431],[77,469]],cathedralGrid21=[];
 for(let z=343;z<=488;z+=5)for(let x=57;x<=86;x+=3)cathedralGrid21.push([x,z]);
 cathedralGrid21.sort((a,b)=>(a[0]-79)**2+(a[1]-385)**2-(b[0]-79)**2-(b[1]-385)**2);
 const cathedralSite21=[...cathedralCandidates21,...cathedralGrid21].find(([cx,cz])=>
  cx-cathedralW21/2>43&&
  inWorld(cx-14,cz-15)&&inWorld(cx+21,cz+21)&&
  !data.boxes.some(b=>cx+21>b[0]-1&&cx-14<b[2]+1&&cz+21>b[1]-1&&cz-15<b[3]+1));
 if(cathedralSite21){
  const [cx,cz]=cathedralSite21,cy=groundAt(cx,cz);
  const concrete=pbr('Concreto mate Catedral Metropolitana21','#bdb9a9',.97);
  const roof=pbr('Cúpulas marfil Catedral Metropolitana21','#e7e1cf',.94);
  const shadow=pbr('Nicho azul Catedral Metropolitana21','#37315b',.91);
  const wall=surfaceTextures31.concrete_wall_003;
  if(wall?.diff){concrete.albedoTexture=wall.diff;concrete.bumpTexture=wall.nor_gl;concrete.invertNormalMapY=true;if(concrete.bumpTexture)concrete.bumpTexture.level=.12;concrete.metadata={worldScale:3.2};}
  const cathedral=makeDetailGroup('Catedral Metropolitana de Managua · modelo artístico21',({box,add})=>{
   box('Nave horizontal de concreto21',cx,cy+3.45,cz,cathedralW21,6.9,cathedralD21,concrete);
   box('Losa plana portante21',cx,cy+6.93,cz,cathedralW21+.6,.26,cathedralD21+.6,concrete);
   box('Umbral y explanada peatonal21',cx,cy+.055,cz+17.3,22,.10,6,assetMats.monument);
   for(const side of [-1,1]){
    box('Receso de sombra violeta21',cx+side*9.05,cy+2.5,cz+14.16,4.1,3.5,.08,shadow);
    box('Galería cubierta de fachada21',cx+side*9.05,cy+6.15,cz+14.23,5.1,.18,1.1,concrete);
   }
   box('Portal escalonado oscuro21',cx,cy+3.3,cz+14.17,4.35,5.6,.09,shadow);
   for(let k=0;k<4;k++){
    const width=6.45-k*.26,depth=cz+14.30+k*.06;
    for(const side of [-1,1])box('Jamba profunda de portal21',cx+side*(width/2-.23),cy+3.45,depth,.46,6.35-k*.20,.11,concrete);
    box('Dintel profundo de portal21',cx,cy+6.60-k*.10,depth,width,.42,.11,concrete);
   }
   box('Puerta principal de madera21',cx,cy+2.30,cz+14.48,2.9,4.6,.075,assetMats.toolWood);
   for(let i=0;i<3;i++)box('Franja de entrada21',cx,cy+.07+i*.04,cz+15.1+i*.68,5.7,.09,.70,assetMats.monument);
   // 63 domos: un lote fusionado por material y ninguna luz dinámica nueva.
   for(let row=0;row<9;row++)for(let col=0;col<7;col++){
    const dx=(col-3)*3.3,dz=(row-4)*2.9;
    const dome=B.MeshBuilder.CreateSphere('Cúpula 21 '+row+'-'+col,{diameter:2.65,segments:8},scene);
    dome.scaling.y=.73;dome.position.set(cx+dx,cy+7.19,cz+dz);add(dome,roof);
    box('Remate de cúpula21',cx+dx,cy+8.25,cz+dz,.32,.28,.32,concrete);
   }
   const bell=B.MeshBuilder.CreateCylinder('Campanario triangular21',{height:19,diameter:4,tessellation:3},scene);
   bell.rotation.y=Math.PI/6;bell.position.set(cx+16.7,cy+9.5,cz+5);add(bell,concrete);
   box('Cruce vertical campanario21',cx+16.7,cy+21.3,cz+5,.20,2.8,.20,assetMats.steel);
   box('Cruce horizontal campanario21',cx+16.7,cy+21.8,cz+5,1.12,.18,.20,assetMats.steel);
   // Acercamiento peatonal hacia la avenida existente sin añadir obstáculos.
   box('Sendero de conexión a la avenida21',cx-18.5,cy+.021,cz+18.8,18,.035,2.6,assetMats.monument);
  });
  cityLandmarks.push(cathedral);
  addWorldBox(cx,cz,cathedralW21,cathedralD21);
  addWorldBox(cx+16.7,cz+5,4.0,4.0);
  data.places.push(['Catedral Metropolitana de Managua · Nueva Catedral',cx,cz+18]);
  stage21Landmarks.cathedral=true;
 }
}

/* Deterministic game rules. Prices and crime response are fictional balancing. */
