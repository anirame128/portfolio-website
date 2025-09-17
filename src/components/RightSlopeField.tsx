"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";

/* -------------------- Shaders (tweaked for right) -------------------- */
const vert = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;
  varying float vH;

  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform vec2  uFlowDir;     // flow direction in UV space
  uniform float uFlowSpeed;   // 0.0–0.12 looks good
  uniform float uWarp;        // domain warp amount
  uniform float uWarpFreq;    // warp frequency
  uniform float uFade;

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
    for(int i=0;i<4;i++){
      v += a * noise(p);
      p = p * 2.0 + 11.5;
      a *= 0.5;
    }
    return v;
  }

  // Ridged multifractal (sharper creases)
  float ridged(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<4;i++){
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

    // ⬇️ was (1.0 - uv.y) for "bottom lift"; switch to uv.x for "right lift"
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
precision mediump float;

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
  uniform float uFade;

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
    for(int i=0;i<4;i++){
      v += a * noise(p);
      p = p * 2.0 + 11.5;
      a *= 0.5;
    }
    return v;
  }
  float ridged(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<4;i++){
      float n = noise(p);
      n = 1.0 - abs(2.0*n - 1.0);
      v += a * n;
      p = p * 2.0 + 17.3;
      a *= 0.5;
    }
    return v;
  }

  // --- edge mask helpers ---
  float edgeNoise(vec2 uv, float t) {
    // two bands of FBM with different scales, animated
    float n1 = fbm(vec2(uv.x * 3.0 + t * 0.07, t * 0.03));
    float n2 = fbm(vec2((uv.x + 5.0) * 7.0 - t * 0.05, (uv.y + 2.0) * 2.0));
    return mix(n1, n2, 0.45); // richer pattern
  }

  // Returns 0..1 opacity with wispy ridges along the LEFT edge
  float leftEdgeMask(vec2 uv){
    // base fade (left -> transparent, right -> opaque)
    float base = uv.x;

    // animated noise to make the line irregular
    float n = edgeNoise(uv, uTime);

    // use surface height to pull ridges up where vH is larger
    // (more 'cloud' poking into the black)
    float ridgeBoost = smoothstep(0.35, 0.9, vH) * uv.x;

    // threshold: tune 0.10, 0.35 band and 0.18..0.22 amounts to taste
    float t = base + 0.18 * (n - 0.5) + 0.22 * ridgeBoost;

    return smoothstep(0.10, 0.38, t);
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
    // ⬇️ right emphasis
    h += smoothstep(0.35, 1.0, uv.x) * 0.28;
    return h;
  }
  void main(){
    // single height sample + derivative normals for performance
    float h = heightAt(vUv, uTime);
    float shade = smoothstep(0.18, 0.92, h);
    vec3 base = mix(uColorLo, uColorHi, shade);

    // screen-space gradient of height (much faster than manual finite differences)
    float dx = dFdx(h) * uAmp;
    float dy = dFdy(h) * uAmp;
    vec3 N = normalize(vec3(-dx, -dy, 1.0));

    vec3 L = normalize(vec3(-0.25, 0.45, 1.0));
    vec3 V = vec3(0.0, 0.0, 1.0);

    float diff = max(dot(N, L), 0.0);
    vec3 R = reflect(-L, N);
    float spec = pow(max(dot(R, V), 0.0), uSpecPower) * uSpec;

    // ⬇️ rim near the right edge instead of bottom edge
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0) * smoothstep(0.62, 1.02, vUv.x);

    vec3 col = base;
    col *= 0.42 + 0.85 * diff;
    col += spec * uFade;
    col += rim * 0.35;
    col += uBloom * uFade * pow(shade, 5.0);

    // organic, noisy left fade instead of CSS mask
    float alpha = leftEdgeMask(vUv);
    
    // apply fade to both color and alpha
    col = mix(vec3(0.0), col, uFade);
    alpha *= uFade;
    
    // early discard to reduce overdraw in wispy regions
    if (alpha < 0.015) discard;

    gl_FragColor = vec4(col, alpha);
  }
`;

/* -------------------- Mesh -------------------- */
function SlopeMesh({ shouldAnimate }: { shouldAnimate: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { width: vw } = useThree((s) => s.viewport); // world-units width at z=0

  const geo = useMemo(() => {
    // Tall & narrow for a right ribbon
    return new THREE.PlaneGeometry(8, 18, 320, 520);
  }, []);

  // simple eased ramp over ~0.5s
  const startRef = useRef<number | null>(null);
  const DURATION = 0.5; // seconds

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;

      if (shouldAnimate) {
        // first-frame set
        if (startRef.current === null) startRef.current = t;
        const u = Math.min(1, (t - startRef.current) / DURATION);

        // easeInOutCubic
        const eased = u < 0.5 ? 4*u*u*u : 1 - Math.pow(-2*u + 2, 3) / 2;

        mat.current.uniforms.uFade.value = eased;
      } else {
        // Reset animation when shouldAnimate is false
        startRef.current = null;
        mat.current.uniforms.uFade.value = 0;
      }
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime:   { value: 0 },
      uAmp:    { value: 1.8 },                     // reduced height for subtler ridges
      uFreq:   { value: 2.2 },                     // reduced frequency for larger, slower features
      uWarp:   { value: 0.6 },                     // reduced warp for less chaotic movement
      uWarpFreq:{ value: 1.8 },                    // reduced warp frequency for slower warping
      uFlowDir:{ value: new THREE.Vector2(1.0, 0.15).normalize() }, // rightward flow with slight upward drift
      uFlowSpeed:{ value: 0.003 },                 // much slower flow speed
      uBloom:  { value: 0.7 },
      uSpec:   { value: 0.35 },                    // specular strength
      uSpecPower:{ value: 36.0 },                  // shininess
      uColorLo:{ value: new THREE.Color("#a855f7") }, // vibrant purple
      uColorHi:{ value: new THREE.Color("#ec4899") }, // hot pink
      uFade:   { value: 0.0 },
    }),
    []
  );

  // scaleY so plane covers the whole viewport height, with generous bleed for ultra-tall screens
  const scaleY = (vw / 8) * 2.2;

  return (
    // Centered vertically; nudged to right edge
    <mesh geometry={geo} position={[3.2, 0, -4]} scale={[1, scaleY, 1]}>
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

/* -------------------- Wrapper (right aligned) -------------------- */
export default function RightSlopeField({ shouldAnimate = true }: { shouldAnimate?: boolean }) {
  return (
    <div
      className="pointer-events-none fixed right-0 top-0"
      style={{
        height: "100vh",
        width: "min(60vw, 800px)",
        overflow: "hidden",
        // ❌ removed CSS mask - now using organic shader-based fade
      }}
      aria-hidden="true"
    >
      <Canvas
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6.5], fov: 35 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* Lights aren't used by the shader, but harmless if left in */}
        <ambientLight intensity={0.8} />
        <SlopeMesh shouldAnimate={shouldAnimate} />
      </Canvas>
    </div>
  );
}
