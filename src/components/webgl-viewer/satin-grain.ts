import * as THREE from 'three';

/** Physical-size, filtered micrograin shared by satin metal/paint housings, buttons and surrounds. */
export function addSatinGrain(material: THREE.MeshPhysicalMaterial, strength = 1) {
  material.onBeforeCompile = shader => {
    shader.uniforms.phoneGrainStrength = { value: strength };
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPhoneSurface;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvPhoneSurface = position;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vPhoneSurface;
      uniform float phoneGrainStrength;
      float phoneHash(vec3 p) {
        p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);
      }
      float phoneNoise(vec3 p) {
        vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(mix(phoneHash(i),phoneHash(i+vec3(1,0,0)),f.x),mix(phoneHash(i+vec3(0,1,0)),phoneHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(phoneHash(i+vec3(0,0,1)),phoneHash(i+vec3(1,0,1)),f.x),mix(phoneHash(i+vec3(0,1,1)),phoneHash(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
      float phoneGrain(vec3 p) {
        float footprint=max(length(dFdx(p)),length(dFdy(p)));
        float coarse=1.0-smoothstep(.45,1.3,footprint*5500.0);
        float fine=1.0-smoothstep(.4,1.2,footprint*9500.0);
        return (phoneNoise(p*5500.0)-.5)*coarse*.75+(phoneNoise(p*9500.0)-.5)*fine*.25;
      }
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float satinGrain=phoneGrain(vPhoneSurface)*phoneGrainStrength;
      diffuseColor.rgb *= 1.0 + satinGrain*.3;
    `).replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+satinGrain*.16,.22,.8);
    `).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
      vec3 r1=cross(sy,normal),r2=cross(normal,sx);
      float det=dot(sx,r1);
      vec3 grainGradient=sign(det)*(dFdx(satinGrain)*r1+dFdy(satinGrain)*r2)*.000012;
      normal=normalize(abs(det)*normal-grainGradient);
    `);
  };
  material.customProgramCacheKey = () => `phone-satin-v3-${strength}`;
}
