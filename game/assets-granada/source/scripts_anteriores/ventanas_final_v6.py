import bpy,json
from pathlib import Path
B=Path(__file__).parent;s=bpy.context.scene;fixed=[]
# Tower shells overlap the main facade. Keep backing panes inside the tower recess,
# ahead of the secondary interior wall so the circular glazing remains visible.
for o in s.objects:
 if o.type=='MESH' and o.get('realismo_v6') and o.name.startswith(('Oculo circular','Nicho torre')):
  o.location.x-=.70;fixed.append(o.name)
assert len(fixed)==8
meta=json.loads(s['realismo_v6']);meta['fondos_vanos_torre_corregidos']=fixed;s['realismo_v6']=json.dumps(meta);json.dump(meta,open(B/'realismo_v6.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Recorrido_01_Paseo'];bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.render.resolution_x=1440;s.render.resolution_y=900;s.cycles.samples=64;s.cycles.use_denoising=True
for name in ['Recorrido_04_Frente_Catedral','Recorrido_06_Desde_Parque']:
 s.camera=bpy.data.objects[name];s.render.filepath=str(B/(name+'.png'));bpy.ops.render.render(write_still=True);print('V6_VISTA_FINAL',name,flush=True)
print('V6_CORRECCION_FINAL_TERMINADA',flush=True)
