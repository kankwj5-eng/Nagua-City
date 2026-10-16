// Alumbrado ambiental independiente de la historia y sin luces puntuales.
 // El juego se explora libremente; los tres faroles siempre deben existir.
function lightsNeighborhood42(){
 if(stage42.neighborhoodLamps)return;
 const warm=pbr('Difusores cálidos barrio42','#ead0a4',.92);
 warm.emissiveColor=B.Color3.FromHexString('#b28a46');
 const root=makeDetailGroup('Luminarias de comercios del barrio42',({box})=>{
  for(const [x,z] of [[-354,22],[-330,22],[-339,22]]){
   const y=groundAt(x,z);
   box('Montura pared de farol42',x,y+2.48,z,.20,.16,.55,assetMats.steel);
   box('Difusor cálido de farol42',x,y+2.38,z+.31,.35,.20,.31,warm);
  }
 });
 registerDetail31(root,-339,22,100);
 stage42.neighborhoodLamps=true;
}
