
import { PressureMode } from '@/types/exam';

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function calculateTimeLeft(examDate: Date): TimeLeft {
  const now = new Date();
  const diff = examDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

export function formatCountdown(timeLeft: TimeLeft, pressureMode: PressureMode): string {
  const { days, hours, minutes, totalSeconds } = timeLeft;

  if (totalSeconds <= 0) {
    return 'Exam passed';
  }

  switch (pressureMode) {
    case 'Calm':
      // Always show days
      if (days === 0) {
        return 'Today';
      } else if (days === 1) {
        return '1 day left';
      } else {
        return `${days} days left`;
      }

    case 'Realistic':
      // Show days and hours
      if (days === 0) {
        if (hours === 0) {
          return `${minutes} minutes left`;
        }
        return `${hours} hours left`;
      } else if (days === 1) {
        return `1 day ${hours} hours left`;
      } else {
        return `${days} days ${hours} hours left`;
      }

    case 'Brutal':
      // >14 days: days only
      // <14 days: hours only
      // <24 hours: hours + minutes
      if (days > 14) {
        return `${days} days left`;
      } else if (days >= 1) {
        const totalHours = days * 24 + hours;
        return `${totalHours} hours left`;
      } else {
        // Less than 24 hours
        if (hours === 0) {
          return `${minutes} minutes left`;
        }
        return `${hours} hours ${minutes} minutes left`;
      }

    default:
      return `${days} days left`;
  }
}

export function formatExactDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
}

export function isExamPassed(examDate: Date): boolean {
  return new Date() > examDate;
}
