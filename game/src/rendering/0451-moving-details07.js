function movingDetails07(fleet){
 let released=0;
 for(const v of fleet)for(const mesh of v.root.getChildMeshes())if(mesh.isWorldMatrixFrozen){mesh.unfreezeWorldMatrix();released++;}
 return {unfrozenVehicleMeshes:released};
}

// Block 08: drawing and bounding boxes do not need per-mesh Vector3 picking copies.
// This targets the embedded Babylon 9.29 cache; keep deformable or pickable meshes intact.
