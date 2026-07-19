'use client'

import { SiteNav } from '@/components/landing/site-nav'
import { Hero } from '@/components/landing/hero'
import { Products } from '@/components/landing/products'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { CtaFooter } from '@/components/landing/cta-footer'
import { WhatsAppButton } from '@/components/whatsapp-button'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <Products />
        <Features />
        <Pricing />
        <CtaFooter />
      </main>
      <WhatsAppButton />
    </div>
  )
}
