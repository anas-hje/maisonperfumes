'use client'

import React from 'react'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  helpText?: string
}

export default function FormField({ label, error, required, children, helpText }: FormFieldProps) {
  return (
    <div className="flex flex-col space-y-1.5 font-[family-name:var(--font-inter)] mb-4">
      <label className="text-sm font-medium text-[#E8E4DF] flex items-center">
        {label}
        {required && <span className="text-red-400 ml-1" title="Requis">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
      {helpText && !error && <p className="text-xs text-[#6B6B70] mt-1">{helpText}</p>}
    </div>
  )
}
