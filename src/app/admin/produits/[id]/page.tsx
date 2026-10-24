'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useAdminProductStore } from '@/lib/store/admin-products'
import { categories } from '@/lib/data/categories'
import FormField from '@/components/admin/FormField'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { CategorySlug, Gender } from '@/lib/types'

// Zod Schema
const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  brand: z.string().min(1, 'La marque est requise'),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  subcategory: z.string().min(1, 'La sous-catégorie est requise'),
  gender: z.enum(['homme', 'femme', 'unisexe']),
  tags: z.string(),
  variants: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, 'Le label est requis'),
      price: z.number().min(1, 'Le prix doit être supérieur à 0'),
      compareAtPrice: z.number().optional().nullable(),
      stock: z.number().min(0, 'Le stock ne peut pas être négatif'),
      sku: z.string().min(1, 'Le SKU est requis'),
    })
  ).min(1, 'Au moins une variante est requise'),
  images: z.array(z.string().min(1, 'L\'URL/chemin de l\'image est requis')).min(1, 'Au moins une image est requise'),
  isFeatured: z.boolean(),
  isOnSale: z.boolean(),
  isNewArrival: z.boolean(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getProductById, updateProduct, deleteProduct } = useAdminProductStore()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const product = getProductById(params.id)

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      brand: '',
      description: '',
      category: 'parfums',
      subcategory: '',
      gender: 'unisexe',
      tags: '',
      variants: [],
      images: ['/images/placeholder.jpg'],
      isFeatured: false,
      isOnSale: false,
      isNewArrival: false,
      rating: 0,
      reviewCount: 0,
    }
  })

  useEffect(() => {
    setIsClient(true)
    if (product) {
      reset({
        ...product,
        tags: product.tags.join(', '),
      })
    }
  }, [product, reset])

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  })

  const watchCategory = watch('category')
  const watchTags = watch('tags')

  const activeCategory = categories.find(c => c.slug === watchCategory)
  const subcategories = activeCategory?.subcategories || []

  const onSubmit = (data: ProductFormValues) => {
    if (!product) return

    try {
      const updatedProduct = {
        ...data,
        category: data.category as CategorySlug,
        gender: data.gender as Gender,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        variants: data.variants.map(v => ({
          ...v,
          compareAtPrice: v.compareAtPrice || undefined
        })),
        images: data.images.filter(Boolean)
      }

      updateProduct(params.id, updatedProduct)
      toast.success('Produit modifié avec succès')
      router.push('/admin/produits')
    } catch (error) {
      console.error('[admin/produits] Failed to update product', error)
      toast.error('Erreur lors de la modification du produit')
    }
  }

  const handleDelete = () => {
    deleteProduct(params.id)
    toast.success('Produit supprimé avec succès')
    router.push('/admin/produits')
  }

  const tagList = watchTags ? watchTags.split(',').map(t => t.trim()).filter(Boolean) : []

  if (!isClient) return null

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 font-[family-name:var(--font-inter)] text-center">
        <h1 className="text-4xl font-bold text-[#E8E4DF] mb-4">Produit Introuvable</h1>
        <p className="text-[#9A9A9E] mb-8">Le produit que vous essayez de modifier n&apos;existe pas ou a été supprimé.</p>
        <Link 
          href="/admin/produits"
          className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 transition-colors"
        >
          Retour aux Produits
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 font-[family-name:var(--font-inter)]">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/admin/produits" className="text-[#9A9A9E] hover:text-[#E8E4DF] flex items-center text-sm transition-colors w-fit mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux produits
          </Link>
          <h1 className="text-2xl font-bold text-[#E8E4DF]">Modifier le Produit</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#1E1E22] p-6 rounded-2xl border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Informations de Base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nom du Produit" required error={errors.name?.message}>
              <input type="text" {...register('name')} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none" />
            </FormField>

            <FormField label="Marque" required error={errors.brand?.message}>
              <input type="text" {...register('brand')} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none" />
            </FormField>
          </div>

          <FormField label="Slug" required error={errors.slug?.message}>
            <input type="text" {...register('slug')} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none" />
          </FormField>

          <FormField label="Description" required error={errors.description?.message}>
            <textarea {...register('description')} rows={4} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none resize-y" />
          </FormField>
        </div>

        {/* Categorization */}
        <div className="bg-[#1E1E22] p-6 rounded-2xl border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Catégorisation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Catégorie" required error={errors.category?.message}>
              <select {...register('category')} className="form-select bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none">
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Sous-catégorie" required error={errors.subcategory?.message}>
              <select {...register('subcategory')} className="form-select bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none">
                {subcategories.map(sub => (
                  <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Genre" required error={errors.gender?.message}>
            <div className="flex gap-4">
              {['homme', 'femme', 'unisexe'].map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm text-[#E8E4DF] cursor-pointer">
                  <input type="radio" value={g} {...register('gender')} className="accent-[#C8923C]" />
                  <span className="capitalize">{g}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Tags" helpText="Séparés par des virgules" error={errors.tags?.message}>
            <input type="text" {...register('tags')} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none" />
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tagList.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#141416] border border-[#2A2A2E] text-[#9A9A9E]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </FormField>
        </div>

        {/* Variants */}
        <div className="bg-[#1E1E22] p-6 rounded-2xl border border-[rgba(200,146,60,0.08)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#E8E4DF]">Variantes</h2>
            <button 
              type="button" 
              onClick={() => appendVariant({ id: `v-${Date.now()}-${variantFields.length}`, label: '', price: 0, compareAtPrice: null, stock: 0, sku: '' })}
              className="text-sm font-medium text-[#C8923C] hover:text-[#D4A853] transition-colors"
            >
              + Ajouter une Variante
            </button>
          </div>
          
          {errors.variants?.root?.message && (
            <p className="text-sm text-red-400 mb-4">{errors.variants.root.message}</p>
          )}

          <div className="space-y-4">
            {variantFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-[#141416] border border-[#2A2A2E] rounded-xl relative">
                {variantFields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeVariant(index)}
                    className="absolute top-4 right-4 text-[#9A9A9E] hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <FormField label="Label" required error={errors.variants?.[index]?.label?.message}>
                      <input type="text" {...register(`variants.${index}.label`)} className="form-input bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E8E4DF] w-full" />
                    </FormField>
                  </div>
                  <FormField label="Prix (MAD)" required error={errors.variants?.[index]?.price?.message}>
                    <input type="number" step="0.01" {...register(`variants.${index}.price`, { valueAsNumber: true })} className="form-input bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E8E4DF] w-full" />
                  </FormField>
                  <FormField label="Prix barré" error={errors.variants?.[index]?.compareAtPrice?.message}>
                    <input type="number" step="0.01" {...register(`variants.${index}.compareAtPrice`, { setValueAs: v => v === '' || v === null || isNaN(v) ? null : parseFloat(v) })} className="form-input bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E8E4DF] w-full" />
                  </FormField>
                  <FormField label="Stock" required error={errors.variants?.[index]?.stock?.message}>
                    <input type="number" {...register(`variants.${index}.stock`, { valueAsNumber: true })} className="form-input bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E8E4DF] w-full" />
                  </FormField>
                  <div className="lg:col-span-2">
                    <FormField label="SKU" required error={errors.variants?.[index]?.sku?.message}>
                      <input type="text" {...register(`variants.${index}.sku`)} className="form-input bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[#E8E4DF] w-full" />
                    </FormField>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-[#1E1E22] p-6 rounded-2xl border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Images du Produit</h2>
          
          <div className="space-y-4">
            <FormField label="Image Principale (URL ou chemin)" required error={errors.images?.[0]?.message}>
              <input type="text" {...register('images.0')} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full" placeholder="/images/produit.jpg" />
            </FormField>
            
            <FormField label="Image Secondaire (URL ou chemin)" error={errors.images?.[1]?.message}>
              <input type="text" {...register('images.1')} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full" placeholder="/images/produit-2.jpg" />
            </FormField>
            
            <FormField label="Troisième Image (URL ou chemin)" error={errors.images?.[2]?.message}>
              <input type="text" {...register('images.2')} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full" placeholder="/images/produit-3.jpg" />
            </FormField>
          </div>
        </div>

        {/* Options */}
        <div className="bg-[#1E1E22] p-6 rounded-2xl border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <label className="flex items-center justify-between p-4 bg-[#141416] border border-[#2A2A2E] rounded-xl cursor-pointer">
              <span className="text-sm font-medium text-[#E8E4DF]">Produit Vedette</span>
              <input type="checkbox" {...register('isFeatured')} className="w-5 h-5 accent-[#C8923C] rounded border-[#2A2A2E] bg-[#1E1E22]" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#141416] border border-[#2A2A2E] rounded-xl cursor-pointer">
              <span className="text-sm font-medium text-[#E8E4DF]">En Promotion</span>
              <input type="checkbox" {...register('isOnSale')} className="w-5 h-5 accent-[#C8923C] rounded border-[#2A2A2E] bg-[#1E1E22]" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#141416] border border-[#2A2A2E] rounded-xl cursor-pointer">
              <span className="text-sm font-medium text-[#E8E4DF]">Nouveauté</span>
              <input type="checkbox" {...register('isNewArrival')} className="w-5 h-5 accent-[#C8923C] rounded border-[#2A2A2E] bg-[#1E1E22]" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Note (0-5)" error={errors.rating?.message}>
              <input type="number" step="0.1" min="0" max="5" {...register('rating', { valueAsNumber: true })} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none" />
            </FormField>
            <FormField label="Nombre d'avis" error={errors.reviewCount?.message}>
              <input type="number" min="0" {...register('reviewCount', { valueAsNumber: true })} className="form-input bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none" />
            </FormField>
          </div>
        </div>

        {/* Sticky Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F0F11]/80 backdrop-blur-md border-t border-[rgba(200,146,60,0.08)] z-10 flex justify-between gap-3 sm:pl-64">
          <div className="max-w-4xl mx-auto w-full flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-lg px-6 py-2.5 transition-colors text-sm"
            >
              Supprimer le Produit
            </button>
            <div className="flex gap-3">
              <Link 
                href="/admin/produits"
                className="px-6 py-2.5 rounded-lg border border-[#2A2A2E] text-[#E8E4DF] bg-[#141416] hover:bg-[#252529] transition-colors font-medium text-sm"
              >
                Annuler
              </Link>
              <button 
                type="submit"
                className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 transition-colors text-sm"
              >
                Enregistrer les Modifications
              </button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
