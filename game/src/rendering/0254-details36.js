function details36(){
 const zinc=pbr('Chapa de canalón36','#99a0a0',.65,.65),pipe=pbr('PVC envejecido36','#c5c7ba',.82),stone=pbr('Borde mineral36','#a6a59a',.95),steel=pbr('Acero galvanizado36','#8b9091',.46,.85),dark=pbr('Hueco de drenaje36','#242925',.97);
 material34(zinc,'corrugated_iron',1.65);material34(stone,'concrete_wall_007',2.4);
 for(const [i,house] of stage34.architecture.entries()){
 const x=house.metadata.x31,z=house.metadata.z31,y=groundAt(x,z),front=z-4;
 const root=makeDetailGroup('Construcción y drenaje36 '+i,({box,cylinder,tube})=>{
 tube('Canalón semicircular36',[V(x-4.65,y+3.10,front-2.03),V(x+4.65,y+3.10,front-2.03)],.07,zinc);
 tube('Codo y bajante36',[V(x+4.45,y+3.1,front-2.03),V(x+4.45,y+2.8,front-.30),V(x+4.45,y+.28,front-.30),V(x+4.45,y+.18,front-.68)],.047,pipe);
 for(let j=0;j<3;j++)box('Abrazadera36',x+4.45,y+.65+j*.85,front-.30,.13,.033,.13,steel);
 const meter=cylinder('Contador eléctrico36',x-4.0,y+1.65,front-.16,.115,.11,steel);meter.rotation.x=Math.PI/2;
 box('Caja de contador36',x-4,y+1.55,front-.12,.28,.42,.14,pipe);tube('Conduit36',[V(x-4,y+1.85,front-.15),V(x-4,y+2.6,front-.15),V(x-3.6,y+2.65,front-.15)],.018,pipe);
 box('Desagüe de portal36',x+3.7,y+.014,front-2.64,.70,.022,.35,dark);
 for(let j=0;j<8;j++)box('Barrote de desagüe36',x+3.42+j*.08,y+.031,front-2.64,.027,.022,.36,steel);
 for(const side of [-1,1]){const lip=box('Chaflán de escalón36',x+side*.61,y+.037,front-2.68,1.2,.07,.10,stone);lip.rotation.x=-.22;}
 if(i%2)for(let side of [-1,1])for(let j=0;j<4;j++)cylinder('Tornillo de chapa36',x+side*2.4,y+3.46,front+1+j*1.6,.025,.03,steel);
 });registerDetail31(root,x,z,100);stage36.details.push(root);
 }
}
