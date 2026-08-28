import {
  LuArrowUpRight,
  LuArrowLeft,
  LuMail,
  LuCalendar,
  LuClock,
  LuCheck,
  LuShare2,
} from 'react-icons/lu';
import {
  FaLinkedinIn,
  FaInstagram,
  FaThreads,
  FaWhatsapp,
} from 'react-icons/fa6';

export function Arrow({ className = '', size = 15 }: { className?: string; size?: number }) {
  return <LuArrowUpRight className={`arrow-icon ${className}`} size={size} aria-hidden="true" />;
}

export function BackArrow({ className = '', size = 16 }: { className?: string; size?: number }) {
  return <LuArrowLeft className={`back-arrow-icon ${className}`} size={size} aria-hidden="true" />;
}

export function EmailIcon({ className = '', size = 18 }: { className?: string; size?: number }) {
  return <LuMail className={`hero-social-icon ${className}`} size={size} aria-hidden="true" />;
}

export function LinkedinIcon({ className = '', size = 18 }: { className?: string; size?: number }) {
  return <FaLinkedinIn className={`hero-social-icon ${className}`} size={size} aria-hidden="true" />;
}

export function InstagramIcon({ className = '', size = 18 }: { className?: string; size?: number }) {
  return <FaInstagram className={`hero-social-icon ${className}`} size={size} aria-hidden="true" />;
}

export function ThreadsIcon({ className = '', size = 18 }: { className?: string; size?: number }) {
  return <FaThreads className={`hero-social-icon ${className}`} size={size} aria-hidden="true" />;
}

export function WhatsAppIcon({ className = '', size = 18 }: { className?: string; size?: number }) {
  return <FaWhatsapp className={`whatsapp-icon ${className}`} size={size} aria-hidden="true" />;
}

export function ShareIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return <LuShare2 className={className} size={size} aria-hidden="true" />;
}

export function CalendarIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return <LuCalendar className={className} size={size} aria-hidden="true" />;
}

export function ClockIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return <LuClock className={className} size={size} aria-hidden="true" />;
}

export function CheckIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return <LuCheck className={className} size={size} aria-hidden="true" />;
}
