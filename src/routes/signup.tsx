import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { prismaClient } from '~/utils/prisma'
import { useMutation } from '~/hooks/useMutation'
import { Auth } from '~/components/Auth'
import { createMagicLink, sendMagicLink } from '~/utils/magic-link'

export const signupFn = createServerFn({ method: 'POST' })
  .validator(
    (d: { email: string; redirectUrl?: string }) => d,
  )
  .handler(async ({ data }) => {
    // Check if the user already exists
    const found = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (found) {
      return {
        error: true,
        userExists: true,
        message: 'User already exists. Try signing in instead.',
      }
    }

    // Create the user
    const user = await prismaClient.user.create({
      data: {
        email: data.email,
        password: '', // No password needed for magic link auth
      },
    })

    // Create and send magic link
    const token = await createMagicLink(data.email)
    await sendMagicLink(data.email, token)

    return {
      success: true,
      message: 'Check your email for a magic link to complete your signup!',
    }
  })

export const Route = createFileRoute('/signup')({
  component: SignupComp,
})

function SignupComp() {
  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
  })

  return (
    <Auth
      actionText="Sign Up"
      status={signupMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement)

        signupMutation.mutate({
          data: {
            email: formData.get('email') as string,
          },
        })
      }}
      afterSubmit={
        signupMutation.data ? (
          <div className={`text-center ${signupMutation.data.success ? 'text-green-400' : 'text-red-400'}`}>
            {signupMutation.data.message}
            {signupMutation.data.success && (
              <div className="mt-2 text-sm text-gray-500">
                Check your email and click the magic link to complete your signup.
              </div>
            )}
          </div>
        ) : null
      }
    />
  )
}
