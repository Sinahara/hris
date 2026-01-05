// Common utility functions for the HRIS system

/**
 * Format date to Indonesian locale
 */
export function formatDateID(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get day name in Indonesian
 */
export function getDayNameID(dateString: string): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

/**
 * Check if time is late (after 08:00:00)
 */
export function isLate(timeString: string): boolean {
  return timeString > "08:00:00";
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Format time to HH:MM
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '-';
  return timeString.substring(0, 5);
}

/**
 * Validate NIP format
 */
export function validateNIP(nip: string): boolean {
  return /^[A-Z0-9]{3,10}$/.test(nip);
}

/**
 * Validate NIK format (16 digits)
 */
export function validateNIK(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    "On Progress": "bg-yellow-100 text-yellow-800",
    "Completed": "bg-green-100 text-green-800",
    "Telat": "bg-red-100 text-red-800",
    "Tepat Waktu": "bg-green-100 text-green-800",
  };
  
  return statusMap[status] || "bg-gray-100 text-gray-800";
}

/**
 * Download data as JSON
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export table to CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Get period text (from-to dates)
 */
export function getPeriodText(startDate: string, endDate: string): string {
  return `${formatDateID(startDate)} - ${formatDateID(endDate)}`;
}
