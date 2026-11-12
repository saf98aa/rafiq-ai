// Interactive hospital map data, built ONLY from the two updated plans in `hospital-blueprints`:
//
//   sit_plan_ground floor_ai.png ........................ ground floor (functional analysis)
//   sit_plan_fristfloor_functional asalysis_ai.png ...... first floor (functional analysis)
//
// The previous plans (sit_plan.png, sit_plan2.png, basement, older ground/first drawings) are no longer used.
// Web copies are cropped to the drawing area (legend/title removed): public/media/plans/ground-ai.webp, first-ai.webp.
//
// What the plans show, and how it is used here:
//  - Department areas are traced from the coloured zones and printed labels of each plan.
//  - Routes follow only the pale-yellow corridors/halls ("ممرات / Corridors" in the legend).
//  - Elevators ("المصاعد") are marked only on the first-floor legend, so first-floor routes start at a marked elevator.
//    The ground-floor plan does not mark elevators, so no route between floors is drawn.
//  - The pharmacy does not appear on either plan → it is listed without a location (no invented position).
//  - Two labels on the ground-floor plan disagree with its legend (blue "عيادة الأم" is captioned "Pain Clinic";
//    pink "غرف صور تخصصي / Specialized Imaging Rooms" is listed in the legend as "غرف فائقة الصوت / Isolation Rooms").
//    The map shows the label printed on the zone itself.
// Nothing here is a real-time position.
import type { L } from './content';

const l = (ar: string, en: string): L => ({ ar, en });

export type FloorId = 'ground' | 'first';
export type DestId = 'reception' | 'clinics' | 'lab' | 'radiology' | 'er' | 'pedsClinic' | 'pedsEr' | 'delivery' | 'nicu' | 'or' | 'wards' | 'pharmacy';

export type Floor = {
  id: FloorId;
  label: L;
  short: L;
  img: string;
  w: number;
  h: number;
  note: L;
  source: string;
};

export const floors: Floor[] = [
  {
    id: 'ground',
    label: l('الدور الأرضي', 'Ground floor'),
    short: l('الأرضي', 'Ground'),
    img: './media/plans/ground-ai.webp',
    w: 970,
    h: 825,
    source: 'sit_plan_ground floor_ai.png',
    note: l(
      'الاستقبال والعيادات وعينات المعامل وغرف التصوير والطوارئ، مع المداخل كما تظهر في المخطط.',
      'Reception, clinics, lab samples, imaging rooms and emergency — with the entrances as shown on the plan.'
    ),
  },
  {
    id: 'first',
    label: l('الدور الأول', 'First floor'),
    short: l('الأول', 'First'),
    img: './media/plans/first-ai.webp',
    w: 1075,
    h: 840,
    source: 'sit_plan_fristfloor_functional asalysis_ai.png',
    note: l(
      'غرف الولادة وحديثي الولادة والعمليات وغرف الأطفال والنساء. تبدأ المسارات من مصعد موضّح في المخطط؛ ومخطط الدور الأرضي لا يحدد موقع المصاعد.',
      'Delivery, neonatal (NICU), operating, and pediatric & women rooms. Routes start at an elevator marked on the plan; the ground-floor plan does not mark the elevators.'
    ),
  },
];

export type Start = { x: number; y: number; label: L };

/** Simulated demo start point on each floor (never a real position). */
export const starts: Record<FloorId, Start> = {
  ground: { x: 420, y: 470, label: l('موقعك التجريبي', 'Your demo location') },
  first: { x: 985, y: 480, label: l('المصعد (حسب المخطط)', 'Elevator (per plan)') },
};
export const youAreHere = { floor: 'ground' as FloorId, ...starts.ground };

export type Dest = {
  id: DestId;
  floor: FloorId | null; // null = not shown on the available plans
  icon: string;
  name: L; // patient-friendly name
  planName: L; // label as printed on the drawing
  area: [number, number, number, number]; // x, y, w, h in floor-image pixels
  anchor: [number, number];
  route: [number, number][] | null; // null = location only
};

const G = starts.ground;
const F = starts.first;

export const dests: Dest[] = [
  {
    id: 'reception',
    floor: 'ground',
    icon: 'desk',
    name: l('الاستقبال', 'Reception'),
    planName: l('استقبال وملفات الزوار', 'Reception & Visitor Records'),
    area: [292, 340, 262, 105],
    anchor: [423, 392],
    route: [[G.x, G.y], [420, 447]],
  },
  {
    id: 'clinics',
    floor: 'ground',
    icon: 'stethoscope',
    name: l('العيادات', 'Clinics'),
    planName: l('عيادة الأم', 'Pain Clinic'),
    area: [400, 200, 128, 125],
    anchor: [464, 262],
    route: [[G.x, G.y], [560, 470], [560, 262], [530, 262]],
  },
  {
    id: 'lab',
    floor: 'ground',
    icon: 'flask',
    name: l('المختبر', 'Laboratory'),
    planName: l('عينات المعامل', 'Laboratory Samples'),
    area: [567, 340, 168, 125],
    anchor: [651, 402],
    route: [[G.x, G.y], [560, 470], [560, 400], [567, 400]],
  },
  {
    id: 'radiology',
    floor: 'ground',
    icon: 'scan',
    name: l('الأشعة والتصوير', 'Radiology & imaging'),
    planName: l('غرف صور تخصصي', 'Specialized Imaging Rooms'),
    area: [567, 40, 268, 145],
    anchor: [701, 112],
    route: [[G.x, G.y], [560, 470], [560, 192], [700, 192], [700, 186]],
  },
  {
    id: 'er',
    floor: 'ground',
    icon: 'activity',
    name: l('طوارئ النساء', "Women's emergency"),
    planName: l('طوارئ النساء', 'Women Emergency'),
    area: [295, 20, 230, 165],
    anchor: [410, 102],
    route: [[G.x, G.y], [560, 470], [560, 192], [420, 192], [420, 186]],
  },
  {
    id: 'pedsClinic',
    floor: 'ground',
    icon: 'users',
    name: l('عيادة الأطفال', 'Pediatric clinic'),
    planName: l('عيادة الأطفال', 'Pediatric Clinic'),
    area: [755, 320, 100, 500],
    anchor: [805, 570],
    route: [[G.x, G.y], [560, 470], [560, 335], [745, 335], [745, 560], [755, 560]],
  },
  {
    id: 'pedsEr',
    floor: 'ground',
    icon: 'activity',
    name: l('طوارئ الأطفال', 'Pediatric emergency'),
    planName: l('طوارئ الأطفال', 'Pediatric Emergency'),
    area: [525, 670, 210, 155],
    anchor: [630, 748],
    route: [[G.x, G.y], [560, 470], [560, 650], [630, 650], [630, 670]],
  },
  {
    id: 'wards',
    floor: 'first',
    icon: 'bed',
    name: l('غرف الأطفال والنساء', 'Pediatric & women rooms'),
    planName: l('غرف الأطفال والنساء', 'Pediatric & Women Rooms'),
    area: [575, 515, 430, 320],
    anchor: [790, 675],
    route: [[F.x, F.y], [985, 347], [530, 347], [530, 505], [752, 505], [752, 560]],
  },
  {
    id: 'or',
    floor: 'first',
    icon: 'activity',
    name: l('العمليات الجراحية', 'Operating rooms'),
    planName: l('العمليات الجراحية', 'Operating Rooms'),
    area: [535, 355, 440, 145],
    anchor: [755, 427],
    route: [[F.x, F.y], [985, 420], [975, 420]],
  },
  {
    id: 'nicu',
    floor: 'first',
    icon: 'heart',
    name: l('غرف حديثي الولادة', 'Neonatal rooms (NICU)'),
    planName: l('غرف حديثي الولادة', 'Neonatal Rooms (NICU)'),
    area: [70, 355, 445, 165],
    anchor: [292, 437],
    route: [[F.x, F.y], [985, 347], [530, 347], [530, 400], [512, 400]],
  },
  {
    id: 'delivery',
    floor: 'first',
    icon: 'bed',
    name: l('غرف الولادة', 'Delivery rooms'),
    planName: l('غرف الولادة', 'Delivery Rooms'),
    area: [40, 10, 520, 180],
    anchor: [300, 100],
    route: [[F.x, F.y], [985, 347], [530, 347], [530, 360], [313, 360], [313, 190]],
  },
  {
    id: 'pharmacy',
    floor: null,
    icon: 'pill',
    name: l('الصيدلية', 'Pharmacy'),
    planName: l('غير موجودة في المخططين المعتمدين', 'Not on the two approved plans'),
    area: [0, 0, 0, 0],
    anchor: [0, 0],
    route: null,
  },
];

export const destById = (id: DestId) => dests.find((d) => d.id === id) ?? dests[0];

export const routeLength = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
