'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'tuition_session'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Please fill in all fields' }
  }

  const user = await prisma.user.findUnique({
    where: { username }
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
