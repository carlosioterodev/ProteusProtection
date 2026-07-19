'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { MessageCircle, X } from 'lucide-react'
import { sileo } from 'sileo'

const WHATSAPP_NUMBER = '5491100000000'
const WHATSAPP_MESSAGE = 'Hola! Me interesa conocer más sobre Proteus Protection.'

export function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (btnRef.current) {
      animate(btnRef.current, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 600,
        delay: 1200,
        ease: 'out(3)',
      })
    }
    if (pulseRef.current) {
      animate(pulseRef.current, {
        scale: [1, 1.8],
        opacity: [0.6, 0],
        duration: 1400,
        loop: true,
        ease: 'out(2)',
      })
    }
  }, [])

  useEffect(() => {
    if (open && popupRef.current) {
      animate(popupRef.current, {
        scale: [0.85, 1],
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 350,
        ease: 'out(3)',
      })
    }
  }, [open])

  const handleToggle = () => {
    setOpen(!open)
    if (!open) {
      animate(btnRef.current!, { rotate: [0, 15, -15, 0], duration: 400, ease: 'out(3)' })
    }
  }

  const handleSend = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    sileo.info({
      title: 'Abriendo WhatsApp',
      description: 'Te redirigimos a WhatsApp para continuar la conversación.',
    })
    setTimeout(() => window.open(url, '_blank'), 800)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          ref={popupRef}
          className="mb-4 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl opacity-0"
        >
          <div className="bg-[#075e54] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Proteus Support</p>
                <p className="text-xs text-white/80">En línea usualmente</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="bg-[#ece5dd] p-4">
            <div className="rounded-lg bg-white px-4 py-2.5 shadow-sm">
              <p className="text-sm text-gray-800">
                ¡Hola! 👋 ¿En qué podemos ayudarte con Proteus Protection?
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                {new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="border-t border-border bg-background p-4">
            <button
              type="button"
              onClick={handleSend}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20ba5a]"
            >
              <MessageCircle className="size-4" />
              Iniciar chat en WhatsApp
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <span
          ref={pulseRef}
          className="absolute inset-0 rounded-full bg-[#25d366] opacity-0"
          style={{ width: 56, height: 56 }}
        />
        <button
          ref={btnRef}
          type="button"
          onClick={handleToggle}
          aria-label={open ? 'Cerrar chat' : 'Abrir chat de WhatsApp'}
          className="relative flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-colors hover:bg-[#20ba5a] opacity-0"
        >
          {open ? (
            <X className="size-6" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
