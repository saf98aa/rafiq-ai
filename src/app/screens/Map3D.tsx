import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Icon from '../../components/Icon';
import { l } from '../../data/content';
import { dests, floors, starts, type Dest, type FloorId } from '../../data/blueprint';
import wallsJson from '../../data/walls.json';
import { useStore } from '../../store';

/**
 * 3D REFERENCE VISUALISATION of the two approved floor plans (not an exact architectural model):
 *  - the floor is the original plan image itself (every room, corridor and entrance exactly as drawn);
 *  - walls are raised from the dark wall lines detected in that same image (scripts: walls.py → walls.json);
 *  - department volumes are the zones traced from the plan's coloured areas and printed labels;
 *  - the route follows the same corridor waypoints as the 2D map. Nothing is added that the plans do not show.
 * Wall height is illustrative — the plans carry no heights. Positions are simulated; no GPS / indoor positioning.
 */
type Rect = [number, number, number, number];
const WALLS = wallsJson as unknown as { cell: number; ground: Rect[]; first: Rect[] };
const K = 1 / 100; // plan pixels → scene units
const SLAB = 0.08;
const WALL_H = 0.16;
const ROUTE_Y = WALL_H + 0.06; // the route floats just above the walls so it is never hidden

const ZONE_COLORS: Record<string, string> = {
  reception: '#a07a5f',
  clinics: '#5aa5e6',
  lab: '#f0a35e',
  radiology: '#e86aa6',
  er: '#7cc35a',
  pedsClinic: '#5aa5e6',
  pedsEr: '#7cc35a',
  delivery: '#e8738a',
  nicu: '#3fb0a0',
  or: '#f0a35e',
  wards: '#7fb2ec',
};

type Theme = { bg: string; wall: string; texTint: string; route: string; halo: string; zoneSel: string; edge: string };
const THEMES: Record<'standard' | 'contrast' | 'dark', Theme> = {
  standard: { bg: '#efe8fb', wall: '#f7f4fc', texTint: '#ffffff', route: '#7b2fd6', halo: '#ffffff', zoneSel: '#9b6fe0', edge: '#4b1d7a' },
  contrast: { bg: '#ffffff', wall: '#3a3a3a', texTint: '#ffffff', route: '#000000', halo: '#ffe100', zoneSel: '#311452', edge: '#000000' },
  dark: { bg: '#140a24', wall: '#cbbfe0', texTint: '#bdb3cf', route: '#f49bb3', halo: '#140a24', zoneSel: '#9b6fe0', edge: '#e9dcff' },
};

type Label = { el: HTMLSpanElement; pos: THREE.Vector3 };

export default function Map3D({ floor, dest, onFail }: { floor: FloorId; dest: Dest | null; onFail: () => void }) {
  const { t, a11y, lang } = useStore();
  const host = useRef<HTMLDivElement>(null);
  const labelsHost = useRef<HTMLDivElement>(null);
  const api = useRef<{
    zoom: (f: number) => void;
    rotate: (a: number) => void;
    reset: () => void;
    top: (on: boolean) => void;
  } | null>(null);
  const [topView, setTopView] = useState(false);
  const [ready, setReady] = useState(false);
  const theme = THEMES[a11y.display];
  const still = a11y.motion;

  useEffect(() => {
    const el = host.current;
    const lh = labelsHost.current;
    if (!el || !lh) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    } catch {
      onFail();
      return;
    }
    const f = floors.find((x) => x.id === floor)!;
    const W = f.w * K;
    const H = f.h * K;
    const toW = (px: number, py: number, y = 0) => new THREE.Vector3(px * K - W / 2, y, py * K - H / 2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(theme.bg);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(theme.bg, 18, 40);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight('#ffffff', '#b9a8d6', 1.1));
    const sun = new THREE.DirectionalLight('#ffffff', 1.1);
    sun.position.set(-4, 10, 6);
    scene.add(sun);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

    // --- floor slab with the original plan image on top ---
    const tex = track(new THREE.TextureLoader().load(f.img, () => setReady(true)));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const side = track(new THREE.MeshLambertMaterial({ color: a11y.display === 'dark' ? '#2a1748' : '#d9cdeb' }));
    const top = track(new THREE.MeshBasicMaterial({ map: tex, color: theme.texTint }));
    const slab = new THREE.Mesh(track(new THREE.BoxGeometry(W, SLAB, H)), [side, side, top, side, side, side]);
    slab.position.y = -SLAB / 2;
    scene.add(slab);

    // --- walls raised from the plan's drawn wall lines ---
    const rects = WALLS[floor];
    const wallGeo = track(new THREE.BoxGeometry(1, 1, 1));
    const wallMat = track(new THREE.MeshLambertMaterial({ color: theme.wall }));
    const walls = new THREE.InstancedMesh(wallGeo, wallMat, rects.length);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    rects.forEach(([x, y, w, h], i) => {
      const c = toW(x + w / 2, y + h / 2, WALL_H / 2);
      m4.compose(c, q, new THREE.Vector3(Math.max(w, 2) * K, WALL_H, Math.max(h, 2) * K));
      walls.setMatrixAt(i, m4);
    });
    walls.instanceMatrix.needsUpdate = true;
    scene.add(walls);

    // --- department volumes (traced zones) ---
    const onFloor = dests.filter((d) => d.floor === floor);
    const pulse: THREE.MeshBasicMaterial[] = [];
    const labels: Label[] = [];
    lh.innerHTML = '';
    const addLabel = (pos: THREE.Vector3, html: string, cls: string) => {
      const s = document.createElement('span');
      s.className = `m3__lbl ${cls}`;
      s.innerHTML = html;
      lh.appendChild(s);
      labels.push({ el: s, pos });
    };
    const esc = (x: string) => x.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
    onFloor.forEach((d) => {
      const [x, y, w, h] = d.area;
      const sel = dest?.id === d.id;
      const zh = sel ? 0.42 : 0.07;
      const mat = track(
        new THREE.MeshBasicMaterial({ color: sel ? theme.zoneSel : ZONE_COLORS[d.id] ?? '#9b6fe0', transparent: true, opacity: sel ? 0.34 : 0.22, depthWrite: false })
      );
      const box = new THREE.Mesh(track(new THREE.BoxGeometry(w * K, zh, h * K)), mat);
      box.position.copy(toW(x + w / 2, y + h / 2, zh / 2 + 0.002));
      scene.add(box);
      if (sel) {
        pulse.push(mat);
        const edges = new THREE.LineSegments(track(new THREE.EdgesGeometry(box.geometry)), track(new THREE.LineBasicMaterial({ color: theme.edge })));
        edges.position.copy(box.position);
        scene.add(edges);
      }
      const name = d.name;
      const other = lang === 'ar' ? name.en : name.ar;
      addLabel(
        toW(d.anchor[0], d.anchor[1], sel ? 0.62 : 0.2),
        `<b lang="${lang}">${esc(t(name))}</b><small lang="${lang === 'ar' ? 'en' : 'ar'}" dir="${lang === 'ar' ? 'ltr' : 'rtl'}">${esc(other)}</small>`,
        sel ? 'is-sel' : ''
      );
    });

    // --- start marker ---
    const st = starts[floor];
    const startPos = toW(st.x, st.y, 0);
    const startMk = new THREE.Mesh(track(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 32)), track(new THREE.MeshBasicMaterial({ color: '#12a58a' })));
    startMk.position.copy(startPos).setY(0.03);
    scene.add(startMk);
    const ring = new THREE.Mesh(track(new THREE.RingGeometry(0.14, 0.2, 40)), track(new THREE.MeshBasicMaterial({ color: '#12a58a', transparent: true, opacity: 0.5, side: THREE.DoubleSide })));
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(startPos).setY(0.02);
    scene.add(ring);
    addLabel(startPos.clone().setY(0.35), `<i></i>${esc(t(st.label))}`, 'is-you');

    // --- route along the plan's corridors ---
    let walker: THREE.Mesh | null = null;
    let path: THREE.CurvePath<THREE.Vector3> | null = null;
    let pin: THREE.Group | null = null;
    if (dest && dest.floor === floor && dest.route) {
      path = new THREE.CurvePath<THREE.Vector3>();
      const pts = dest.route.map(([x, y]) => toW(x, y, ROUTE_Y));
      for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(pts[i - 1], pts[i]));
      const segs = Math.max(40, pts.length * 30);
      const halo = new THREE.Mesh(track(new THREE.TubeGeometry(path, segs, 0.062, 8, false)), track(new THREE.MeshBasicMaterial({ color: theme.halo })));
      const tube = new THREE.Mesh(track(new THREE.TubeGeometry(path, segs, 0.045, 8, false)), track(new THREE.MeshBasicMaterial({ color: theme.route })));
      // the halo sits underneath as an outline; the coloured route must stay on top or it disappears inside it
      halo.position.y = -0.035;
      tube.position.y = 0.035;
      scene.add(halo, tube);
      walker = new THREE.Mesh(track(new THREE.SphereGeometry(0.075, 20, 16)), track(new THREE.MeshBasicMaterial({ color: '#f49bb3' })));
      walker.position.copy(pts[0]).setY(ROUTE_Y + 0.09);
      scene.add(walker);
    }
    if (dest && dest.floor === floor) {
      pin = new THREE.Group();
      const cone = new THREE.Mesh(track(new THREE.ConeGeometry(0.1, 0.26, 24)), track(new THREE.MeshLambertMaterial({ color: '#e0445a' })));
      cone.rotation.x = Math.PI;
      const ball = new THREE.Mesh(track(new THREE.SphereGeometry(0.12, 24, 16)), track(new THREE.MeshLambertMaterial({ color: '#e0445a' })));
      ball.position.y = 0.2;
      pin.add(cone, ball);
      pin.position.copy(toW(dest.anchor[0], dest.area[1] + dest.area[3] / 2, 0.62));
      scene.add(pin);
    }

    // --- camera & controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.minDistance = 2.2;
    controls.maxDistance = 17;
    controls.maxPolarAngle = 1.22;
    controls.screenSpacePanning = false;
    controls.rotateSpeed = 0.7;
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

    const focus = (() => {
      if (dest && dest.floor === floor) {
        const xs = [...(dest.route ?? []).map((p) => p[0]), dest.area[0], dest.area[0] + dest.area[2]];
        const ys = [...(dest.route ?? []).map((p) => p[1]), dest.area[1], dest.area[1] + dest.area[3]];
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 260) * K;
        return { c: toW(cx, cy, 0), d: Math.min(14, span * 1.45 + 2.2) };
      }
      return { c: new THREE.Vector3(0, 0, 0), d: Math.max(W, H) * 1.25 };
    })();
    const goal = { target: focus.c.clone(), pos: new THREE.Vector3() };
    const place = (polar: number, azimuth: number, dist: number) =>
      new THREE.Vector3(Math.sin(polar) * Math.sin(azimuth), Math.cos(polar), Math.sin(polar) * Math.cos(azimuth)).multiplyScalar(dist).add(goal.target);
    goal.pos = place(topView ? 0.02 : 0.95, 0.35, focus.d);
    camera.position.copy(place(topView ? 0.02 : 1.1, 0.6, focus.d * 1.35));
    controls.target.copy(goal.target);
    let tween = 1;
    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();
    const animateTo = (pos: THREE.Vector3, target: THREE.Vector3) => {
      fromPos.copy(camera.position);
      fromTarget.copy(controls.target);
      goal.pos.copy(pos);
      goal.target.copy(target);
      tween = 0;
    };
    animateTo(goal.pos.clone(), goal.target.clone());

    api.current = {
      zoom: (k) => {
        const dir = camera.position.clone().sub(controls.target);
        const len = THREE.MathUtils.clamp(dir.length() * k, controls.minDistance, controls.maxDistance);
        animateTo(controls.target.clone().add(dir.setLength(len)), controls.target.clone());
      },
      rotate: (a) => {
        const off = camera.position.clone().sub(controls.target);
        off.applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
        animateTo(controls.target.clone().add(off), controls.target.clone());
      },
      reset: () => animateTo(place(0.95, 0.35, focus.d), focus.c.clone()),
      top: (on) => {
        const d = camera.position.distanceTo(controls.target);
        animateTo(on ? new THREE.Vector3(controls.target.x, controls.target.y + d, controls.target.z + 0.001) : place(0.95, 0.35, d), controls.target.clone());
      },
    };

    // --- size & render loop ---
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const v3 = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      if (tween < 1) {
        tween = Math.min(1, tween + dt / (still ? 0.01 : 0.85));
        const e = ease(tween);
        camera.position.lerpVectors(fromPos, goal.pos, e);
        controls.target.lerpVectors(fromTarget, goal.target, e);
      }
      controls.update();
      if (!still) {
        pulse.forEach((m) => (m.opacity = 0.26 + Math.sin(time * 2.4) * 0.1));
        ring.scale.setScalar(1 + ((time * 0.8) % 1) * 0.8);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - ((time * 0.8) % 1));
        if (pin) pin.position.y = 0.62 + Math.sin(time * 2.2) * 0.05;
        if (walker && path) walker.position.copy(path.getPointAt((time / 3.4) % 1)).setY(ROUTE_Y + 0.09);
      } else if (walker && path) walker.position.copy(path.getPointAt(1)).setY(ROUTE_Y + 0.09);
      renderer.render(scene, camera);
      const w = el.clientWidth;
      const h = el.clientHeight;
      for (const lb of labels) {
        v3.copy(lb.pos).project(camera);
        const off = v3.z > 1 || v3.x < -1.2 || v3.x > 1.2 || v3.y < -1.2 || v3.y > 1.2;
        lb.el.style.display = off ? 'none' : '';
        if (!off) lb.el.style.transform = `translate(-50%, -100%) translate(${((v3.x + 1) / 2) * w}px, ${((1 - v3.y) / 2) * h}px)`;
      }
    };
    loop();

    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      disposables.forEach((d) => d.dispose());
      walls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      lh.innerHTML = '';
      api.current = null;
    };
    // the scene is rebuilt when the floor, destination, language or display mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floor, dest?.id, lang, a11y.display, still]);

  useEffect(() => {
    api.current?.top(topView);
  }, [topView]);

  const onKey = (e: React.KeyboardEvent) => {
    const a = api.current;
    if (!a) return;
    const k: Record<string, () => void> = {
      '+': () => a.zoom(0.8),
      '=': () => a.zoom(0.8),
      '-': () => a.zoom(1.25),
      ArrowLeft: () => a.rotate(-0.35),
      ArrowRight: () => a.rotate(0.35),
      '0': () => a.reset(),
    };
    if (k[e.key]) {
      e.preventDefault();
      k[e.key]();
    }
  };

  return (
    <div className="m3">
      <div
        className="m3__view"
        ref={host}
        tabIndex={0}
        onKeyDown={onKey}
        role="application"
        aria-roledescription={t(l('خريطة ثلاثية الأبعاد', '3D map'))}
        aria-label={t(
          l(
            'خريطة ثلاثية الأبعاد مرجعية. اسحب بإصبع للتدوير، وبإصبعين للتكبير والتحريك، أو استخدم الأزرار. الأسهم للتدوير، و+ و- للتكبير.',
            'Reference 3D map. Drag with one finger to rotate, two fingers to zoom and move, or use the buttons. Arrow keys rotate; + and - zoom.'
          )
        )}
      >
        <div className="m3__labels" ref={labelsHost} aria-hidden="true" />
        {!ready && (
          <div className="m3__loading">
            <span className="m3__spin" />
            {t(l('جارٍ تجهيز الخريطة ثلاثية الأبعاد…', 'Preparing the 3D map…'))}
          </div>
        )}
      </div>
      <div className="m3__ctl" role="group" aria-label={t(l('التحكم في الخريطة', 'Map controls'))}>
        <button onClick={() => api.current?.zoom(0.75)} aria-label={t(l('تكبير', 'Zoom in'))}>
          <Icon name="plus" size={18} />
        </button>
        <button onClick={() => api.current?.zoom(1.33)} aria-label={t(l('تصغير', 'Zoom out'))}>
          <Icon name="minus" size={18} />
        </button>
        <button onClick={() => api.current?.rotate(lang === 'ar' ? 0.5 : -0.5)} aria-label={t(l('تدوير', 'Rotate'))}>
          <Icon name="orbit" size={17} />
        </button>
        <button className={topView ? 'is-on' : ''} onClick={() => setTopView((x) => !x)} aria-pressed={topView} aria-label={t(l('منظر علوي', 'Top view'))}>
          <Icon name="layers" size={17} />
        </button>
        <button onClick={() => (setTopView(false), api.current?.reset())} aria-label={t(l('إعادة ضبط المنظر', 'Reset view'))}>
          <Icon name="scan" size={17} />
        </button>
      </div>
      <span className="m3__badge">
        <Icon name="cube" size={13} />
        {t(l('تصوّر مرجعي ثلاثي الأبعاد', '3D reference visualisation'))}
      </span>
    </div>
  );
}
