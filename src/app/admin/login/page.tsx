'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Connexion réussie')
        router.push('/admin')
        router.refresh()
      } else {
        const body = await response.json().catch(() => null)
        toast.error(body?.error || 'Identifiants incorrects')
      }
    } catch {
      toast.error('Impossible de contacter le serveur.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center p-4 font-[family-name:var(--font-inter)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1E1E22]/80 backdrop-blur-xl border border-[rgba(200,146,60,0.1)] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#C8923C] rounded-xl flex items-center justify-center text-[#0F0F11] font-bold text-3xl mx-auto mb-4">
              M
            </div>
            <h1 className="text-2xl font-bold text-[#E8E4DF] mb-2 tracking-wide">Maison</h1>
            <p className="text-[#9A9A9E]">Espace Administration</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#E8E4DF] mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@maison.ma"
                className="w-full px-4 py-3 bg-[#141416] border border-[#2A2A2E] rounded-xl text-[#E8E4DF] focus:outline-none focus:border-[#C8923C] transition-colors placeholder:text-[#6B6B70]"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E8E4DF] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#141416] border border-[#2A2A2E] rounded-xl text-[#E8E4DF] focus:outline-none focus:border-[#C8923C] transition-colors placeholder:text-[#6B6B70]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9E] hover:text-[#C8923C] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#0F0F11] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Se Connecter</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
