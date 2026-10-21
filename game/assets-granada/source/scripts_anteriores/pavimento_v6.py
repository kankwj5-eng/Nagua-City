import bpy,json
from pathlib import Path
B=Path(__file__).parent;s=bpy.context.scene
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
m=bpy.data.materials['V5 piedra gris del recorte'];n,l,p,pos=shader(m)
# Centimetre aggregate is resolvable from eye height; metre-scale colour clouding is removed.
warp=n.new('ShaderNodeTexNoise');warp.inputs['Scale'].default_value=24;warp.inputs['Detail'].default_value=3;l.new(pos,warp.inputs['Vector'])
v=n.new('ShaderNodeVectorMath');v.operation='SCALE';v.inputs['Scale'].default_value=.012;l.new(warp.outputs['Color'],v.inputs[0]);add=n.new('ShaderNodeVectorMath');add.operation='ADD';l.new(pos,add.inputs[0]);l.new(v.outputs[0],add.inputs[1])
vor=n.new('ShaderNodeTexVoronoi');vor.distance='EUCLIDEAN';vor.feature='F1';vor.inputs['Scale'].default_value=65;l.new(add.outputs[0],vor.inputs['Vector'])
gran=ramp(n,l,vor.outputs['Distance'],(.14,.135,.125),(.80,.78,.74),.18,.68)
basecol=ramp(n,l,noise(n,l,pos,24,4),(.060,.057,.052),(.105,.100,.091),.20,.82)
mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.65;l.new(basecol,mix.inputs[1]);l.new(gran,mix.inputs[2])
# Slight, discontinuous darker traces rather than broad glossy blobs.
wet=noise(n,l,pos,.7,2);wm=n.new('ShaderNodeMapRange');wm.clamp=True;wm.inputs['From Min'].default_value=.64;wm.inputs['From Max'].default_value=.82;wm.inputs['To Min'].default_value=0;wm.inputs['To Max'].default_value=.35;l.new(wet,wm.inputs[0])
col=n.new('ShaderNodeMixRGB');col.blend_type='MULTIPLY';l.new(wm.outputs[0],col.inputs[0]);l.new(mix.outputs[0],col.inputs[1]);col.inputs[2].default_value=(.67,.69,.71,1);l.new(col.outputs[0],p.inputs['Base Color'])
rough(n,l,p,noise(n,l,pos,28,3),.73,.91)
co=bump(n,l,p,vor.outputs['Distance'],.0018,.48);bump(n,l,p,noise(n,l,pos,170,3),.0012,.55,co)
p.inputs['Specular IOR Level'].default_value=.22;p.inputs['Coat Weight'].default_value=0;m['realismo_v6']='Piedra de agregado centimetico y poro milimetrico; sin nubarrones ni barniz'
meta=json.loads(s['realismo_v6']);meta['pavimento_v6']='Agregado resoluble, microrelieve y rugosidad alta. Nubarrones eliminados.';s['realismo_v6']=json.dumps(meta);json.dump(meta,open(B/'realismo_v6.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Recorrido_01_Paseo'];bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.render.resolution_x=1080;s.render.resolution_y=675;s.cycles.samples=32;s.render.filepath=str(B/'Prueba_Piedra_V6.png');bpy.ops.render.render(write_still=True)
print('V6_PIEDRA_VALIDAR',flush=True)
