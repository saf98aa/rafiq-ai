// Character asset manager: one place that maps every story/app role to its reference photograph
// from the `pic_ref` folder. Filenames in pic_ref are the source of truth for each role.
// Names are fictional; the photographs are used as-is (no filters, no face changes).
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
    name: l('محمد عبدالله', 'Mohammed Abdullah'),
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
    name: l('ريم', 'Reem'),
    role: l('ابنته ومرافقته', 'His daughter and companion'),
    photo: `${P}companion.webp`,
    avatar: `${P}av_companion.webp`,
    w: 720,
    h: 1280,
    face: { x: 0.54, y: 0.27 },
  },
  doctor: {
    id: 'doctor',
    source: 'Doctor.jpg.png',
    name: l('د. سارة العتيبي', 'Dr. Sara Alotaibi'),
    role: l('استشارية الطب الباطني', 'Consultant, Internal Medicine'),
    photo: `${P}doctor.webp`,
    avatar: `${P}av_doctor.webp`,
    w: 900,
    h: 1200,
    face: { x: 0.57, y: 0.24 },
  },
  nurse: {
    id: 'nurse',
    source: 'Nurse.jpg.png',
    name: l('الممرضة نورة', 'Nurse Noura'),
    role: l('التمريض — العيادات الخارجية', 'Nursing — Outpatient clinics'),
    photo: `${P}nurse.webp`,
    avatar: `${P}av_nurse.webp`,
    w: 900,
    h: 1350,
    face: { x: 0.51, y: 0.22 },
  },
  pharmacist: {
    id: 'pharmacist',
    source: 'Pharmacist.jpg.png',
    name: l('الصيدلي يوسف', 'Pharmacist Yousef'),
    role: l('صيدلية المستشفى', 'Hospital pharmacy'),
    photo: `${P}pharmacist.webp`,
    avatar: `${P}av_pharmacist.webp`,
    w: 900,
    h: 1350,
    face: { x: 0.58, y: 0.14 },
  },
  receptionist: {
    id: 'receptionist',
    source: 'Receptionist.jpg.png',
    name: l('هند', 'Hind'),
    role: l('موظفة الاستقبال', 'Receptionist'),
    photo: `${P}receptionist.webp`,
    avatar: `${P}av_receptionist.webp`,
    w: 900,
    h: 1200,
    face: { x: 0.51, y: 0.49 },
  },
  lab: {
    id: 'lab',
    source: 'Lab_Technician.jpg.png',
    name: l('خالد', 'Khalid'),
    role: l('فني المختبر', 'Laboratory technician'),
    photo: `${P}lab.webp`,
    avatar: `${P}av_lab.webp`,
    w: 900,
    h: 1350,
    face: { x: 0.52, y: 0.17 },
  },
  radiology: {
    id: 'radiology',
    source: 'Radiology_Technician.jpg.png',
    name: l('عمر', 'Omar'),
    role: l('فني الأشعة', 'Radiology technician'),
    photo: `${P}radiology.webp`,
    avatar: `${P}av_radiology.webp`,
    w: 900,
    h: 1350,
    face: { x: 0.33, y: 0.2 },
  },
};

/** Hospital environment photographs from `hospital-blueprints`. */
export const hospitalPhotos = {
  exterior: { src: './media/hospital/exterior.webp', w: 1672, h: 940 },
  emergency: { src: './media/hospital/emergency.webp', w: 1536, h: 1024 },
};
