function vehicleSnapshot13(v){return {p:v.root.position.clone(),r:v.root.rotation.clone(),parts:Object.values(v.parts).map(node=>({node,r:node.rotation.clone()}))};}
