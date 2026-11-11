// Interactive hospital map data, built from the real architectural drawings in `hospital-blueprints`.
//
// Source audit (all files are PNG images):
//  - sit_plan.png ............................ campus site plan; the highlighted building is "مستشفى الولادة" (maternity hospital)
//  - sit_plan_ground floor(.png / 2.png) ..... ground floor colour plan + functional (adjacency) diagram  → public-facing, used for routes
//  - sit_plan2.png / sit_plan_basement ....... basement services plan + diagram  → pharmacy location only (no route between floors is shown)
//  - sit_plan_fristfloor / functional 2 ...... first floor (delivery, newborn, operating, inpatient rooms) → view only
//  - second / fourth floor ................... inpatient rooms and suites → not used (no patient destinations)
//
// Department areas are traced from the colour-coded plans. Routes only follow corridor/hall areas (pale yellow on the plan)
// and only connect spaces the functional diagram shows as connected. Nothing here is a real-time position.
import type { L } from './content';

const l = (ar: string, en: string): L => ({ ar, en });

export type FloorId = 'ground' | 'basement' | 'first';
export type DestId = 'reception' | 'clinics' | 'lab' | 'radiology' | 'er' | 'pharmacy';

export type Floor = {
  id: FloorId;
  label: L;
  short: L;
  img: string;
  w: number;
  h: number;
  note: L;
};

export const floors: Floor[] = [
  {
    id: 'ground',
    label: l('الطابق الأرضي', 'Ground floor'),
    short: l('الأرضي', 'Ground'),
    img: './media/plans/ground.webp',
    w: 830,
    h: 770,
    note: l('الأقسام التي يراجعها المرضى: الاستقبال، العيادات، عينات المعامل، الموجات فوق الصوتية، والطوارئ.', 'Patient-facing departments: reception, clinics, lab samples, ultrasound and emergency.'),
  },
  {
    id: 'basement',
    label: l('طابق القبو', 'Basement'),
    short: l('القبو', 'Basement'),
    img: './media/plans/basement.webp',
    w: 805,
    h: 740,
    note: l('طابق خدمات. تظهر عليه الصيدلية؛ ولا يوضح المخطط الطريق بين الطوابق.', 'A services floor. The pharmacy is shown here; the plan does not show the way between floors.'),
  },
  {
    id: 'first',
    label: l('الطابق الأول', 'First floor'),
    short: l('الأول', 'First'),
    img: './media/plans/first.webp',
    w: 900,
    h: 730,
    note: l('أقسام التنويم والعمليات — للعرض فقط، ولا توجد عليه وجهات لمراجعي العيادات.', 'Inpatient and surgical areas — view only, with no outpatient destinations.'),
  },
];

export type Dest = {
  id: DestId;
  floor: FloorId;
  icon: string;
  name: L; // patient-friendly name
  planName: L; // label as written on the drawing
  area: [number, number, number, number]; // x, y, w, h in floor-image pixels
  anchor: [number, number];
  route: [number, number][] | null; // null = location only (route not verifiable from the plans)
};

/** Simulated demo position: the west hall by the women's entrance (ground floor). */
export const youAreHere = { floor: 'ground' as FloorId, x: 200, y: 262, label: l('موقعك التجريبي', 'Your demo location') };

export const dests: Dest[] = [
  {
    id: 'reception',
    floor: 'ground',
    icon: 'desk',
    name: l('الاستقبال', 'Reception'),
    planName: l('استقبال وملفات الزوار', 'Reception & visitor files'),
    area: [272, 302, 215, 95],
    anchor: [380, 350],
    route: [
      [200, 262],
      [200, 295],
      [290, 295],
      [290, 312],
    ],
  },
  {
    id: 'clinics',
    floor: 'ground',
    icon: 'stethoscope',
    name: l('العيادات', 'Clinics'),
    planName: l('عيادة الأم والطفل', 'Mother & child clinic'),
    area: [362, 192, 126, 106],
    anchor: [425, 245],
    route: [
      [200, 262],
      [200, 180],
      [425, 180],
      [425, 196],
    ],
  },
  {
    id: 'lab',
    floor: 'ground',
    icon: 'flask',
    name: l('المختبر', 'Laboratory'),
    planName: l('عينات المعامل', 'Lab samples'),
    area: [500, 300, 140, 140],
    anchor: [570, 370],
    route: [
      [200, 262],
      [200, 180],
      [575, 180],
      [575, 295],
      [570, 306],
    ],
  },
  {
    id: 'radiology',
    floor: 'ground',
    icon: 'scan',
    name: l('الموجات فوق الصوتية', 'Ultrasound'),
    planName: l('غرف فوق الصوت', 'Ultrasound rooms'),
    area: [500, 45, 300, 130],
    anchor: [640, 112],
    route: [
      [200, 262],
      [200, 180],
      [600, 180],
      [600, 166],
    ],
  },
  {
    id: 'er',
    floor: 'ground',
    icon: 'activity',
    name: l('الطوارئ', 'Emergency'),
    planName: l('طوارئ الأطفال والنساء', "Children's & women's emergency"),
    area: [270, 45, 220, 125],
    anchor: [380, 105],
    route: [
      [200, 262],
      [200, 180],
      [380, 180],
      [380, 166],
    ],
  },
  {
    id: 'pharmacy',
    floor: 'basement',
    icon: 'pill',
    name: l('الصيدلية', 'Pharmacy'),
    planName: l('الصيدلية', 'Pharmacy'),
    area: [430, 175, 135, 115],
    anchor: [497, 232],
    route: null,
  },
];

export const destById = (id: DestId) => dests.find((d) => d.id === id)!;

export const routeLength = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
