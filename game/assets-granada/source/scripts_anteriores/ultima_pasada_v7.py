"""Aplicar una sola vez sobre V6. Ultima revision contrastada con 312 cuadros del recorte."""
import bpy,math,random,json,bmesh,numpy as np
from pathlib import Path
from mathutils import Vector,Matrix
B=Path(__file__).parent;s=bpy.context.scene
assert not s.get('ultima_pasada_v7'),'V7 ya aplicada; abrir V6 para reproducir esta etapa'
random.seed(71021)
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('ivory=material')])
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
stats={'referencia':'1000335491.mp4; 312 cuadros revisados en 7 hojas de contacto y ampliaciones nativas','limites':'Planta existente y zonas ocultas aproximadas. No es levantamiento fotogrametrico ni verificacion en un motor de juego.'}
def getmat(prefix):return next(m for m in bpy.data.materials if m.users and m.name.startswith(prefix))
ivory=getmat('Cal blanca');wood=getmat('Madera oscura');curb=getmat('Bordillo amarillo');bark=getmat('Tronco');iron=getmat('Hierro pintado');leafm=[bpy.data.materials['V6 hoja natural '+str(i)] for i in range(5)]
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
# Replace diamond cards with curved oval leaves carrying a consistent leaf UV.
group('22 V7 Hojas y vegetacion')
protos=[o for o in s.objects if o.name.startswith('V6 prototipo copa oculta')];total=0
pattern=np.array([(.5,0),(.2,.12),(0,.5),(.2,.88),(.5,1),(.8,.88),(1,.5),(.8,.12),(.5,.5)],dtype=np.float32)
coeff=[(-1,0),(-.7,-.6),(0,-1),(.7,-.6),(1,0),(.7,.6),(0,1),(-.7,.6)]
for number,proto in enumerate(protos):
 old=proto.data;verts=[];faces=[];ids=[]
 for j in range(len(old.vertices)//5):
  q=[old.vertices[j*5+k].co.copy() for k in range(5)];p=(q[0]+q[2])/2;u=(q[2]-q[0])/2;w=(q[3]-q[1])/2;st=len(verts)
  verts.extend([tuple(p+u*a+w*b) for a,b in coeff]);verts.append(tuple(p+Vector((0,0,.008))))
  faces.extend([(st+k,st+(k+1)%8,st+8) for k in range(8)]);ids.extend([old.polygons[j*4].material_index]*8)
 d=bpy.data.meshes.new('V7 hojas ovaladas con nervio UV '+str(number));d.from_pydata(verts,[],faces);d.update()
 for m in old.materials:d.materials.append(m)
 d.polygons.foreach_set('material_index',np.array(ids,dtype=np.int32));d.polygons.foreach_set('use_smooth',np.ones(len(faces),dtype=bool));vi=np.empty(len(d.loops),dtype=np.int32);d.loops.foreach_get('vertex_index',vi);uv=d.uv_layers.new(name='Hoja');uv.data.foreach_set('uv',pattern[vi%9].ravel())
 for o in list(s.objects):
  if o.type=='MESH' and o.data==old:o.data=d
 total+=len(old.vertices)//5
 print('V7_HOJAS',number+1,'/ 8',flush=True)
for m in leafm:
 n=m.node_tree.nodes;l=m.node_tree.links;p=next(a for a in n if a.type=='BSDF_PRINCIPLED');original=p.inputs['Base Color'].links[0].from_socket
 for nd in n:
  if nd.type=='VALTORGB':
   for e in nd.color_ramp.elements:e.color=(*(min(.8,c*1.12) for c in e.color[:3]),1)
 uv=n.new('ShaderNodeTexCoord').outputs['UV'];sep=n.new('ShaderNodeSeparateXYZ');l.new(uv,sep.inputs[0]);sub=n.new('ShaderNodeMath');sub.operation='SUBTRACT';sub.inputs[1].default_value=.5;l.new(sep.outputs[0],sub.inputs[0]);absolute=n.new('ShaderNodeMath');absolute.operation='ABSOLUTE';l.new(sub.outputs[0],absolute.inputs[0]);mask=n.new('ShaderNodeMapRange');mask.clamp=True;mask.inputs['From Min'].default_value=.007;mask.inputs['From Max'].default_value=.025;mask.inputs['To Min'].default_value=.25;mask.inputs['To Max'].default_value=0;l.new(absolute.outputs[0],mask.inputs[0])
 mix=n.new('ShaderNodeMixRGB');l.new(mask.outputs[0],mix.inputs[0]);l.new(original,mix.inputs[1]);mix.inputs[2].default_value=(.24,.34,.055,1);l.new(mix.outputs[0],p.inputs['Base Color']);bump(n,l,p,noise(n,l,uv,45,2),.00004,.12)
for o in s.objects:
 if o.name.startswith('Copa detallada') and o.location.x>85:o.scale.x*=.94;o.scale.y*=.96;o.scale.z*=.94
stats['hojas_ovaladas_con_uv']=total
# Root flare connects raised trunk ends to the actual planter soil.
soilbeds=[o for o in s.objects if o.name.startswith('Tierra alcorque') and o.location.x>85]
for bed in soilbeds:
 x,y,z=bed.location;cyl('V7 ensanchamiento de raiz',(x,y,.24),(x+.01,y,.61),.18,bark,.115,N=24)
 for k in range(5):
  a=k*math.tau/5+random.random()*.3;curve('V7 raiz visible',[(x,y,.36),(x+math.cos(a)*.16,y+math.sin(a)*.16,.28),(x+math.cos(a)*.37,y+math.sin(a)*.37,.248)],.027,bark)
stats['bases_arbol_con_raices']=len(soilbeds)
# Fill palm crowns with young ascending fronds, retaining the hanging outer fronds.
for o in s.objects:
 if o.name.startswith('V2 anillo tronco'):
  o.data.materials.clear();o.data.materials.append(bark)
palms=[(-71,-23,15),(-76,4,16.5),(-85,57,17),(-107,62,15),(-117,20,16),(-111,-23,14.5),(3,86,15),(20,75,13.5),(66,69,12.5),(72,1,14)]
for x,y,h in palms:
 for k in range(14):
  a=k*2.4;L=random.uniform(2.1,3.1);pts=[Vector((x+.55+L*(j/24)*math.cos(a),y+L*(j/24)*math.sin(a),h+2.7*math.sin(j/24*1.7)-.8*(j/24)**2)) for j in range(25)];curve('V7 raquis joven palmera',[tuple(p) for p in pts],.016,leafm[1]);v=[];f=[]
  along=Vector((math.cos(a),math.sin(a),0));side=Vector((-math.sin(a),math.cos(a),0))
  for j in range(2,24):
   t=j/24;c=pts[j]
   for sign in [-1,1]:
    tip=c+side*sign*(.55*math.sin(t*math.pi)**.7)+along*.23+Vector((0,0,-.16));mid=(c+tip)/2+Vector((0,0,.045));st=len(v);v.extend([tuple(c-along*.012),tuple(mid-along*.027),tuple(tip),tuple(mid+along*.027),tuple(c+along*.012)]);f.extend([(st,st+1,st+3,st+4),(st+1,st+2,st+3)])
  mesh('V7 foliolos jovenes palmera',v,f,leafm[1+k%3],True)
stats['palmeras_con_copa_rellena']=10
# Weathered clay and fine skirting chips, while retaining physical tile geometry.
for m in bpy.data.materials:
 if not m.users or not m.name.startswith('Teja envejecida'):continue
 try:idx=int(m.name.split('Teja envejecida ')[1][:2])
 except:idx=5
 c=tint((.29,.072,.029),.90+.022*idx);n,l,p,pos=shader(m);col=ramp(n,l,noise(n,l,pos,.8,4),tint(c,.67),tint(c,1.17),.23,.78);patch=n.new('ShaderNodeMixRGB');patch.blend_type='MULTIPLY';patch.inputs[0].default_value=.26;l.new(col,patch.inputs[1]);l.new(ramp(n,l,noise(n,l,pos,7),(.25,.28,.20),(.95,.90,.82),.35,.72),patch.inputs[2]);l.new(patch.outputs[0],p.inputs['Base Color']);rough(n,l,p,noise(n,l,pos,45),.82,.96);co=bump(n,l,p,noise(n,l,pos,53),.0010,.35);bump(n,l,p,noise(n,l,pos,180),.0004,.35,co)
# Restore local dampness to the mineral surface without a uniform glossy coat.
m=bpy.data.materials['V5 piedra gris del recorte'];n=m.node_tree.nodes;l=m.node_tree.links;p=next(a for a in n if a.type=='BSDF_PRINCIPLED');pos=n.new('ShaderNodeNewGeometry').outputs['Position'];wet=noise(n,l,scaled(n,l,pos,(1,.65,1)),1.1,4);rough(n,l,p,wet,.40,.86);p.inputs['Specular IOR Level'].default_value=.30
# The grain stays connected from V6; only irregular roughness is changed.
stats['pavimento']='Grano mineral V6 conservado; rugosidad variable por zonas, sin barniz uniforme'
group('23 V7 Aleros y herrajes')
rafters=0;handles=0
for wall in [o for o in s.objects if o.type=='MESH' and o.name.startswith('Casa ') and 0<o.location.x<500 and o.dimensions.x<40]:
 x=wall.location.x;side=1 if wall.location.y>center(x) else -1;front=center(x)+side*9;h=wall.location.z+wall.dimensions.z/2-.15;wid=wall.dimensions.x
 for j in range(int(wid/.65)):
  xx=x-wid/2+.35+j*.65;box('V7 canecillo de alero',(xx,front-side*.08,h-.10),(.075,.68,.115),wood,.008);rafters+=1
for ob in [o for o in s.objects if o.type=='MESH' and o.name.startswith('Vano casa ') and any(m and m.name.startswith('Madera oscura') for m in o.data.materials)]:
 ps=[ob.matrix_world@v.co for v in ob.data.vertices];x0=min(v.x for v in ps);x1=max(v.x for v in ps);y=sum(v.y for v in ps)/len(ps);x=(x0+x1)/2;side=1 if y>center(x) else -1;xx=x1-.16;yy=y-side*.045
 cyl('V7 tirador de puerta',(xx,yy,1.04),(xx,yy,1.18),.018,iron,N=16);box('V7 cerradura',(xx,yy+side*.005,1.11),(.055,.02,.22),iron,.008);handles+=1
stats.update(canecillos_aleros=rafters,puertas_con_tirador=handles)
# Copy the complete native lantern assembly into the previously empty first block.
group('24 V7 Faroles y jardineras del tramo inicial');bpy.context.view_layer.update()
prefix=('V3 base farol','V3 pedestal farol','V3 poste negro','V3 remate poste','V3 brazo forjado','V3 voluta farol','V3 cristal linterna','V3 marco linterna','V3 sombrerete negro','V3 remate linterna')
base=Vector((99,center(99)-1.8,0));template=[]
for o in s.objects:
 if not o.name.startswith(prefix) or o.hide_render:continue
 ps=[o.matrix_world@Vector(p) for p in o.bound_box];c=sum(ps,Vector())/8
 if abs(c.x-base.x)<1.5 and abs(c.y-base.y)<1.5:template.append(o)
assert len(template)>25
for x in [15,39,63,83]:
 for side in [-1,1]:
  delta=Vector((x,center(x)+side*3.7,0))-base
  for ob in template:
   copy=ob.copy();COL.objects.link(copy);copy.location+=delta;copy['detalle_v7']='Farol completo del tramo inicial; ubicacion aproximada a partir del video'
soil=material('V7 tierra humeda alcorque',(.085,.105,.035),.95,.002,40)
posts=[o for o in s.objects if o.name.startswith('V3 poste negro') and not o.hide_render]
for post in posts:
 x,y=post.location.x,post.location.y
 for dx,dy,wx,wy in [(-.42,0,.075,.915),(.42,0,.075,.915),(0,-.42,.77,.075),(0,.42,.77,.075)]:box('V7 borde jardinera farol',(x+dx,y+dy,.09),(wx,wy,.085),curb,.008)
 box('V7 tierra jardinera farol',(x,y,.063),(.76,.76,.035),soil,.003)
stats['faroles_agregados_tramo_inicial']=8;stats['jardineras_farol']=len(posts)
# Inlaid crossing colours observed in the clip. Thin overlays are flush with the paving.
group('25 V7 Franjas de cruce enrasadas')
colours=[(.36,.185,.135),(.53,.49,.37),(.17,.28,.31),(.48,.32,.25)];pavers=[material('V7 piedra de cruce '+str(i),c,.78,.0012,95) for i,c in enumerate(colours)]
for x in [85,198,309,383]:
 cy=center(x)
 for lo,hi,mat in [(-2,-1.65,pavers[0]),(-1.65,-1.32,pavers[1]),(1.32,1.65,pavers[1]),(1.65,2,pavers[0])]:mesh('V7 borde enrasado de cruce',[(x+lo,cy-6.75,.047),(x+hi,cy-6.75,.047),(x+hi,cy+6.75,.047),(x+lo,cy+6.75,.047)],[(0,1,2,3)],mat)
 for j in range(18):
  y=cy-6.75+j*.75;mesh('V7 loseta decorativa de cruce',[(x-1.32,y,.047),(x+1.32,y,.047),(x+1.32,y+.744,.047),(x-1.32,y+.744,.047)],[(0,1,2,3)],pavers[2 if j%3 else 3])
stats['cruces_enrasados_revisados']=4
# Actual depth in the return-shot elevation, matching existing opening profiles.
group('26 V7 Relieve posterior catedral')
src=(B/'realismo_v6.py').read_text();exec(src[src.index('def bounds('):src.index('bpy.context.view_layer.update();planes=')])
rear=[o for o in s.objects if o.type=='MESH' and o.name.startswith(('V5 ventana oriental ojival','V5 vano bajo posterior','V5 oculo posterior'))]
count=recess(bpy.data.objects['Nave central'],rear,(1,0,0),.8)
for wall in [o for o in s.objects if o.name.startswith('Nave lateral')]:
 lo,hi=bounds(wall);chosen=[]
 for ob in s.objects:
  if ob.type!='MESH' or not ob.name.startswith('V5 vano ala posterior'):continue
  a,b=bounds(ob)
  if lo[1]<(a[1]+b[1])/2<hi[1]:chosen.append(ob)
 count+=recess(wall,chosen,(1,0,0),.75)
stats['aberturas_posteriores_rehundidas']=count
# Remove exact duplicate side cornices and obsolete hidden construction prototypes.
seen=set();duplicates=0
for o in list(s.objects):
 if not o.name.startswith('Cornisa lateral'):continue
 key=tuple(round(v,4) for row in o.matrix_world for v in row)+tuple(round(v,4) for v in o.dimensions)
 if key in seen:bpy.data.objects.remove(o,do_unlink=True);duplicates+=1
 else:seen.add(key)
removed=0
for o in list(s.objects):
 if o.hide_render and o.name.startswith(('Copa foliar original','V2 prototipo follaje','V6 prototipo copa oculta','Alcorque amarillo')):bpy.data.objects.remove(o,do_unlink=True);removed+=1
bpy.data.orphans_purge(do_recursive=True)
stats.update(cornisas_duplicadas_retiradas=duplicates,prototipos_ocultos_retirados=removed)
for o in s.objects:
 if o.type=='LIGHT' and o.data.type=='SUN':o.data.energy=1.5;o.data.angle=math.radians(12)
for nd in s.world.node_tree.nodes:
 if nd.type=='BACKGROUND':nd.inputs['Strength'].default_value=.32
s.view_settings.exposure=.1;s['ultima_pasada_v7']=json.dumps(stats,ensure_ascii=False);s['estado']='V7: pasada visual contrastada con el recorte; pendientes ajustes y prueba dentro del motor del juego.'
json.dump(stats,open(B/'ultima_pasada_v7.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.render.resolution_x=1440;s.render.resolution_y=900;s.cycles.samples=64;s.cycles.use_denoising=True
assert count>=8 and len(posts)>=70 and all(i.packed_file for i in bpy.data.images if i.source=='FILE')
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
# Review one ground-level view and the matching return-shot camera before final rendering.
s.camera=bpy.data.objects['Recorrido_03_Bancas_y_Faroles'];s.render.resolution_x=960;s.render.resolution_y=600;s.cycles.samples=24;s.render.filepath=str(B/'Prueba_V7_Calle.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_x=576;s.render.resolution_y=1024;s.cycles.samples=24;s.render.filepath=str(B/'Prueba_V7_Video.png');bpy.ops.render.render(write_still=True)
print('V7_GEOMETRIA_Y_PRUEBAS_LISTAS',stats,flush=True)
