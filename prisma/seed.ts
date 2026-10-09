import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@weballcreative.com' },
  })

  if (existing) {
    console.log('Admin already exists')
    return
  }

  const password = await hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@weballcreative.com',
      name: 'WeballCreative Admin',
      role: 'ADMIN',
      phone: process.env.WA_ADMIN_PHONE || null,
      password,
      isActive: true,
    },
  })

  console.log('Admin created:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
