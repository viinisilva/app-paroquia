"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PWAInstallPrompt from "@/components/pwa-install-prompt"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [hasUsers, setHasUsers] = useState(false)

  // Check if there are registered users
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("churchAppUsers") || "[]")
      setHasUsers(users.length > 0)
    } catch (err) {
      console.error("Erro ao verificar usuários:", err)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    try {
      // Check for demo account
      if ((email === "admin@admin.com" || email === "admin") && password === "admin") {
        // Store demo user info
        localStorage.setItem(
          "churchAppCurrentUser",
          JSON.stringify({
            nome: "Administrador",
            email: "admin@admin.com",
            comunidade: "matriz",
          }),
        )
        router.push("/dashboard")
        return
      }

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("churchAppUsers") || "[]")

      // Find user with matching email
      const user = users.find((u: any) => u.email === email)

      if (user && user.senha === password) {
        // Store current user info
        localStorage.setItem(
          "churchAppCurrentUser",
          JSON.stringify({
            nome: user.nome,
            email: user.email,
            comunidade: user.comunidade,
          }),
        )

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError("Email ou senha incorretos.")
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      setError("Ocorreu um erro ao fazer login. Por favor, tente novamente.")
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-opacity-80">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-40 h-40 mx-auto mb-4">
            <Image
              src="/images/logo.png"
              alt="Paróquia São Roque"
              width={160}
              height={160}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-amber-900 font-cinzel">Paróquia São Roque</h1>
          <div className="church-divider w-32 mx-auto my-2"></div>
          <p className="text-amber-800">Faça login para acessar</p>
        </div>

        <Card className="church-card overflow-hidden">
          <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100 pb-6">
            <div className="flex justify-center mb-2">
              <div className="text-amber-800 text-2xl">✝</div>
            </div>
            <CardTitle className="text-center text-amber-900 font-cinzel">Login</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Seu email cadastrado"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-amber-800 mb-1">
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full church-button bg-amber-700 hover:bg-amber-800">
                Entrar
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => router.push("/cadastro")} className="text-sm text-amber-700">
                Não tem uma conta? Cadastre-se
              </Button>
            </div>

            {!hasUsers && (
              <Alert className="mt-4 bg-blue-50 text-blue-800 border-blue-200">
                <AlertDescription>
                  <p className="font-medium">Conta de demonstração:</p>
                  <p>Email: admin@admin.com</p>
                  <p>Senha: admin</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <PWAInstallPrompt />
    </main>
  )
}
