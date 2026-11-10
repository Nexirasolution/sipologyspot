export function LeafIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 20c8 0 14-6 14-14 0 0-9 0-13 4S4 20 4 20Z" />
      <path d="M4 20c2-6 5-9 9-11" />
    </svg>
  );
}

export function BagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function PotIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M7 9h10l-1 10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L7 9Z" />
      <path d="M5 9h14M9 9V6h6v3" />
    </svg>
  );
}

export function WoodIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M12 11v10M8 21h8" />
    </svg>
  );
}

export function DropIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z" />
    </svg>
  );
}

export function HerbIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 21V9M12 9C12 5 9 3 5 3c0 4 2 7 7 7Zm0 0c0-4 3-6 7-6 0 4-2 7-7 7Z" />
    </svg>
  );
}

export function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 5c0 8.8 6.2 15 15 15l3-3.5a1 1 0 0 0-.3-1.6l-4-2a1 1 0 0 0-1.1.2l-1.3 1.3A12 12 0 0 1 9 8.7l1.3-1.3a1 1 0 0 0 .2-1.1l-2-4a1 1 0 0 0-1.6-.3L4 5Z" />
    </svg>
  );
}

export function WhatsappIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.8c-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2c0 1.3.9 2.6 1.1 2.8.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}

export function LocationIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export const CATEGORY_ICONS = {
  bag: BagIcon,
  pot: PotIcon,
  wood: WoodIcon,
  drop: DropIcon,
  herb: HerbIcon,
  leaf: LeafIcon,
};
