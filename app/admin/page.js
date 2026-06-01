'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus, Trash2, ArrowLeft, Check, ShoppingBag, Save, Lock, LogOut,
  Sparkles, RefreshCw, Eye, Image as ImageIcon, Sliders, Type, DollarSign
} from 'lucide-react'

const HERO_IMG = 'https://customer-assets.emergentagent.com/job_jus-frais-marseille/artifacts/7jovrgtv_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%286%29.jpeg'

const GRADIENT_PRESETS = [
  { name: 'Rouge profond (Bissap)', value: 'from-rose-700 via-red-800 to-rose-900' },
  { name: 'Vert / Jaune (Detox)', value: 'from-lime-500 via-yellow-500 to-amber-600' },
  { name: 'Orange chaud (Vita)', value: 'from-orange-400 via-amber-500 to-orange-600' },
  { name: 'Rose / Rouge (Water)', value: 'from-pink-500 via-rose-500 to-red-600' },
  { name: 'Violet mystique', value: 'from-purple-600 via-indigo-700 to-violet-800' },
  { name: 'Vert Émeraude', value: 'from-teal-600 via-emerald-700 to-green-800' },
]

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [authError, setAuthError] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
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

  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('jfm-admin-user')
      const savedPass = localStorage.getItem('jfm-admin-pass')
      if (savedUser && savedPass) {
        setUsername(savedUser)
        setPassword(savedPass)
        verifyCredentials(savedUser, savedPass)
      }
    }
  }, [])

  const verifyCredentials = async (userToVerify, passToVerify) => {
    setLoading(true)
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
    setSelectedProduct(null)
  }

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const selectProductForEdit = (p) => {
    setSelectedProduct(p)
    setFormId(p.id)
    setFormName(p.name)
    setFormTagline(p.tagline)
    setFormDescription(p.description)
    setFormIngredients(Array.isArray(p.ingredients) ? p.ingredients.join(', ') : p.ingredients || '')
    setFormColor(p.color)
    setFormEmoji(p.emoji)
    setFormPrice(p.price || 5)
    setFormImage(p.image || '')
    
    // Parse position
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
      showNotification('L\'ID et le Nom sont requis.', 'error')
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

    setLoading(true)
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
        showNotification('Produit enregistré avec succès !')
        // Refresh products list
        const refreshedRes = await fetch('/api/products', {
          headers: { 
            'x-admin-username': username,
            'x-admin-password': password 
          }
        })
        const refreshedData = await refreshedRes.json()
        setProducts(refreshedData)
        
        // Find saved product
        const saved = refreshedData.find(p => p.id === payload.id)
        if (saved) setSelectedProduct(saved)
      } else {
        showNotification('Erreur lors de la sauvegarde.', 'error')
      }
    } catch (err) {
      showNotification('Erreur de connexion.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (idToDelete) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/products?id=${idToDelete}`, {
          method: 'DELETE',
          headers: { 
            'x-admin-username': username,
            'x-admin-password': password 
          }
        })
  
        if (res.ok) {
          showNotification('Produit supprimé.')
          const refreshedRes = await fetch('/api/products', {
            headers: { 
              'x-admin-username': username,
              'x-admin-password': password 
            }
          })
          const refreshedData = await refreshedRes.json()
          setProducts(refreshedData)
        setSelectedProduct(null)
      } else {
        showNotification('Erreur lors de la suppression.', 'error')
      }
    } catch (err) {
      showNotification('Erreur de connexion.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0f1f18] flex items-center justify-center p-5 text-amber-50 relative overflow-hidden">
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

  return (
    <div className="min-h-screen bg-[#0f1f18] text-amber-50 p-5 md:p-8">
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

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-xs font-medium shadow-2xl border ${notification.type === 'error' ? 'bg-rose-900/90 text-rose-200 border-rose-800' : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'}`}>
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        {/* Products list & form */}
        <div className="lg:col-span-8 space-y-6">
          {/* List Card */}
          <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-amber-200">
                <Sparkles className="w-4 h-4" /> Recettes de jus ({products.length})
              </h2>
              <Button onClick={handleNewProduct} className="rounded-xl bg-amber-300 hover:bg-amber-200 text-[#0f1f18] text-xs font-bold h-9">
                <Plus className="w-4 h-4 mr-1.5" /> Créer un jus
              </Button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.isArray(products) && products.filter(Boolean).map(p => (
                <button
                  key={p.id}
                  onClick={() => selectProductForEdit(p)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${selectedProduct?.id === p.id ? 'bg-white/10 border-amber-300/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-amber-100/50 text-xs mt-0.5">{p.price || 5} € • {p.imagePos || 'center'}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(p.id)
                    }}
                    className="w-8 h-8 rounded-full hover:bg-rose-500/20 text-amber-100/50 hover:text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </button>
              ))}
            </div>
          </Card>

          {/* Form Card */}
          {selectedProduct && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/5 blur-3xl rounded-full pointer-events-none" />
                <h2 className="font-serif text-lg font-bold mb-6 flex items-center gap-2 text-amber-200">
                  {selectedProduct.isNew ? <Plus className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
                  {selectedProduct.isNew ? 'Nouveau Produit' : `Modifier: ${selectedProduct.name}`}
                </h2>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* ID & Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="p-id" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><Type className="w-3 h-3" /> ID Unique *</Label>
                      <Input
                        id="p-id"
                        value={formId}
                        onChange={(e) => setFormId(e.target.value)}
                        disabled={!selectedProduct.isNew}
                        placeholder="ex: gingembre-fresh"
                        className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-name" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><Type className="w-3 h-3" /> Nom du produit *</Label>
                      <Input
                        id="p-name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="ex: Ginger Boost"
                        className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Tagline & Price */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="p-tagline" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><Type className="w-3 h-3" /> Slogan / Tagline</Label>
                      <Input
                        id="p-tagline"
                        value={formTagline}
                        onChange={(e) => setFormTagline(e.target.value)}
                        placeholder="ex: Fraîcheur piquante"
                        className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-price" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Prix (€) *</Label>
                      <Input
                        id="p-price"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Emoji & Colors */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="p-emoji" className="text-xs uppercase tracking-wider text-amber-200/70">Emoji</Label>
                      <Input
                        id="p-emoji"
                        value={formEmoji}
                        onChange={(e) => setFormEmoji(e.target.value)}
                        placeholder="ex: 🍍"
                        className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm text-center text-lg focus:ring-amber-500/20"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="p-color" className="text-xs uppercase tracking-wider text-amber-200/70">Dégradé Tailwind</Label>
                      <Input
                        id="p-color"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        placeholder="ex: from-lime-500 via-yellow-500 to-amber-600"
                        className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-xs font-mono focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Presets color */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-amber-100/40 mr-1 uppercase">Presets dégradé:</span>
                    {GRADIENT_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setFormColor(preset.value)}
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${preset.value} border border-white/20 transition-all hover:scale-110`}
                        title={preset.name}
                      />
                    ))}
                  </div>

                  {/* Description & Ingredients */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="p-desc" className="text-xs uppercase tracking-wider text-amber-200/70">Description</Label>
                      <Textarea
                        id="p-desc"
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Description du goût et des bienfaits..."
                        className="rounded-xl bg-black/30 border-white/10 mt-2 text-sm focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-ing" className="text-xs uppercase tracking-wider text-amber-200/70">Ingrédients (séparés par des virgules)</Label>
                      <Input
                        id="p-ing"
                        value={formIngredients}
                        onChange={(e) => setFormIngredients(e.target.value)}
                        placeholder="ex: Gingembre, Citron, Menthe"
                        className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-sm focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Custom Image URL */}
                  <div>
                    <Label htmlFor="p-image" className="text-xs uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Image personnalisée (Optionnel - URL)</Label>
                    <Input
                      id="p-image"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Laisser vide pour l'image d'origine"
                      className="rounded-xl bg-black/30 border-white/10 mt-2 h-11 text-xs font-mono focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Image sliders */}
                  <div className="border-t border-white/10 pt-6 space-y-5">
                    <h3 className="font-serif text-sm font-semibold flex items-center gap-2 text-amber-200">
                      <Sliders className="w-4 h-4" /> Réglages Cadrage, Position & Clarté
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-amber-100/60 mb-2">
                            <span>Position X (Gauche/Droite)</span>
                            <span className="font-mono">{posX}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={posX}
                            onChange={(e) => setPosX(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-amber-100/60 mb-2">
                            <span>Position Y (Haut/Bas)</span>
                            <span className="font-mono">{posY}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={posY}
                            onChange={(e) => setPosY(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-amber-100/60 mb-2">
                            <span>Zoom (Cadrage)</span>
                            <span className="font-mono">{zoom}%</span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="600"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-amber-100/60 mb-2">
                            <span>Luminosité (Rendre claire)</span>
                            <span className="font-mono">{brightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-amber-100/60 mb-2">
                            <span>Contraste (Clarté)</span>
                            <span className="font-mono">{contrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end border-t border-white/10 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedProduct(null)}
                      className="rounded-xl border-white/10 hover:bg-white/5 hover:text-white h-12 text-xs font-semibold px-6"
                    >
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

        {/* Live Preview Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
          <Card className="rounded-[2rem] bg-black/20 border-white/10 p-6 shadow-xl">
            <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 text-amber-200">
              <Eye className="w-4 h-4" /> Prévisualisation en direct
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
                      <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center text-amber-100/60"><Plus className="w-3.5 h-3.5" /></button>
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
    </div>
  )
}
