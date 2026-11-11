import type { CSSProperties } from 'react';

// Compact stroke icon set (24x24, 1.8 stroke) drawn for Rafiq.
const P: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a3 3 0 0 1 3-3h4M18 9v6a3 3 0 0 1-3 3h-4',
  map: 'M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20',
  pill: 'M10.5 20.5a4.95 4.95 0 0 1-7-7l7-7a4.95 4.95 0 0 1 7 7zM7 10l7 7',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  door: 'M5 21V4a1 1 0 0 1 1-1h9l4 2v16M3 21h18M14 12h.01',
  id: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.5 16a3.5 3.5 0 0 1 7 0M15 9h3M15 13h3',
  heart: 'M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.1a5 5 0 1 1 7.5 6.5z',
  stethoscope: 'M5 3v5a5 5 0 0 0 10 0V3M10 13v2a5 5 0 0 0 10 0v-2M20 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  flask: 'M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10',
  file: 'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h4',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  check: 'M5 12.5 10 17 19 7',
  checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.7 2.5L16 9.5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  arrowBack: 'M19 12H5M11 6l-6 6 6 6',
  chevron: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  nav: 'M3 11 21 3l-8 18-2-8z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6.5 6.5 0 0 1 3.5 6',
  user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8M12 8v8',
  drop: 'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z',
  activity: 'M3 12h4l3-7 4 14 3-7h4',
  thermo: 'M14 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0zM12 9v7',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  present: 'M3 4h18M4 4v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4M12 15v3M8 21l4-3 4 3',
  play: 'M7 4.5v15l12-7.5z',
  replay: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  shield: 'M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z M9 12l2 2 4-4',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  calendar: 'M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v4M16 3v4',
  chat: 'M4 5h16v11H9l-5 4z M8 10h8M8 13h5',
  lift: 'M5 3h14v18H5zM9 9l1.5-2L12 9M15 15l-1.5 2L12 15',
  wc: 'M7 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 21v-6l-1-1 1-5h4l1 5-1 1v6M15 21v-5h-2l2-7h4l2 7h-2v5M12 3v18',
  chair: 'M6 12V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7M4 12h16v3H4zM6 15v6M18 15v6',
  desk: 'M3 9h18v3H3zM5 12v9M19 12v9M9 9V6a3 3 0 0 1 6 0v3',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
  phone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  wave: 'M2 12h3l2-5 3 10 3-12 3 9 2-2h4',
  skip: 'M5 5l8 7-8 7zM15 5v14M19 5v14',
  hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V13c0 4.4-2.5 8-6.5 8-2.3 0-3.7-1-5-2.8L3 14.5a1.6 1.6 0 0 1 2.5-2L8 15',
  swipe: 'M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3M9 21h6',
  speaker: 'M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
  mute: 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6',
  pause: 'M8 5v14M16 5v14',
  stop: 'M6 6h12v12H6z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  text: 'M4 7V5h12v2M10 5v14M8 19h4M14 12v-1h7v1M17.5 11v8M16 19h3',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 17.5l10 5 10-5',
  a11y: 'M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4 9l8 1.5L20 9M12 10.5V15M12 15l-3 6M12 15l3 6',
  keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
  locate: 'M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM12 2v3M12 19v3M2 12h3M19 12h3M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  simple: 'M4 5h16v5H4zM4 14h16v5H4z',
  contrast: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v18',
  motion: 'M5 12h3M3 8h5M3 16h5M12 6a6 6 0 1 1 0 12',
  label: 'M3 7a2 2 0 0 1 2-2h9l7 7-7 7H5a2 2 0 0 1-2-2zM8 12h.01',
};

export default function Icon({
  name,
  size = 22,
  stroke = 1.8,
  className,
  style,
}: {
  name: string;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const d = P[name] ?? P.info;
  const fill = name === 'play' ? 'currentColor' : 'none';
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
