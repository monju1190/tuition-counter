'use server'

import prisma from '@/lib/db'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function createTuition(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const studentName = formData.get('studentName') as string
  const subject = formData.get('subject') as string
  const totalClasses = parseInt(formData.get('totalClasses') as string) || 12

  if (!studentName || !subject) {
    throw new Error('Please provide all details')
  }

  await prisma.tuition.create({
    data: {
      studentName,
      subject,
      totalClasses,
      userId: session.id
    }
  })

  revalidatePath('/dashboard')
}

export async function deleteTuition(id: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // delete related entries first
  await prisma.classEntry.deleteMany({
    where: { tuitionId: id }
  })

  await prisma.tuition.delete({
    where: { id }
  })

  revalidatePath('/dashboard')
}

export async function addClassEntry(tuitionId: string, dateStr: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // verify ownership
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId }
  })

  if (!tuition || tuition.userId !== session.id) {
    throw new Error('Unauthorized')
  }

  await prisma.classEntry.create({
    data: {
      date: new Date(dateStr),
      tuitionId
    }
  })

  revalidatePath(`/dashboard/tuition/${tuitionId}`)
  revalidatePath('/dashboard')
}

export async function resetTuitionCycle(tuitionId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // For this simple app, resetting just clears all entries for the tuition.
  // We could archive it if history is needed, but the prompt just said "reset hoye notun mash shuru hbe".
  // So deleting entries starts the counter from 0.
  await prisma.classEntry.deleteMany({
    where: { tuitionId }
  })

  revalidatePath(`/dashboard/tuition/${tuitionId}`)
  revalidatePath('/dashboard')
}

export async function deleteClassEntry(entryId: string, tuitionId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // verify ownership
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId }
  })

  if (!tuition || tuition.userId !== session.id) {
    throw new Error('Unauthorized')
  }

  await prisma.classEntry.delete({
    where: { id: entryId }
  })

  revalidatePath(`/dashboard/tuition/${tuitionId}`)
  revalidatePath('/dashboard')
}

export async function updateClassEntry(entryId: string, tuitionId: string, newDateStr: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // verify ownership
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId }
  })

  if (!tuition || tuition.userId !== session.id) {
    throw new Error('Unauthorized')
  }

  await prisma.classEntry.update({
    where: { id: entryId },
    data: { date: new Date(newDateStr) }
  })

  revalidatePath(`/dashboard/tuition/${tuitionId}`)
  revalidatePath('/dashboard')
}
