import { CookieBanner } from './_components/CookieBanner'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieBanner />
    </>
  )
}
