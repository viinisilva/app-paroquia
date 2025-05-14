"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstallClick = () => {
    if (!installPrompt) return

    installPrompt.prompt()
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Usuário aceitou a instalação do PWA")
      } else {
        console.log("Usuário recusou a instalação do PWA")
      }
      setShowPrompt(false)
    })
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="church-card border-amber-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-900">Instalar App da Paróquia</p>
              <p className="text-sm text-amber-700">Instale o app para acesso rápido mesmo offline</p>
            </div>
            <Button onClick={handleInstallClick} className="church-button bg-amber-700 hover:bg-amber-800">
              <Download className="mr-2 h-4 w-4" />
              Instalar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
