function instantiateHuman45(container,index){
 const groups=container.animationGroups;container.animationGroups=[];
 try{return container.instantiateModelsToScene(n=>'h'+index+'_'+n,false,{doNotInstantiate:true});}
 finally{container.animationGroups=groups;}
}
// Preserve all keyframes and their original JS precision in shared binary buffers.
// Block 01: retain every keyframe's timing and Float64 precision.
// The pool lives only while one animation library is being prepared.
// Block 03: use narrower storage only when every Number is exactly representable.
// Never quantize: mixed or higher-precision tracks retain Float64 storage.
