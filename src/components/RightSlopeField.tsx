"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

/* -------------------- Shaders -------------------- */
const vert = /* glsl */ `
  varying vec2 vUv;
  varying float vH;

  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform vec2  uFlowDir;     // flow direction in UV space
  uniform float uFlowSpeed;   // 0.0–0.12 looks good
  uniform float uWarp;        // domain warp amount
  uniform float uWarpFreq;    // warp frequency

  // hash/noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
           (c - a)*u.y*(1.0 - u.x) +
           (d - b)*u.x*u.y;
  }

  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){
      v += a * noise(p);
      p = p * 2.0 + 11.5;
      a *= 0.5;
    }
    return v;
  }

  // Ridged multifractal (sharper creases)
  float ridged(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){
      float n = noise(p);
      n = 1.0 - abs(2.0*n - 1.0); // ridge
      v += a * n;
      p = p * 2.0 + 17.3;
      a *= 0.5;
    }
    return v;
  }

  vec2 warp(vec2 p, float t){
    // two-phase warp for streaky flow
    float w1 = fbm(p * uWarpFreq + t*0.12);
    float w2 = fbm((p + 7.0) * (uWarpFreq*1.35) - t*0.08);
    vec2 w = vec2(w1, w2);
    return p + uWarp * (w - 0.5);
  }

  float heightAt(vec2 uv, float t){
    // advect along a direction for "flow"
    vec2 puv = uv + uFlowDir * (t * uFlowSpeed);

    // directional stretch to get elongated ridges
    mat2 stretch = mat2(1.0, 0.0, 0.0, 0.6);  // squeeze Y
    puv = stretch * puv;

    // domain warp before sampling
    vec2 q = warp(puv * uFreq, t);

    // blend fbm + ridged for both soft and sharp features
    float h = 0.55 * fbm(q) + 0.75 * ridged(q * 1.3);

    // bias to "lift" the right side
    h += smoothstep(0.35, 1.0, uv.x) * 0.28;
    return h;
  }

  void main(){
    vUv = uv;
    float t = uTime;

    float h = heightAt(uv, t);
    vH = h;

    vec3 pos = position;
    pos.z += h * uAmp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const frag = /* glsl */ `
  varying vec2 vUv;
  varying float vH;

  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform vec2  uFlowDir;
  uniform float uFlowSpeed;
  uniform float uWarp;
  uniform float uWarpFreq;

  uniform vec3 uColorLo;
  uniform vec3 uColorHi;
  uniform float uBloom;
  uniform float uSpec;       // specular strength
  uniform float uSpecPower;  // 16–64

  // Reuse noise helpers
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
           (c - a)*u.y*(1.0 - u.x) +
           (d - b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){
      v += a * noise(p);
      p = p * 2.0 + 11.5;
      a *= 0.5;
    }
    return v;
  }
  float ridged(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){
      float n = noise(p);
      n = 1.0 - abs(2.0*n - 1.0);
      v += a * n;
      p = p * 2.0 + 17.3;
      a *= 0.5;
    }
    return v;
  }
  vec2 warp(vec2 p, float t, float wf, float amt){
    float w1 = fbm(p * wf + t*0.12);
    float w2 = fbm((p + 7.0) * (wf*1.35) - t*0.08);
    return p + amt * (vec2(w1, w2) - 0.5);
  }
  float heightAt(vec2 uv, float t){
    vec2 puv = uv + uFlowDir * (t * uFlowSpeed);
    mat2 stretch = mat2(1.0, 0.0, 0.0, 0.6);
    puv = stretch * puv;
    vec2 q = warp(puv * uFreq, t, uWarpFreq, uWarp);
    float h = 0.55 * fbm(q) + 0.75 * ridged(q * 1.3);
    h += smoothstep(0.35, 1.0, uv.x) * 0.28;
    return h;
  }
  vec3 normalFromHeight(vec2 uv){
    float eps = max(0.002, 0.7 / (uFreq * 300.0)); // scale with freq/segments
    float t = uTime;

    float h  = heightAt(uv, t);
    float hx = heightAt(uv + vec2(eps, 0.0), t);
    float hy = heightAt(uv + vec2(0.0, eps), t);

    float dx = (hx - h) * uAmp;
    float dy = (hy - h) * uAmp;
    return normalize(vec3(-dx, -dy, 1.0));
  }

  void main(){
    // height ramp for color
    float shade = smoothstep(0.18, 0.92, vH);
    vec3 base = mix(uColorLo, uColorHi, shade);

    // lighting
    vec3 N = normalFromHeight(vUv);
    vec3 L = normalize(vec3(-0.25, 0.45, 1.0));   // from upper-left
    vec3 V = vec3(0.0, 0.0, 1.0);

    float diff = max(dot(N, L), 0.0);

    // specular highlights on ridges
    vec3 R = reflect(-L, N);
    float spec = pow(max(dot(R, V), 0.0), uSpecPower) * uSpec;

    // gentle rim on the right edge for slope feel
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0) * smoothstep(0.62, 1.02, vUv.x);

    vec3 col = base;
    col *= 0.42 + 0.85 * diff;
    col += spec;
    col += rim * 0.35;
    col += uBloom * pow(shade, 5.0);

    // fade into page on the left
    float vign = smoothstep(0.0, 0.4, vUv.x);
    float alpha = mix(0.0, 1.0, vign);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* -------------------- Mesh -------------------- */
function SlopeMesh() {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geo = useMemo(() => {
    // Dense tesselation = smoother slopes
    const g = new THREE.PlaneGeometry(8, 14, 320, 520);
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime:   { value: 0 },
      uAmp:    { value: 1.8 },                     // reduced height for subtler ridges
      uFreq:   { value: 2.2 },                     // reduced frequency for larger, slower features
      uWarp:   { value: 0.6 },                     // reduced warp for less chaotic movement
      uWarpFreq:{ value: 1.8 },                    // reduced warp frequency for slower warping
      uFlowDir:{ value: new THREE.Vector2(0.35, -1.0).normalize() }, // diagonal flow
      uFlowSpeed:{ value: 0.003 },                 // much slower flow speed
      uBloom:  { value: 0.7 },
      uSpec:   { value: 0.35 },                    // specular strength
      uSpecPower:{ value: 36.0 },                  // shininess
      uColorLo:{ value: new THREE.Color("#7dd3fc") }, // more vibrant light blue
      uColorHi:{ value: new THREE.Color("#1e40af") }, // richer deep blue
    }),
    []
  );

  return (
    <mesh geometry={geo} position={[3.2, 0, -4]}>
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* -------------------- Wrapper -------------------- */
export default function RightSlopeField() {
  return (
    <div
      className="pointer-events-none"
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        height: "100vh",
        width: "min(45vw, 760px)",
        overflow: "hidden",
        // Constrain to right side & softly fade into page
        maskImage: "linear-gradient(to left, black 42%, transparent 85%)",
        WebkitMaskImage: "linear-gradient(to left, black 42%, transparent 85%)",
      }}
      aria-hidden="true"
    >
      <Canvas
        // Transparent canvas so background shows through
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 6.5], fov: 35 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // fully transparent
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Lights aren't used by the shader, but harmless if left in */}
        <ambientLight intensity={0.8} />
        <SlopeMesh />
      </Canvas>
    </div>
  );
}