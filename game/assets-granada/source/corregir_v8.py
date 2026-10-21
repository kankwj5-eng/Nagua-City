import bpy,math,random,json
from pathlib import Path
from mathutils import Vector,Matrix
B=Path(__file__).parent;s=bpy.context.scene;random.seed(821)
assert 'revision_v8' not in s
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('ivory=material')])
bpy.context.view_layer.update()
def bounds(o):
 p=[o.matrix_world@Vector(v) for v in o.bound_box];return Vector(tuple(min(a[k] for a in p) for k in range(3))),Vector(tuple(max(a[k] for a in p) for k in range(3)))
def deform(o,fn):
 # Bake a world-space transform into independent geometry, retaining modifiers.
 o.data=o.data.copy();mw=o.matrix_world.copy();inv=mw.inverted()
 if o.type=='MESH':
  for v in o.data.vertices:v.co=inv@fn(mw@v.co)
  o.data.update()
 elif o.type=='CURVE':
  for sp in o.data.splines:
   for p in sp.points:p.co=(*(inv@fn(mw@Vector(p.co[:3]))),p.co.w)
   for p in sp.bezier_points:
    p.co=inv@fn(mw@p.co);p.handle_left=inv@fn(mw@p.handle_left);p.handle_right=inv@fn(mw@p.handle_right)
catcols=['01 Catedral - geometria observada','12 V3 Catedral afinada','16 V5 Alzado visto en el recorte']
cats={o for c in bpy.data.collections if c.name in catcols for o in c.objects}
drum=[];body=[]
for o in cats:
 if o.type not in ['MESH','CURVE'] or o.hide_render:continue
 lo,hi=bounds(o);c=(lo+hi)/2
 if (c.x-16.8)**2+(c.y-1.5)**2<6.8**2 and lo.z>27:
  drum.append(o);continue
 # Leave the western front and its towers intact. Nave and east elevation
 # receive separate, coherent heights, including their openings and mouldings.
 if hi.x<-30:continue
 if lo.x<-30 and hi.x<-25:continue
 side=abs(c.y-1.5)>12.1 and 'Tejado nave' not in o.name
 factor=.94 if side else .78
 deform(o,lambda p,f=factor:Vector((p.x,p.y,p.z*f)));body.append(o.name)
assert len(drum)>35 and len(body)>50,(len(drum),len(body))
for o in drum:
 # A single supported drum; no disconnected vertical displacement.
 radial=1.04
 if o.name.startswith(('Linterna cupula','Pilar linterna','Remate rojo')):radial=1.85
 deform(o,lambda p,r=radial:Vector((16.8+(p.x-16.8)*r,1.5+(p.y-1.5)*r,p.z-5.8)))
group('29 V8 Encuentro cupula y desgaste')
ivory=bpy.data.materials['Cal blanca desgastada'];ochre=bpy.data.materials['Ocre catedral - observado en F000 F570']
for z0,z1,r,r2,m in [(20.5,21.5,6.15,6.15,ochre),(21.5,21.82,6.55,6.55,ivory),(21.82,22.2,6.55,5.94,ivory),(22.2,22.38,5.94,5.94,ivory)]:
 cyl('V8 basamento conectado del tambor',(16.8,1.5,z0),(16.8,1.5,z1),r,m,r2,N=96)
# Enlarge the lantern sill and crown together with its columns.
for z in [35.30,36.97]:cyl('V8 anillo linterna',(16.8,1.5,z),(16.8,1.5,z+.13),1.05,ivory,N=64)
# Correct the walking proxies for altered nave volumes only.
for o in s.objects:
 if o.name.startswith(('COL_Nave central','COL_Nave lateral')):
  f=.78 if 'central' in o.name else .94;deform(o,lambda p,f=f:Vector((p.x,p.y,p.z*f)))
# Material changes preserve the existing mineral grain and fine normals.
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
def mathnode(n,l,op,a,b):
 v=n.new('ShaderNodeMath');v.operation=op
 for i,x in enumerate([a,b]):
  if isinstance(x,(int,float)):v.inputs[i].default_value=x
  else:l.new(x,v.inputs[i])
 return v.outputs[0]
def multiply_color(m,mask,dark,amount):
 n=m.node_tree.nodes;l=m.node_tree.links;p=next(a for a in n if a.type=='BSDF_PRINCIPLED');socket=p.inputs['Base Color']
 old=socket.links[0].from_socket if socket.is_linked else None;default=tuple(socket.default_value)
 mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.label='V8 suciedad acumulada';l.new(mathnode(n,l,'MULTIPLY',mask,amount),mix.inputs[0]);mix.inputs[1].default_value=default
 if old:l.new(old,mix.inputs[1])
 mix.inputs[2].default_value=(*dark,1);l.new(mix.outputs[0],socket)
changed=[]
used={slot.material for o in s.objects if not o.hide_render for slot in o.material_slots if slot.material and slot.material.use_nodes}
for m in used:
 name=m.name;n=m.node_tree.nodes;l=m.node_tree.links
 if not name.startswith(('Teja envejecida','V2 teja contexto','Cupulas rojo','Fachada ','Cal blanca','Ocre catedral','Zocalo azul','Bordillo amarillo','V5 piedra gris','Acera barro','V4 junta')):continue
 pos=n.new('ShaderNodeNewGeometry').outputs['Position'];sep=n.new('ShaderNodeSeparateXYZ');l.new(pos,sep.inputs[0])
 if name.startswith(('Teja envejecida','V2 teja contexto')):
  # Contact dirt is strongest in concave tile channels. Position noise
  # supplies irregular soot/lichen patches, rather than recolouring all tiles.
  geom=n.new('ShaderNodeNewGeometry');cavity=ramp(n,l,geom.outputs['Pointiness'],(1,1,1),(0,0,0),.43,.51)
  patches=ramp(n,l,noise(n,l,scaled(n,l,pos,(1,1,1.8)),2.7,5),(0,0,0),(1,1,1),.43,.65)
  mask=mathnode(n,l,'MAXIMUM',mathnode(n,l,'MULTIPLY',cavity,.75),patches)
  multiply_color(m,mask,(.21,.24,.17),.76)
  # Small faded mineral islands on the ceramic surface.
  p=next(a for a in n if a.type=='BSDF_PRINCIPLED');old=p.inputs['Base Color'].links[0].from_socket
  dust=ramp(n,l,noise(n,l,pos,19,3),(0,0,0),(1,1,1),.66,.77);mix=n.new('ShaderNodeMixRGB');l.new(mathnode(n,l,'MULTIPLY',dust,.30),mix.inputs[0]);l.new(old,mix.inputs[1]);mix.inputs[2].default_value=(.27,.20,.12,1);l.new(mix.outputs[0],p.inputs['Base Color'])
 elif name.startswith(('V5 piedra gris','Acera barro','V4 junta')):
  # Broad, irregular traces of use with fine broken edges; roughness stays matte.
  patch=ramp(n,l,noise(n,l,pos,.72,5),(0,0,0),(1,1,1),.46,.65)
  fine=ramp(n,l,noise(n,l,pos,13,3),(.4,.4,.4),(1,1,1),.3,.75)
  multiply_color(m,mathnode(n,l,'MULTIPLY',patch,fine),(.32,.28,.22),.67)
 else:
  # Ground splash zone and elongated vertical rain streaks.
  low=n.new('ShaderNodeMapRange');low.clamp=True;l.new(sep.outputs['Z'],low.inputs['Value']);low.inputs['From Min'].default_value=.10;low.inputs['From Max'].default_value=1.8;low.inputs['To Min'].default_value=1;low.inputs['To Max'].default_value=0
  streak=ramp(n,l,noise(n,l,scaled(n,l,pos,(5,5,.28)),2.4,4),(0,0,0),(1,1,1),.42,.67)
  geom=n.new('ShaderNodeNewGeometry');cavity=ramp(n,l,geom.outputs['Pointiness'],(1,1,1),(0,0,0),.43,.50)
  mask=mathnode(n,l,'MAXIMUM',mathnode(n,l,'MULTIPLY',low.outputs[0],streak),mathnode(n,l,'MULTIPLY',cavity,.35))
  multiply_color(m,mask,(.24,.23,.17),.68)
 m['revision_v8']='Desgaste localizado, conservando poro y rugosidad';changed.append(name)
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
# Thin, irregular sediment deposits along kerbs and around planting beds.
dirt=material('V8 sedimento mineral en juntas',(.055,.040,.023),.98,.0007,60)
verts=[];faces=[]
for side in [-1,1]:
 for x in range(1,478):
  if random.random()<.25:continue
  x0=x+random.random()*.3;x1=x0+random.uniform(.3,1.2);w=random.uniform(.025,.17);y0=center(x0)+side*6.73;y1=center(x1)+side*6.73;k=len(verts)
  verts.extend([(x0,y0,.049),(x1,y1,.049),(x1-.1,y1-side*w*.6,.049),(x0+.07,y0-side*w,.049)]);faces.append((k,k+1,k+2,k+3))
mesh('V8 deposito discontinuo junto al bordillo',verts,faces,dirt)
# Hairline cracks with short branches, kept millimetric and flush.
crack=material('V8 junta fisurada oscura',(.018,.015,.011),.98,0)
for k in range(105):
 x=random.uniform(4,475);y=center(x)+random.uniform(-6.2,6.2);a=random.random()*math.tau;length=random.uniform(.10,.68);pts=[]
 for j in range(7):
  d=length*j/6;pts.append((x+d*math.cos(a)+random.uniform(-.017,.017),y+d*math.sin(a)+random.uniform(-.017,.017),.048))
 curve('V8 fisura de uso del pavimento',pts,random.uniform(.0008,.0018),crack)
meta={'piezas_tambor_corregidas':len(drum),'piezas_nave_proporcionadas':len(body),'materiales_con_desgaste':changed,'tecnica':'Geometria y materiales nativos; proporcion estimada a partir del video. No medicion arquitectonica.'}
s['revision_v8']=json.dumps(meta,ensure_ascii=False);(B/'revision_v8.json').write_text(json.dumps(meta,indent=2,ensure_ascii=False))
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.cycles.samples=64;s.cycles.use_denoising=True
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
# Quick diagnostics before committing the complete render set.
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_x=576;s.render.resolution_y=1024;s.cycles.samples=24;s.render.filepath=str(B/'Prueba_V8_Video.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['Recorrido_03_Bancas_y_Faroles'];s.render.resolution_x=960;s.render.resolution_y=600;s.render.filepath=str(B/'Prueba_V8_Suelo.png');bpy.ops.render.render(write_still=True)
print('V8_PRUEBAS_TERMINADAS',meta,flush=True)
