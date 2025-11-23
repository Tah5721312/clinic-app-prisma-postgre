import 'server-only';
import { prisma } from '@/lib/prisma';
import { AbilityRule, Actions, Subjects, createAbilityFromRules, AppAbility } from '@/lib/ability';

type DbPermissionRow = {
  SUBJECT: string;
  ACTION: string;
  FIELD_NAME?: string | null;
  CAN_ACCESS?: number | null;
};

const subjectMap: Record<string, Subjects> = {
  ALL: 'all',
  USERS: 'User',
  USER: 'User',
  PATIENTS: 'Patient',
  PATIENT: 'Patient',
  DOCTORS: 'Doctor',
  DOCTOR: 'Doctor',
  APPOINTMENTS: 'Appointment',
  APPOINTMENT: 'Appointment',
  DASHBOARD: 'Dashboard',
};

const actionMap: Record<string, Actions> = {
  MANAGE: 'manage',
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

function mapDbRowsToRules(rows: DbPermissionRow[]): AbilityRule[] {
  const rules: AbilityRule[] = [];

  for (const row of rows) {
    const subjectKey = (row.SUBJECT || '').toUpperCase();
    const actionKey = (row.ACTION || '').toUpperCase();
    const mappedSubject = subjectMap[subjectKey];
    const mappedAction = actionMap[actionKey];
    if (!mappedSubject || !mappedAction) continue;

    if (row.CAN_ACCESS === 0) continue;

    const rule: AbilityRule = {
      action: mappedAction,
      subject: mappedSubject,
    };

    if (row.FIELD_NAME && row.FIELD_NAME.trim() !== '') {
      rule.fields = row.FIELD_NAME;
    }

    rules.push(rule);
  }

  return rules;
}

export async function fetchAbilityRulesFromDB(userId: number): Promise<AbilityRule[]> {
  // Use Prisma to fetch user with role and permissions
  const user = await prisma.user.findUnique({
    where: { userId: BigInt(userId) },
    include: {
      role: {
        include: {
          rolePermissions: true,
        },
      },
    },
  });

  if (!user || !user.role) {
    return [];
  }

  // Transform Prisma results to match DbPermissionRow format
  const rows: DbPermissionRow[] = (user.role.rolePermissions || []).map(rp => ({
    SUBJECT: rp.subject,
    ACTION: rp.action,
    FIELD_NAME: rp.fieldName,
    CAN_ACCESS: rp.canAccess,
  }));

  return mapDbRowsToRules(rows);
}

export async function defineAbilityFromDB(userId: number): Promise<AppAbility> {
  // Handle guest user (ID = -1)
  if (userId === -1) {
    return defineGuestAbility();
  }
  
  const rules = await fetchAbilityRulesFromDB(userId);
  return createAbilityFromRules(rules);
}

export function defineGuestAbility(): AppAbility {
  const guestRules: AbilityRule[] = [
    { action: 'read', subject: 'Doctor' },
    { action: 'read', subject: 'Appointment' },
  ];
  return createAbilityFromRules(guestRules);
}


