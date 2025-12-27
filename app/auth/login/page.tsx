"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showInstructions, setShowInstructions] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10 space-y-4">
        <Card className="glass">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">GearGuard</h1>
              <p className="text-muted-foreground">Maintenance Management System</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="glass-sm bg-white/5 border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="glass-sm bg-white/5 border-white/20"
                />
              </div>

              {error && <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm">{error}</div>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-sm text-blue-400 hover:text-blue-300 underline"
              >
                {showInstructions ? "Hide" : "Show"} setup instructions
              </button>
            </div>
          </div>
        </Card>

        {showInstructions && (
          <Card className="glass border-blue-500/30">
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-foreground">First Time Setup?</h3>
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertDescription className="text-sm text-foreground">
                  <p className="font-medium mb-3">To create test users:</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs">
                    <li>Go to Supabase Dashboard → Authentication → Users</li>
                    <li>Click "Add user" and create a test account</li>
                    <li>Use any email and password you choose</li>
                    <li>Enter those credentials above to login</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="bg-foreground/5 p-4 rounded-lg">
                <p className="text-xs font-medium text-foreground mb-2">Example Credentials:</p>
                <div className="space-y-1 text-xs text-muted-foreground font-mono">
                  <p>
                    Email: <span className="text-foreground">admin@geargard.demo</span>
                  </p>
                  <p>
                    Password: <span className="text-foreground">DemoPassword123!</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                See <code className="bg-foreground/10 px-2 py-1 rounded">SETUP_GUIDE.md</code> for detailed
                instructions.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
