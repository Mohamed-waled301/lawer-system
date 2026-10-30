import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "law_firm_jwt_secret_key_change_in_production_2024_xyz";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export const COOKIE_NAME = "law_session_token";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as "ADMIN" | "EMPLOYEE",
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("غير مصرح: يجب تسجيل الدخول أولاً للقيام بهذه العملية.");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("صلاحيات غير كافية: هذا الإجراء أو التقرير متاح للمدير فقط.");
  }
  return user;
}

