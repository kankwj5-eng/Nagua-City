#!/usr/bin/env python3
"""Inventario de dependencias del parque vehicular antiguo.

No modifica el juego. --strict se activará al concluir el reemplazo total.
Se registran también consumidores de APIs compartidas que requieren migración.
"""
from __future__ import annotations
import argparse,json,re
from pathlib import Path

PATTERNS={
 "catalogo_antiguo":r"\bvehicleAssets\b|\bINTEGRATED\.vehicles\b|asset-vehicles|loadAsset\(['\"]vehicles['\"]\)",
 "fabricacion_anterior":r"\b(createTemplates|expandVehicleVariants|createVehicle|installFleet)\s*\(",
 "personas_en_motos":r"\b(installRiders26|humanRide|solveHumanRide24|riderPose|riderVisibility24)\s*\(|RidePulsar|RideBoxer",
 "mallas_motos_anteriores":r"\b(bike46|motorcycleModel|installMotorcycle|buildMoto)\s*\(",
 "identificadores_modelos_anteriores":r"['\"](?:pulsar|boxer|discover|delivery|trail|yamaha|taypan|lc300|prado|alto|sedan|suv|taxi|pickup4x4|hatch)['\"]",
}
REGEX={name:re.compile(expr,re.I) for name,expr in PATTERNS.items()}
SCAN=("game/src","performance","scripts")

def audit(root:Path):
    findings=[]
    for directory in SCAN:
        folder=root/directory
        if not folder.is_dir():continue
        for p in sorted(folder.rglob("*")):
            if p.suffix not in (".js",".py") or p.name.startswith(("audit_legacy_fleet","clean_legacy_media")):continue
            try:text=p.read_text(encoding="utf8")
            except UnicodeDecodeError:continue
            for lineno,line in enumerate(text.splitlines(),1):
                for name,pattern in REGEX.items():
                    if pattern.search(line):
                        findings.append({
                            "ruta":str(p.relative_to(root)),
                            "linea":lineno,"categoria":name
                        })
    return findings

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--strict",action="store_true")
    args=parser.parse_args()
    issues=audit(args.repo)
    categories={cat:sum(x["categoria"]==cat for x in issues) for cat in REGEX}
    print(json.dumps({
        "referenciasAnteriores":len(issues),
        "archivos":len(set(x["ruta"] for x in issues)),
        "categorias":categories,"detalles":issues,
        "limpiezaTerminada":len(issues)==0,
    },ensure_ascii=False,indent=2))
    if issues and args.strict:raise SystemExit(2)
if __name__=="__main__":main()
