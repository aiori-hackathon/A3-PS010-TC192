import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface GlassContextType {
  triggerShatter: () => void;
  triggerBack: () => void;
  isShattered: boolean;
  webGlSupported: boolean;
}

const GlassContext = createContext<GlassContextType>({
  triggerShatter: () => {},
  triggerBack: () => {},
  isShattered: false,
  webGlSupported: true,
});

export const useGlass = () => useContext(GlassContext);

export const ShatteredGlassEngine: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isShattered, setIsShattered] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References for imperative control
  const shatterRef = useRef<() => void>(() => {});
  const backRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL support
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    let W = window.innerWidth;
    let H = window.innerHeight;
    let isPhone = W <= 640;

    let marginSide = isPhone ? 16 : W * 0.055;
    let marginTop = isPhone ? 16 : H * 0.085;
    let blockWidth = W - 2 * marginSide;
    let blockHeight = H - 2 * marginTop;
    let S = blockWidth / 1730;

    let navHeight = blockHeight * 0.108;
    let gap = 14 * S;
    let panelHeight = blockHeight - navHeight - gap;
    let panelWidth = blockWidth;

    let appState: 'HERO' | 'SHATTERING' | 'METHODOLOGY' | 'ASSEMBLING' = 'HERO';
    let animStartTime = 0;

    // Pointer state
    const pointer = {
      x: 0,
      y: 0,
      active: false,
      worldPos: new THREE.Vector3(0, 0, 0),
      panelNormX: 0.5,
      panelNormY: 0.5,
    };

    let currentTiltX = 0;
    let currentTiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);

    // Camera: 1 world unit = 1 CSS pixel at z = 0
    const fov = 30;
    const camera = new THREE.PerspectiveCamera(fov, W / H, 10, 10000);
    const updateCameraDistance = () => {
      const dist = H / 2 / Math.tan(((fov * Math.PI) / 180) / 2);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
    };
    updateCameraDistance();

    // Environment map via PMREM RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.42;

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xdbe8ff, 1.4);
    keyLight.position.set(-W * 0.4, H * 0.6, 500);
    scene.add(keyLight);

    const ambientLight = new THREE.AmbientLight(0x10131d, 0.75);
    scene.add(ambientLight);

    const slabGroup = new THREE.Group();
    scene.add(slabGroup);

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2(-999, -999);

    // --- Glass Material with Lavender Cursor Glow ---
    const pointerWorldUniform = new THREE.Vector3(0, 0, 0);
    const pointerGlowUniform = { value: 0.0 };

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x17171b,
      roughness: 0.36,
      metalness: 0.0,
      clearcoat: 0.75,
      clearcoatRoughness: 0.12,
      specularIntensity: 0.7,
      specularColor: new THREE.Color(0xffffff),
      transmission: 0.0,
      iridescence: 0.55,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [250, 650],
      envMapIntensity: 1.0,
    });

    glassMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uPointerWorld = { value: pointerWorldUniform };
      shader.uniforms.uPointerGlow = pointerGlowUniform;
      shader.uniforms.uS = { value: S };

      shader.vertexShader = `
        varying vec3 vWorldPos;
        ${shader.vertexShader}
      `.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

      shader.fragmentShader = `
        uniform vec3 uPointerWorld;
        uniform float uPointerGlow;
        uniform float uS;
        varying vec3 vWorldPos;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
         float pDist = distance(vWorldPos.xy, uPointerWorld.xy);
         float pGlow = exp(-1.6 * pow(pDist / (300.0 * uS), 2.0)) * 0.16 * uPointerGlow;
         vec3 lavenderGlow = vec3(0.55, 0.48, 1.0) * pGlow;
         gl_FragColor.rgb += lavenderGlow;`
      );
    };

    // --- Polygon Inset & Rounded Corner Helpers ---
    const getPolygonArea = (pts: number[][]) => {
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
      }
      return area * 0.5;
    };

    const insetPolygon = (pts: number[][], inset: number) => {
      const n = pts.length;
      const isCCW = getPolygonArea(pts) > 0;
      const normals: number[][] = [];
      const tangents: number[][] = [];

      for (let i = 0; i < n; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const len = Math.hypot(dx, dy) || 1e-6;
        const tx = dx / len;
        const ty = dy / len;
        tangents.push([tx, ty]);
        normals.push(isCCW ? [-ty, tx] : [ty, -tx]);
      }

      const insetPts: number[][] = [];
      for (let i = 0; i < n; i++) {
        const prev = (i - 1 + n) % n;
        const [tx1, ty1] = tangents[prev];
        const [nx1, ny1] = normals[prev];
        const [tx2, ty2] = tangents[i];
        const [nx2, ny2] = normals[i];
        const p1_shift = [pts[i][0] + nx1 * inset, pts[i][1] + ny1 * inset];
        const p2_shift = [pts[i][0] + nx2 * inset, pts[i][1] + ny2 * inset];
        const D = tx1 * ty2 - ty1 * tx2;
        if (Math.abs(D) > 1e-5) {
          const s = ((p2_shift[0] - p1_shift[0]) * ty2 - (p2_shift[1] - p1_shift[1]) * tx2) / D;
          insetPts.push([p1_shift[0] + s * tx1, p1_shift[1] + s * ty1]);
        } else {
          insetPts.push([pts[i][0] + (nx1 + nx2) * 0.5 * inset, pts[i][1] + (ny1 + ny2) * 0.5 * inset]);
        }
      }
      return insetPts;
    };

    const createRoundedShape = (insetPts: number[][], radius: number) => {
      const n = insetPts.length;
      const shape = new THREE.Shape();
      const corners: Array<{ pCurr: number[]; q1: number[]; q2: number[] }> = [];

      for (let i = 0; i < n; i++) {
        const prev = (i - 1 + n) % n;
        const next = (i + 1) % n;
        const pPrev = insetPts[prev];
        const pCurr = insetPts[i];
        const pNext = insetPts[next];

        const v1 = [pPrev[0] - pCurr[0], pPrev[1] - pCurr[1]];
        const v2 = [pNext[0] - pCurr[0], pNext[1] - pCurr[1]];
        const len1 = Math.hypot(v1[0], v1[1]) || 1e-6;
        const len2 = Math.hypot(v2[0], v2[1]) || 1e-6;
        const u1 = [v1[0] / len1, v1[1] / len1];
        const u2 = [v2[0] / len2, v2[1] / len2];

        const dot = Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]));
        const halfAngle = Math.acos(dot) * 0.5;
        let cutBack = radius / Math.tan(halfAngle);
        const maxCutBack = Math.min(len1 * 0.45, len2 * 0.45);
        if (cutBack > maxCutBack) cutBack = maxCutBack;

        corners.push({
          pCurr,
          q1: [pCurr[0] + u1[0] * cutBack, pCurr[1] + u1[1] * cutBack],
          q2: [pCurr[0] + u2[0] * cutBack, pCurr[1] + u2[1] * cutBack],
        });
      }

      shape.moveTo(corners[0].q2[0], corners[0].q2[1]);
      for (let i = 0; i < n; i++) {
        const nextIdx = (i + 1) % n;
        shape.lineTo(corners[nextIdx].q1[0], corners[nextIdx].q1[1]);
        shape.quadraticCurveTo(
          corners[nextIdx].pCurr[0],
          corners[nextIdx].pCurr[1],
          corners[nextIdx].q2[0],
          corners[nextIdx].q2[1]
        );
      }
      shape.closePath();
      return shape;
    };

    const getExtrudeSettings = () => ({
      depth: 13 * S,
      bevelEnabled: true,
      bevelThickness: 2.6 * S,
      bevelSize: 2.6 * S,
      bevelSegments: 3,
      curveSegments: 8,
    });

    // --- Shards Definition ---
    const baseCutPoints: Record<string, [number, number]> = {
      TL: [0, 0],
      TR: [1, 0],
      BL: [0, 1],
      BR: [1, 1],
      tAB: [0.22, 0],
      tBC: [0.515, 0],
      tCE: [0.84, 0],
      bAD: [0.34, 1],
      bDE: [0.865, 1],
      J0: [0.385, 0.72],
      J1: [0.48, 0.62],
      J2: [0.716, 0.49],
    };

    const driftParams: Record<string, { wx: number; px: number; wy?: number; py?: number }> = {
      tAB: { wx: 0.35, px: 1.2 },
      tBC: { wx: 0.28, px: 2.7 },
      tCE: { wx: 0.42, px: 0.5 },
      bAD: { wx: 0.31, px: 3.1 },
      bDE: { wx: 0.24, px: 4.2 },
      J0: { wx: 0.38, px: 0.8, wy: 0.32, py: 1.9 },
      J1: { wx: 0.29, px: 2.1, wy: 0.41, py: 0.4 },
      J2: { wx: 0.45, px: 4.8, wy: 0.26, py: 3.3 },
    };

    const shardDefs = [
      { id: 'A', keys: ['TL', 'tAB', 'J0', 'bAD', 'BL'] },
      { id: 'B', keys: ['tAB', 'tBC', 'J1', 'J0'] },
      { id: 'C', keys: ['tBC', 'tCE', 'J2', 'J1'] },
      { id: 'D', keys: ['J0', 'J1', 'J2', 'bDE', 'bAD'] },
      { id: 'E', keys: ['tCE', 'TR', 'BR', 'bDE', 'J2'] },
    ];

    interface ShardInstance {
      def: { id: string; keys: string[] };
      group: THREE.Group;
      glassMesh: THREE.Mesh;
      mat: THREE.MeshPhysicalMaterial;
    }

    const shardObjects: ShardInstance[] = [];

    const createShardInstance = (def: { id: string; keys: string[] }, index: number): ShardInstance => {
      const group = new THREE.Group();
      group.userData = {
        isShard: true,
        index,
        id: def.id,
        z: 0,
        vz: 0,
        tipX: 0,
        tipY: 0,
        hovered: false,
        scatterVel: new THREE.Vector3(),
        rotAxis: new THREE.Vector3(
          Math.sin(index * 1.7) * 2,
          Math.cos(index * 2.3) * 2,
          Math.sin(index * 3.1)
        ).normalize(),
        rotSpeed: 2.0 + Math.random() * 1.6,
        flyZ: 420 * S + Math.random() * 380 * S,
        stagger: 0.03 * (index + 1),
      };

      const mat = glassMaterial.clone();
      const glassMesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
      group.add(glassMesh);
      slabGroup.add(group);

      return { def, group, glassMesh, mat };
    };

    shardDefs.forEach((def, i) => {
      shardObjects.push(createShardInstance(def, i));
    });

    // --- Floating Navigation Glass Slab ---
    const navGroup = new THREE.Group();
    navGroup.userData = {
      isNav: true,
      z: 0,
      vz: 0,
      tipX: 0,
      tipY: 0,
      hovered: false,
      scatterVel: new THREE.Vector3(0, 300 * S, 0),
      rotAxis: new THREE.Vector3(1, 0.2, 0).normalize(),
      rotSpeed: 2.2,
      flyZ: 500 * S,
      stagger: 0,
    };
    const navMat = glassMaterial.clone();
    const navGlassMesh = new THREE.Mesh(new THREE.BufferGeometry(), navMat);
    navGroup.add(navGlassMesh);
    slabGroup.add(navGroup);

    const buildNavGeometry = () => {
      const nw = blockWidth;
      const nh = navHeight;
      const r = 20 * S;
      const inset = 7 * S;

      const shape = new THREE.Shape();
      const hw = (nw - inset * 2) / 2;
      const hh = (nh - inset * 2) / 2;

      shape.moveTo(-hw + r, -hh);
      shape.lineTo(hw - r, -hh);
      shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
      shape.lineTo(hw, hh - r);
      shape.quadraticCurveTo(hw, hh, hw - r, hh);
      shape.lineTo(-hw + r, hh);
      shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
      shape.lineTo(-hw, -hh + r);
      shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

      navGlassMesh.geometry.dispose();
      navGlassMesh.geometry = new THREE.ExtrudeGeometry(shape, getExtrudeSettings());

      const topY = blockHeight / 2;
      navGroup.position.set(0, topY - navHeight / 2, 0);
    };

    // --- Rebuilding Dynamic Shards ---
    const computeLiveCutPoints = (timeSec: number) => {
      const pts: Record<string, [number, number]> = {
        TL: [...baseCutPoints.TL],
        TR: [...baseCutPoints.TR],
        BL: [...baseCutPoints.BL],
        BR: [...baseCutPoints.BR],
      };

      ['tAB', 'tBC', 'tCE', 'bAD', 'bDE'].forEach((k) => {
        const d = driftParams[k];
        const base = baseCutPoints[k];
        pts[k] = [base[0] + 0.02 * Math.sin(timeSec * d.wx + d.px), base[1]];
      });

      ['J0', 'J1', 'J2'].forEach((k) => {
        const d = driftParams[k];
        const base = baseCutPoints[k];
        pts[k] = [
          base[0] + 0.02 * Math.sin(timeSec * d.wx + d.px),
          base[1] + 0.035 * Math.sin(timeSec * (d.wy || 0.3) + (d.py || 0)),
        ];
      });

      if (pointer.active && appState === 'HERO') {
        const mx = pointer.panelNormX;
        const my = pointer.panelNormY;
        Object.keys(pts).forEach((k) => {
          if (k === 'TL' || k === 'TR' || k === 'BL' || k === 'BR') return;
          const p = pts[k];
          const dx = p[0] - mx;
          const dy = p[1] - my;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.6 && dist > 1e-4) {
            const push = 0.04 * Math.pow(1 - dist / 0.6, 2);
            p[0] += (dx / dist) * push;
            if (k.startsWith('t')) p[1] = 0;
            else if (k.startsWith('b')) p[1] = 1;
            else p[1] += (dy / dist) * push;
          }
        });
      }

      return pts;
    };

    const rebuildShardGeometries = (livePoints: Record<string, [number, number]>) => {
      const gapInset = 7 * S;
      const cornerR = 20 * S;
      const extrudeSettings = getExtrudeSettings();

      shardObjects.forEach((shard) => {
        const keys = shard.def.keys;
        const poly = keys.map((k) => {
          const pt = livePoints[k];
          return [(pt[0] - 0.5) * panelWidth, (0.5 - pt[1]) * panelHeight];
        });

        let cx = 0;
        let cy = 0;
        poly.forEach((p) => {
          cx += p[0];
          cy += p[1];
        });
        cx /= poly.length;
        cy /= poly.length;
        const len = Math.hypot(cx, cy) || 1;
        shard.group.userData.scatterVel.set(
          (cx / len) * (400 * S + Math.random() * 200 * S),
          (cy / len) * (300 * S) - 150 * S,
          0
        );

        const inset = insetPolygon(poly, gapInset);
        const shape = createRoundedShape(inset, cornerR);
        shard.glassMesh.geometry.dispose();
        shard.glassMesh.geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const topY = blockHeight / 2;
        const panelCenterY = topY - navHeight - gap - panelHeight / 2;
        if (appState === 'HERO') {
          shard.group.position.y = panelCenterY;
        }
      });
    };

    buildNavGeometry();
    rebuildShardGeometries(computeLiveCutPoints(0));

    // Initial fly-in entrance
    appState = 'ASSEMBLING';
    animStartTime = performance.now();

    // Trigger Functions
    shatterRef.current = () => {
      if (appState !== 'HERO') return;
      appState = 'SHATTERING';
      animStartTime = performance.now();
      setIsShattered(true);
    };

    backRef.current = () => {
      if (appState !== 'METHODOLOGY') return;
      appState = 'ASSEMBLING';
      animStartTime = performance.now();
      setIsShattered(false);
    };

    // --- Pointer Events ---
    const onPointerMove = (e: PointerEvent) => {
      pointer.active = true;
      pointer.x = (e.clientX / W) * 2 - 1;
      pointer.y = -(e.clientY / H) * 2 + 1;
      mouseNDC.x = pointer.x;
      mouseNDC.y = pointer.y;

      const vec = new THREE.Vector3(pointer.x, pointer.y, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      pointer.worldPos.copy(camera.position).add(dir.multiplyScalar(distance));
      pointerWorldUniform.copy(pointer.worldPos);

      const topY = blockHeight / 2;
      const panelTopY = topY - navHeight - gap;
      pointer.panelNormX = (pointer.worldPos.x + panelWidth / 2) / panelWidth;
      pointer.panelNormY = (panelTopY - pointer.worldPos.y) / panelHeight;

      targetTiltY = (pointer.x * 7.0 - 1.2) * (Math.PI / 180);
      targetTiltX = (-pointer.y * 5.5 + 0.8) * (Math.PI / 180);
    };

    const onPointerLeave = () => {
      pointer.active = false;
      targetTiltX = 0;
      targetTiltY = 0;
      mouseNDC.set(-999, -999);
    };

    const onWindowResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      isPhone = W <= 640;

      marginSide = isPhone ? 16 : W * 0.055;
      marginTop = isPhone ? 16 : H * 0.085;
      blockWidth = W - 2 * marginSide;
      blockHeight = H - 2 * marginTop;
      S = blockWidth / 1730;

      navHeight = blockHeight * 0.108;
      gap = 14 * S;
      panelHeight = blockHeight - navHeight - gap;
      panelWidth = blockWidth;

      camera.aspect = W / H;
      updateCameraDistance();
      camera.updateProjectionMatrix();

      renderer.setSize(W, H);
      buildNavGeometry();
      rebuildShardGeometries(computeLiveCutPoints(performance.now() * 0.001));
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onWindowResize);

    // --- Animation Loop ---
    let animId = 0;
    let lastTime = performance.now();
    let lastGeomRebuild = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const timeSec = now * 0.001;

      // 1. Tilt
      const easeTilt = 1 - Math.exp(-dt / 0.3);
      currentTiltX += (targetTiltX - currentTiltX) * easeTilt;
      currentTiltY += (targetTiltY - currentTiltY) * easeTilt;
      slabGroup.rotation.x = currentTiltX;
      slabGroup.rotation.y = currentTiltY;

      // 2. Cursor glow
      const targetGlow = pointer.active ? 1.0 : 0.0;
      pointerGlowUniform.value += (targetGlow - pointerGlowUniform.value) * (1 - Math.exp(-dt / 0.15));

      // 3. Rebuild dynamic cut geometry (~45 fps)
      if (appState === 'HERO' && now - lastGeomRebuild > 22) {
        lastGeomRebuild = now;
        rebuildShardGeometries(computeLiveCutPoints(timeSec));
      }

      // 4. Raycast Hover
      let hoveredGroup: THREE.Object3D | null = null;
      if (pointer.active && appState === 'HERO') {
        raycaster.setFromCamera(mouseNDC, camera);
        const intersectables = [navGlassMesh, ...shardObjects.map((s) => s.glassMesh)];
        const hits = raycaster.intersectObjects(intersectables, false);
        if (hits.length > 0) {
          hoveredGroup = hits[0].object.parent;
        }
      }

      // 5. Spring Physics
      const allPieces = [navGroup, ...shardObjects.map((s) => s.group)];
      allPieces.forEach((group) => {
        const u = group.userData;
        const isHovered = group === hoveredGroup;
        u.hovered = isHovered;

        if (appState === 'HERO') {
          const targetZ = isHovered ? (u.isNav ? 32 * S : 48 * S) : 0;
          let targetTipX = 0;
          let targetTipY = 0;
          if (isHovered) {
            const dx = pointer.worldPos.x - group.position.x;
            const dy = pointer.worldPos.y - group.position.y;
            targetTipY = Math.max(-0.24, Math.min(0.24, (dx / (panelWidth * 0.5)) * 0.24));
            targetTipX = Math.max(-0.24, Math.min(0.24, (-dy / (panelHeight * 0.5)) * 0.24));
          }

          const fz = -170 * (u.z - targetZ) - 19 * u.vz;
          u.vz += fz * dt;
          u.z += u.vz * dt;
          group.position.z = u.z;

          u.tipX += (targetTipX - u.tipX) * (1 - Math.exp(-dt / 0.12));
          u.tipY += (targetTipY - u.tipY) * (1 - Math.exp(-dt / 0.12));
          group.rotation.x = u.tipX;
          group.rotation.y = u.tipY;

          const mat = u.isNav ? navMat : shardObjects[u.index].mat;
          const targetIrid = isHovered ? 1.0 : 0.55;
          const targetEnv = isHovered ? 1.9 : 1.0;
          mat.iridescence += (targetIrid - mat.iridescence) * (1 - Math.exp(-dt / 0.15));
          mat.envMapIntensity += (targetEnv - mat.envMapIntensity) * (1 - Math.exp(-dt / 0.15));
        }
      });

      // 6. Transitions: Shatter & Assemble
      if (appState === 'SHATTERING') {
        const elapsed = (now - animStartTime) / 1000;
        const duration = 0.72;

        allPieces.forEach((group) => {
          const u = group.userData;
          const tPiece = Math.max(0, (elapsed - u.stagger) / duration);
          if (tPiece > 0) {
            const ease = Math.min(Math.pow(tPiece, 3), 4);
            const baseCenterY = u.isNav
              ? blockHeight / 2 - navHeight / 2
              : blockHeight / 2 - navHeight - gap - panelHeight / 2;
            group.position.x = u.scatterVel.x * ease;
            group.position.y = baseCenterY + u.scatterVel.y * ease - 400 * S * ease * ease;
            group.position.z = u.flyZ * ease;

            group.rotation.x = u.rotAxis.x * u.rotSpeed * ease;
            group.rotation.y = u.rotAxis.y * u.rotSpeed * ease;
            group.rotation.z = u.rotAxis.z * u.rotSpeed * ease;
          }
        });

        if (elapsed >= duration + 0.15) {
          appState = 'METHODOLOGY';
        }
      } else if (appState === 'ASSEMBLING') {
        const elapsed = (now - animStartTime) / 1000;
        const duration = 0.72;

        allPieces.forEach((group) => {
          const u = group.userData;
          const tPiece = Math.max(0, (elapsed - u.stagger) / duration);
          if (tPiece < 1) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const inv = 1 - tPiece;
            const ease = 1 - (c3 * Math.pow(inv, 3) - c1 * Math.pow(inv, 2));
            const rev = 1 - ease;

            const baseCenterY = u.isNav
              ? blockHeight / 2 - navHeight / 2
              : blockHeight / 2 - navHeight - gap - panelHeight / 2;
            group.position.x = u.scatterVel.x * rev;
            group.position.y = baseCenterY + u.scatterVel.y * rev - 400 * S * rev * rev;
            group.position.z = u.flyZ * rev;

            group.rotation.x = u.rotAxis.x * u.rotSpeed * rev;
            group.rotation.y = u.rotAxis.y * u.rotSpeed * rev;
            group.rotation.z = u.rotAxis.z * u.rotSpeed * rev;
          } else {
            const baseCenterY = u.isNav
              ? blockHeight / 2 - navHeight / 2
              : blockHeight / 2 - navHeight - gap - panelHeight / 2;
            group.position.set(0, baseCenterY, 0);
            group.rotation.set(0, 0, 0);
            u.z = 0;
            u.vz = 0;
          }
        });

        if (elapsed >= duration + 0.1) {
          appState = 'HERO';
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
    };
  }, []);

  return (
    <GlassContext.Provider
      value={{
        triggerShatter: () => shatterRef.current(),
        triggerBack: () => backRef.current(),
        isShattered,
        webGlSupported,
      }}
    >
      {/* 3D WebGL Canvas Layer */}
      <canvas
        ref={canvasRef}
        id="shattered-glass-canvas"
        className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      />

      {/* Methodology Paper View (Shattered State) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 overflow-y-auto bg-[#050507]/95 backdrop-blur-3xl p-6 sm:p-12 flex flex-col justify-center items-center ${
          isShattered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-3xl w-full my-auto space-y-8 relative">
          {/* Back button sliver */}
          <button
            onClick={() => backRef.current()}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-[#17171B]/90 border border-white/20 text-white hover:text-[#B9ABFF] hover:border-[#8C7BFF]/50 transition-all shadow-[0_4px_24px_rgba(140,123,255,0.15)] text-xs font-mono mb-2"
          >
            <span>&larr; Reassemble Workspace</span>
          </button>

          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#8C7BFF] uppercase block mb-1.5 font-semibold">
              Explainable Network Intelligence Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              NetEvidence AI &mdash; Seven Core Principles
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A0AA] mt-1.5 leading-relaxed">
              Transparent, evidence-fused IP network-type classification combining autonomous telemetry with explainable rule-fusion.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl backdrop-blur-xl bg-[#17171B]/70 border border-white/[0.08] hover:border-[#8C7BFF]/30 transition-all">
              <h3 className="text-xs font-mono font-semibold text-white mb-1">
                1. Multi-Source Telemetry Ingestion
              </h3>
              <p className="text-xs text-[#A0A0AA] leading-relaxed">
                Asynchronously extracts Autonomous System Numbers (ASN), BGP prefix announcements, reverse DNS PTR hostnames, and WHOIS org handles without leaking private ranges.
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-xl bg-[#17171B]/70 border border-white/[0.08] hover:border-[#8C7BFF]/30 transition-all">
              <h3 className="text-xs font-mono font-semibold text-white mb-1">
                2. RFC 1918 / 6598 Deterministic Guardrails
              </h3>
              <p className="text-xs text-[#A0A0AA] leading-relaxed">
                Local loopback, CGNAT (100.64.0.0/10), and RFC 1918 private scopes are verified locally with instantaneous 100% confidence, guaranteeing zero external DNS leakage.
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-xl bg-[#17171B]/70 border border-white/[0.08] hover:border-[#8C7BFF]/30 transition-all">
              <h3 className="text-xs font-mono font-semibold text-white mb-1">
                3. Normalized Feature Vector Scoring
              </h3>
              <p className="text-xs text-[#A0A0AA] leading-relaxed">
                Raw strings from PTR, BGP AS-names, and routing tables undergo keyword pattern matching (cable, dsl, static, aws, dynamic, gprs) to score class vectors.
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-xl bg-[#17171B]/70 border border-white/[0.08] hover:border-[#8C7BFF]/30 transition-all">
              <h3 className="text-xs font-mono font-semibold text-white mb-1">
                4. Cross-Signal Contradiction Resolution
              </h3>
              <p className="text-xs text-[#A0A0AA] leading-relaxed">
                Detects anomalies such as residential PTR hostnames hosted inside cloud hypervisor datacenters, flagging high-risk proxy and VPN tunnel exit nodes.
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-xl bg-[#17171B]/70 border border-white/[0.08] hover:border-[#8C7BFF]/30 transition-all">
              <h3 className="text-xs font-mono font-semibold text-white mb-1">
                5. Calibrated Confidence Index
              </h3>
              <p className="text-xs text-[#A0A0AA] leading-relaxed">
                Calculates weighted consensus across available sensors with penalization for missing or contradictory sources, ensuring analysts never receive overconfident guesses.
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-xl bg-[#17171B]/70 border border-white/[0.08] hover:border-[#8C7BFF]/30 transition-all">
              <h3 className="text-xs font-mono font-semibold text-white mb-1">
                6. Transparent &ldquo;Why?&rdquo; Explainability
              </h3>
              <p className="text-xs text-[#A0A0AA] leading-relaxed">
                Every classified IP provides human-readable attribution rules, matching token highlights, and source contribution weights for audit and court compliance.
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-xl bg-[#17171B]/70 border border-white/[0.08] hover:border-[#8C7BFF]/30 transition-all">
              <h3 className="text-xs font-mono font-semibold text-white mb-1">
                7. Tamper-Evident SHA-256 Audit Ledger
              </h3>
              <p className="text-xs text-[#A0A0AA] leading-relaxed">
                All investigations are hashed into an immutable append-only ledger with timestamp, target hash, and analyst identity for regulatory forensics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Application DOM Layer */}
      <div className="relative z-10">{children}</div>
    </GlassContext.Provider>
  );
};
