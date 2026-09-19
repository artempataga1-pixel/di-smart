import * as THREE from 'three';

/** Preserve the three distinct optical assemblies from the source model, including aperture blades. */
export function refineCameraOptics(model:THREE.Object3D) {
  model.traverse(node=>{
    const mesh=node as THREE.Mesh;if(!mesh.isMesh)return;
    const material=mesh.material as THREE.MeshPhysicalMaterial;
    if(material.name==='JledLPXRPXpnGDQ') {
      // Match apparent lens size through the source's transparent optical stack.
      // Three's alpha-blended covers do not reproduce the source renderer's magnification.
      const magnification=mesh.name==='NWcSDiJMCdsakCS'?2.3:mesh.name==='SFGqndkrQBwIqsK'?.75:1.15;
      mesh.geometry.computeBoundingBox();const center=mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
      mesh.scale.set(magnification,magnification,1);mesh.position.x+=(1-magnification)*center.x;mesh.position.y+=(1-magnification)*center.y;
      material.metalness=.35;material.roughness=.16;material.clearcoat=.15;
      material.envMapIntensity=.2;material.emissiveMap=material.map;
      material.emissive.set('#b1acff');material.emissiveIntensity=mesh.name==='SFGqndkrQBwIqsK'?.55:.8;
    }
    if(material.name==='rWTUuVcPAAIaxme'&&!['TSnGjOfascDNZUr','KNduBXMjGgxuHKf'].includes(mesh.name)){
      material.color.set('#12131b');material.opacity=.045;material.clearcoat=.15;material.envMapIntensity=.2;material.specularColor.set('#8991d0');material.iridescence=.7;material.iridescenceThicknessRange=[280,430];
    }
    if(material.name==='FGiOncfTbhplOxD') {material.metalness=0;material.roughness=.5;material.specularIntensity=.025;material.clearcoat=0;}
    if(['NJtxhMpxfaBshfC','NZtZZWsItDhUsxA','nUqwlgVifodlmux'].includes(material.name)) {
      const opticalName=material.name;
      // Reset inherited USD optical parameters before applying an absorbing baffle.
      const absorbing=new THREE.MeshPhysicalMaterial({color:'#08090b',roughness:.65,metalness:0,specularIntensity:0});
      material.copy(absorbing);material.name=opticalName;absorbing.dispose();
      material.color.set(material.name==='NZtZZWsItDhUsxA'?'#0b0c0f':'#030405');
      material.map=null;material.roughnessMap=null;material.metalnessMap=null;material.metalness=0;material.roughness=.65;material.clearcoat=0;material.specularIntensity=0;material.envMapIntensity=0;
    }
  });
}
