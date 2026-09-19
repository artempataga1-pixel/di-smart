"""Export Apple's exact USD geometry through OpenUSD's transform evaluation.
No simplification or invented surfaces. Normals and UV seams are preserved.
Requires usd-core; run from any directory.
"""
from pathlib import Path
import json,struct,math
from pxr import Usd,UsdGeom,Gf
root=Path(__file__).resolve().parents[2]
stage=Usd.Stage.Open(str(root/'public/media/iphone-18-pro/apple/iphone-web.usdz'))
gltf={'asset':{'version':'2.0','generator':'OpenUSD geometry export for Di-SMART'},'scene':0,'scenes':[{'nodes':[]}],'nodes':[],'meshes':[],'buffers':[{}],'bufferViews':[],'accessors':[]}
binary=bytearray();counts={'meshes':0,'triangles':0}
def attribute(values,size,kind):
 while len(binary)%4:binary.append(0)
 offset=len(binary);flat=[float(v) for row in values for v in row]
 binary.extend(struct.pack('<'+'f'*len(flat),*flat));view=len(gltf['bufferViews']);gltf['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(flat)*4,'target':34962})
 obj={'bufferView':view,'componentType':5126,'count':len(values),'type':'VEC'+str(size)}
 if kind=='POSITION':obj.update(min=[min(v[i] for v in values) for i in range(size)],max=[max(v[i] for v in values) for i in range(size)])
 i=len(gltf['accessors']);gltf['accessors'].append(obj);return i
for prim in stage.Traverse():
 if prim.GetTypeName()!='Mesh' or UsdGeom.Imageable(prim).ComputeVisibility()=='invisible':continue
 mesh=UsdGeom.Mesh(prim);points=mesh.GetPointsAttr().Get();indices=mesh.GetFaceVertexIndicesAttr().Get();faces=mesh.GetFaceVertexCountsAttr().Get()
 matrix=UsdGeom.Xformable(prim).ComputeLocalToWorldTransform(0);normal_matrix=matrix.GetInverse().GetTranspose()
 pv=UsdGeom.PrimvarsAPI(prim);normals=pv.GetPrimvar('normals');uv=pv.GetPrimvar('st');normal_values=normals.ComputeFlattened() if normals else mesh.GetNormalsAttr().Get();uv_values=uv.ComputeFlattened() if uv else None
 normal_interp=normals.GetInterpolation() if normals else mesh.GetNormalsInterpolation();uv_interp=uv.GetInterpolation() if uv else None
 positions=[];out_normals=[];out_uv=[];cursor=0
 for face_index,count in enumerate(faces):
  if count not in (3,4):raise ValueError('Unexpected topology: '+prim.GetName())
  for corner in range(1,count-1):
   corners=[cursor,cursor+corner,cursor+corner+1]
   if mesh.GetOrientationAttr().Get()=='leftHanded':corners.reverse()
   for face_vertex in corners:
    vertex=indices[face_vertex];position=matrix.Transform(Gf.Vec3d(points[vertex]));positions.append([v*.01 for v in position])
    if normal_values:
     ni=face_vertex if normal_interp=='faceVarying' else vertex if normal_interp in ('vertex','varying') else face_index if normal_interp=='uniform' else 0
     normal=normal_matrix.TransformDir(Gf.Vec3d(normal_values[ni])).GetNormalized();out_normals.append(list(normal))
    if uv_values:
     ti=face_vertex if uv_interp=='faceVarying' else vertex if uv_interp in ('vertex','varying') else face_index if uv_interp=='uniform' else 0
     out_uv.append(list(uv_values[ti]))
  cursor+=count
 triangle_count=len(positions)//3
 unique={};vertex_positions=[];vertex_normals=[];vertex_uv=[];element_indices=[]
 for k,position in enumerate(positions):
  key=tuple(position)+(tuple(out_normals[k]) if out_normals else ())+(tuple(out_uv[k]) if out_uv else ())
  if key not in unique:
   unique[key]=len(vertex_positions);vertex_positions.append(position)
   if out_normals:vertex_normals.append(out_normals[k])
   if out_uv:vertex_uv.append(out_uv[k])
  element_indices.append(unique[key])
 attrs={'POSITION':attribute(vertex_positions,3,'POSITION')}
 if vertex_normals:attrs['NORMAL']=attribute(vertex_normals,3,'NORMAL')
 if vertex_uv:attrs['TEXCOORD_0']=attribute(vertex_uv,2,'TEXCOORD_0')
 while len(binary)%4:binary.append(0)
 offset=len(binary);short=len(vertex_positions)<65536;fmt='H' if short else 'I'
 binary.extend(struct.pack('<'+fmt*len(element_indices),*element_indices))
 view=len(gltf['bufferViews']);gltf['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(element_indices)*(2 if short else 4),'target':34963})
 index_accessor=len(gltf['accessors']);gltf['accessors'].append({'bufferView':view,'componentType':5123 if short else 5125,'count':len(element_indices),'type':'SCALAR'})
 i=len(gltf['meshes']);gltf['meshes'].append({'name':prim.GetName(),'primitives':[{'attributes':attrs,'indices':index_accessor,'mode':4}]});gltf['nodes'].append({'name':prim.GetName(),'mesh':i});gltf['scenes'][0]['nodes'].append(i)
 counts['meshes']+=1;counts['triangles']+=len(positions)//3
while len(binary)%4:binary.append(0)
gltf['buffers'][0]['byteLength']=len(binary);header=json.dumps(gltf,separators=(',',':')).encode()
while len(header)%4:header+=b' '
output=struct.pack('<4sII',b'glTF',2,12+8+len(header)+8+len(binary))+struct.pack('<I4s',len(header),b'JSON')+header+struct.pack('<I4s',len(binary),b'BIN\0')+binary
(root/'public/media/iphone-18-pro/apple/iphone-geometry.glb').write_bytes(output)
print(counts,'bytes',len(output))
