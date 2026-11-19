/**
 * The app's icons as small inline SVGs (no icon library needed).
 * They inherit the text colour and are hidden from screen readers; put the
 * accessible name on the button that contains the icon.
 */
import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type Props = SVGProps<SVGSVGElement>;

export const HomeIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M10 20v-5h4v5" />
  </Icon>
);
export const BookIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z" />
    <path d="M12 6.5v13" />
  </Icon>
);
export const RepeatIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M17 2.5 21 6.5l-4 4" />
    <path d="M3 11.5v-1a4 4 0 0 1 4-4h14" />
    <path d="M7 21.5 3 17.5l4-4" />
    <path d="M21 12.5v1a4 4 0 0 1-4 4H3" />
  </Icon>
);
export const ChatIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />
  </Icon>
);
export const GearIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
);
export const SpeakerIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </Icon>
);
export const CheckIcon = (p: Props) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
export const CloseIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const SparkleIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    <path d="M19 16v4M17 18h4" />
  </Icon>
);
export const TrashIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Icon>
);
export const ArrowRightIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const SendIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M4 12 20 4l-6 16-3-7-7-1Z" />
  </Icon>
);
export const FlameIcon = (p: Props) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M12.5 2c.5 3-1 4.700-2.500 6.200C8.300 9.900 7 11.600 7 14a5 5 0 0 0 10 0c0-1.300-.4-2.400-1-3.300-.400 1-1 1.600-1.800 1.800.5-3.500-.2-7.500-1.700-10.500Z" />
  </Icon>
);
export const HelpIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.700.400-1 1-1 1.700" />
    <path d="M12 17h.01" />
  </Icon>
);
export const TranslateIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M4 5h9M8.5 3v2" />
    <path d="M11 5c-.8 3.6-3.300 6.600-6.500 8" />
    <path d="M6.500 8.500c1.200 2 3 3.300 5 4" />
    <path d="M13 21l4-9 4 9M14.300 18h5.400" />
  </Icon>
);
export const SearchIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.500-3.500" />
  </Icon>
);
export const BookmarkIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-6-4-6 4V3Z" />
  </Icon>
);
