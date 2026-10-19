import type { FacilityCategory, FacilityUsage } from '@/features/facility/api'

export const CATEGORY_LABELS: Record<FacilityCategory, string> = {
  FURNITURE: 'Furnitur',
  SANITARY: 'Sanitasi',
  APPLIANCE: 'Elektronik',
  OTHER: 'Lainnya',
}

export const USAGE_LABELS: Record<FacilityUsage, string> = {
  ASSIGNED: 'Per penghuni',
  SHARED: 'Bersama',
}
