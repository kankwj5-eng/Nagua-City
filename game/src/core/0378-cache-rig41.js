// Caché de nodos del nuevo GLB. No reconstruye pistas de animación antiguas.
function cacheRig41(person){
 if(person.rig41)return person.rig41;
 const nodes=new Map(person.root.getDescendants().map(node=>
  [node.name.replace(/^originalV4_\d+_/,'').replace(/^nagua4_\d+_/,'') ,node]));
 return person.rig41={nodes,tracks:[],groundY:0,lastHeading:person.root.rotation.y,
  turn:0,air:0,landing:0,walk:0,run:0,wasAir:false};
}
