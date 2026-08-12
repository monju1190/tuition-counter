'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'tuition_session'

export async function login(formData: FormData) {
  const username = (formData.get('username') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!username || !password) {
    return { error: 'Please fill in all fields' }
  }

  const user = await prisma.user.findFirst({
    where: { 
      username: {
        equals: username,
        mode: 'insensitive'
      }
    }
  })

  if (!user) {
    return { error: 'Invalid username or password' }
  }

  const isValid = await bcrypt.compare(password, user.password)
  
  if (!isValid) {
    return { error: 'Invalid username or password' }
  }

  // Create session (just storing user ID for this simple app)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const username = (formData.get('username') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!username || !password) {
    return { error: 'Please fill in all fields' }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { 
      username: {
        equals: username,
        mode: 'insensitive'
      }
    }
  })

  if (existingUser) {
    return { error: 'Username already taken' }
  }

  // Create new user
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword
    }
  })

  // Create session
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/')
}

export async function getSession() {
  const cookieStore = await cookies()
  const userId = cookieStore.get(SESSION_COOKIE)?.value

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true }
  })

  return user
}

export async function changePassword(formData: FormData) {
  const currentPassword = (formData.get('currentPassword') as string)?.trim()
  const newPassword = (formData.get('newPassword') as string)?.trim()

  if (!currentPassword || !newPassword) {
    return { error: 'Please fill in all fields' }
  }

  const session = await getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id }
  })

  if (!user) {
    return { error: 'User not found' }
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return { error: 'Incorrect current password' }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  await prisma.user.update({
    where: { id: session.id },
    data: { password: hashedPassword }
  })

  return { success: true }
}
