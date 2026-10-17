"""Pruebas sin dependencias externas del importador selectivo de diez modelos."""
import importlib.util
import json
import struct
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("cast10", ROOT / "scripts/import_cast_v4.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def fake_glb(identifier, clips=None):
    actions = sorted(mod.REQUIRED_CLIPS)
    amount = 37 if identifier == "01_mateo" else 12
    names = clips or actions + [f"Clip_{i}" for i in range(amount-len(actions))]
    document = {"skins": [{"joints": list(range(79 if identifier == "01_mateo" else 52))}],
                "animations": [{"name": name} for name in names],
                "extensionsRequired": ["KHR_mesh_quantization"]}
    data = json.dumps(document).encode()
    data += b" " * ((4 - len(data) % 4) % 4)
    return b"glTF" + struct.pack("<4I", 2, 20 + len(data), len(data), 0x4E4F534A) + data


class CastTests(unittest.TestCase):
    def make_zip(self, location, broken=None):
        with zipfile.ZipFile(location, "w") as z:
            for identifier in mod.IDS:
                data = fake_glb(identifier, [] if broken == identifier else None)
                z.writestr(f"Personajes-Nicaragua-v4/models/{identifier}/{identifier}.glb", data)
                z.writestr(f"Personajes-Nicaragua-v4/models/{identifier}/{identifier}_LOD1.glb", b"not imported")

    def test_exactly_ten_no_lod1(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "input.zip"
            target = Path(d) / "output"
            self.make_zip(path)
            result = mod.stage(path, target)
            self.assertEqual(result["totalModelos"], 10)
            self.assertEqual(result["modelosLOD1Importados"], 0)
            self.assertEqual(len(list(target.glob("*.glb"))), 10)
            self.assertFalse(any("LOD1" in p.name for p in target.iterdir()))
            self.assertEqual(result["personajes"][0]["nombre"], "Mateo")
            self.assertEqual(sum(p["protagonista"] for p in result["personajes"]), 1)
            # Reimporting the same exact GLBs must not duplicate them.
            mod.stage(path, target)
            self.assertEqual(len(list(target.glob("*.glb"))), 10)

    def test_invalid_zip_cannot_leave_partial_assets(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "invalid.zip"
            target = Path(d) / "output"
            self.make_zip(path, broken="10_elena")
            with self.assertRaises(ValueError):
                mod.stage(path, target)
            self.assertFalse(target.exists())


if __name__ == "__main__":
    unittest.main()
