// Re-export all generated models and services from the OpenAPI spec
export * from '../api';

// Additional type aliases not covered by the generated spec
export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED' | 'LATE_CANCEL' | 'ATTENDED' | 'NO_SHOW' | 'COMPLETED';
export type StaffRole = 'HOSPITAL_ADMIN' | 'DOCTOR' | 'SCHEDULER';
