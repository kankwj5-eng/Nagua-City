import bpy,math,random,json
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene
random.seed(401)
stats={'materiales':{},'tecnica':'Materiales procedurales a escala metrica; relieve fino y rugosidad independientes. No fotogrametria.'}
def shader(m):
 m.use_nodes=True;n=m.node_tree.nodes;n.clear();l=m.node_tree.links
 p=n.new('ShaderNodeBsdfPrincipled');out=n.new('ShaderNodeOutputMaterial');l.new(p.outputs[0],out.inputs['Surface'])
 pos=n.new('ShaderNodeNewGeometry').outputs['Position']
 p.inputs['Coat Weight'].default_value=0;p.inputs['Specular IOR Level'].default_value=.26
 return n,l,p,pos
def noise(n,l,pos,scale,detail=3):
 a=n.new('ShaderNodeTexNoise');a.inputs['Scale'].default_value=scale;a.inputs['Detail'].default_value=detail;a.inputs['Roughness'].default_value=.68;l.new(pos,a.inputs['Vector']);return a.outputs['Fac']
def ramp(n,l,x,c0,c1,a=.2,b=.8):
 r=n.new('ShaderNodeValToRGB');r.color_ramp.elements[0].position=a;r.color_ramp.elements[1].position=b
 r.color_ramp.elements[0].color=(*c0,1);r.color_ramp.elements[1].color=(*c1,1);l.new(x,r.inputs[0]);return r.outputs[0]
def rough(n,l,p,x,lo,hi):
 v=n.new('ShaderNodeMapRange');v.inputs['To Min'].default_value=lo;v.inputs['To Max'].default_value=hi;l.new(x,v.inputs['Value']);l.new(v.outputs[0],p.inputs['Roughness'])
def bump(n,l,p,x,distance,strength=.4,normal=None):
 b=n.new('ShaderNodeBump');b.inputs['Distance'].default_value=distance;b.inputs['Strength'].default_value=strength;l.new(x,b.inputs['Height'])
 if normal:l.new(normal,b.inputs['Normal'])
 l.new(b.outputs[0],p.inputs['Normal']);return b.outputs[0]
def scaled(n,l,pos,values):
 v=n.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=values;l.new(pos,v.inputs[0]);return v.outputs[0]
def tint(c,f):return tuple(max(0,min(1,a*f)) for a in c)
def oldcolor(m):
 if m.use_nodes:
  rs=[x for x in m.node_tree.nodes if x.type=='VALTORGB']
  if rs:return tuple(rs[0].color_ramp.elements[-1].color[:3])
 return tuple(m.diffuse_color[:3])
def record(cat):stats['materiales'][cat]=stats['materiales'].get(cat,0)+1
# Rebuild only materials assigned to visible geometry, retaining the chosen facade colours.
used={slot.material for o in s.objects for slot in o.material_slots if slot.material}
for m in sorted(used,key=lambda x:x.name):
 name=m.name;c=oldcolor(m);cat=None
 if name.startswith(('Piedra mojada','Losas humedas')):cat='piedra'
 elif name.startswith('Acera barro'):cat='acera'
 elif name.startswith(('Fachada ','Cal blanca','Ocre catedral','Zocalo azul','Bordillo amarillo')):cat='revoque'
 elif name.startswith(('Teja envejecida','V2 teja contexto','Cupulas rojo')):cat='ceramica'
 elif name.startswith(('Madera oscura','V3 madera asientos')):cat='madera'
 elif name.startswith(('Hierro pintado','V3 hierro negro','Papelera azul')):cat='metal_pintado'
 elif name.startswith(('Tronco','V2 corteza')):cat='corteza'
 elif name.startswith(('Tierra y jardin','V2 cesped')):cat='tierra'
 elif name.startswith('V2 follaje'):cat='hojas'
 if not cat:continue
 record(cat);n,l,p,pos=shader(m)
 if cat=='piedra':
  # Slate/stone grain: sub-centimetre aggregate, without a uniform wet clearcoat.
  variation=1+(.07 if name.endswith('0.26)') else 0)
  col=ramp(n,l,noise(n,l,pos,5),tint((.052,.054,.055),variation),tint((.115,.119,.121),variation))
  micro=noise(n,l,pos,190,2);grain=ramp(n,l,micro,(.38,.40,.40),(.86,.86,.84),.17,.86)
  mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.30;l.new(col,mix.inputs[1]);l.new(grain,mix.inputs[2]);l.new(mix.outputs[0],p.inputs['Base Color'])
  rough(n,l,p,noise(n,l,pos,17),.64,.88)
  coarse=bump(n,l,p,noise(n,l,pos,28),.0016,.38)
  bump(n,l,p,micro,.00085,.55,coarse)
 elif cat=='acera':
  l.new(ramp(n,l,noise(n,l,pos,3),tint(c,.65),tint(c,.95)),p.inputs['Base Color']);rough(n,l,p,noise(n,l,pos,25),.75,.96)
  coarse=bump(n,l,p,noise(n,l,pos,32),.0016,.45);bump(n,l,p,noise(n,l,pos,160,2),.0007,.40,coarse)
 elif cat=='revoque':
  # Old painted lime plaster, subtle clouding and fine pores; retain pigment.
  l.new(ramp(n,l,noise(n,l,pos,1.25),tint(c,.79),tint(c,1.015)),p.inputs['Base Color']);rough(n,l,p,noise(n,l,pos,26),.79,.96)
  coarse=bump(n,l,p,noise(n,l,pos,19),.0011,.27);bump(n,l,p,noise(n,l,pos,145,2),.00045,.42,coarse)
 elif cat=='ceramica':
  l.new(ramp(n,l,noise(n,l,pos,11),tint(c,.68),tint(c,1.06)),p.inputs['Base Color']);rough(n,l,p,noise(n,l,pos,32),.72,.94)
  b=bump(n,l,p,noise(n,l,pos,42),.0011,.34);bump(n,l,p,noise(n,l,pos,220,2),.00055,.5,b)
 elif cat=='madera':
  direction=(.85,65,90) if name.startswith('V3 madera') else (55,55,.75)
  grainpos=scaled(n,l,pos,direction);g=noise(n,l,grainpos,2.1)
  l.new(ramp(n,l,g,tint(c,.37),tint(c,1.14),.18,.83),p.inputs['Base Color']);rough(n,l,p,g,.58,.83)
  b=bump(n,l,p,g,.0006,.4);bump(n,l,p,noise(n,l,pos,130,2),.00015,.28,b)
 elif cat=='metal_pintado':
  l.new(ramp(n,l,noise(n,l,pos,13),tint(c,.65),tint(c,1.18)),p.inputs['Base Color']);rough(n,l,p,noise(n,l,pos,100,2),.48,.70)
  p.inputs['Metallic'].default_value=.12;bump(n,l,p,noise(n,l,pos,330,2),.00012,.25)
 elif cat=='corteza':
  g=noise(n,l,scaled(n,l,pos,(18,18,1.25)),2.4)
  l.new(ramp(n,l,g,tint(c,.50),tint(c,1.08)),p.inputs['Base Color']);rough(n,l,p,g,.86,.98);bump(n,l,p,g,.005,.5)
 elif cat=='tierra':
  l.new(ramp(n,l,noise(n,l,pos,5),tint(c,.60),tint(c,1.1)),p.inputs['Base Color']);p.inputs['Roughness'].default_value=.98
  b=bump(n,l,p,noise(n,l,pos,38),.008,.48);bump(n,l,p,noise(n,l,pos,160,2),.001,.45,b)
 else:
  l.new(ramp(n,l,noise(n,l,pos,45,2),tint(c,.74),tint(c,1.04)),p.inputs['Base Color']);p.inputs['Roughness'].default_value=.64
  p.inputs['Subsurface Weight'].default_value=.035;bump(n,l,p,noise(n,l,pos,220,2),.00005,.2)
 m['textura_v4']=cat
print('MATERIALES_V4',stats,flush=True)
# Physical worn slab edges replace the flat, floating square surfaces.
o=bpy.data.objects['Losas individuales humedas'];old=o.data;verts=[];faces=[];mats=[]
joint=bpy.data.materials.new('V4 junta mineral y borde gastado');n,l,p,pos=shader(joint)
l.new(ramp(n,l,noise(n,l,pos,55),(.025,.024,.021),(.071,.067,.058)),p.inputs['Base Color']);p.inputs['Roughness'].default_value=.94;bump(n,l,p,noise(n,l,pos,150,2),.0015,.5)
def addface(ids,mat):faces.append(ids);mats.append(mat)
for f in old.polygons:
 ps=[old.vertices[i].co for i in f.vertices];x0=min(v.x for v in ps);x1=max(v.x for v in ps);y0=min(v.y for v in ps);y1=max(v.y for v in ps);z=sum(v.z for v in ps)/4
 cut=random.uniform(.003,.009);edge=.0035
 ring=[(x0+cut,y0),(x1-cut,y0),(x1,y0+cut),(x1,y1-cut),(x1-cut,y1),(x0+cut,y1),(x0,y1-cut),(x0,y0+cut)]
 cx=(x0+x1)/2;cy=(y0+y1)/2;st=len(verts);tiltx=random.uniform(-.0015,.0015);tilty=random.uniform(-.0015,.0015)
 for kind in range(3):
  for xx,yy in ring:
   if kind==1:xx+=edge if xx<cx else -edge;yy+=edge if yy<cy else -edge
   zz=z+(tiltx*(xx-cx)+tilty*(yy-cy))-(.003 if kind==0 else .018 if kind==2 else 0)
   verts.append((xx,yy,zz))
 verts.append((cx,cy,z+random.uniform(-.0004,.0004)))
 for k in range(8):
  j=(k+1)%8;addface((st+8+k,st+8+j,st+24),f.material_index)
  addface((st+k,st+j,st+8+j,st+8+k),f.material_index)
  addface((st+16+k,st+16+j,st+j,st+k),3)
new=bpy.data.meshes.new('V4 losas con bisel erosionado y desnivel milimetrico');new.from_pydata(verts,[],faces);new.update()
for m in old.materials:new.materials.append(m)
new.materials.append(joint)
for f,idx in zip(new.polygons,mats):f.material_index=idx
o.data=new;o['textura_v4']='Arista achaflanada fisica, juntas profundas, grano mineral y microrelieve'
stats['losas_con_aristas_fisicas']=len(old.polygons);stats['poligonos_pavimento']=len(new.polygons)
# Additional camera aimed at the textured ground, retaining the whole furniture view.
def center(x):return 34.35+(30.33-34.35)*(x-85)/(198-85)
bpy.ops.object.camera_add(location=(124,center(124)-.2,1.2));cam=bpy.context.object;cam.name='V4 detalle de piedra y juntas'
cam.rotation_euler=(Vector((120.5,center(120.5)-1.2,.12))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=43;cam.data.clip_end=3000
s['texturas_v4']=json.dumps(stats,ensure_ascii=False);json.dump(stats,open(B/'texturas_v4.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.cycles.samples=64;s.cycles.use_denoising=True
assert all(i.packed_file for i in bpy.data.images if i.source=='FILE')
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.camera=bpy.data.objects['V3 detalle de faroles y asientos'];s.render.resolution_percentage=75;s.cycles.samples=32;s.render.filepath=str(B/'Previa_Texturas.png');bpy.ops.render.render(write_still=True)
print('TEXTURAS_V4_LISTAS',stats,flush=True)
