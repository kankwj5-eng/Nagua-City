import bpy,json,struct
from pathlib import Path
B=Path(__file__).parent;s=bpy.context.scene
assert 'revision_v8_alzado' in s
# Place the glazing near the exterior reveal, rather than deep inside the nave.
col=bpy.data.collections['30 V8 Alzado posterior corregido'];glassmat=bpy.data.materials.new('V8 vidrio posterior oscuro');glassmat.use_nodes=True;p=glassmat.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.024,.036,.038,1);p.inputs['Roughness'].default_value=.37
for o in col.objects:
 if o.type=='MESH' and o.name.startswith('V8 ventana posterior redonda'):
  o.location.x+=2.0;o.data.materials.clear();o.data.materials.append(glassmat)
# Shade dirt below overhangs and cornices while leaving exposed paint readable.
for m in bpy.data.materials:
 if not m.users or not m.use_nodes or not m.name.startswith(('Fachada ','Cal blanca','Ocre catedral')):continue
 n=m.node_tree.nodes;l=m.node_tree.links;p=next(a for a in n if a.type=='BSDF_PRINCIPLED');old=p.inputs['Base Color'].links[0].from_socket
 ao=n.new('ShaderNodeAmbientOcclusion');ao.samples=8;ao.inputs['Distance'].default_value=.65
 inv=n.new('ShaderNodeMath');inv.operation='SUBTRACT';inv.inputs[0].default_value=1;l.new(ao.outputs['AO'],inv.inputs[1])
 mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';mul.inputs[1].default_value=.43;l.new(inv.outputs[0],mul.inputs[0])
 mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';l.new(mul.outputs[0],mix.inputs[0]);l.new(old,mix.inputs[1]);mix.inputs[2].default_value=(.28,.25,.18,1);l.new(mix.outputs[0],p.inputs['Base Color'])
colliders=[o for o in s.objects if o.get('role')=='collision_proxy'];bpy.ops.object.select_all(action='DESELECT')
for o in colliders:o.hide_viewport=False;o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=colliders[0]
bpy.ops.export_scene.gltf(filepath=str(B/'Colisiones_Granada.glb'),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_materials='NONE',export_cameras=False,export_lights=False)
for o in colliders:o.select_set(False);o.hide_viewport=True
raw=(B/'Colisiones_Granada.glb').read_bytes();magic,version,size=struct.unpack_from('<4sII',raw);assert magic==b'glTF' and version==2 and size==len(raw)
views=json.loads((B/'camaras_primera_persona.json').read_text());s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.render.resolution_x=1440;s.render.resolution_y=900;s.render.resolution_percentage=100;s.cycles.samples=64;s.cycles.use_denoising=True
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
for v in views:
 s.camera=bpy.data.objects[Path(v['archivo']).stem];s.render.filepath=str(B/v['archivo']);bpy.ops.render.render(write_still=True);v['version_modelo']=8;print('V8_FOTO_LISTA',v['archivo'],flush=True)
(B/'camaras_primera_persona.json').write_text(json.dumps(views,indent=2,ensure_ascii=False))
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_x=576;s.render.resolution_y=1024;s.render.filepath=str(B/'Vista_Video_V8.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['V8 detalle encuentro cupula'];s.render.resolution_x=1200;s.render.resolution_y=960;s.render.filepath=str(B/'Detalle_Cupula_V8.png');bpy.ops.render.render(write_still=True)
print('V8_RENDER_COMPLETO',flush=True)
