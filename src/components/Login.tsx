import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '../hooks/useMutation'
import { loginFn } from '../routes/_authed'
import { Auth } from './Auth'

export function Login() {
  const router = useRouter()

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (ctx.data?.success) {
        // Don't navigate - show success message instead
        return
      }
    },
  })

  return (
    <Auth
      actionText="Send Magic Link"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement)

        loginMutation.mutate({
          data: {
            email: formData.get('email') as string,
          },
        })
      }}
      afterSubmit={
        loginMutation.data ? (
          <div className={`text-center ${loginMutation.data.success ? 'text-green-400' : 'text-red-400'}`}>
            {loginMutation.data.message}
            {loginMutation.data.success && (
              <div className="mt-2 text-sm text-gray-500">
                Check your email and click the magic link to sign in.
              </div>
            )}
          </div>
        ) : null
      }
    />
  )
}
