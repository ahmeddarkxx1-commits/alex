import { AdminUser } from '@/types/database';

export function parseSupabaseAdmin(row: any): AdminUser {
  let deptId = row.assigned_department_id || null;
  let pass = row.password;
  let active = row.is_active;

  if (deptId && typeof deptId === 'string' && deptId.includes(':::')) {
    const parts = deptId.split(':::');
    deptId = parts[0] === 'all' || !parts[0] ? null : parts[0];
    if (!pass && parts[1]) pass = parts[1];
    if (active === undefined && parts[2]) active = parts[2] === '1';
  }

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    assigned_department_id: deptId,
    password: pass || 'admin123',
    is_active: active !== undefined ? active : true,
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function serializeAdminDept(admin: Partial<AdminUser>): string {
  const deptPart = admin.assigned_department_id || 'all';
  const passPart = admin.password || 'admin123';
  const activePart = admin.is_active !== false ? '1' : '0';
  return `${deptPart}:::${passPart}:::${activePart}`;
}
