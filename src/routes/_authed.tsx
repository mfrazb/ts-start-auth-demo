import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prismaClient } from '~/utils/prisma'
import { Login } from '~/components/Login'
import { useAppSession } from '~/utils/session'
import { createMagicLink, sendMagicLink } from '~/utils/magic-link'

export const loginFn = createServerFn({ method: 'POST' })
  .validator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    // Create or find user
    let user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })

    // If user doesn't exist, create them
    if (!user) {
      user = await prismaClient.user.create({
        data: {
          email: data.email,
          password: '', // No password needed for magic link auth
        },
      })
    }

    // Create and send magic link
    const token = await createMagicLink(data.email)
    await sendMagicLink(data.email, token)

    return {
      success: true,
      message: 'Check your email for a magic link to sign in!',
    }
  })

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <Login />
    }

    throw error
  },
})
