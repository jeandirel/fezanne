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
  Copy, Search, Package, ReceiptText, ChevronDown, ChevronUp,
  Settings, Clock, Star, MessageCircle, Globe, AlertTriangle, ToggleLeft, ToggleRight
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { DEFAULT_SETTINGS } from '@/lib/defaultSettings'

const HERO_IMG = 'https://customer-assets.emergentagent.com/job_jus-frais-marseille/artifacts/7jovrgtv_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%286%29.jpeg'

const GRADIENT_PRESETS = [
  { name: 'Rouge profond', value: 'from-rose-700 via-red-800 to-rose-900' },
  { name: 'Vert / Jaune', value: 'from-lime-500 via-yellow-500 to-amber-600' },
  { name: 'Orange chaud', value: 'from-orange-400 via-amber-500 to-orange-600' },
  { name: 'Rose / Rouge', value: 'from-pink-500 via-rose-500 to-red-600' },
  { name: 'Violet', value: 'from-purple-600 via-indigo-700 to-violet-800' },
  { name: 'Émeraude', value: 'from-teal-600 via-emerald-700 to-green-800' },
]

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
  } catch { return iso }
}

// ─── Shared save helper ──────────────────────────────────────────────────────
async function postSettings(settings, username, password) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-username': username, 'x-admin-password': password },
    body: JSON.stringify(settings)
  })
  if (!res.ok) throw new Error('Erreur serveur')
}

// ─── Tabs config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'products',    icon: Package,       label: 'Recettes' },
  { id: 'orders',      icon: ReceiptText,   label: 'Commandes' },
  { id: 'settings',    icon: Settings,      label: 'Paramètres' },
  { id: 'schedule',    icon: Clock,         label: 'Horaires' },
  { id: 'tarifs',      icon: DollarSign,    label: 'Tarifs' },
  { id: 'benefits',    icon: Sparkles,      label: 'Avantages' },
  { id: 'testimonials',icon: Star,          label: 'Avis clients' },
]

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [authError, setAuthError] = useState('')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ count: 0, totalRevenue: 0 })
  const [activeTab, setActiveTab] = useState('products')
  const [expandedOrder, setExpandedOrder] = useState(null)

  // Product form
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
    } catch (err) { console.error(err) }
    finally { setLoadingStats(false) }
  }, [])

  const fetchOrders = useCallback(async (creds) => {
    setLoadingOrders(true)
    try {
      const res = await fetch('/api/orders', { headers: { 'x-admin-username': creds.username, 'x-admin-password': creds.password } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) { console.error(err) }
    finally { setLoadingOrders(false) }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSiteSettings({ ...DEFAULT_SETTINGS, ...data })
    } catch (err) { console.error(err) }
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

  const verifyCredentials = async (u, p) => {
    setLoading(true)
    setInitialLoading(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'x-admin-username': u, 'x-admin-password': p } })
      if (res.status === 200) {
        const prodRes = await fetch('/api/products')
        const data = await prodRes.json()
        setProducts(data)
        setIsAuth(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('jfm-admin-user', u)
          localStorage.setItem('jfm-admin-pass', p)
        }
        fetchStats()
        fetchOrders({ username: u, password: p })
        fetchSettings()
        toast.success('Connexion réussie !')
      } else {
        setAuthError('Nom d\'utilisateur ou mot de passe incorrect.')
        setIsAuth(false)
        localStorage.removeItem('jfm-admin-user')
        localStorage.removeItem('jfm-admin-pass')
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
    localStorage.removeItem('jfm-admin-user')
    localStorage.removeItem('jfm-admin-pass')
    setUsername(''); setPassword(''); setIsAuth(false)
    setProducts([]); setOrders([]); setSelectedProduct(null)
    setSiteSettings(DEFAULT_SETTINGS)
    toast.info('Session fermée.')
  }

  const saveSettings = async (partialSettings) => {
    const merged = { ...siteSettings, ...partialSettings }
    try {
      await postSettings(merged, username, password)
      setSiteSettings(merged)
      toast.success('Enregistré !')
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde.')
    }
  }

  // ─── Product handlers ────────────────────────────────────────────────────
  const selectProductForEdit = (p) => {
    setSelectedProduct(p)
    setFormId(p.id); setFormName(p.name)
    setFormTagline(p.tagline || ''); setFormDescription(p.description || '')
    setFormIngredients(Array.isArray(p.ingredients) ? p.ingredients.join(', ') : p.ingredients || '')
    setFormColor(p.color || 'from-rose-700 via-red-800 to-rose-900')
    setFormEmoji(p.emoji || '🌿'); setFormPrice(p.price || 5)
    setFormImage(p.image || '')
    let x = 50, y = 50
    if (p.imagePos) { const pts = p.imagePos.split(' '); x = parseInt(pts[0]) || 50; y = parseInt(pts[1]) || 50 }
    setPosX(x); setPosY(y); setZoom(p.imageZoom || 380)
    setBrightness(p.imageBrightness ?? 100); setContrast(p.imageContrast ?? 100)
  }

  const handleDuplicateProduct = (p) => {
    selectProductForEdit({ ...p, id: `${p.id}-copie`, name: `${p.name} (Copie)` })
    setSelectedProduct({ isNew: true })
    setFormId(`${p.id}-copie`); setFormName(`${p.name} (Copie)`)
    toast.info('Recette clonée ! Indiquez un ID unique avant d\'enregistrer.')
  }

  const handleNewProduct = () => {
    setSelectedProduct({ isNew: true })
    setFormId(''); setFormName(''); setFormTagline(''); setFormDescription('')
    setFormIngredients(''); setFormColor('from-rose-700 via-red-800 to-rose-900')
    setFormEmoji('🌿'); setFormPrice(5); setFormImage('')
    setPosX(50); setPosY(50); setZoom(380); setBrightness(100); setContrast(100)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formId.trim() || !formName.trim()) { toast.error('L\'ID et le Nom sont requis.'); return }
    const payload = {
      id: formId.toLowerCase().replace(/\s+/g, '-'), name: formName, tagline: formTagline,
      description: formDescription, ingredients: formIngredients.split(',').map(i => i.trim()).filter(Boolean),
      color: formColor, imagePos: `${posX}% ${posY}%`, emoji: formEmoji,
      price: Number(formPrice) || 5, imageZoom: Number(zoom) || 380,
      imageBrightness: Number(brightness), imageContrast: Number(contrast), image: formImage
    }
    const oldProducts = [...products]
    const exists = products.some(p => p.id === payload.id)
    setProducts(exists ? products.map(p => p.id === payload.id ? { ...p, ...payload } : p) : [...products, { ...payload, isOptimistic: true }])
    toast.loading('Enregistrement...', { id: 'save-product' })
    try {
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-username': username, 'x-admin-password': password }, body: JSON.stringify(payload) })
      if (res.ok) {
        toast.success('Recette enregistrée !', { id: 'save-product' })
        const refreshedData = await fetch('/api/products').then(r => r.json())
        setProducts(refreshedData)
        const saved = refreshedData.find(p => p.id === payload.id)
        if (saved) setSelectedProduct(saved)
      } else { setProducts(oldProducts); toast.error('Erreur sauvegarde.', { id: 'save-product' }) }
    } catch { setProducts(oldProducts); toast.error('Erreur réseau.', { id: 'save-product' }) }
  }

  const handleDelete = async (idToDelete) => {
    if (!confirm('Supprimer définitivement cette recette ?')) return
    const oldProducts = [...products]
    setProducts(products.filter(p => p.id !== idToDelete))
    if (selectedProduct?.id === idToDelete) setSelectedProduct(null)
    toast.loading('Suppression...', { id: 'delete-product' })
    try {
      const res = await fetch(`/api/products?id=${idToDelete}`, { method: 'DELETE', headers: { 'x-admin-username': username, 'x-admin-password': password } })
      if (res.ok) { toast.success('Recette supprimée !', { id: 'delete-product' }) }
      else { setProducts(oldProducts); toast.error('Erreur suppression.', { id: 'delete-product' }) }
    } catch { setProducts(oldProducts); toast.error('Erreur réseau.', { id: 'delete-product' }) }
  }

  // ─── Login ───────────────────────────────────────────────────────────────
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
              <Label className="text-xs uppercase tracking-wider text-amber-200/80">Nom d'utilisateur</Label>
              <div className="relative mt-2">
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl bg-black/20 border-white/10 text-amber-50 h-12 pl-10" placeholder="Nom d'utilisateur" autoFocus required />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-200/40 font-semibold text-sm">@</span>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-amber-200/80">Mot de passe</Label>
              <div className="relative mt-2">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl bg-black/20 border-white/10 text-amber-50 h-12 pl-10" placeholder="••••••••" required />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-200/40" />
              </div>
            </div>
            {authError && <p className="text-rose-400 text-xs text-center">{authError}</p>}
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-amber-300 text-[#0f1f18] hover:bg-amber-200 font-semibold">
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
        <div className="flex items-center gap-3">
          {siteSettings.siteStatus !== 'open' && (
            <Badge className={`${siteSettings.siteStatus === 'pause' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'} border px-3 py-1`}>
              <AlertTriangle className="w-3 h-3 mr-1.5" />
              {siteSettings.siteStatus === 'pause' ? 'Site en pause' : 'Site fermé'}
            </Badge>
          )}
          <Button onClick={handleLogout} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 hover:text-white h-10 text-xs font-semibold px-4">
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Commandes', value: stats.count, color: 'text-amber-200' },
          { label: 'Chiffre d\'affaires', value: `${Number(stats.totalRevenue || 0).toFixed(2).replace('.', ',')} €`, color: 'text-amber-300' },
          { label: 'Panier moyen', value: `${stats.count > 0 ? (Number(stats.totalRevenue || 0) / stats.count).toFixed(2).replace('.', ',') : '0,00'} €`, color: 'text-emerald-300' },
          { label: 'Objectif mensuel', value: '1 000 €', color: 'text-rose-300', refresh: true },
        ].map((s, i) => (
          <Card key={i} className="rounded-2xl bg-black/20 border-white/10 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-amber-100/50 text-xs uppercase tracking-wider">{s.label}</div>
              <div className={`font-serif text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </div>
            {s.refresh && (
              <button onClick={fetchStats} disabled={loadingStats} className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-100/40 hover:text-amber-100/70 transition-colors">
                <RefreshCw className={`w-3 h-3 ${loadingStats ? 'animate-spin' : ''}`} /> Actualiser
              </button>
            )}
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = tab.id === 'products' ? products.length : tab.id === 'orders' ? stats.count : undefined
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'orders') fetchOrders({ username, password })
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-amber-300 text-[#0f1f18]' : 'bg-white/5 text-amber-100/60 hover:bg-white/10 hover:text-amber-100'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== undefined && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-[#0f1f18]/20' : 'bg-white/10'}`}>{count}</span>
              )}
            </button>
          )
        })}
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
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-100/40" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="h-9 pl-9 rounded-xl bg-white/5 border-white/10 text-xs placeholder:text-amber-100/30 text-amber-50" />
                </div>
                <Button onClick={handleNewProduct} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] text-xs font-bold h-9">
                  <Plus className="w-4 h-4 mr-1.5" /> Créer un jus
                </Button>
              </div>
              {initialLoading ? (
                <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-[72px] rounded-2xl bg-white/5 border border-white/5" />)}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-amber-100/40 text-sm">{searchQuery ? 'Aucun résultat.' : 'Aucun produit. Créez-en un !'}</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => selectProductForEdit(p)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group cursor-pointer ${selectedProduct?.id === p.id ? 'bg-white/10 border-amber-300/40' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{p.name}</div>
                          <div className="text-amber-100/50 text-xs">{p.price || 5} €</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleDuplicateProduct(p) }} className="w-8 h-8 rounded-full hover:bg-amber-300/20 text-amber-100/50 hover:text-amber-300 flex items-center justify-center" title="Dupliquer">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }} className="w-8 h-8 rounded-full hover:bg-rose-500/20 text-amber-100/50 hover:text-rose-400 flex items-center justify-center" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {selectedProduct && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
                  <h2 className="font-serif text-lg font-bold mb-6 flex items-center gap-2 text-amber-200">
                    {selectedProduct.isNew ? <Plus className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
                    {selectedProduct.isNew ? 'Nouveau Produit' : `Modifier : ${selectedProduct.name}`}
                  </h2>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">ID Unique *</Label>
                        <Input value={formId} onChange={(e) => setFormId(e.target.value)} disabled={!selectedProduct.isNew} placeholder="ex: gingembre-fresh" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" required />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">Nom du produit *</Label>
                        <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="ex: Ginger Boost" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">Slogan</Label>
                        <Input value={formTagline} onChange={(e) => setFormTagline(e.target.value)} placeholder="ex: Fraîcheur piquante" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">Prix (€) *</Label>
                        <Input type="number" min="0" step="0.5" value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">Emoji</Label>
                        <Input value={formEmoji} onChange={(e) => setFormEmoji(e.target.value)} placeholder="🍍" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-lg text-center" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">Dégradé Tailwind</Label>
                        <Input value={formColor} onChange={(e) => setFormColor(e.target.value)} className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-xs font-mono" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-amber-100/40 uppercase">Presets :</span>
                      {GRADIENT_PRESETS.map(p => <button key={p.value} type="button" onClick={() => setFormColor(p.value)} className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.value} border border-white/20 hover:scale-110 transition-transform`} title={p.name} />)}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">Description</Label>
                        <Textarea rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Description..." className="rounded-xl bg-black/30 border-white/10 mt-2 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-amber-200/70">Ingrédients (séparés par des virgules)</Label>
                        <Input value={formIngredients} onChange={(e) => setFormIngredients(e.target.value)} placeholder="Gingembre, Citron, Menthe" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Image URL (optionnel)</Label>
                      <Input value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="Laisser vide pour l'image d'origine" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-xs font-mono" />
                    </div>
                    <div className="border-t border-white/10 pt-6">
                      <h3 className="font-serif text-sm font-semibold flex items-center gap-2 text-amber-200 mb-5"><Sliders className="w-4 h-4" /> Position & Clarté</h3>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {[
                          { label: 'Position X', val: posX, set: setPosX, min: 0, max: 100 },
                          { label: 'Position Y', val: posY, set: setPosY, min: 0, max: 100 },
                          { label: 'Zoom', val: zoom, set: setZoom, min: 100, max: 600 },
                          { label: 'Luminosité', val: brightness, set: setBrightness, min: 50, max: 200 },
                          { label: 'Contraste', val: contrast, set: setContrast, min: 50, max: 200 },
                        ].map(({ label, val, set, min, max }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs text-amber-100/60 mb-2"><span>{label}</span><span className="font-mono">{val}%</span></div>
                            <input type="range" min={min} max={max} value={val} onChange={(e) => set(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end border-t border-white/10 pt-6">
                      <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)} className="rounded-xl border-white/10 hover:bg-white/5 hover:text-white h-12 text-xs px-6">Annuler</Button>
                      <Button type="submit" disabled={loading} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] h-12 text-xs font-bold px-8">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Sauvegarder
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
              <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 text-amber-200"><Eye className="w-4 h-4" /> Prévisualisation</h2>
              <div className="max-w-[280px] mx-auto">
                <Card className="overflow-hidden border-white/10 rounded-3xl bg-[#14261e] shadow-2xl flex flex-col">
                  <div className={`relative aspect-[4/5] bg-gradient-to-br ${formColor || 'from-rose-700 via-red-800 to-rose-900'} overflow-hidden`} style={{ backgroundImage: `url(${formImage || HERO_IMG})`, backgroundSize: `${zoom}% auto`, backgroundPosition: `${posX}% ${posY}%`, backgroundRepeat: 'no-repeat', filter: `brightness(${brightness}%) contrast(${contrast}%)` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <Badge className="glass border-white/30 text-white text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">{formTagline || 'Aperçu'}</Badge>
                      <div className="text-3xl drop-shadow-lg">{formEmoji || '🌿'}</div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="font-serif text-2xl font-semibold drop-shadow-lg">{formName || 'Nom du jus'}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ingredientsList.map(i => <span key={i} className="text-[10px] uppercase tracking-wider bg-white/15 backdrop-blur px-2 py-0.5 rounded-full border border-white/20">{i}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-amber-100/60 mb-4 h-14 overflow-y-auto leading-normal">{formDescription || 'Description...'}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="flex items-center bg-white/5 rounded-full px-1 py-1 border border-white/10">
                        <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center text-amber-100/60"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-5 text-center text-xs font-semibold">1</span>
                        <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center text-amber-100/60"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <Button type="button" className="flex-1 rounded-full bg-amber-300 text-[#0f1f18] h-9 text-xs font-bold">
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
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200"><ReceiptText className="w-4 h-4" /> Commandes ({orders.length})</h2>
              <Button onClick={() => fetchOrders({ username, password })} disabled={loadingOrders} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 h-9 text-xs px-4">
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loadingOrders ? 'animate-spin' : ''}`} /> Actualiser
              </Button>
            </div>
            {loadingOrders ? (
              <div className="space-y-3 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/5 border border-white/5" />)}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-amber-100/40"><ReceiptText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Aucune commande pour le moment.</p></div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id
                  const items = Array.isArray(order.items) ? order.items : []
                  return (
                    <div key={order.id} className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
                      <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
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
                              <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-amber-100/60">{item.quantity > 1 ? `${item.quantity}× ` : ''}{item.name}</span>
                            ))}
                            {items.length > 3 && <span className="text-[10px] text-amber-100/40">+{items.length - 3}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <span className="font-serif font-bold text-amber-300 text-sm">{Number(order.total || 0).toFixed(2).replace('.', ',')} €</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-100/40" /> : <ChevronDown className="w-4 h-4 text-amber-100/40" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-white/5">
                            <div className="p-4 space-y-2">
                              {items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-100/60">{item.quantity || 1}</span>
                                    <span className="text-amber-100/80">{item.name}</span>
                                  </div>
                                  <span className="text-amber-100/50 font-mono text-xs">{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2).replace('.', ',')} €</span>
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

      {/* ── PARAMÈTRES TAB ── */}
      {activeTab === 'settings' && (
        <SettingsTab settings={siteSettings} onSave={saveSettings} />
      )}

      {/* ── HORAIRES TAB ── */}
      {activeTab === 'schedule' && (
        <ScheduleTab settings={siteSettings} onSave={saveSettings} />
      )}

      {/* ── TARIFS TAB ── */}
      {activeTab === 'tarifs' && (
        <TarifsTab settings={siteSettings} onSave={saveSettings} />
      )}

      {/* ── AVANTAGES TAB ── */}
      {activeTab === 'benefits' && (
        <BenefitsTab settings={siteSettings} onSave={saveSettings} />
      )}

      {/* ── AVIS TAB ── */}
      {activeTab === 'testimonials' && (
        <TestimonialsTab settings={siteSettings} onSave={saveSettings} />
      )}
    </div>
  )
}

// ─── Paramètres Tab ──────────────────────────────────────────────────────────
function SettingsTab({ settings, onSave }) {
  const [contact, setContact] = useState({ ...DEFAULT_SETTINGS.contact, ...(settings.contact || {}) })
  const [hero, setHero] = useState({ ...DEFAULT_SETTINGS.hero, ...(settings.hero || {}) })
  const [siteStatus, setSiteStatus] = useState(settings.siteStatus || 'open')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ contact, hero, siteStatus })
    } finally { setSaving(false) }
  }

  const statusOptions = [
    { value: 'open', label: '🟢 Ouvert', desc: 'Le site fonctionne normalement.', cls: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
    { value: 'pause', label: '🟡 En pause', desc: 'Une bannière jaune s\'affiche. Les commandes restent possibles.', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
    { value: 'closed', label: '🔴 Fermé', desc: 'Bannière rouge. Les commandes sont désactivées.', cls: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Site status */}
      <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
        <h2 className="font-serif text-lg font-bold mb-5 flex items-center gap-2 text-amber-200">
          <Globe className="w-4 h-4" /> Statut du site
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {statusOptions.map(opt => (
            <button key={opt.value} type="button" onClick={() => setSiteStatus(opt.value)} className={`p-4 rounded-2xl border-2 text-left transition-all ${siteStatus === opt.value ? opt.cls : 'border-white/5 bg-white/5 text-amber-100/50 hover:border-white/10'}`}>
              <div className="font-semibold text-sm mb-1">{opt.label}</div>
              <div className="text-[11px] opacity-70 leading-tight">{opt.desc}</div>
            </button>
          ))}
        </div>
        {siteStatus !== 'open' && (
          <div className="mt-4">
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">Message de pause (affiché dans la bannière)</Label>
            <Input value={hero.pauseMessage || ''} onChange={e => setHero(h => ({ ...h, pauseMessage: e.target.value }))} placeholder="Nous serons de retour très bientôt..." className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" />
          </div>
        )}
      </Card>

      {/* Contact */}
      <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
        <h2 className="font-serif text-lg font-bold mb-5 flex items-center gap-2 text-amber-200">
          <MessageCircle className="w-4 h-4" /> Informations de contact
        </h2>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">Numéro WhatsApp (avec indicatif, sans +)</Label>
            <Input value={contact.whatsapp || ''} onChange={e => setContact(c => ({ ...c, whatsapp: e.target.value }))} placeholder="33650711629" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">Téléphone (affiché)</Label>
            <Input value={contact.phone || ''} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="06 50 71 16 29" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">URL Instagram</Label>
            <Input value={contact.instagram || ''} onChange={e => setContact(c => ({ ...c, instagram: e.target.value }))} placeholder="https://instagram.com/jusfraismaison" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">Adresse</Label>
            <Input value={contact.address || ''} onChange={e => setContact(c => ({ ...c, address: e.target.value }))} placeholder="3 Rue Curiol, 13001 Marseille — Vieux-Port" className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" />
          </div>
        </div>
      </Card>

      {/* Hero texts */}
      <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
        <h2 className="font-serif text-lg font-bold mb-5 flex items-center gap-2 text-amber-200">
          <Type className="w-4 h-4" /> Textes de la page d'accueil
        </h2>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">Badge hero (ex: "Préparé ce matin à Marseille")</Label>
            <Input value={hero.badge || ''} onChange={e => setHero(h => ({ ...h, badge: e.target.value }))} className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">Description hero</Label>
            <Textarea rows={2} value={hero.description || ''} onChange={e => setHero(h => ({ ...h, description: e.target.value }))} className="rounded-xl bg-black/30 border-white/10 mt-2 text-sm" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-amber-200/70">Badges (séparés par des virgules)</Label>
            <Input
              value={Array.isArray(hero.badgeItems) ? hero.badgeItems.join(', ') : ''}
              onChange={e => setHero(h => ({ ...h, badgeItems: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              placeholder="100% Naturel, Fait maison, Livraison Marseille"
              className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] h-12 text-sm font-bold px-10 shadow-lg">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  )
}

// ─── Horaires Tab ────────────────────────────────────────────────────────────
function ScheduleTab({ settings, onSave }) {
  const [schedule, setSchedule] = useState(settings.schedule || DEFAULT_SETTINGS.schedule)
  const [saving, setSaving] = useState(false)

  const update = (i, field, value) => setSchedule(s => s.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  const addDay = () => setSchedule(s => [...s, { day: 'Nouveau jour', hours: '18h — 19h', active: true }])
  const removeDay = (i) => setSchedule(s => s.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave({ schedule }) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200"><Clock className="w-4 h-4" /> Horaires de livraison</h2>
          <Button onClick={addDay} className="rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 text-xs h-9 px-4"><Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter un jour</Button>
        </div>
        <p className="text-xs text-amber-100/40 mb-5">Pour plusieurs créneaux par jour, séparez-les par une virgule. Ex: <span className="font-mono">18h — 19h, 19h — 20h</span></p>
        <div className="space-y-3">
          {schedule.map((s, i) => (
            <div key={i} className={`p-4 rounded-2xl border transition-all ${s.active ? 'border-white/10 bg-white/5' : 'border-white/5 bg-black/20 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => update(i, 'active', !s.active)} className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative ${s.active ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${s.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <div className="flex-1 grid sm:grid-cols-2 gap-2">
                  <Input value={s.day} onChange={e => update(i, 'day', e.target.value)} className="h-9 rounded-xl bg-black/30 border-white/10 text-sm" placeholder="Jour" />
                  <Input value={s.hours} onChange={e => update(i, 'hours', e.target.value)} className="h-9 rounded-xl bg-black/30 border-white/10 text-sm font-mono" placeholder="18h — 19h" />
                </div>
                <button type="button" onClick={() => removeDay(i)} className="w-8 h-8 rounded-full hover:bg-rose-500/20 text-amber-100/40 hover:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] h-12 text-sm font-bold px-10">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Enregistrer
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Tarifs Tab ──────────────────────────────────────────────────────────────
function TarifsTab({ settings, onSave }) {
  const [formats, setFormats] = useState(settings.formats || DEFAULT_SETTINGS.formats)
  const [saving, setSaving] = useState(false)

  const update = (i, field, value) => setFormats(f => f.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  const addFormat = () => setFormats(f => [...f, { size: 'New ml', price: 5, label: 'Standard', popular: false }])
  const removeFormat = (i) => setFormats(f => f.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave({ formats }) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200"><DollarSign className="w-4 h-4" /> Formats & Prix</h2>
          <Button onClick={addFormat} className="rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 text-xs h-9 px-4"><Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter</Button>
        </div>
        <div className="space-y-4">
          {formats.map((f, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-amber-100/50 uppercase">Taille</Label>
                  <Input value={f.size} onChange={e => update(i, 'size', e.target.value)} className="h-10 rounded-xl bg-black/30 border-white/10 mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-amber-100/50 uppercase">Prix (€)</Label>
                  <Input type="number" min="0" step="0.5" value={f.price} onChange={e => update(i, 'price', Number(e.target.value))} className="h-10 rounded-xl bg-black/30 border-white/10 mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-amber-100/50 uppercase">Label</Label>
                  <Input value={f.label} onChange={e => update(i, 'label', e.target.value)} className="h-10 rounded-xl bg-black/30 border-white/10 mt-1 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-amber-100/60 cursor-pointer">
                  <input type="checkbox" checked={!!f.popular} onChange={e => update(i, 'popular', e.target.checked)} className="rounded accent-amber-300" />
                  Afficher badge "Populaire"
                </label>
                <button type="button" onClick={() => removeFormat(i)} className="text-xs text-rose-400/60 hover:text-rose-400 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] h-12 text-sm font-bold px-10">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Enregistrer
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Avantages Tab ───────────────────────────────────────────────────────────
const ICON_OPTIONS = ['Leaf', 'Sparkles', 'Heart', 'Snowflake', 'Truck', 'Apple', 'Star', 'Globe', 'Clock']

function BenefitsTab({ settings, onSave }) {
  const [benefits, setBenefits] = useState(settings.benefits || DEFAULT_SETTINGS.benefits)
  const [saving, setSaving] = useState(false)

  const update = (i, field, value) => setBenefits(b => b.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  const addBenefit = () => setBenefits(b => [...b, { icon: 'Leaf', title: 'Nouvel avantage', text: 'Description...' }])
  const removeBenefit = (i) => setBenefits(b => b.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave({ benefits }) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200"><Sparkles className="w-4 h-4" /> Section "Pourquoi nous"</h2>
          <Button onClick={addBenefit} className="rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 text-xs h-9 px-4"><Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <select value={b.icon} onChange={e => update(i, 'icon', e.target.value)} className="h-9 rounded-xl bg-black/40 border border-white/10 text-amber-50 text-xs px-2 flex-shrink-0">
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <Input value={b.title} onChange={e => update(i, 'title', e.target.value)} className="h-9 rounded-xl bg-black/30 border-white/10 text-sm flex-1" placeholder="Titre" />
                <button type="button" onClick={() => removeBenefit(i)} className="w-8 h-8 rounded-full hover:bg-rose-500/20 text-amber-100/40 hover:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Textarea rows={2} value={b.text} onChange={e => update(i, 'text', e.target.value)} className="rounded-xl bg-black/30 border-white/10 text-xs" placeholder="Description..." />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] h-12 text-sm font-bold px-10">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Enregistrer
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Avis clients Tab ────────────────────────────────────────────────────────
function TestimonialsTab({ settings, onSave }) {
  const [testimonials, setTestimonials] = useState(settings.testimonials || DEFAULT_SETTINGS.testimonials)
  const [saving, setSaving] = useState(false)

  const update = (i, field, value) => setTestimonials(t => t.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  const addTestimonial = () => setTestimonials(t => [...t, { name: 'Nouveau Client', text: 'Super produit !', rating: 5, area: 'Marseille', active: true }])
  const removeTestimonial = (i) => setTestimonials(t => t.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave({ testimonials }) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200"><Star className="w-4 h-4" /> Avis clients</h2>
          <Button onClick={addTestimonial} className="rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 text-xs h-9 px-4"><Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter un avis</Button>
        </div>
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className={`p-5 rounded-2xl border transition-all ${t.active ? 'border-white/10 bg-white/5' : 'border-white/5 bg-black/20 opacity-60'}`}>
              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => update(i, 'active', !t.active)} className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative ${t.active ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${t.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <Badge className={`text-[10px] px-2 ${t.active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-amber-100/40 border-white/10'} border`}>
                  {t.active ? 'Visible' : 'Masqué'}
                </Badge>
                <div className="flex-1" />
                <button type="button" onClick={() => removeTestimonial(i)} className="w-8 h-8 rounded-full hover:bg-rose-500/20 text-amber-100/40 hover:text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs text-amber-100/50 uppercase">Nom</Label>
                  <Input value={t.name} onChange={e => update(i, 'name', e.target.value)} className="h-9 rounded-xl bg-black/30 border-white/10 mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-amber-100/50 uppercase">Quartier</Label>
                  <Input value={t.area} onChange={e => update(i, 'area', e.target.value)} className="h-9 rounded-xl bg-black/30 border-white/10 mt-1 text-sm" placeholder="Vieux-Port" />
                </div>
              </div>
              <div className="mb-3">
                <Label className="text-xs text-amber-100/50 uppercase">Texte du témoignage</Label>
                <Textarea rows={2} value={t.text} onChange={e => update(i, 'text', e.target.value)} className="rounded-xl bg-black/30 border-white/10 mt-1 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-amber-100/50 uppercase">Note</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => update(i, 'rating', star)} className={`w-6 h-6 ${(t.rating || 5) >= star ? 'text-amber-400' : 'text-white/20'}`}>
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] h-12 text-sm font-bold px-10">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Enregistrer
          </Button>
        </div>
      </Card>
    </div>
  )
}
