import { redirect } from 'next/navigation'
import { Navbar } from '@/components/landing/Navbar'
import { createServerClient } from '@/lib/supabase'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
