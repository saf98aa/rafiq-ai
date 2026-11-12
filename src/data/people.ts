// Character asset manager: one place that maps every story/app role to its reference photograph
// from the `pic_ref` folder. Filenames in pic_ref are the source of truth for each role.
// The photographs are used as-is (cropped/resized only — no filters, no face changes).
//
// Official cast (names given by the project owner):
//   Receptionist Safaa · Patient Amer · Companion (his daughter) Najia · Dr. Yusra Zakaria
//   Nurse Najwa · Pharmacist Suleiman · Lab technician Mohammed · Radiology technician Omar
// "Rafiq" is the AI companion product — never a person.
import type { L } from './content';

const l = (ar: string, en: string): L => ({ ar, en });

export type PersonId = 'patient' | 'companion' | 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'lab' | 'radiology';

export type Person = {
  id: PersonId;
  source: string; // original file in pic_ref
  name: L;
  role: L;
  photo: string; // full photograph (web-optimised copy)
  avatar: string; // square face crop
  w: number;
  h: number;
  face: { x: number; y: number }; // face centre in the photograph (0..1)
};

const P = './media/people/';

export const people: Record<PersonId, Person> = {
  patient: {
    id: 'patient',
    source: 'Elderly_Patient.jpg.png',
    name: l('عامر', 'Amer'),
    role: l('المريض', 'Patient'),
    photo: `${P}patient.webp`,
    avatar: `${P}av_patient.webp`,
    w: 1400,
    h: 1050,
    face: { x: 0.44, y: 0.3 },
  },
  companion: {
    id: 'companion',
    source: 'Patient_Companion.jpg.jpeg',
    name: l('ناجية', 'Najia'),
    role: l('ابنته ومرافقته', 'His daughter and companion'),
    photo: `${P}companion.webp`,
    avatar: `${P}av_companion.webp`,
    w: 720,
    h: 1280,
    face: { x: 0.54, y: 0.27 },
  },
  doctor: {
    id: 'doctor',
    source: 'doctor ai.png',
    name: l('د. يسرى زكريا', 'Dr. Yusra Zakaria'),
    role: l('استشارية الطب الباطني', 'Consultant, Internal Medicine'),
    photo: `${P}doctor-ai.webp`,
    avatar: `${P}av_yusra.webp`,
    w: 1600,
    h: 900,
    face: { x: 0.46, y: 0.32 },
  },
  nurse: {
    id: 'nurse',
    source: 'nurse ai.png',
    name: l('الممرضة نجوى', 'Nurse Najwa'),
    role: l('التمريض', 'Nursing'),
    photo: `${P}nurse-ai.webp`,
    avatar: `${P}av_najwa.webp`,
    w: 1600,
    h: 900,
    face: { x: 0.43, y: 0.3 },
  },
  pharmacist: {
    id: 'pharmacist',
    source: 'Pharmacist.jpg.png',
    name: l('الصيدلي سليمان', 'Pharmacist Suleiman'),
    role: l('صيدلية المستشفى', 'Hospital pharmacy'),
    photo: `${P}pharmacist.webp`,
    avatar: `${P}av_pharmacist.webp`,
    w: 900,
    h: 1350,
    face: { x: 0.58, y: 0.14 },
  },
  receptionist: {
    id: 'receptionist',
    source: 'Patient Check-in & Registration.png',
    name: l('صفا', 'Safaa'),
    role: l('موظفة الاستقبال والتسجيل', 'Check-in & registration'),
    photo: `${P}checkin.webp`,
    avatar: `${P}av_safaa.webp`,
    w: 1600,
    h: 900,
    face: { x: 0.83, y: 0.345 },
  },
  lab: {
    id: 'lab',
    source: 'Lab_Technician.jpg.png',
    name: l('محمد', 'Mohammed'),
    role: l('فني المختبر', 'Laboratory technician'),
    photo: `${P}lab.webp`,
    avatar: `${P}av_lab.webp`,
    w: 900,
    h: 1350,
    face: { x: 0.52, y: 0.17 },
  },
  radiology: {
    id: 'radiology',
    source: 'x-ray.png',
    name: l('عمر', 'Omar'),
    role: l('فني الأشعة', 'Radiology technician'),
    photo: `${P}radiology-xray.webp`,
    avatar: `${P}av_omar.webp`,
    w: 900,
    h: 1349,
    face: { x: 0.415, y: 0.195 },
  },
};

/** Group scenes from pic_ref, used as-is. */
export const scenePhotos = {
  /** "patient Waiting.png" — Amer and his daughter Najia in the waiting area. */
  waiting: { src: `${P}waiting.webp`, source: 'patient Waiting.png', w: 1600, h: 900, focus: { x: 0.5, y: 0.36 } },
  /** "Patient Check-in & Registration.png" — Amer and Najia at the reception desk with Safaa. */
  checkin: { src: `${P}checkin.webp`, source: 'Patient Check-in & Registration.png', w: 1600, h: 900, focus: { x: 0.62, y: 0.36 } },
  /** "Patient Discharge & Hospital Exit.png" — Amer and Najia walking towards the hospital exit. */
  discharge: { src: `${P}discharge.webp`, source: 'Patient Discharge & Hospital Exit.png', w: 1600, h: 900, focus: { x: 0.45, y: 0.4 } },
};

/** Hospital environment photographs from `hospital-blueprints`. */
export const hospitalPhotos = {
  exterior: { src: './media/hospital/exterior.webp', w: 1672, h: 940 },
  emergency: { src: './media/hospital/emergency.webp', w: 1536, h: 1024 },
};
