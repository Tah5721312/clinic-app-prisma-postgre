/**
 * ID Generator Utilities
 * Helper functions to work with the custom ID system (prefix-based IDs)
 * 
 * ID Prefixes:
 * - Doctors: 75
 * - Patients: 95
 * - Appointments: 55
 * - Medical Records: 33
 * - Users: 45
 * - Role Permissions: 65
 * - Doctor Schedules: 77
 * - Invoices: 88
 */

export const ID_PREFIXES = {
  DOCTOR: 75,
  PATIENT: 95,
  APPOINTMENT: 55,
  MEDICAL_RECORD: 33,
  USER: 45,
  ROLE_PERMISSION: 65,
  DOCTOR_SCHEDULE: 77,
  INVOICE: 88,
} as const;

export type IDPrefix = typeof ID_PREFIXES[keyof typeof ID_PREFIXES];

/**
 * Extract the prefix from an ID
 */
export function extractPrefix(id: number | bigint): number {
  const idStr = id.toString();
  if (idStr.length < 2) return 0;
  return parseInt(idStr.substring(0, 2), 10);
}

/**
 * Extract the sequence number from an ID (removes prefix)
 */
export function extractSequence(id: number | bigint): number {
  const idStr = id.toString();
  if (idStr.length < 2) return 0;
  return parseInt(idStr.substring(2), 10);
}

/**
 * Check if an ID belongs to a specific prefix
 */
export function hasPrefix(id: number | bigint, prefix: IDPrefix): boolean {
  return extractPrefix(id) === prefix;
}

/**
 * Validate if an ID has a valid prefix
 */
export function isValidId(id: number | bigint): boolean {
  const prefix = extractPrefix(id);
  return Object.values(ID_PREFIXES).includes(prefix as IDPrefix);
}

/**
 * Get the entity type from an ID prefix
 */
export function getEntityType(id: number | bigint): string | null {
  const prefix = extractPrefix(id);
  
  switch (prefix) {
    case ID_PREFIXES.DOCTOR:
      return 'doctor';
    case ID_PREFIXES.PATIENT:
      return 'patient';
    case ID_PREFIXES.APPOINTMENT:
      return 'appointment';
    case ID_PREFIXES.MEDICAL_RECORD:
      return 'medical_record';
    case ID_PREFIXES.USER:
      return 'user';
    case ID_PREFIXES.ROLE_PERMISSION:
      return 'role_permission';
    case ID_PREFIXES.DOCTOR_SCHEDULE:
      return 'doctor_schedule';
    case ID_PREFIXES.INVOICE:
      return 'invoice';
    default:
      return null;
  }
}

/**
 * Format ID for display (adds separators for readability)
 */
export function formatId(id: number | bigint): string {
  const idStr = id.toString();
  if (idStr.length <= 2) return idStr;
  
  const prefix = idStr.substring(0, 2);
  const sequence = idStr.substring(2);
  
  // Add separators every 4 digits for readability
  const formattedSequence = sequence.replace(/(\d{4})(?=\d)/g, '$1-');
  
  return `${prefix}-${formattedSequence}`;
}

/**
 * Parse formatted ID back to number
 */
export function parseId(formattedId: string): number {
  // Remove all non-digit characters
  const cleaned = formattedId.replace(/\D/g, '');
  return parseInt(cleaned, 10);
}

/**
 * Type guards for ID validation
 */
export function isDoctorId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.DOCTOR);
}

export function isPatientId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.PATIENT);
}

export function isAppointmentId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.APPOINTMENT);
}

export function isMedicalRecordId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.MEDICAL_RECORD);
}

export function isUserId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.USER);
}

export function isRolePermissionId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.ROLE_PERMISSION);
}

export function isDoctorScheduleId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.DOCTOR_SCHEDULE);
}

export function isInvoiceId(id: number | bigint): boolean {
  return hasPrefix(id, ID_PREFIXES.INVOICE);
}

