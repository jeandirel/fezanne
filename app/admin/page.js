'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus, Minus, Trash2, ArrowLeft, ShoppingBag, Save, Lock, LogOut,
  Sparkles, RefreshCw, Eye, Image as ImageIcon, Sliders, Type, DollarSign,
  Copy, Search, Package, ReceiptText, ChevronDown, ChevronUp
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

const HERO_IMG = 'https://customer-assets.emergentagent.com/job_jus-frais-marseille/artifacts/7jovrgtv_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%286%29.jpeg'

const GRADIENT_PRESETS = [
  { name: 'Rouge profond (Bissap)', value: 'from-rose-700 via-red-800 to-rose-900' },
  { name: 'Vert / Jaune (Detox)', value: 'from-lime-500 via-yellow-500 to-amber-600' },
  { name: 'Orange chaud (Vita)', value: 'from-orange-400 via-amber-500 to-orange-600' },
  { name: 'Rose / Rouge (Water)', value: 'from-pink-500 via-rose-500 to-red-600' },
  { name: 'Violet mystique', value: 'from-purple-600 via-indigo-700 to-violet-800' },
  { name: 'Vert Émeraude', value: 'from-teal-600 via-emerald-700 to-green-800' },
]

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [authError, setAuthError] = useState('')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ count: 0, totalRevenue: 0 })
  const [activeTab, setActiveTab] = useState('products')
  const [expandedOrder, setExpandedOrder] = useState(null)

  // Form fields
  const [formId, setFormId] = useState('')
  const [formName, setFormName] = useState('')
  const [formTagline, setFormTagline] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIngredients, setFormIngredients] = useState('')
  const [formColor, setFormColor] = useState('')
  const [formEmoji, setFormEmoji] = useState('')
  const [formPrice, setFormPrice] = useState(5)
  const [formImage, setFormImage] = useState('')
  const [posX, setPosX] = useState(50)
  const [posY, setPosY] = useState(50)
  const [zoom, setZoom] = useState(380)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/orders/stats')
      const data = await res.json()
      if (data) setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchOrders = useCallback(async (creds) => {
    setLoadingOrders(true)
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'x-admin-username': creds.username,
          'x-admin-password': creds.password,
        }
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('jfm-admin-user')
      const savedPass = localStorage.getItem('jfm-admin-pass')
      if (savedUser && savedPass) {
        setUsername(savedUser)
        setPassword(savedPass)
        verifyCredentials(savedUser, savedPass)
      } else {
        setInitialLoading(false)
      }
    }
  }, [])

  const verifyCredentials = async (userToVerify, passToVerify) => {
    setLoading(true)
    setInitialLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'x-admin-username': userToVerify,
          'x-admin-password': passToVerify
        }
      })
      if (res.status === 200) {
        const prodRes = await fetch('/api/products')
        const data = await prodRes.json()
        setProducts(data)
        setIsAuth(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('jfm-admin-user', userToVerify)
          localStorage.setItem('jfm-admin-pass', passToVerify)
        }
        // Load stats and orders in background
        fetchStats()
        fetchOrders({ username: userToVerify, password: passToVerify })
        toast.success('Connexion réussie !')
      } else {
        setAuthError('Nom d\'utilisateur ou mot de passe incorrect.')
        setIsAuth(false)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jfm-admin-user')
          localStorage.removeItem('jfm-admin-pass')
        }
      }
    } catch (e) {
      setAuthError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    verifyCredentials(username, password)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jfm-admin-user')
      localStorage.removeItem('jfm-admin-pass')
    }
    setUsername('')
    setPassword('')
    setIsAuth(false)
    setProducts([])
    setOrders([])
    setSelectedProduct(null)
    toast.info('Session fermée.')
  }

  const selectProductForEdit = (p) => {
    setSelectedProduct(p)
    setFormId(p.id)
    setFormName(p.name)
    setFormTagline(p.tagline || '')
    setFormDescription(p.description || '')
    setFormIngredients(Array.isArray(p.ingredients) ? p.ingredients.join(', ') : p.ingredients || '')
    setFormColor(p.color || 'from-rose-700 via-red-800 to-rose-900')
    setFormEmoji(p.emoji || '🌿')
    setFormPrice(p.price || 5)
    setFormImage(p.image || '')

    let x = 50, y = 50
    if (p.imagePos) {
      const parts = p.imagePos.split(' ')
      if (parts.length === 2) {
        x = parseInt(parts[0]) || 50
        y = parseInt(parts[1]) || 50
      }
    }
    setPosX(x)
    setPosY(y)
    setZoom(p.imageZoom || 380)
    setBrightness(p.imageBrightness ?? 100)
    setContrast(p.imageContrast ?? 100)
  }

  const handleDuplicateProduct = (p) => {
    setSelectedProduct({ isNew: true })
    setFormId(`${p.id}-copie`)
    setFormName(`${p.name} (Copie)`)
    setFormTagline(p.tagline || '')
    setFormDescription(p.description || '')
    setFormIngredients(Array.isArray(p.ingredients) ? p.ingredients.join(', ') : p.ingredients || '')
    setFormColor(p.color || 'from-rose-700 via-red-800 to-rose-900')
    setFormEmoji(p.emoji || '🌿')
    setFormPrice(p.price || 5)
    setFormImage(p.image || '')

    let x = 50, y = 50
    if (p.imagePos) {
      const parts = p.imagePos.split(' ')
      if (parts.length === 2) {
        x = parseInt(parts[0]) || 50
        y = parseInt(parts[1]) || 50
      }
    }
    setPosX(x)
    setPosY(y)
    setZoom(p.imageZoom || 380)
    setBrightness(p.imageBrightness ?? 100)
    setContrast(p.imageContrast ?? 100)
    toast.info('Recette clonée ! Indiquez un ID unique avant d\'enregistrer.')
  }

  const handleNewProduct = () => {
    setSelectedProduct({ isNew: true })
    setFormId('')
    setFormName('')
    setFormTagline('')
    setFormDescription('')
    setFormIngredients('')
    setFormColor('from-rose-700 via-red-800 to-rose-900')
    setFormEmoji('🌿')
    setFormPrice(5)
    setFormImage('')
    setPosX(50)
    setPosY(50)
    setZoom(380)
    setBrightness(100)
    setContrast(100)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formId.trim() || !formName.trim()) {
      toast.error('L\'ID et le Nom de la recette sont requis.')
      return
    }

    const payload = {
      id: formId.toLowerCase().replace(/\s+/g, '-'),
      name: formName,
      tagline: formTagline,
      description: formDescription,
      ingredients: formIngredients.split(',').map(i => i.trim()).filter(Boolean),
      color: formColor,
      imagePos: `${posX}% ${posY}%`,
      emoji: formEmoji,
      price: Number(formPrice) || 5,
      imageZoom: Number(zoom) || 380,
      imageBrightness: Number(brightness),
      imageContrast: Number(contrast),
      image: formImage
    }

    const oldProducts = [...products]
    const exists = products.some(p => p.id === payload.id)
    const optimisticProducts = exists
      ? products.map(p => p.id === payload.id ? { ...p, ...payload } : p)
      : [...products, { ...payload, isOptimistic: true }]

    setProducts(optimisticProducts)
    toast.loading('Enregistrement de la recette...', { id: 'save-product' })

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-username': username,
          'x-admin-password': password
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success('Recette enregistrée !', { id: 'save-product' })
        const refreshedRes = await fetch('/api/products')
        const refreshedData = await refreshedRes.json()
        setProducts(refreshedData)
        const saved = refreshedData.find(p => p.id === payload.id)
        if (saved) setSelectedProduct(saved)
      } else {
        setProducts(oldProducts)
        toast.error('Erreur lors de la sauvegarde.', { id: 'save-product' })
      }
    } catch (err) {
      setProducts(oldProducts)
      toast.error('Erreur réseau.', { id: 'save-product' })
    }
  }

  const handleDelete = async (idToDelete) => {
    if (!confirm('Voulez-vous vraiment supprimer définitivement cette recette ?')) return

    const oldProducts = [...products]
    setProducts(products.filter(p => p.id !== idToDelete))
    if (selectedProduct?.id === idToDelete) setSelectedProduct(null)
    toast.loading('Suppression...', { id: 'delete-product' })

    try {
      const res = await fetch(`/api/products?id=${idToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-admin-username': username,
          'x-admin-password': password
        }
      })

      if (res.ok) {
        toast.success('Recette supprimée !', { id: 'delete-product' })
      } else {
        setProducts(oldProducts)
        toast.error('Erreur lors de la suppression.', { id: 'delete-product' })
      }
    } catch (err) {
      setProducts(oldProducts)
      toast.error('Erreur réseau.', { id: 'delete-product' })
    }
  }

  // ─── Login screen ────────────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0f1f18] flex items-center justify-center p-5 text-amber-50 relative overflow-hidden">
        <Toaster position="top-center" theme="dark" richColors />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(31,58,46,0.8),transparent_70%)] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full glass rounded-[2rem] p-8 border border-white/10 relative z-10 shadow-2xl">
          <div className="text-center mb-8">
            <span className="text-4xl">🌿</span>
            <h1 className="font-serif text-2xl font-bold mt-4 tracking-tight">Espace Administration</h1>
            <p className="text-amber-100/60 text-xs uppercase tracking-[0.2em] mt-1">Jus Frais Maison</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-xs uppercase tracking-wider text-amber-200/80">Nom d'utilisateur</Label>
              <div className="relative mt-2">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl bg-black/20 border-white/10 text-amber-50 h-12 pl-10 focus:ring-amber-500/20 focus:border-amber-500/40"
                  placeholder="Nom d'utilisateur"
                  autoFocus
                  required
                />
                <span className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-200/40 font-semibold text-sm">@</span>
              </div>
            </div>
            <div>
              <Label htmlFor="pass" className="text-xs uppercase tracking-wider text-amber-200/80">Mot de passe</Label>
              <div className="relative mt-2">
                <Input
                  id="pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl bg-black/20 border-white/10 text-amber-50 h-12 pl-10 focus:ring-amber-500/20 focus:border-amber-500/40"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-200/40" />
              </div>
            </div>
            {authError && <p className="text-rose-400 text-xs text-center">{authError}</p>}
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-amber-300 text-[#0f1f18] hover:bg-amber-200 font-semibold transition-all shadow-lg shadow-amber-300/10">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Se connecter
            </Button>
          </form>
        </motion.div>
      </div>
    )
  }

  const ingredientsList = (formIngredients || '').split(',').map(i => i.trim()).filter(Boolean)

  const filteredProducts = Array.isArray(products)
    ? products.filter(Boolean).filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(p.ingredients) && p.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : []

  // ─── Authenticated dashboard ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f1f18] text-amber-50 p-5 md:p-8">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <a href="/" className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center border border-white/10 text-amber-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Panneau d'Administration</h1>
            <p className="text-amber-100/60 text-[10px] uppercase tracking-[0.25em]">Marseille • Jus Frais</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 hover:text-white h-10 text-xs font-semibold px-4">
          <LogOut className="w-4 h-4 mr-2" /> Déconnexion
        </Button>
      </div>

      {/* Stats row */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl bg-black/20 border-white/10 p-5 shadow-xl flex flex-col justify-center">
          <div className="text-amber-100/50 text-xs uppercase tracking-wider">Total Commandes</div>
          <div className="font-serif text-2xl font-bold mt-1 text-amber-200">{stats.count}</div>
        </Card>
        <Card className="rounded-2xl bg-black/20 border-white/10 p-5 shadow-xl flex flex-col justify-center">
          <div className="text-amber-100/50 text-xs uppercase tracking-wider">Chiffre d'affaires</div>
          <div className="font-serif text-2xl font-bold mt-1 text-amber-300">
            {Number(stats.totalRevenue || 0).toFixed(2).replace('.', ',')} €
          </div>
        </Card>
        <Card className="rounded-2xl bg-black/20 border-white/10 p-5 shadow-xl flex flex-col justify-center">
          <div className="text-amber-100/50 text-xs uppercase tracking-wider">Panier moyen</div>
          <div className="font-serif text-2xl font-bold mt-1 text-emerald-300">
            {stats.count > 0 ? (Number(stats.totalRevenue || 0) / stats.count).toFixed(2).replace('.', ',') : '0,00'} €
          </div>
        </Card>
        <Card className="rounded-2xl bg-black/20 border-white/10 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-amber-100/50 text-xs uppercase tracking-wider">Objectif Mensuel</div>
            <div className="font-serif text-2xl font-bold mt-1 text-rose-300">1 000 €</div>
          </div>
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-100/40 hover:text-amber-100/70 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loadingStats ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </Card>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'products' ? 'bg-amber-300 text-[#0f1f18]' : 'bg-white/5 text-amber-100/60 hover:bg-white/10 hover:text-amber-100'}`}
        >
          <Package className="w-3.5 h-3.5" />
          Recettes <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'products' ? 'bg-[#0f1f18]/20' : 'bg-white/10'}`}>{products.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('orders'); fetchOrders({ username, password }) }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'orders' ? 'bg-amber-300 text-[#0f1f18]' : 'bg-white/5 text-amber-100/60 hover:bg-white/10 hover:text-amber-100'}`}
        >
          <ReceiptText className="w-3.5 h-3.5" />
          Commandes <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-[#0f1f18]/20' : 'bg-white/10'}`}>{stats.count}</span>
        </button>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {activeTab === 'products' && (
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200">
                  <Sparkles className="w-4 h-4" /> Recettes ({filteredProducts.length}{searchQuery ? `/${products.length}` : ''})
                </h2>
                <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-100/40" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher une recette..."
                      className="h-9 pl-9 rounded-xl bg-white/5 border-white/10 text-xs placeholder:text-amber-100/30 text-amber-50 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
                <Button onClick={handleNewProduct} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] text-xs font-bold h-9">
                  <Plus className="w-4 h-4 mr-1.5" /> Créer un jus
                </Button>
              </div>

              {initialLoading ? (
                <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 h-[72px]">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-white/10 rounded w-2/3" />
                          <div className="h-3 bg-white/10 rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-amber-100/40 text-sm">
                  {searchQuery ? 'Aucun résultat pour cette recherche.' : 'Aucun produit. Créez-en un !'}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => selectProductForEdit(p)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group cursor-pointer ${selectedProduct?.id === p.id ? 'bg-white/10 border-amber-300/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{p.name}</div>
                          <div className="text-amber-100/50 text-xs mt-0.5">{p.price || 5} €</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicateProduct(p) }}
                          className="w-8 h-8 rounded-full hover:bg-amber-300/20 text-amber-100/50 hover:text-amber-300 flex items-center justify-center"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}
                          className="w-8 h-8 rounded-full hover:bg-rose-500/20 text-amber-100/50 hover:text-rose-400 flex items-center justify-center"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Form Card */}
            {selectedProduct && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/5 blur-3xl rounded-full pointer-events-none" />
                  <h2 className="font-serif text-lg font-bold mb-6 flex items-center gap-2 text-amber-200">
                    {selectedProduct.isNew ? <Plus className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
                    {selectedProduct.isNew ? 'Nouveau Produit' : `Modifier : ${selectedProduct.name}`}
                  </h2>

                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="p-id" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><Type className="w-3 h-3" /> ID Unique *</Label>
                        <Input id="p-id" value={formId} onChange={(e) => setFormId(e.target.value)} disabled={!selectedProduct.isNew} placeholder="ex: gingembre-fresh" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20" required />
                      </div>
                      <div>
                        <Label htmlFor="p-name" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><Type className="w-3 h-3" /> Nom du produit *</Label>
                        <Input id="p-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="ex: Ginger Boost" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20" required />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="p-tagline" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><Type className="w-3 h-3" /> Slogan / Tagline</Label>
                        <Input id="p-tagline" value={formTagline} onChange={(e) => setFormTagline(e.target.value)} placeholder="ex: Fraîcheur piquante" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20" />
                      </div>
                      <div>
                        <Label htmlFor="p-price" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Prix (€) *</Label>
                        <Input id="p-price" type="number" min="0" step="0.5" value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20" required />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="p-emoji" className="text-xs uppercase tracking-wider text-amber-200/70">Emoji</Label>
                        <Input id="p-emoji" value={formEmoji} onChange={(e) => setFormEmoji(e.target.value)} placeholder="ex: 🍍" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm text-center text-lg focus:ring-amber-500/20" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="p-color" className="text-xs uppercase tracking-wider text-amber-200/70">Dégradé Tailwind</Label>
                        <Input id="p-color" value={formColor} onChange={(e) => setFormColor(e.target.value)} placeholder="ex: from-lime-500 via-yellow-500 to-amber-600" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-xs font-mono focus:ring-amber-500/20" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-amber-100/40 mr-1 uppercase">Presets :</span>
                      {GRADIENT_PRESETS.map(preset => (
                        <button key={preset.value} type="button" onClick={() => setFormColor(preset.value)} className={`w-6 h-6 rounded-full bg-gradient-to-br ${preset.value} border border-white/20 transition-all hover:scale-110`} title={preset.name} />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="p-desc" className="text-xs uppercase tracking-wider text-amber-200/70">Description</Label>
                        <Textarea id="p-desc" rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Description du goût et des bienfaits..." className="rounded-xl bg-black/30 border-white/10 mt-2 text-sm focus:ring-amber-500/20" />
                      </div>
                      <div>
                        <Label htmlFor="p-ing" className="text-xs uppercase tracking-wider text-amber-200/70">Ingrédients (séparés par des virgules)</Label>
                        <Input id="p-ing" value={formIngredients} onChange={(e) => setFormIngredients(e.target.value)} placeholder="ex: Gingembre, Citron, Menthe" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="p-image" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Image personnalisée (URL optionnel)</Label>
                      <Input id="p-image" value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="Laisser vide pour l'image d'origine" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-xs font-mono focus:ring-amber-500/20" />
                    </div>

                    <div className="border-t border-white/10 pt-6 space-y-5">
                      <h3 className="font-serif text-sm font-semibold flex items-center gap-2 text-amber-200">
                        <Sliders className="w-4 h-4" /> Réglages Position & Clarté
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {[
                            { label: 'Position X', val: posX, set: setPosX, min: 0, max: 100, unit: '%' },
                            { label: 'Position Y', val: posY, set: setPosY, min: 0, max: 100, unit: '%' },
                            { label: 'Zoom', val: zoom, set: setZoom, min: 100, max: 600, unit: '%' },
                          ].map(({ label, val, set, min, max, unit }) => (
                            <div key={label}>
                              <div className="flex justify-between text-xs text-amber-100/60 mb-2">
                                <span>{label}</span><span className="font-mono">{val}{unit}</span>
                              </div>
                              <input type="range" min={min} max={max} value={val} onChange={(e) => set(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300" />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: 'Luminosité', val: brightness, set: setBrightness, min: 50, max: 200, unit: '%' },
                            { label: 'Contraste', val: contrast, set: setContrast, min: 50, max: 200, unit: '%' },
                          ].map(({ label, val, set, min, max, unit }) => (
                            <div key={label}>
                              <div className="flex justify-between text-xs text-amber-100/60 mb-2">
                                <span>{label}</span><span className="font-mono">{val}{unit}</span>
                              </div>
                              <input type="range" min={min} max={max} value={val} onChange={(e) => set(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end border-t border-white/10 pt-6">
                      <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)} className="rounded-xl border-white/10 hover:bg-white/5 hover:text-white h-12 text-xs font-semibold px-6">
                        Annuler
                      </Button>
                      <Button type="submit" disabled={loading} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] h-12 text-xs font-bold px-8 shadow-lg shadow-amber-300/10">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Sauvegarder
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
              <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 text-amber-200">
                <Eye className="w-4 h-4" /> Prévisualisation
              </h2>
              <div className="max-w-[280px] mx-auto">
                <Card className="overflow-hidden border-white/10 rounded-3xl bg-[#14261e] shadow-2xl flex flex-col h-full">
                  <div
                    className={`relative aspect-[4/5] bg-gradient-to-br ${formColor || 'from-rose-700 via-red-800 to-rose-900'} overflow-hidden`}
                    style={{
                      backgroundImage: `url(${formImage || HERO_IMG})`,
                      backgroundSize: `${zoom}% auto`,
                      backgroundPosition: `${posX}% ${posY}%`,
                      backgroundRepeat: 'no-repeat',
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <Badge className="glass border-white/30 text-white text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">
                        {formTagline || 'Aperçu'}
                      </Badge>
                      <div className="text-3xl drop-shadow-lg">{formEmoji || '🌿'}</div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="font-serif text-2xl font-semibold drop-shadow-lg">{formName || 'Nom du jus'}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ingredientsList.map(i => (
                          <span key={i} className="text-[10px] uppercase tracking-wider bg-white/15 backdrop-blur px-2 py-0.5 rounded-full border border-white/20">{i}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-amber-100/60 mb-4 h-16 overflow-y-auto leading-normal">
                      {formDescription || 'Description du jus et de ses saveurs fraîches...'}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="flex items-center bg-white/5 rounded-full px-1 py-1 border border-white/10">
                        <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center text-amber-100/60"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-5 text-center text-xs font-semibold">1</span>
                        <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center text-amber-100/60"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <Button type="button" className="flex-1 rounded-full bg-amber-300 text-[#0f1f18] hover:bg-amber-200 h-9 text-xs font-bold">
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" /> {formPrice || 5} €
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="max-w-7xl mx-auto">
          <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200">
                <ReceiptText className="w-4 h-4" /> Commandes ({orders.length})
              </h2>
              <Button
                onClick={() => fetchOrders({ username, password })}
                disabled={loadingOrders}
                variant="outline"
                className="rounded-xl border-white/10 hover:bg-white/5 h-9 text-xs px-4"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loadingOrders ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            {loadingOrders ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-white/5 border border-white/5" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-amber-100/40">
                <ReceiptText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune commande pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id
                  const items = Array.isArray(order.items) ? order.items : []
                  return (
                    <div key={order.id} className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-300/10 border border-amber-300/20 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-4 h-4 text-amber-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-xs text-amber-100/50">#{order.id?.slice(0, 8).toUpperCase()}</div>
                            <div className="text-xs text-amber-100/40 mt-0.5">{formatDate(order.createdAt)}</div>
                          </div>
                          <div className="hidden sm:flex flex-wrap gap-1 ml-2">
                            {items.slice(0, 3).map((item, i) => (
                              <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-amber-100/60">
                                {item.quantity > 1 ? `${item.quantity}× ` : ''}{item.name}
                              </span>
                            ))}
                            {items.length > 3 && <span className="text-[10px] text-amber-100/40">+{items.length - 3}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <span className="font-serif font-bold text-amber-300 text-sm">
                            {Number(order.total || 0).toFixed(2).replace('.', ',')} €
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-100/40" /> : <ChevronDown className="w-4 h-4 text-amber-100/40" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-white/5"
                          >
                            <div className="p-4 space-y-2">
                              {items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-100/60">{item.quantity || 1}</span>
                                    <span className="text-amber-100/80">{item.name}</span>
                                  </div>
                                  <span className="text-amber-100/50 font-mono text-xs">
                                    {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2).replace('.', ',')} €
                                  </span>
                                </div>
                              ))}
                              <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-semibold">
                                <span className="text-amber-100/60">Total</span>
                                <span className="text-amber-300 font-mono">{Number(order.total || 0).toFixed(2).replace('.', ',')} €</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
