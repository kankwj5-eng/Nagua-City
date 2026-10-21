from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
from zipfile import ZipFile,ZIP_DEFLATED
import json
B=Path(__file__).parent;R=B.parent/'revision_v7';views=json.loads((B/'camaras_primera_persona.json').read_text());assert all(v['version_modelo']==8 for v in views)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22);small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',17)
sheet=Image.new('RGB',(1560,1675),'#102331');d=ImageDraw.Draw(sheet)
for i,v in enumerate(views):
 p=B/v['archivo'];Image.open(p).verify();im=Image.open(p).convert('RGB');assert im.size==(1440,900);x=20+(i%2)*770;y=60+(i//2)*550;sheet.paste(ImageOps.contain(im,(750,469)),(x,y));d.text((x,y-38),str(i+1)+'. '+v['vista'],font=font,fill='white')
sheet.save(B/'Recorrido_Primera_Persona.png')
comp=Image.new('RGB',(1200,1120),'#102331');d=ImageDraw.Draw(comp)
for x,path,label in [(12,R/'detalle_09.png','VIDEO APORTADO'),(612,B/'Vista_Video_V8.png','MODELO - REVISION V8')]:
 im=Image.open(path).convert('RGB');assert im.size==(576,1024);comp.paste(im,(x,50));d.text((x,16),label,font=font,fill='white')
d.text((12,1088),'Proporciones estimadas del video. Persisten diferencias; no es una replica exacta.',font=small,fill='#c4d9e2');comp.save(B/'Comparacion_con_video.png')
(B/'LEEME.md').write_text('''# Granada - revision V8

Proyecto Blender 4.2.3. Los renders proceden de esta escena 3D, sin retoques generativos. La referencia muestra Granada, Nicaragua. El proyecto representa el entorno de la catedral y La Calzada, no toda la ciudad.

Esta revision corrige la elevacion arbitraria de la cupula de V7: reduce la altura de la nave, conserva la fachada occidental, ajusta las naves laterales por separado y crea un basamento continuo entre la cubierta y el tambor. Se adosan los marcos laterales al muro y se reduce el retranqueo del vidrio a 15 cm. Se ensancha ligeramente el conjunto central y se da mas cuerpo a su linterna. La fachada posterior tiene ventanas redondas mas cortas, friso con oculos, fronton central curvo y cierres de las bovedas laterales. Son estimaciones visuales, sin levantamiento arquitectonico; persisten diferencias con el edificio real.

Los materiales conservan el grano y microrelieve previos y suman suciedad irregular en las tejas, depositos en canales concavos, manchas minerales, salpicaduras en zocalos y acumulacion bajo cornisas y aleros. El suelo recibe manchas discontinuas, sedimento junto a bordillos y fisuras finas; se anaden desconchados a la pintura del bordillo. La suciedad es procedural y geometrica, no procede de un escaneo del lugar.

## Uso e integracion

Abrir Granada_Video.blend para editar. No volver a ejecutar los scripts de modificacion sobre esta version: las transformaciones son acumulativas. Checkpoint_V7.blend, si existe localmente, es solo una copia de trabajo y no forma parte de la entrega.

La coleccion oculta 28 COLISIONES RECORRIDO PRINCIPAL contiene 266 proxies basicos. Colisiones_Granada.glb exporta solo esos proxies, actualizados para la altura de las naves; no es la version visual del escenario. Los extras role, source_object y collision_shape sirven al integrador para configurar cuerpos estaticos. El archivo no activa fisica automaticamente.

Continuan pendientes el horneado de materiales para el motor, exportacion visual, LOD, particion por zonas y pruebas de memoria, FPS y recorrido en el juego. Las colisiones no cubren todos los detalles de la nueva fachada. El control anterior del suelo por 479 rayos no equivale a una prueba dentro del motor.

## Reproduccion

Sobre un checkpoint V7 limpio: corregir_v8.py, despues alzado_v8.py y despues render_v8.py y cerrar_y_render_v8.py y remates_ventanas_v8.py y actualizar_dos_vistas_v8.py, abriendo el archivo guardado entre etapas. Estos scripts modifican materiales y geometria; render_v8.py tambien agrega sombreado de acumulacion bajo aleros. No ejecutarlos de nuevo sobre V8. Los scripts historicos incluidos documentan etapas previas.
''',encoding='utf-8')
(B/'LEEME_Recorrido.txt').write_text('Seis renders V8 de Granada a 1.70 m, 1440 x 900 px, Cycles 64 muestras. Se incluyen un detalle de la cupula y una comparacion con el video. Reconstruccion aproximada, no fotografia ni replica exacta.\n',encoding='utf-8')
photos=[v['archivo'] for v in views]+['Recorrido_Primera_Persona.png','Comparacion_con_video.png','Vista_Video_V8.png','Detalle_Cupula_V8.png','camaras_primera_persona.json','LEEME_Recorrido.txt']
with ZipFile(B/'Fotos_Primera_Persona_Granada.zip','w',ZIP_DEFLATED) as z:
 for fn in photos:z.write(B/fn,fn)
source=['Granada_Video.blend','LEEME.md','corregir_v8.py','alzado_v8.py','render_v8.py','cerrar_y_render_v8.py','remates_ventanas_v8.py','preparar_v8.py','revision_v8.json','Preparacion_Integracion.json','Colisiones_Granada.glb','construir.py','texturas_v4.py','realismo_v6.py','granada_osm.xml','referencias.json','Plano_Granada.png','Plano_Granada.svg','Pavimento_del_video.png']
with ZipFile(B/'Granada_Reconstruccion_Video.zip','w',ZIP_DEFLATED,compresslevel=6) as z:
 for fn in source+photos:z.write(B/fn,fn)
 for p in sorted(B.glob('*.py')):
  if p.name not in source:z.write(p,'scripts_anteriores/'+p.name)
 for p in sorted(R.glob('contacto_*.jpg')):z.write(p,'revision_video/'+p.name)
 for p in sorted(R.glob('detalle_*.png')):z.write(p,'referencia_video/'+p.name)
for fn in ['Fotos_Primera_Persona_Granada.zip','Granada_Reconstruccion_Video.zip']:
 with ZipFile(B/fn) as z:assert z.testzip() is None
previous=json.loads((B/'guardado_v7.json').read_text())['results'];uploads=[]
for r in previous:
 assert r['status']=='succeeded';uploads.append(dict(local_path=str(B/r['file_name']),purpose='replace_library_file',library_file_id=r['library_file_id'],expected_current_version=r['current_version_number'],version_reason='V8: proporcion y basamento de cupula, alzado posterior, desgaste de suelos, tejas y revoques'))
uploads.append(dict(local_path=str(B/'Detalle_Cupula_V8.png'),purpose='create_library_file',library_artifact_type='image'))
(B/'uploads_v8.json').write_text(json.dumps({'uploads':uploads},indent=2,ensure_ascii=False));print('V8_ENTREGA_VALIDADA',len(uploads),flush=True)
