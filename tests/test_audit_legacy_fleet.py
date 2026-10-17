import importlib.util,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("fleet_audit",ROOT/"scripts/audit_legacy_fleet.py")
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class FleetAuditTests(unittest.TestCase):
    def test_detects_old_fleet_and_motorbike_motions(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);folder=root/"game/src/vehicles";folder.mkdir(parents=True)
            (folder/"old.js").write_text(
                "const vehicleAssets={};\n"
                "function createTemplates(){}\n"
                "humanRide(p,v);\n"
                "const animation='RidePulsar';\n"
                "const model='boxer';\n"
                "bike46(v);\n",encoding="utf8")
            found=module.audit(root)
            self.assertEqual(len(found),6)
            self.assertEqual(set(x["categoria"] for x in found),set(module.PATTERNS))
    def test_does_not_remove_shared_physics(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);folder=root/"game/src/vehicles";folder.mkdir(parents=True)
            (folder/"new.js").write_text(
                "function drive(vehicle,dt){vehicle.speed+=dt;}\n"
                "const physics={friction:.8,gravity:9.81};",encoding="utf8")
            self.assertEqual(module.audit(root),[])
if __name__=="__main__":unittest.main()
