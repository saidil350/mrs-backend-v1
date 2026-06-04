"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import {
  countUsers,
  createUser as createUserDb,
  deleteUser as deleteUserDb,
  getAllUsers,
  getUserByEmail,
  updateUser as updateUserDb,
} from "@/lib/users";
import type { UserRole } from "@/types";

const VALID_ROLES: UserRole[] = ["admin", "sales"];

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

function assertAdmin(
  user: Awaited<ReturnType<typeof getCurrentUser>>,
): asserts user is CurrentUser {
  if (!user) redirect("/login");
  if (user.role !== "admin") {
    throw new Error("Hanya admin yang dapat mengelola akun");
  }
}

function parseRole(value: string): UserRole {
  if (!VALID_ROLES.includes(value as UserRole)) {
    throw new Error("Role tidak valid");
  }
  return value as UserRole;
}

export async function listUsersAction() {
  const user = await getCurrentUser();
  assertAdmin(user);
  return getAllUsers();
}

export async function createUserAction(formData: FormData) {
  const user = await getCurrentUser();
  assertAdmin(user);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = parseRole(String(formData.get("role") || "sales"));

  if (!name || !email || !password) {
    throw new Error("Nama, email, dan password wajib diisi");
  }
  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Email sudah terdaftar");
  }

  await createUserDb({ name, email, password, role });

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUserAction(formData: FormData) {
  const user = await getCurrentUser();
  assertAdmin(user);

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("ID tidak boleh kosong");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = parseRole(String(formData.get("role") || "sales"));

  if (!name || !email) {
    throw new Error("Nama dan email wajib diisi");
  }
  if (password && password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  // unique email check (skip self)
  const existing = await getUserByEmail(email);
  if (existing && existing.id !== id) {
    throw new Error("Email sudah dipakai akun lain");
  }

  await updateUserDb(id, {
    name,
    email,
    role,
    ...(password ? { password } : {}),
  });

  revalidatePath("/users");
  revalidatePath(`/users/${id}/edit`);
  redirect("/users");
}

export async function deleteUserAction(formData: FormData) {
  const user = await getCurrentUser();
  assertAdmin(user);

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("ID tidak boleh kosong");
  if (id === user.id) {
    throw new Error("Tidak dapat menghapus akun sendiri");
  }

  const total = await countUsers();
  if (total <= 1) {
    throw new Error("Tidak dapat menghapus akun terakhir");
  }

  await deleteUserDb(id);

  revalidatePath("/users");
}

export async function usersCountAction() {
  const user = await getCurrentUser();
  if (!user) return 0;
  return countUsers();
}
