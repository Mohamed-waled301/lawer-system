"use server";

import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  COOKIE_NAME,
  getCurrentUser,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/activity";

export async function loginAction(formData: { username: string; password: string }) {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "بيانات غير صالحة" };
  }

  const { username, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !user.isActive) {
    return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  }

  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  }

  const token = await createSessionToken({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as "ADMIN" | "EMPLOYEE",
  });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  await logActivity({
    action: "LOGIN",
    entityType: "USER",
    entityId: user.id,
    details: `تسجيل دخول ناجح للمستخدم ${user.name} (${user.username})`,
  });

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  };
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    await logActivity({
      action: "LOGOUT",
      entityType: "USER",
      entityId: user.id,
      details: `تسجيل خروج للمستخدم ${user.name}`,
    });
  }
  cookies().delete(COOKIE_NAME);
  return { success: true };
}

export async function getSessionUser() {
  return await getCurrentUser();
}

