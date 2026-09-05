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
