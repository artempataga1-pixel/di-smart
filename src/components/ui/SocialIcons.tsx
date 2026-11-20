/* lucide-react не включает брендовые иконки соцсетей — простые line-иконки
   на currentColor, чтобы вписывались в любой текстовый/акцентный цвет. */

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M21 4.5 3.5 11.3c-.9.35-.9 1.62.02 1.94l4.2 1.47 1.6 5.1c.24.77 1.23.97 1.75.36l2.35-2.75 4.4 3.24c.7.51 1.7.13 1.9-.72L22.9 5.4c.2-.9-.7-1.63-1.9-.9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.7 14.7 17 8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

export function ViberIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 3.5c-5 0-8.5 3.1-8.5 7.7 0 2.4 1 4.4 2.8 5.8l-.7 3.1 3.2-1.5c1 .3 2.1.5 3.2.5 5 0 8.5-3.1 8.5-7.7S17 3.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 8.2c-.3.2-.5.6-.4 1 .5 2.5 2.5 4.5 5 5.1.4.1.8-.1 1-.4l.5-.8-1.7-1-1 1c-1.1-.5-2-1.4-2.5-2.5l1-1-1-1.7-.9.3Z"
        fill="currentColor"
      />
      <path d="M13.2 7.4c1.8.3 3.1 1.6 3.4 3.4M13.1 9.3c.8.1 1.4.7 1.6 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
