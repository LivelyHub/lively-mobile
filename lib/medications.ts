import type { Medication, MedicationLog } from '@/lib/api/types';
import { isToday } from '@/lib/time';

// Per-slot "confirmed today?" logic, shared so the Progress screen and the
// upcoming Medications screen (M6) read today's state the same way. Logs carry
// only a timestamp, not which scheduled slot they satisfy, so we confirm slots
// in time order: N confirmations today satisfy the N earliest slots of that med.
export type MedSlotStatus = {
  medicationId: string;
  name: string;
  dosage: string;
  time: string; // "HH:MM"
  confirmed: boolean;
};

export function todayMedSlots(medications: Medication[], logs: MedicationLog[]): MedSlotStatus[] {
  const slots: MedSlotStatus[] = [];
  for (const med of medications) {
    if (!med.active) continue;
    const takenToday = logs.filter((l) => l.medication_id === med.id && isToday(l.taken_at)).length;
    const ordered = [...med.schedule_times].sort();
    ordered.forEach((time, index) => {
      slots.push({
        medicationId: med.id,
        name: med.name,
        dosage: med.dosage,
        time,
        confirmed: index < takenToday,
      });
    });
  }
  return slots;
}

export function unconfirmedTodaySlots(
  medications: Medication[],
  logs: MedicationLog[],
): MedSlotStatus[] {
  return todayMedSlots(medications, logs).filter((slot) => !slot.confirmed);
}
