function merge46(name,items,parent=null){
 const groups=new Map();for(const m of items){const key=m.material.uniqueId+':'+m.overrideMaterialSideOrientation;const list=groups.get(key)||[];list.push(m);groups.set(key,list);m.isPickable=false;}
 const result=[];for(const list of groups.values()){const mat=list[0].material;const mesh=B.Mesh.MergeMeshes(list,true,true,undefined,false,false);if(!mesh)continue;mesh.name=name+' '+mat.name;mesh.material=mat;mesh.parent=parent;mesh.isPickable=false;mesh.receiveShadows=true;result.push(mesh);}return result;
}
