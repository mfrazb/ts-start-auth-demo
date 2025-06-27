import { redirect, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { verifyMagicLink } from '~/utils/magic-link'
import { useAppSession } from '~/utils/session'

export const verifyFn = createServerFn({ method: 'GET' })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const result = await verifyMagicLink(data.token)
    
    if (result.error) {
      return {
        error: true,
        message: result.error,
      }
    }

    // Create a session
    const session = await useAppSession()
    
    // Store the user's email in the session
    await session.update({
      userEmail: result.email,
    })

    // Redirect to home page
    throw redirect({
      href: '/',
    })
  })

export const Route = createFileRoute('/verify')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string,
    }
  },
  component: VerifyComp,
})

function VerifyComp() {
  const { token } = Route.useSearch()
  
  // Call the verification function when the component mounts
  verifyFn({ data: { token } })
  
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center p-8">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your magic link...</h1>
        <div className="text-gray-500">
          Please wait while we verify your magic link and sign you in.
        </div>
      </div>
    </div>
  )
} 