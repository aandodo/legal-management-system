import { db, jsonError, jsonOk, toSafeUser } from "@/lib/api-store";

/**
 * POST /api/login
 * body: { identifier: string (email atau ID pegawai), password: string }
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    identifier?: string;
    password?: string;
  } | null;

  if (!body?.identifier || !body?.password) {
    return jsonError("Email/ID pegawai dan kata sandi wajib diisi", 422);
  }

  const identifier = body.identifier.trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === identifier ||
      u.employee_id.toLowerCase() === identifier
  );

  if (!user || user.password !== body.password) {
    return jsonError("Kredensial tidak valid. Periksa kembali email/ID dan kata sandi Anda.", 401);
  }

  return jsonOk({
    token: `mock-token-${user.id}-${Date.now()}`,
    user: toSafeUser(user),
  });
}
