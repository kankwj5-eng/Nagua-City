class SurfaceVariation36 extends B.MaterialPluginBase{
 constructor(material,wall){super(material,'SurfaceVariation36',160,{SURFACE36:true});this.wall=wall;this._enable(true);}
 getClassName(){return 'SurfaceVariation36';}
 prepareDefines(d){d.SURFACE36=true;}
 getUniforms(){return {ubo:[{name:'wall36',size:1,type:'float'}],fragment:'uniform float wall36;'};}
 bindForSubMesh(u){u.updateFloat('wall36',this.wall?1:0);}
 getCustomCode(type){if(type!=='fragment')return null;return {
 CUSTOM_FRAGMENT_DEFINITIONS:`float hash36(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}float noise36(vec2 q){vec2 k=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(hash36(k),hash36(k+vec2(1.,0.)),f.x),mix(hash36(k+vec2(0.,1.)),hash36(k+vec2(1.)),f.x),f.y);}`,
 CUSTOM_FRAGMENT_BEFORE_LIGHTS:`#ifdef SURFACE36
 float macro36=noise36(vPositionW.xz*.22+vec2(vPositionW.y*.27,0.));
 float fine36=noise36(vPositionW.xz*.91+vPositionW.y*.7);
 float stain36=wall36*(1.-smoothstep(.05,.70,vPositionW.y))*mix(.025,.15,noise36(vPositionW.xz*1.8));
 surfaceAlbedo*=mix(.92,1.045,macro36)*mix(.975,1.025,fine36)*(1.-stain36);
 #endif`};}
}
