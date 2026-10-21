from pathlib import Path
B=Path(__file__).parent
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
m=bpy.data.materials['V2 teja contexto'];n,l,p,pos=shader(m)
t=n.new('ShaderNodeTexBrick');t.inputs['Scale'].default_value=1;t.inputs['Brick Width'].default_value=.27;t.inputs['Row Height'].default_value=.36
t.inputs['Mortar Size'].default_value=.006;t.inputs['Mortar Smooth'].default_value=.003
t.inputs['Color1'].default_value=(.34,.082,.032,1);t.inputs['Color2'].default_value=(.23,.049,.019,1);t.inputs['Mortar'].default_value=(.095,.027,.012,1);l.new(pos,t.inputs['Vector'])
grain=noise(n,l,pos,155,2);mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.17;l.new(t.outputs['Color'],mix.inputs[1]);l.new(grain,mix.inputs[2]);l.new(mix.outputs[0],p.inputs['Base Color'])
rough(n,l,p,noise(n,l,pos,24),.79,.95)
b=n.new('ShaderNodeBump');b.invert=True;b.inputs['Distance'].default_value=.009;b.inputs['Strength'].default_value=.50;l.new(t.outputs['Fac'],b.inputs['Height']);bump(n,l,p,grain,.0007,.40,b.outputs[0])
m['textura_v4']='ceramica';s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.cycles.samples=64;s.render.resolution_x=1000;s.render.resolution_y=1400;s.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.cycles.samples=32
for cn,fn in [('Comparacion F390 - regreso por Calzada','Comparacion_Calzada.png'),('Comparacion F570 - fachada y parque','Comparacion_Catedral.png'),('Comparacion F000 - vista aerea','Entorno_Aereo.png')]:
 s.camera=bpy.data.objects[cn];s.render.filepath=str(B/fn);bpy.ops.render.render(write_still=True)
print('TEJAS_Y_VISTAS_V4_LISTAS',flush=True)
