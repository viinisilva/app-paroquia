"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    comunidade: "",
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!formData.nome || !formData.email || !formData.telefone || !formData.senha || !formData.confirmarSenha) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem.")
      return
    }

    try {
      // Store user data in localStorage
      const userData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        comunidade: formData.comunidade,
        senha: formData.senha,
      }

      // Get existing users or initialize empty array
      const existingUsers = JSON.parse(localStorage.getItem("churchAppUsers") || "[]")

      // Check if email already exists
      if (existingUsers.some((user: any) => user.email === formData.email)) {
        setError("Este email já está cadastrado. Por favor, use outro email.")
        return
      }

      // Add new user
      existingUsers.push(userData)

      // Save back to localStorage
      localStorage.setItem("churchAppUsers", JSON.stringify(existingUsers))

      // Show success message
      setError("")
      setSuccess(true)

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      console.error("Erro ao salvar dados:", err)
      setError("Ocorreu um erro ao cadastrar. Por favor, tente novamente.")
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-opacity-80">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-amber-100 shadow-lg"></div>
            <Image
              src="/images/paroquia.jpg"
              alt="Paróquia"
              width={100}
              height={100}
              className="relative z-10 mx-auto rounded-full object-cover border-4 border-amber-200"
            />
          </div>
          <h1 className="text-3xl font-bold text-amber-900 font-cinzel">Cadastro de Membro</h1>
          <div className="church-divider w-32 mx-auto my-2"></div>
          <p className="text-amber-800">Crie sua conta de membro para acessar o App da Paróquia</p>
        </div>

        <Card className="church-card overflow-hidden">
          <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="mr-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-amber-900 font-cinzel">Cadastro de Novo Membro</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  Cadastro realizado com sucesso! Redirecionando para a página de login...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-amber-800 mb-1">
                    Nome completo *
                  </label>
                  <Input
                    id="nome"
                    type="text"
                    name="nome"
                    placeholder="Digite seu nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Digite seu email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                  <p className="text-xs text-amber-700 mt-1">Este email será usado para fazer login no aplicativo.</p>
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-amber-800 mb-1">
                    Telefone *
                  </label>
                  <Input
                    id="telefone"
                    type="tel"
                    name="telefone"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label htmlFor="comunidade" className="block text-sm font-medium text-amber-800 mb-1">
                    Comunidade (opcional)
                  </label>
                  <Select
                    value={formData.comunidade || ""}
                    onValueChange={(value) => handleSelectChange("comunidade", value)}
                  >
                    <SelectTrigger
                      id="comunidade"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    >
                      <SelectValue placeholder="Selecione sua comunidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matriz">Igreja Matriz</SelectItem>
                      <SelectItem value="santa-rita">Capela Santa Rita</SelectItem>
                      <SelectItem value="sao-jose">Capela São José</SelectItem>
                      <SelectItem value="outra">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-amber-800 mb-1">
                    Senha *
                  </label>
                  <Input
                    id="senha"
                    type="password"
                    name="senha"
                    placeholder="Crie uma senha segura"
                    value={formData.senha}
                    onChange={handleChange}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-amber-800 mb-1">
                    Confirmar senha *
                  </label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    name="confirmarSenha"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full church-button bg-amber-700 hover:bg-amber-800">
                    Cadastrar como Membro
                  </Button>
                  <p className="text-xs text-amber-700 mt-2 text-center">
                    Após o cadastro, você poderá fazer login usando seu email e senha.
                  </p>
                </div>
              </div>
            </form>

            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => router.push("/")} className="text-sm text-amber-700">
                Já tem uma conta? Faça login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
