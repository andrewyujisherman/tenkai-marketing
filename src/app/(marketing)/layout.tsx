import { Navbar } from '@/components/landing/Navbar'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
