// ── Enums ──────────────────────────────────────────────────────
export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED' | 'LATE_CANCEL' | 'ATTENDED' | 'NO_SHOW' | 'COMPLETED';

// ── Shared API models ──────────────────────────────────────────
export interface AvailabilitySlotDTO {
  id?:         number;
  doctorId?:   string;
  hospitalId?: number;
  startTime:   string;
  endTime:     string;
  doctorName?: string;
  createdAt?:  string;
}

export interface AppointmentDTO {
  id?:              number;
  slotId:           number;
  bookedByUserId?:  string;
  isProxyBooking?:  boolean;
  patientName?:     string;
  patientPhone?:    string;
  status?:          AppointmentStatus;
  checkedInAt?:     string;
  cancelledAt?:     string;
  createdAt?:       string;
  updatedAt?:       string;
}

export interface StatusUpdateRequest { status: string; }
