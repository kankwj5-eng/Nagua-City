"""Regresiones de clips y ruedas de ambas caponeras nuevas."""
import importlib.util,json,struct,unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("builder",ROOT/"scripts/build_traffic_canoneras_v4.py")
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)

def sample(key,wheels,steering,missing=False):
    nodes=[{"name":name} for name in (*wheels,*steering)]
    ids={n["name"]:i for i,n in enumerate(nodes)}
    clips=[{"name":"Rodar_"+name,"channels":[{"target":{"node":ids[name],"path":"rotation"}}]} for name in wheels]
    for side in ("Derecha","Izquierda"):
        clips.append({"name":"Direccion_"+side,"channels":[{"target":{"node":ids[name],"path":"rotation"}} for name in steering]})
    channels=[{"target":{"node":ids[steering[0]],"path":"rotation"}}]
    if key=="mototaxi-roja":
        nodes.append({"name":"Bandera_Nicaragua"})
        channels.append({"target":{"node":len(nodes)-1,"path":"weights"}})
    clips.append({"name":"Rodar_y_Doblar","channels":channels})
    if missing:clips.pop()
    document=json.dumps({"nodes":nodes,"animations":clips}).encode()
    document+=b" "*((-len(document))%4)
    return b"glTF"+struct.pack("<4I",2,20+len(document),len(document),0x4e4f534a)+document

class Caponeras(unittest.TestCase):
    def test_six_animations_per_caponera(self):
        for key,filename,_,wheels,steering in builder.CAPONERAS:
            data=sample(key,wheels,steering)
            row=builder.inspect_glb(key,filename,data,wheels,steering)
            self.assertEqual(len(row["animations"]),6)
            self.assertEqual(len(row["wheels"]),3)
            self.assertEqual(row["type"],"caponera")
        self.assertEqual(len(builder.VEHICLES),6)
    def test_reject_missing_anim(self):
        for key,filename,_,wheels,steering in builder.CAPONERAS:
            with self.assertRaises(ValueError):
                builder.inspect_glb(key,filename,sample(key,wheels,steering,True),wheels,steering)
    def test_reject_invalid_glb(self):
        key,filename,_,wheels,steering=builder.CAPONERAS[0]
        with self.assertRaises(ValueError):
            builder.inspect_glb(key,filename,b"no-glb",wheels,steering)

if __name__=="__main__":unittest.main()
