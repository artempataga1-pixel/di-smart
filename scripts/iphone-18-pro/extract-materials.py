"""Extract linear USD surface values and stable mesh bindings. Requires usd-core."""
import json
from pathlib import Path
from pxr import Usd, UsdShade
root = Path(__file__).resolve().parents[2]
stage = Usd.Stage.Open(str(root / 'public/media/iphone-18-pro/apple/iphone-web.usdz'))
materials, bindings = {}, {}
for prim in stage.Traverse():
    if prim.GetTypeName() == 'Material':
        shader = UsdShade.Material(prim).ComputeSurfaceSource()[0]
        values = {}
        for inp in shader.GetInputs():
            value = inp.Get()
            if value is not None:
                try: values[inp.GetBaseName()] = list(value)
                except TypeError: values[inp.GetBaseName()] = value
        materials[prim.GetName()] = values
    elif prim.GetTypeName() == 'Mesh':
        targets = prim.GetRelationship('material:binding').GetTargets()
        if targets: bindings[prim.GetName()] = targets[0].name
out = root / 'src/app/iphone-18-pro/phone-material-data.json'
out.write_text(json.dumps({'materials':materials,'bindings':bindings},indent=2)+'\n')
print(f'{len(materials)} materials, {len(bindings)} mesh bindings')
