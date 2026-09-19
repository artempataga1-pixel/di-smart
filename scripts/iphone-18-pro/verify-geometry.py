"""Regression check: web geometry retains every USD mesh at its authored world position."""
from pathlib import Path
import json,struct,math
from pxr import Usd,UsdGeom,Gf
root=Path(__file__).resolve().parents[2]
data=(root/'public/media/iphone-18-pro/apple/iphone-geometry.glb').read_bytes()
length=struct.unpack_from('<I',data,12)[0];gltf=json.loads(data[20:20+length]);binary_start=20+length+8
stage=Usd.Stage.Open(str(root/'public/media/iphone-18-pro/apple/iphone-web.usdz'))
expected={p.GetName():p for p in stage.Traverse() if p.GetTypeName()=='Mesh' and UsdGeom.Imageable(p).ComputeVisibility()!='invisible'}
assert len(gltf['meshes'])==len(expected)==94
triangles=0;worst=0
for item in gltf['meshes']:
 prim=expected.pop(item['name']);mesh=UsdGeom.Mesh(prim);matrix=UsdGeom.Xformable(prim).ComputeLocalToWorldTransform(0)
 points=[matrix.Transform(Gf.Vec3d(p))*.01 for p in mesh.GetPointsAttr().Get()]
 primitive=item['primitives'][0];accessor=gltf['accessors'][primitive['attributes']['POSITION']]
 position_view=gltf['bufferViews'][accessor['bufferView']]
 position_values=struct.unpack_from('<'+'f'*(accessor['count']*3),data,binary_start+position_view['byteOffset'])
 for key,fn in [('min',min),('max',max)]:
  for axis in range(3):
   error=abs(fn(position_values[axis::3])-fn(p[axis] for p in points));worst=max(error,worst);assert error<1e-7,(item['name'],key,axis,error)
 normal=gltf['accessors'][primitive['attributes']['NORMAL']];assert normal['count']==accessor['count']
 view=gltf['bufferViews'][normal['bufferView']];offset=binary_start+view['byteOffset'];floats=struct.unpack_from('<'+'f'*(normal['count']*3),data,offset)
 for k in range(0,len(floats),3):assert abs(sum(v*v for v in floats[k:k+3])-1)<1e-4
 triangles+=gltf['accessors'][primitive['indices']]['count']//3
assert not expected and triangles==70003
print(f'PASS: 94 meshes, {triangles} triangles, unit normals; maximum bound error {worst:.2g} m')
