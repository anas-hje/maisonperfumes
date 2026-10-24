'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAdminProductStore } from '@/lib/store/admin-products'
import { products as seedProducts } from '@/lib/data/products'
import { categories } from '@/lib/data/categories'
import DataTable from '@/components/admin/DataTable'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { formatPriceRange } from '@/lib/utils'
import { Product } from '@/lib/types'

export default function AdminProductsPage() {
  const { products, initialized, initializeProducts, deleteProduct } = useAdminProductStore()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [brandFilter, setBrandFilter] = useState<string>('')
  const [stockFilter, setStockFilter] = useState<string>('') // 'in_stock', 'low_stock', 'out_of_stock'

  useEffect(() => {
    if (!initialized) {
      initializeProducts(seedProducts)
    }
  }, [initialized, initializeProducts])

  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map((p) => p.brand))
    return Array.from(uniqueBrands).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (categoryFilter && p.category !== categoryFilter) return false
      
      // Brand filter
      if (brandFilter && p.brand !== brandFilter) return false
      
      // Stock filter
      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0)
      if (stockFilter === 'in_stock' && totalStock <= 10) return false
      if (stockFilter === 'low_stock' && (totalStock === 0 || totalStock > 10)) return false
      if (stockFilter === 'out_of_stock' && totalStock > 0) return false

      return true
    })
  }, [products, categoryFilter, brandFilter, stockFilter])

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id)
      toast.success('Produit supprimé avec succès')
      setProductToDelete(null)
    }
  }

  const columns = [
    {
      key: 'thumbnail',
      label: '',
      sortable: false,
      render: (item: Product) => (
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#141416] border border-[#2A2A2E] text-lg font-bold text-[#C8923C]">
          {item.brand.charAt(0)}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (item: Product) => (
        <div>
          <div className="font-medium text-[#E8E4DF]">{item.name}</div>
          <div className="text-xs text-[#9A9A9E] mt-0.5">{item.brand}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Catégorie',
      sortable: true,
      render: (item: Product) => {
        const cat = categories.find(c => c.slug === item.category)
        return <span className="text-[#9A9A9E]">{cat?.name || item.category}</span>
      }
    },
    {
      key: 'price',
      label: 'Prix',
      sortable: false,
      render: (item: Product) => (
        <span className="font-medium text-[#E8E4DF]">{formatPriceRange(item)}</span>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (item: Product) => {
        const totalStock = item.variants.reduce((acc, v) => acc + v.stock, 0)
        let colorClass = 'text-green-400'
        let text = `${totalStock} en stock`
        
        if (totalStock === 0) {
          colorClass = 'text-red-400'
          text = 'Rupture'
        } else if (totalStock <= 10) {
          colorClass = 'text-amber-400'
          text = `${totalStock} (Faible)`
        }
        
        return <span className={colorClass}>{text}</span>
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: false,
      render: (item: Product) => (
        <div className="flex gap-2">
          {item.isFeatured && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#C8923C]/10 text-[#C8923C] border border-[#C8923C]/20">Vedette</span>
          )}
          {item.isOnSale && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Promo</span>
          )}
          {item.isNewArrival && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Nouveau</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (item: Product) => (
        <div className="flex items-center justify-end gap-3">
          <Link 
            href={`/admin/produits/${item.id}`}
            className="text-[#9A9A9E] hover:text-[#E8E4DF] transition-colors"
            title="Modifier"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button 
            onClick={() => handleDeleteClick(item)}
            className="text-[#9A9A9E] hover:text-red-400 transition-colors"
            title="Supprimer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#E8E4DF] font-[family-name:var(--font-inter)]">Gestion des Produits</h1>
          <span className="bg-[#1E1E22] border border-[#2A2A2E] text-[#9A9A9E] text-xs font-medium px-2.5 py-1 rounded-full">
            {filteredProducts.length} produits
          </span>
        </div>
        <Link 
          href="/admin/produits/nouveau"
          className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 transition-colors font-[family-name:var(--font-inter)] text-sm shadow-[0_0_15px_rgba(200,146,60,0.2)]"
        >
          Ajouter un Produit
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#1E1E22] p-4 rounded-xl border border-[rgba(200,146,60,0.08)] flex flex-wrap gap-4 font-[family-name:var(--font-inter)]">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-[#9A9A9E]">Catégorie</label>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none focus:ring-1 focus:ring-[#C8923C] transition-colors"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-[#9A9A9E]">Marque</label>
          <select 
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none focus:ring-1 focus:ring-[#C8923C] transition-colors"
          >
            <option value="">Toutes les marques</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-[#9A9A9E]">Stock</label>
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none focus:ring-1 focus:ring-[#C8923C] transition-colors"
          >
            <option value="">Tous les statuts</option>
            <option value="in_stock">En stock (&gt;10)</option>
            <option value="low_stock">Stock faible (1-10)</option>
            <option value="out_of_stock">Rupture (0)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable 
        data={filteredProducts} 
        columns={columns}
        searchPlaceholder="Rechercher par nom, marque..."
        pageSize={10}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer le produit"
        message={productToDelete ? `Êtes-vous sûr de vouloir supprimer "${productToDelete.name}" ? Cette action est irréversible.` : ''}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
