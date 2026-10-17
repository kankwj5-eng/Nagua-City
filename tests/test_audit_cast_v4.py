import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("v4audit",ROOT/"scripts/audit_cast_v4.py")
audit=importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AuditTests(unittest.TestCase):
 def test_detects_legacy_assets_and_animation_code(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d)
   src=root/"game/src/characters"
   src.mkdir(parents=True)
   (src/"old.js").write_text("const x=humanContainers; // CitizenAtlas\n"
                              "const y=packed48('humans');\n")
   findings=audit.audit(root)
   self.assertEqual(len(findings),3)
   self.assertEqual(len({x["categoria"] for x in findings}),3)

 def test_clean_cast_has_no_false_positives(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d)
   src=root/"game/src/characters"
   src.mkdir(parents=True)
   (src/"new.js").write_text("const ids=['01_mateo','02_ernesto'];\n"
                              "const x=scene.animationGroups;\n")
   self.assertEqual(audit.audit(root),[])


if __name__=="__main__":
 unittest.main()
