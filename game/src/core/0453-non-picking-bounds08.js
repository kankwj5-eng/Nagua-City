function nonPickingBounds08(applySkeleton=false,applyMorph=false){
 const options=typeof applySkeleton==='object'?{...applySkeleton}:{applySkeleton,applyMorph};
 if(!this.isPickable&&!options.applySkeleton&&!options.applyMorph&&!options.applyBakedVertexAnimation&&options.updatePositionsArray===undefined)options.updatePositionsArray=false;
 return B.Mesh.prototype.refreshBoundingInfo.call(this,options);
}

// Block 11: batch only opaque, identically named body pieces of automobile templates.
// Wheel/steering pivots, motorcycles and transparent pieces stay separate.
