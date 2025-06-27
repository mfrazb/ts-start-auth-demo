import { prismaClient } from './prisma'
import crypto from 'crypto'

// In production, you'd want to use a proper email service like SendGrid, AWS SES, etc.
// For now, we'll just log the magic link to the console
export async function sendMagicLink(email: string, token: string) {
  const magicLink = `${process.env.BASE_URL || 'http://localhost:3000'}/verify?token=${token}`
  
  console.log('Magic link sent to:', email)
  console.log('Magic link:', magicLink)
  
  // TODO: Replace with actual email sending logic
  // await sendEmail({
  //   to: email,
  //   subject: 'Sign in to Triad Buying Co-op',
  //   html: `
  //     <h1>Sign in to Triad Buying Co-op</h1>
  //     <p>Click the link below to sign in:</p>
  //     <a href="${magicLink}">Sign In</a>
  //     <p>This link will expire in 10 minutes.</p>
  //   `
  // })
}

export async function createMagicLink(email: string) {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Store the token in the database with expiration
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  await prismaClient.magicLink.create({
    data: {
      email,
      token,
      expiresAt,
    },
  })
  
  return token
}

export async function verifyMagicLink(token: string) {
  // Find the magic link
  const magicLink = await prismaClient.magicLink.findUnique({
    where: { token },
  })
  
  if (!magicLink) {
    return { error: 'Invalid token' }
  }
  
  // Check if expired
  if (magicLink.expiresAt < new Date()) {
    // Clean up expired token
    await prismaClient.magicLink.delete({
      where: { token },
    })
    return { error: 'Token expired' }
  }
  
  // Clean up the used token
  await prismaClient.magicLink.delete({
    where: { token },
  })
  
  return { email: magicLink.email }
} 