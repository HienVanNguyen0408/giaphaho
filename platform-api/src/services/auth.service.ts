import { prisma } from '../lib/prisma'
import { comparePassword } from '../utils/hash'
import { signToken } from '../utils/jwt'

export async function login(email: string, password: string) {
  const admin = await prisma.platformAdmin.findUnique({ where: { email } })

  if (!admin) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const valid = await comparePassword(password, admin.password)
  if (!valid) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const token = signToken({ adminId: admin.id, email: admin.email, role: admin.role })

  return { token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } }
}

export async function getMe(adminId: string) {
  const admin = await prisma.platformAdmin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  })

  if (!admin) {
    throw new Error('ADMIN_NOT_FOUND')
  }

  return admin
}
