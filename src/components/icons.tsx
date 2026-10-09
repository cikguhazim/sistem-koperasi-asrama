import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg(props: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="1.25em"
      height="1.25em"
      {...props}
    />
  );
}

export const IconCart = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
  </Svg>
);
export const IconGear = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Svg>
);
export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconMinus = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);
export const IconSave = (p: P) => (
  <Svg {...p}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </Svg>
);
export const IconCoins = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.1 10.4A6 6 0 1 1 10.4 18.1" />
    <path d="M7 6h1v4" />
  </Svg>
);
export const IconWallet = (p: P) => (
  <Svg {...p}>
    <path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h13" />
    <path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
    <path d="M21 12h-4a2 2 0 0 0 0 4h4v-4Z" />
  </Svg>
);
export const IconBox = (p: P) => (
  <Svg {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </Svg>
);
export const IconArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);
export const IconLock = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);
export const IconEye = (p: P) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const IconEyeOff = (p: P) => (
  <Svg {...p}>
    <path d="M17.9 17.9A10.6 10.6 0 0 1 12 19c-6.4 0-10-7-10-7a18 18 0 0 1 5.1-5.9M9.9 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-2.2 3.2" />
    <path d="M1 1l22 22M14.1 14.1a3 3 0 0 1-4.2-4.2" />
  </Svg>
);
export const IconList = (p: P) => (
  <Svg {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </Svg>
);
export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);
export const IconX = (p: P) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);
