from pathlib import Path
B=Path(__file__).parent
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
for m in bpy.data.materials:
 if m.get('textura_v4')!='piedra':continue
 n,l,p,pos=shader(m)
 col=ramp(n,l,noise(n,l,pos,5),(.073,.076,.078),(.105,.110,.113))
 micro=noise(n,l,pos,115,3)
 grain=ramp(n,l,micro,(.18,.20,.21),(.97,.96,.94),.27,.73)
 mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.60;l.new(col,mix.inputs[1]);l.new(grain,mix.inputs[2]);l.new(mix.outputs[0],p.inputs['Base Color'])
 rough(n,l,p,noise(n,l,pos,23),.64,.89)
 coarse=bump(n,l,p,noise(n,l,pos,26),.002,.4)
 bump(n,l,p,micro,.0038,.70,coarse)
 m['textura_v4']='piedra'
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_percentage=100;s.cycles.samples=64
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.camera=bpy.data.objects['V4 detalle de piedra y juntas'];s.render.resolution_x=1200;s.render.resolution_y=860;s.cycles.samples=48;s.render.filepath=str(B/'Previa_Grano.png');bpy.ops.render.render(write_still=True)
