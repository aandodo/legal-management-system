import { db, jsonError, jsonOk, toSafeUser } from "@/lib/api-store";

/**
 * POST /api/register
 * body: { name, email, password, department }
 * Registrasi khusus staff — wajib Gmail.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
    department?: string;
  } | null;

  const { name, email, password, department } = body ?? {};

  if (!name?.trim() || !email || !password || !department) {
    return jsonError("Seluruh data registrasi wajib diisi", 422);
  }
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    return jsonError("Registrasi staff wajib menggunakan email Gmail", 422);
  }
  if (password.length < 6) {
    return jsonError("Kata sandi minimal 6 karakter", 422);
  }
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return jsonError("Email sudah terdaftar. Silakan masuk.", 409);
  }
  if (department === "Divisi Hukum") {
    return jsonError("Akun Divisi Hukum dibuat oleh administrator sistem", 403);
  }

  const staffCount = db.users.filter((u) => u.role === "STAFF").length;
  const newUser = {
    id: `U-${String(db.users.length + 1).padStart(3, "0")}`,
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: "STAFF" as const,
    department,
    employee_id: `ST-${String(staffCount + 100).padStart(3, "0")}`,
    position: "Pegawai",
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);

  return jsonOk(toSafeUser(newUser), 201);
}
