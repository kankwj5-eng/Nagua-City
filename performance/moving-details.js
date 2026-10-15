// Block 07: static-detail builders freeze matrices; descendants of vehicles must move.
function movingDetails07(fleet){
 let released=0;
 for(const v of fleet)for(const mesh of v.root.getChildMeshes())if(mesh.isWorldMatrixFrozen){mesh.unfreezeWorldMatrix();released++;}
 return {unfrozenVehicleMeshes:released};
}
