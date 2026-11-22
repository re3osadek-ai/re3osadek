/* ========================================
   📅 REAOSADEK - Formatters
   ======================================== */

import { DATE_FORMATS, STAGES } from '../config.js';

// ═══════════════════════════════════════
// 📅 Date Formatters
// ═══════════════════════════════════════

/**
 * Format date for display (Arabic)
 * @example formatDateAr(new Date()) => "2 نوفمبر 2026"
 */
export function formatDateAr(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format date for display (English)
 * @example formatDateEn(new Date()) => "Nov 2, 2026"
 */
export function formatDateEn(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date based on language
 */
export function formatDateLocalized(date, lang = 'ar') {
  return lang === 'ar' ? formatDateAr(date) : formatDateEn(date);
}

/**
 * Format datetime (date + time)
 */
export function formatDateTime(date, lang = 'ar') {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  const dateStr = formatDateLocalized(d, lang);
  const timeStr = d.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return `${dateStr} - ${timeStr}`;
}

/**
 * Format time only
 */
export function formatTime(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "منذ 5 دقائق")
 */
export function formatRelativeTime(date, lang = 'ar') {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (lang === 'ar') {
    if (diffSec < 60) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHour < 24) return `منذ ${diffHour} ساعة`;
    if (diffDay === 1) return 'أمس';
    if (diffDay < 7) return `منذ ${diffDay} أيام`;
    if (diffWeek < 4) return `منذ ${diffWeek} أسابيع`;
    if (diffMonth < 12) return `منذ ${diffMonth} أشهر`;
    return `منذ ${diffYear} سنوات`;
  } else {
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 4) return `${diffWeek}w ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${diffYear}y ago`;
  }
}

/**
 * Format short date (e.g., "2 Nov")
 */
export function formatShortDate(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format date for input (YYYY-MM-DD)
 */
export function formatDateForInput(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format date range
 */
export function formatDateRange(startDate, endDate, lang = 'ar') {
  const start = formatDateLocalized(startDate, lang);
  const end = formatDateLocalized(endDate, lang);
  const separator = lang === 'ar' ? ' إلى ' : ' to ';
  return `${start}${separator}${end}`;
}

// ═══════════════════════════════════════
// 🔢 Number Formatters
// ═══════════════════════════════════════

/**
 * Format number with thousand separators
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format number in Arabic
 */
export function formatNumberAr(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '٠';
  return Number(num).toLocaleString('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format percentage with color indicator
 */
export function formatPercentageWithStatus(value) {
  const num = Number(value);
  if (isNaN(num)) return { text: '0%', class: 'text-muted' };
  
  let className = 'text-success';
  if (num < 30) className = 'text-danger';
  else if (num < 70) className = 'text-warning';
  
  return {
    text: `${num.toFixed(0)}%`,
    class: className,
  };
}

/**
 * Format compact number (e.g., 1.2K, 3.5M)
 */
export function formatCompact(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  });
  
  return formatter.format(num);
}

/**
 * Format ordinal number (1st, 2nd, 3rd)
 */
export function formatOrdinal(num) {
  const n = Number(num);
  if (isNaN(n)) return num;
  
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// ═══════════════════════════════════════
// 💰 Currency Formatters
// ═══════════════════════════════════════

/**
 * Format currency (EGP)
 */
export function formatCurrency(amount, currency = 'EGP') {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency in English
 */
export function formatCurrencyEn(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format price with EGP symbol
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 ج.م';
  return `${formatNumber(amount)} ج.م`;
}

// ═══════════════════════════════════════
// 📏 Dimension Formatters
// ═══════════════════════════════════════

/**
 * Format dimension (W x D x H)
 */
export function formatDimension(width, depth, height, unit = 'mm') {
  const w = width || 0;
  const d = depth || 0;
  const h = height || 0;
  return `${w} × ${d} × ${h} ${unit}`;
}

/**
 * Format dimension compact
 */
export function formatDimensionCompact(width, depth, height) {
  const w = width || 0;
  const d = depth || 0;
  const h = height || 0;
  return `${w}×${d}×${h}`;
}

/**
 * Format area (width × depth)
 */
export function formatArea(width, depth, unit = 'mm²') {
  if (!width || !depth) return '0';
  const area = width * depth;
  return `${formatNumber(area)} ${unit}`;
}

/**
 * Format volume (width × depth × height)
 */
export function formatVolume(width, depth, height, unit = 'mm³') {
  if (!width || !depth || !height) return '0';
  const volume = width * depth * height;
  return `${formatNumber(volume)} ${unit}`;
}

/**
 * Convert mm to cm
 */
export function mmToCm(mm) {
  return Number(mm) / 10;
}

/**
 * Convert mm to meters
 */
export function mmToMeters(mm) {
  return Number(mm) / 1000;
}

/**
 * Format dimension in cm
 */
export function formatDimensionCm(width, depth, height) {
  return formatDimension(
    mmToCm(width).toFixed(1),
    mmToCm(depth).toFixed(1),
    mmToCm(height).toFixed(1),
    'cm'
  );
}

// ═══════════════════════════════════════
// 🏭 Production Formatters
// ═══════════════════════════════════════

/**
 * Format stage name with icon
 */
export function formatStage(stageId, lang = 'en') {
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) return stageId;
  
  const name = lang === 'ar' ? stage.nameAr : stage.name;
  return `${stage.icon} ${name}`;
}

/**
 * Format stage name only (without icon)
 */
export function formatStageName(stageId, lang = 'en') {
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) return stageId;
  return lang === 'ar' ? stage.nameAr : stage.name;
}

/**
 * Format stage progress
 */
export function formatStageProgress(currentStageId) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStageId);
  if (currentIndex === -1) return { text: '0%', current: 0, total: STAGES.length };
  
  const progress = ((currentIndex + 1) / STAGES.length) * 100;
  return {
    text: `${progress.toFixed(0)}%`,
    current: currentIndex + 1,
    total: STAGES.length,
  };
}

/**
 * Format duration (days)
 */
export function formatDuration(days) {
  if (days === null || days === undefined || isNaN(days)) return '—';
  
  const d = Number(days);
  if (d === 0) return 'اليوم';
  if (d === 1) return 'يوم واحد';
  if (d === 2) return 'يومان';
  if (d < 11) return `${d} أيام`;
  return `${d} يوم`;
}

/**
 * Format duration in English
 */
export function formatDurationEn(days) {
  if (days === null || days === undefined || isNaN(days)) return '—';
  
  const d = Number(days);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day';
  return `${d} days`;
}

/**
 * Format duration with status color
 */
export function formatDurationWithStatus(days, expectedDays = 7) {
  const d = Number(days);
  if (isNaN(d)) return { text: '—', class: 'text-muted' };
  
  let className = 'text-success';
  if (d > expectedDays * 1.5) className = 'text-danger';
  else if (d > expectedDays) className = 'text-warning';
  
  return {
    text: formatDuration(d),
    class: className,
  };
}

// ═══════════════════════════════════════
// 📦 File Size Formatters
// ═══════════════════════════════════════

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '—';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ═══════════════════════════════════════
// 👤 User Formatters
// ═══════════════════════════════════════

/**
 * Format user initials
 */
export function formatUserInitials(name) {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * Format user name with role
 */
export function formatUserWithName(name, role) {
  if (!name) return 'Unknown';
  return role ? `${name} (${role})` : name;
}

// ═══════════════════════════════════════
// 📊 Statistics Formatters
// ═══════════════════════════════════════

/**
 * Format trend (up/down with percentage)
 */
export function formatTrend(current, previous) {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;
  
  if (prev === 0) {
    return {
      text: curr > 0 ? '↑ جديد' : '—',
      class: curr > 0 ? 'up' : 'neutral',
      value: 0,
    };
  }
  
  const change = ((curr - prev) / prev) * 100;
  const absChange = Math.abs(change).toFixed(1);
  
  if (change > 0) {
    return { text: `↑ ${absChange}%`, class: 'up', value: change };
  } else if (change < 0) {
    return { text: `↓ ${absChange}%`, class: 'down', value: change };
  } else {
    return { text: '→ 0%', class: 'neutral', value: 0 };
  }
}

/**
 * Format count with label
 */
export function formatCount(count, singular, plural, lang = 'ar') {
  const n = Number(count) || 0;
  
  if (lang === 'ar') {
    if (n === 0) return `لا يوجد ${plural}`;
    if (n === 1) return `${singular} واحد`;
    if (n === 2) return `${singular}ان`;
    if (n >= 3 && n <= 10) return `${n} ${plural}`;
    return `${n} ${singular}`;
  } else {
    return `${n} ${n === 1 ? singular : plural}`;
  }
}

// ═══════════════════════════════════════
// 🎨 Display Formatters
// ═══════════════════════════════════════

/**
 * Format boolean as Yes/No
 */
export function formatBoolean(value, lang = 'ar') {
  if (lang === 'ar') {
    return value ? '✅ نعم' : '❌ لا';
  }
  return value ? '✅ Yes' : '❌ No';
}

/**
 * Format status with icon
 */
export function formatStatus(status, lang = 'ar') {
  const statuses = {
    pending: { icon: '⏳', ar: 'معلق', en: 'Pending' },
    'in-progress': { icon: '⚙️', ar: 'قيد التنفيذ', en: 'In Progress' },
    completed: { icon: '✅', ar: 'مكتمل', en: 'Completed' },
    delayed: { icon: '⚠️', ar: 'متأخر', en: 'Delayed' },
    'on-hold': { icon: '⏸️', ar: 'متوقف', en: 'On Hold' },
    cancelled: { icon: '❌', ar: 'ملغي', en: 'Cancelled' },
  };
  
  const s = statuses[status];
  if (!s) return status;
  
  return `${s.icon} ${lang === 'ar' ? s.ar : s.en}`;
}

/**
 * Format priority with icon
 */
export function formatPriority(priority, lang = 'ar') {
  const priorities = {
    low: { icon: '🟢', ar: 'منخفضة', en: 'Low' },
    medium: { icon: '🟡', ar: 'متوسطة', en: 'Medium' },
    high: { icon: '🟠', ar: 'عالية', en: 'High' },
    critical: { icon: '🔴', ar: 'حرجة', en: 'Critical' },
  };
  
  const p = priorities[priority];
  if (!p) return priority;
  
  return `${p.icon} ${lang === 'ar' ? p.ar : p.en}`;
}

/**
 * Format client code with prefix
 */
export function formatClientCode(code) {
  if (!code) return '—';
  return `#${code}`;
}

/**
 * Format item count
 */
export function formatItemCount(count, lang = 'ar') {
  const n = Number(count) || 0;
  if (lang === 'ar') {
    if (n === 0) return 'لا توجد بنود';
    if (n === 1) return 'بند واحد';
    if (n === 2) return 'بندان';
    if (n >= 3 && n <= 10) return `${n} بنود`;
    return `${n} بند`;
  }
  return `${n} ${n === 1 ? 'item' : 'items'}`;
}

// ═══════════════════════════════════════
// 📱 Phone Formatters
// ═══════════════════════════════════════

/**
 * Format Egyptian phone number
 */
export function formatEgyptianPhone(phone) {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return `01${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

// ═══════════════════════════════════════
// 🎯 Export All
// ═══════════════════════════════════════

export default {
  // Dates
  formatDateAr, formatDateEn, formatDateLocalized, formatDateTime,
  formatTime, formatRelativeTime, formatShortDate, formatDateForInput,
  formatDateRange,
  // Numbers
  formatNumber, formatNumberAr, formatPercentage, formatPercentageWithStatus,
  formatCompact, formatOrdinal,
  // Currency
  formatCurrency, formatCurrencyEn, formatPrice,
  // Dimensions
  formatDimension, formatDimensionCompact, formatArea, formatVolume,
  mmToCm, mmToMeters, formatDimensionCm,
  // Production
  formatStage, formatStageName, formatStageProgress,
  formatDuration, formatDurationEn, formatDurationWithStatus,
  // Files
  formatFileSize,
  // Users
  formatUserInitials, formatUserWithName,
  // Statistics
  formatTrend, formatCount,
  // Display
  formatBoolean, formatStatus, formatPriority,
  formatClientCode, formatItemCount,
  // Phone
  formatEgyptianPhone,
};