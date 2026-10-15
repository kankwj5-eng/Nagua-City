class LeafWind36 extends B.MaterialPluginBase{
 constructor(material){super(material,'LeafWind36',150,{LEAFWIND36:true});this.strength=.65;this._enable(true);}
 getClassName(){return 'LeafWind36';}
 prepareDefines(d){d.LEAFWIND36=true;}
 getUniforms(){return {ubo:[{name:'leafTime36',size:1,type:'float'},{name:'leafStrength36',size:1,type:'float'}],vertex:'uniform float leafTime36;uniform float leafStrength36;'};}
 bindForSubMesh(u){u.updateFloat('leafTime36',time);u.updateFloat('leafStrength36',this.strength);}
 getCustomCode(type){return type==='vertex'?{CUSTOM_VERTEX_UPDATE_POSITION:`#ifdef LEAFWIND36
 float leaf36=sin(positionUpdated.x*1.13+positionUpdated.z*.74+leafTime36*1.9);
 positionUpdated.x+=leaf36*.045*leafStrength36;
 positionUpdated.z+=sin(positionUpdated.z*.87+leafTime36*1.4)*.022*leafStrength36;
 #endif`}:null;}
}
