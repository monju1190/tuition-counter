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

  // delete related entries and cycles first
  await prisma.classEntry.deleteMany({
    where: { tuitionId: id }
  })
  await prisma.tuitionCycle.deleteMany({
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

export async function resetTuitionCycle(tuitionId: string, cycleName?: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId }
  })

  if (!tuition || tuition.userId !== session.id) {
    throw new Error('Unauthorized')
  }

  // Count past cycles to calculate cycle number
  const pastCyclesCount = await prisma.tuitionCycle.count({
    where: { tuitionId }
  })

  const cycleNumber = pastCyclesCount + 1

  // Create TuitionCycle archive
  const cycle = await prisma.tuitionCycle.create({
    data: {
      cycleNumber,
      name: cycleName?.trim() || `Cycle ${cycleNumber}`,
      totalClasses: tuition.totalClasses,
      completedAt: new Date(),
      tuitionId
    }
  })

  // Move all currently active entries to this completed cycle
  await prisma.classEntry.updateMany({
    where: {
      tuitionId,
      cycleId: null
    },
    data: {
      cycleId: cycle.id
    }
  })

  revalidatePath(`/dashboard/tuition/${tuitionId}`)
  revalidatePath('/dashboard')
}

export async function deleteTuitionCycle(cycleId: string, tuitionId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId }
  })

  if (!tuition || tuition.userId !== session.id) {
    throw new Error('Unauthorized')
  }

  // Delete all class entries in this cycle
  await prisma.classEntry.deleteMany({
    where: { cycleId }
  })

  // Delete the cycle itself
  await prisma.tuitionCycle.delete({
    where: { id: cycleId }
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

export async function togglePaymentStatus(cycleId: string, tuitionId: string, currentIsPaid: boolean) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId }
  })

  if (!tuition || tuition.userId !== session.id) {
    throw new Error('Unauthorized')
  }

  await prisma.tuitionCycle.update({
    where: { id: cycleId },
    data: {
      isPaid: !currentIsPaid,
      paidAt: !currentIsPaid ? new Date() : null
    }
  })

  revalidatePath(`/dashboard/tuition/${tuitionId}`)
  revalidatePath('/dashboard')
}
