'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Leaf, ShoppingBag, Instagram, Phone, MapPin, Clock, Moon, Sun,
  Plus, Minus, MessageCircle, Sparkles, Snowflake, Heart, Truck, Apple, QrCode,
  X, Menu, Check, Star, Trash2, ChevronRight, ArrowLeft, AlertTriangle
} from 'lucide-react'
import { DEFAULT_SETTINGS } from '@/lib/defaultSettings'

const HERO_IMG = '/images/jus-hero.jpeg'
const CUSTOMER_REVIEW_IMAGE = '/images/avis-clients.jpeg'

const PRODUCT_CARD_IMAGES = {
  bissap: { image: '/images/atelier-bissap-boost.jpeg', position: '57% 50%' },
  detox: { image: '/images/atelier-fresh-detox.jpeg', position: '30% 50%' },
  vita: { image: '/images/atelier-vita-orange.jpeg', position: '50% 50%' },
  water: { image: '/images/product-water-fresh.jpeg', position: '18% 50%' },
}

const STATIC_PRODUCTS = [
  { id: 'bissap', name: 'Bissap Boost', tagline: 'Énergie tropicale', description: "Le rouge profond de l'hibiscus, l'éclat de l'ananas et la fraîcheur de la menthe.", ingredients: ['Bissap', 'Ananas', 'Menthe'], color: 'from-rose-700 via-red-800 to-rose-900', imagePos: '61% 72%', emoji: '🌺' },
  { id: 'detox', name: 'Fresh Detox', tagline: 'Purifiant & vif', description: 'Pomme verte, gingembre piquant, citron éclatant et menthe fraîche. La detox premium.', ingredients: ['Pomme', 'Gingembre', 'Citron', 'Menthe'], color: 'from-lime-500 via-yellow-500 to-amber-600', imagePos: '16% 72%', emoji: '🍏' },
  { id: 'vita', name: 'Vita Orange', tagline: 'Vitamine pure', description: 'Carotte sucrée, orange juteuse et touche de menthe. Le boost solaire matinal.', ingredients: ['Carotte', 'Orange', 'Menthe'], color: 'from-orange-400 via-amber-500 to-orange-600', imagePos: '39% 72%', emoji: '🍊' },
  { id: 'water', name: 'Water Fresh', tagline: 'Hydratation extrême', description: 'Pastèque juteuse, citron pétillant et menthe glaciale. La fraîcheur ultime de l\'été.', ingredients: ['Pastèque', 'Citron', 'Menthe'], color: 'from-pink-500 via-rose-500 to-red-600', imagePos: '84% 72%', emoji: '🍉' },
]

const BENEFIT_ICONS = { Leaf, Sparkles, Heart, Snowflake, Truck, Apple }

const DAY_OPTIONS = ['Lundi', 'Mercredi', 'Vendredi', 'Samedi', 'Dimanche']
const SLOTS_BY_DAY = {
  'Lundi': ['18h — 19h'],
  'Mercredi': ['18h — 19h45'],
  'Vendredi': ['18h — 19h', '19h — 20h', '20h — 21h'],
  'Samedi': ['14h — 16h', '16h — 18h', '18h — 19h'],
  'Dimanche': ['14h — 16h', '16h — 18h', '18h — 19h'],
}

const fmtEuro = (n) => `${n.toFixed(2).replace('.', ',')} €`
const fmtEuroSimple = (n) => Number.isInteger(n) ? `${n} €` : `${n.toFixed(2).replace('.', ',')} €`

// ========== Cart hook ==========
function useCart() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('jfm-cart')
      if (saved) setItems(JSON.parse(saved))
    } catch (e) {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return
    localStorage.setItem('jfm-cart', JSON.stringify(items))
  }, [items, loaded])

  const add = (product, format, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === product.id && i.size === format.size)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [...prev, { productId: product.id, name: product.name, emoji: product.emoji, size: format.size, price: product.price || format.price, qty }]
    })
  }
  const setQty = (productId, size, qty) => {
    setItems(prev => qty <= 0
      ? prev.filter(i => !(i.productId === productId && i.size === size))
      : prev.map(i => i.productId === productId && i.size === size ? { ...i, qty } : i)
    )
  }
  const remove = (productId, size) => setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)))
  const clear = () => setItems([])
  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.qty * i.price, 0)

  return { items, add, setQty, remove, clear, count, total }
}

// ========== Loader ==========
function Loader({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f3a2e]">
      <div className="flex flex-col items-center gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
          <div className="w-20 h-20 rounded-full border-4 border-amber-200/20 border-t-amber-300" />
        </motion.div>
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
          <div className="font-serif text-2xl text-amber-50 tracking-wide">JUS FRAIS MAISON</div>
          <div className="text-amber-100/60 text-xs uppercase tracking-[0.3em] mt-2">Marseille</div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function FloatingLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Leaf className="absolute top-[10%] left-[5%] w-12 h-12 text-emerald-600/20 float-leaf rotate-12" />
      <Leaf className="absolute top-[20%] right-[8%] w-16 h-16 text-emerald-700/15 float-leaf-2 -rotate-45" />
      <Leaf className="absolute bottom-[15%] left-[12%] w-10 h-10 text-emerald-500/20 float-leaf-3 rotate-90" />
      <Leaf className="absolute top-[60%] right-[15%] w-8 h-8 text-emerald-600/20 float-leaf rotate-180" />
    </div>
  )
}

// ========== Site Status Banner ==========
function StatusBanner({ status, message }) {
  if (status === 'open') return null
  const isPause = status === 'pause'
  return (
    <motion.div
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className={`fixed top-0 inset-x-0 z-[60] py-3 px-5 text-center text-sm font-semibold flex items-center justify-center gap-2 ${isPause ? 'bg-amber-500 text-amber-950' : 'bg-rose-700 text-white'}`}
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      {message || (isPause ? 'Nous serons de retour très bientôt. Merci de votre fidélité ! 🌿' : 'Boutique fermée. Merci de revenir bientôt.')}
    </motion.div>
  )
}

// ========== Navbar ==========
function Navbar({ dark, setDark, openMenu, setOpenMenu, onOpenCart, cartCount, statusOffset }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [
    { href: '#saveurs', label: 'Saveurs' },
    { href: '#formats', label: 'Tarifs' },
    { href: '#pourquoi', label: 'Pourquoi nous' },
    { href: '#livraison', label: 'Livraison' },
  ]
  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ top: statusOffset }}
        className={`fixed inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 group">
            <span className="text-2xl">🌿</span>
            <div className="leading-none">
              <div className="font-serif text-lg md:text-xl font-semibold tracking-tight">JUS FRAIS MAISON</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Marseille • Artisanal</div>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors" aria-label="theme">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={onOpenCart} className="relative w-11 h-11 rounded-full bg-[#1f3a2e] text-amber-50 hover:bg-[#264a3a] flex items-center justify-center transition-colors" aria-label="cart">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-[#a02440] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </motion.span>
              )}
            </button>
            <button onClick={() => setOpenMenu(true)} className="md:hidden w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center" aria-label="menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {openMenu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpenMenu(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background p-6 flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <div className="font-serif text-lg">Menu</div>
                <button onClick={() => setOpenMenu(false)} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.a key={l.href} href={l.href} onClick={() => setOpenMenu(false)} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }} className="font-serif text-3xl py-3 border-b border-border/50">
                    {l.label}
                  </motion.a>
                ))}
              </div>
              <Button onClick={() => { setOpenMenu(false); onOpenCart() }} className="mt-auto bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50 rounded-full h-14 text-base btn-shine">
                <ShoppingBag className="w-5 h-5 mr-2" /> Voir mon panier {cartCount > 0 && `(${cartCount})`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ========== Hero ==========
function Hero({ onOpenCart, onScrollSaveurs, hero }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const badge = hero?.badge || DEFAULT_SETTINGS.hero.badge
  const description = hero?.description || DEFAULT_SETTINGS.hero.description
  const badgeItems = hero?.badgeItems || DEFAULT_SETTINGS.hero.badgeItems
  return (
    <section ref={ref} id="top" className="relative min-h-[100svh] gradient-hero overflow-hidden pt-24 md:pt-28 pb-16">
      <FloatingLeaves />
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center relative">
        <motion.div style={{ y, opacity }} className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-[0.2em] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="font-serif text-[42px] leading-[1.02] sm:text-6xl lg:text-7xl font-medium tracking-tight text-balance">
            Des jus <span className="italic text-[#a02440]">frais</span> maison,<br />
            préparés <span className="italic">chaque jour</span><br />
            à <span className="text-[#1f3a2e]">Marseille</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl text-balance">
            {description}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={onScrollSaveurs} size="lg" className="bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50 rounded-full h-14 px-8 text-base btn-shine pulse-glow">
              <ShoppingBag className="w-5 h-5 mr-2" /> Commander maintenant
            </Button>
            <Button onClick={onScrollSaveurs} variant="outline" size="lg" className="rounded-full h-14 px-7 text-base border-foreground/20 hover:bg-foreground/5">
              Voir les saveurs
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 flex flex-wrap gap-2">
            {badgeItems.map(b => (
              <Badge key={b} variant="secondary" className="glass border-foreground/10 px-3 py-1.5 text-xs font-medium">
                <Check className="w-3 h-3 mr-1.5 text-emerald-600" /> {b}
              </Badge>
            ))}
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.4, duration: 1, type: 'spring' }} className="relative z-10">
          <div className="relative aspect-[4/5] max-w-[520px] mx-auto">
            <div className="absolute -inset-8 bg-gradient-to-br from-amber-200/40 via-rose-200/30 to-emerald-200/40 blur-3xl rounded-full" />
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
              <img src={HERO_IMG} alt="Jus Frais Maison - 4 saveurs" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="absolute -left-4 sm:-left-10 top-10 glass rounded-2xl p-3 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pressé</div>
                <div className="font-semibold text-sm">à froid</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="absolute -right-4 sm:-right-8 bottom-16 glass rounded-2xl p-3 shadow-xl">
              <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              <div className="text-xs font-medium">+200 clients</div>
              <div className="text-[10px] text-muted-foreground">à Marseille</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ========== ProductCard ==========
function ProductCard({ p, idx, onAdd, formats }) {
  const activeFormats = (formats || DEFAULT_SETTINGS.formats)
  const [format, setFormat] = useState(activeFormats[0] || { size: '380 ml', price: 5 })
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAdd(p, format, qty)
    setAdded(true)
    setQty(1)
    setTimeout(() => setAdded(false), 1500)
  }

  const price = p.price || format.price
  const fallbackCardImage = PRODUCT_CARD_IMAGES[p.id] || {}
  const cardImage = p.image || fallbackCardImage.image || HERO_IMG
  const cardImagePosition = p.image ? (p.imagePos || 'center') : (fallbackCardImage.position || 'center')

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: idx * 0.08, duration: 0.6 }} whileHover={{ y: -4 }} className="group">
      <Card className="overflow-hidden border-foreground/10 rounded-3xl bg-card hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
        <div className={`relative aspect-[4/5] bg-gradient-to-br ${p.color} overflow-hidden`}>
          <img
            src={cardImage}
            alt={`${p.name} - Jus Frais Maison`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: cardImagePosition,
              filter: `brightness(${p.imageBrightness ?? 100}%) contrast(${p.imageContrast ?? 100}%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <Badge className="glass border-white/30 text-white text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">{p.tagline}</Badge>
            <div className="text-3xl drop-shadow-lg">{p.emoji}</div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="font-serif text-2xl md:text-3xl font-semibold drop-shadow-lg">{p.name}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.isArray(p.ingredients) && p.ingredients.map(i => (
                <span key={i} className="text-[10px] uppercase tracking-wider bg-white/15 backdrop-blur px-2 py-0.5 rounded-full border border-white/20">{i}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center bg-secondary rounded-full px-1 py-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-7 h-7 rounded-full hover:bg-background flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
              <span className="w-7 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-7 h-7 rounded-full hover:bg-background flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <Button onClick={handleAdd} className={`flex-1 rounded-full transition-all btn-shine ${added ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-foreground text-background hover:opacity-90'}`}>
              {added ? <><Check className="w-4 h-4 mr-1" /> Ajouté</> : <><ShoppingBag className="w-4 h-4 mr-1.5" /> {fmtEuroSimple(price * qty)}</>}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function Saveurs({ onAdd, products, formats }) {
  return (
    <section id="saveurs" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Nos saveurs</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">Quatre recettes, <span className="italic">une obsession</span> : la fraîcheur.</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {products.map((p, i) => <ProductCard key={p.id} p={p} idx={i} onAdd={onAdd} formats={formats} />)}
        </div>
      </div>
    </section>
  )
}

function AtelierGallery() {
  const highlights = [
    { icon: Apple, title: '4 saveurs', text: 'Bissap, detox, orange et water fresh.' },
    { icon: Snowflake, title: 'Frais du jour', text: 'Préparé, refroidi, puis livré rapidement.' },
    { icon: MessageCircle, title: 'Commande simple', text: 'Validation directe sur WhatsApp.' },
  ]
  return (
    <section id="atelier" className="py-24 md:py-32 bg-secondary/35 relative overflow-hidden">
      <FloatingLeaves />
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Repère saveurs</div>
            <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">Simple à <span className="italic text-[#a02440]">choisir</span>.</h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              Un aperçu clair des recettes et des infos essentielles, sans répéter les photos déjà présentes sur les cartes produit.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {['Guide clair', 'Fait maison', 'Commande rapide'].map((label) => (
                <Badge key={label} variant="secondary" className="glass border-foreground/10 px-3 py-1.5 text-xs font-medium">
                  <Sparkles className="w-3 h-3 mr-1.5 text-[#a02440]" /> {label}
                </Badge>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="min-w-0">
            <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-5 items-stretch">
              <div className="self-start rounded-3xl overflow-hidden border border-border bg-card shadow-xl">
                <div className="relative aspect-[16/9] bg-emerald-50 dark:bg-emerald-950/20">
                  <img src="/images/brand-guide-wide.jpeg" alt="Guide des saveurs Jus Frais Maison" className="h-full w-full object-cover object-center" />
                  <Badge className="absolute left-4 top-4 glass border-white/30 text-white text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">Guide saveurs</Badge>
                </div>
              </div>
              <div className="grid gap-3">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-3xl p-5 bg-card border border-border">
                    <div className="w-11 h-11 rounded-2xl bg-[#1f3a2e] text-amber-50 flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="font-serif text-xl font-medium">{item.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Formats({ formats }) {
  const activeFormats = formats || DEFAULT_SETTINGS.formats
  return (
    <section id="formats" className="py-24 md:py-32 bg-secondary/40 relative overflow-hidden">
      <FloatingLeaves />
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Volume & Prix</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">La bouteille <span className="italic">idéale</span>.</h2>
        </motion.div>
        <div className="flex justify-center max-w-sm mx-auto">
          {activeFormats.map((f, i) => (
            <motion.div key={f.size} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }} className="relative rounded-3xl p-8 text-center border bg-[#1f3a2e] text-amber-50 border-[#1f3a2e] shadow-2xl scale-[1.03] w-full">
              {f.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a02440] text-white border-0 px-3">Bouteille Unique</Badge>}
              <div className="text-xs uppercase tracking-[0.25em] mb-3 text-amber-200/80">Bouteille</div>
              <div className="font-serif text-5xl md:text-6xl font-semibold mb-3">{f.size}</div>
              <div className="text-4xl font-serif text-amber-200">{f.price} €</div>
              <div className="text-xs mt-4 text-amber-100/70">Toutes saveurs disponibles</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pourquoi({ benefits }) {
  const activeBenefits = benefits || DEFAULT_SETTINGS.benefits
  return (
    <section id="pourquoi" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Pourquoi choisir nos jus ?</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">L'exigence du <span className="italic">vrai frais</span>.</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {activeBenefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[b.icon] || Leaf
            return (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="group rounded-3xl p-7 bg-card border border-border hover:border-[#1f3a2e]/40 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#1f3a2e] text-amber-50 flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="font-serif text-2xl font-medium mb-1.5">{b.title}</div>
                <div className="text-sm text-muted-foreground">{b.text}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Livraison({ schedule, contact }) {
  const activeSchedule = (schedule || DEFAULT_SETTINGS.schedule).filter(s => s.active !== false)
  const whatsapp = contact?.whatsapp || DEFAULT_SETTINGS.contact.whatsapp
  const address = contact?.address || DEFAULT_SETTINGS.contact.address
  const whatsappOrderUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Bonjour Jus Frais Maison, je souhaite passer une commande.')}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=14&bgcolor=ffffff&color=1f3a2e&data=${encodeURIComponent(whatsappOrderUrl)}`
  return (
    <section id="livraison" className="py-24 md:py-32 bg-[#1f3a2e] text-amber-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <Leaf className="absolute top-10 left-10 w-40 h-40 text-amber-200 float-leaf" />
        <Leaf className="absolute bottom-10 right-10 w-32 h-32 text-amber-200 float-leaf-2" />
      </div>
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70 mb-4">Livraison locale</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">Marseille, <span className="italic text-amber-200">Vieux-Port</span>.</h2>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-8 border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 text-[#1f3a2e] flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Créneaux</div>
                <div className="font-serif text-xl">Jours de livraison</div>
              </div>
            </div>
            <div className="space-y-3">
              {activeSchedule.map((s, i) => (
                <motion.div key={s.day} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-medium">{s.day}</div>
                  <div className="font-serif text-amber-200 text-lg">{s.hours}</div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-6 text-amber-200/80">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{address}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-8 border-white/10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-200/10 text-amber-200 text-xs uppercase tracking-[0.2em] mb-5">
              <QrCode className="w-3 h-3" /> Scan & commande
            </div>
            <div className="font-serif text-3xl md:text-4xl mb-3">Commandez en 1 scan</div>
            <p className="text-amber-100/70 text-sm mb-7 max-w-sm mx-auto">Scannez ce QR code pour ouvrir WhatsApp avec un message de commande prêt à envoyer.</p>
            <a href={whatsappOrderUrl} target="_blank" rel="noreferrer" className="inline-block p-4 bg-white rounded-2xl shadow-2xl transition-transform hover:scale-[1.02]">
              <img src={qrUrl} alt="QR WhatsApp" className="w-48 h-48 md:w-56 md:h-56" />
            </a>
            <div className="mt-6 flex justify-center">
              <Button asChild className="rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white btn-shine">
                <a href={whatsappOrderUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" /> Commander sur WhatsApp
                </a>
              </Button>
            </div>
            <div className="mt-4 text-sm text-amber-100/80">WhatsApp : +{whatsapp}</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Testimonials({ testimonials }) {
  const activeTestimonials = (testimonials || DEFAULT_SETTINGS.testimonials).filter(t => t.active !== false)
  return (
    <section id="avis" className="py-24 md:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Avis clients</div>
          <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">Marseille adore.</h2>
        </motion.div>
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)] gap-6 lg:gap-8 items-stretch">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl p-3 sm:p-4 bg-card border border-border shadow-xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-secondary">
              <img src={CUSTOMER_REVIEW_IMAGE} alt="Retour client WhatsApp" className="h-full w-full object-cover" />
              <Badge className="absolute left-4 top-4 border-white/50 bg-white/85 text-[#1f3a2e] hover:bg-white/85 dark:bg-[#1f3a2e]/90 dark:text-amber-50 dark:border-amber-50/10">
                <Heart className="w-3 h-3 mr-1.5 fill-current text-[#a02440]" /> Retour client
              </Badge>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex gap-0.5 mb-3 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="font-serif text-2xl md:text-3xl leading-tight">"Ton Bissap est tres bon"</p>
              <p className="text-sm text-muted-foreground mt-3">Un vrai message client, recu apres une commande de Bissap Boost.</p>
            </div>
          </motion.div>
          <div className="grid md:grid-cols-3 lg:grid-cols-1 gap-5">
            {activeTestimonials.map((t, i) => (
              <motion.div key={t.name + i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-3xl p-7 bg-card border border-border">
                <div className="flex gap-0.5 mb-4 text-amber-500">
                  {[...Array(t.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="font-serif text-lg leading-snug mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1f3a2e] to-[#a02440] flex items-center justify-center text-amber-50 text-sm font-semibold">{t.name[0]}</div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.area} - Marseille</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer({ contact }) {
  const whatsapp = contact?.whatsapp || DEFAULT_SETTINGS.contact.whatsapp
  const instagram = contact?.instagram || DEFAULT_SETTINGS.contact.instagram
  const address = contact?.address || DEFAULT_SETTINGS.contact.address
  const phone = contact?.phone || DEFAULT_SETTINGS.contact.phone
  return (
    <footer className="bg-[#0f1f18] text-amber-50/90 pt-16 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <a href="/admin" className="text-2xl hover:opacity-85 transition-opacity" title="Admin">🌿</a>
              <div className="font-serif text-xl">JUS FRAIS MAISON</div>
            </div>
            <p className="text-sm text-amber-50/60 max-w-xs">Des jus frais artisanaux préparés chaque matin à Marseille. 100% naturel, sans conservateurs.</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] mb-4 text-amber-200/70">Contact</div>
            <div className="space-y-2 text-sm">
              <a href={`tel:+${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-amber-200"><Phone className="w-4 h-4" /> {phone}</a>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {address}</div>
              <a href={instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-200"><Instagram className="w-4 h-4" /> @jusfraismaison</a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-200"><MessageCircle className="w-4 h-4" /> WhatsApp direct</a>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] mb-4 text-amber-200/70">Le shop</div>
            <div className="space-y-2 text-sm">
              <a href="#saveurs" className="block hover:text-amber-200">Nos saveurs</a>
              <a href="#formats" className="block hover:text-amber-200">Tarifs</a>
              <a href="#livraison" className="block hover:text-amber-200">Livraison Marseille</a>
              <a href="#pourquoi" className="block hover:text-amber-200">Pourquoi nous</a>
            </div>
          </div>
        </div>
        <div className="border-t border-amber-50/10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-50/50">
          <div>© {new Date().getFullYear()} Jus Frais Maison — Marseille. Fait avec ❤. <a href="/admin" className="opacity-0 hover:opacity-30 transition-opacity ml-1 cursor-default text-[8px] select-none" aria-label="admin">.</a></div>
          <div>Site premium — 100% artisanal</div>
        </div>
      </div>
    </footer>
  )
}

// ========== Cart Drawer ==========
function CartDrawer({ open, onClose, cart, whatsapp, schedule }) {
  const [step, setStep] = useState('cart')
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', adresse: '', quartier: '', jour: '', creneau: '', note: '' })
  const [errors, setErrors] = useState({})

  const activeSchedule = (schedule || DEFAULT_SETTINGS.schedule).filter(s => s.active !== false)
  const dayOptions = activeSchedule.map(s => s.day)
  const slotsByDay = Object.fromEntries(
    activeSchedule.map(s => [s.day, s.hours.split(',').map(h => h.trim())])
  )

  useEffect(() => {
    if (open) {
      setStep('cart')
      setErrors({})
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jfm-customer')
          if (saved) setForm(prev => ({ ...prev, ...JSON.parse(saved) }))
        } catch (e) {}
      }
    }
  }, [open])

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.nom.trim()) e.nom = 'Requis'
    if (!form.prenom.trim()) e.prenom = 'Requis'
    if (!form.telephone.trim()) e.telephone = 'Requis'
    if (!form.adresse.trim()) e.adresse = 'Requis'
    if (!form.quartier.trim()) e.quartier = 'Requis'
    if (!form.jour) e.jour = 'Requis'
    if (!form.creneau) e.creneau = 'Requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    if (typeof window !== 'undefined') localStorage.setItem('jfm-customer', JSON.stringify(form))
    const lines = cart.items.map(it => `- ${it.qty} x ${it.name} ${it.size} = ${fmtEuroSimple(it.qty * it.price)}`)
    const msg = `Bonjour, je souhaite passer une commande.\n\nNom : ${form.nom}\nPrénom : ${form.prenom}\nTéléphone : ${form.telephone}\nAdresse : ${form.adresse}\nQuartier : ${form.quartier}\nJour : ${form.jour}\nCréneau : ${form.creneau}\nNote : ${form.note || '-'}\n\nCommande :\n${lines.join('\n')}\n\nTotal : ${fmtEuroSimple(cart.total)}\n\nMerci.`
    try {
      await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: form, items: cart.items, total: cart.total }) })
    } catch (e) {}
    window.open(`https://wa.me/${whatsapp || DEFAULT_SETTINGS.contact.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    setStep('sent')
  }

  const slots = form.jour ? (slotsByDay[form.jour] || SLOTS_BY_DAY[form.jour] || []) : []

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-end md:items-stretch md:justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 28 }} className="relative w-full md:max-w-md md:h-full bg-background rounded-t-3xl md:rounded-none max-h-[92svh] md:max-h-none flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                {step !== 'cart' && step !== 'sent' && (
                  <button onClick={() => setStep('cart')} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {step === 'cart' ? 'Mon panier' : step === 'checkout' ? 'Vos coordonnées' : 'Commande envoyée'}
                  </div>
                  <div className="font-serif text-xl">
                    {step === 'cart' ? `${cart.count} ${cart.count > 1 ? 'articles' : 'article'}` : step === 'checkout' ? 'Livraison' : 'Merci !'}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {step === 'cart' && (
                cart.items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🛍️</div>
                    <div className="font-serif text-2xl mb-2">Votre panier est vide</div>
                    <p className="text-sm text-muted-foreground mb-6">Ajoutez vos jus préférés pour commencer.</p>
                    <Button onClick={onClose} className="rounded-full bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50">Voir les saveurs</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.items.map(it => (
                      <motion.div key={`${it.productId}_${it.size}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/20 flex items-center justify-center text-2xl flex-shrink-0">{it.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-serif text-base font-medium leading-tight">{it.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{it.size} • {it.price} € l'unité</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-secondary rounded-full">
                              <button onClick={() => cart.setQty(it.productId, it.size, it.qty - 1)} className="w-7 h-7 rounded-full hover:bg-background flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                              <span className="w-7 text-center text-sm font-semibold">{it.qty}</span>
                              <button onClick={() => cart.setQty(it.productId, it.size, it.qty + 1)} className="w-7 h-7 rounded-full hover:bg-background flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                            </div>
                            <div className="font-serif text-base font-semibold">{fmtEuroSimple(it.qty * it.price)}</div>
                          </div>
                        </div>
                        <button onClick={() => cart.remove(it.productId, it.size)} className="w-8 h-8 rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
              {step === 'checkout' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="nom" className="text-xs uppercase tracking-wider">Nom *</Label>
                      <Input id="nom" value={form.nom} onChange={e => update('nom', e.target.value)} className={`mt-1 rounded-xl ${errors.nom ? 'border-rose-500' : ''}`} placeholder="Dupont" />
                    </div>
                    <div>
                      <Label htmlFor="prenom" className="text-xs uppercase tracking-wider">Prénom *</Label>
                      <Input id="prenom" value={form.prenom} onChange={e => update('prenom', e.target.value)} className={`mt-1 rounded-xl ${errors.prenom ? 'border-rose-500' : ''}`} placeholder="Marie" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tel" className="text-xs uppercase tracking-wider">Téléphone *</Label>
                    <Input id="tel" type="tel" value={form.telephone} onChange={e => update('telephone', e.target.value)} className={`mt-1 rounded-xl ${errors.telephone ? 'border-rose-500' : ''}`} placeholder="06 12 34 56 78" />
                  </div>
                  <div>
                    <Label htmlFor="adresse" className="text-xs uppercase tracking-wider">Adresse *</Label>
                    <Input id="adresse" value={form.adresse} onChange={e => update('adresse', e.target.value)} className={`mt-1 rounded-xl ${errors.adresse ? 'border-rose-500' : ''}`} placeholder="12 Rue de la République" />
                  </div>
                  <div>
                    <Label htmlFor="quartier" className="text-xs uppercase tracking-wider">Quartier *</Label>
                    <Input id="quartier" value={form.quartier} onChange={e => update('quartier', e.target.value)} className={`mt-1 rounded-xl ${errors.quartier ? 'border-rose-500' : ''}`} placeholder="Vieux-Port, Castellane..." />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider">Jour souhaité *</Label>
                    <div className={`grid gap-1.5 mt-1`} style={{ gridTemplateColumns: `repeat(${Math.min(dayOptions.length, 5)}, 1fr)` }}>
                      {dayOptions.map(d => (
                        <button key={d} type="button" onClick={() => { update('jour', d); update('creneau', '') }} className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.jour === d ? 'border-[#1f3a2e] bg-[#1f3a2e] text-amber-50' : `border-border ${errors.jour ? 'border-rose-500/50' : ''}`}`}>
                          {d.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.jour && slots.length > 0 && (
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Créneau *</Label>
                      <div className="grid grid-cols-3 gap-1.5 mt-1">
                        {slots.map(s => (
                          <button key={s} type="button" onClick={() => update('creneau', s)} className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.creneau === s ? 'border-[#1f3a2e] bg-[#1f3a2e] text-amber-50' : `border-border ${errors.creneau ? 'border-rose-500/50' : ''}`}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="note" className="text-xs uppercase tracking-wider">Note spéciale</Label>
                    <Textarea id="note" value={form.note} onChange={e => update('note', e.target.value)} className="mt-1 rounded-xl" rows={2} placeholder="Étage, code, allergie..." />
                  </div>
                </div>
              )}
              {step === 'sent' && (
                <div className="text-center py-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-20 h-20 rounded-full bg-emerald-500 mx-auto mb-6 flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="font-serif text-3xl mb-2">Commande envoyée !</div>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Votre commande a été transmise sur WhatsApp. Nous vous confirmerons rapidement.</p>
                  <Button onClick={() => { cart.clear(); onClose() }} className="rounded-full bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50">Fermer</Button>
                </div>
              )}
            </div>
            {step === 'cart' && cart.items.length > 0 && (
              <div className="border-t border-border p-5 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="font-serif text-3xl font-semibold">{fmtEuroSimple(cart.total)}</div>
                </div>
                <Button onClick={() => setStep('checkout')} className="w-full h-14 rounded-full bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50 text-base btn-shine">
                  Passer commande <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}
            {step === 'checkout' && (
              <div className="border-t border-border p-5 bg-card">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <div className="text-muted-foreground">{cart.count} {cart.count > 1 ? 'articles' : 'article'}</div>
                  <div className="font-serif text-2xl font-semibold">{fmtEuroSimple(cart.total)}</div>
                </div>
                <Button onClick={submit} className="w-full h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white text-base btn-shine">
                  <MessageCircle className="w-5 h-5 mr-2" /> Valider sur WhatsApp
                </Button>
                <div className="text-center text-[11px] text-muted-foreground mt-2">Vous serez redirigé vers WhatsApp avec votre commande.</div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FloatingWhatsApp({ whatsapp }) {
  const number = whatsapp || DEFAULT_SETTINGS.contact.whatsapp
  return (
    <motion.a href={`https://wa.me/${number}?text=${encodeURIComponent('Bonjour Jus Frais Maison, ')}`} target="_blank" rel="noreferrer" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5, type: 'spring' }} className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] shadow-xl flex items-center justify-center text-white" aria-label="WhatsApp">
      <MessageCircle className="w-6 h-6" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </motion.a>
  )
}

function StickyMobileCart({ count, total, onOpen }) {
  if (count === 0) return null
  return (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring' }} className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
      <button onClick={onOpen} className="w-full h-14 rounded-full bg-[#1f3a2e] text-amber-50 shadow-2xl flex items-center justify-between px-5 btn-shine">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-[#a02440] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{count}</span>
          </div>
          <span className="font-medium">Voir mon panier</span>
        </div>
        <div className="font-serif text-lg">{fmtEuroSimple(total)}</div>
      </button>
    </motion.div>
  )
}

// ========== App ==========
function App() {
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [siteSettings, setSiteSettings] = useState(null)
  const cart = useCart()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('jfm-theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) setDark(true)
  }, [])
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', dark)
    if (typeof window !== 'undefined') localStorage.setItem('jfm-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setProducts(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(() => {})
  }, [])

  const settings = siteSettings || DEFAULT_SETTINGS
  const siteStatus = settings.siteStatus || 'open'
  const statusOffset = siteStatus !== 'open' ? 44 : 0

  const displayProducts = (Array.isArray(products) && products.length > 0) ? products.filter(Boolean) : STATIC_PRODUCTS
  const scrollSaveurs = () => document.getElementById('saveurs')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence>
      <StatusBanner status={siteStatus} message={settings.hero?.pauseMessage} />
      <div className="min-h-screen bg-background text-foreground" style={{ paddingTop: statusOffset }}>
        <Navbar dark={dark} setDark={setDark} openMenu={openMenu} setOpenMenu={setOpenMenu} onOpenCart={() => setCartOpen(true)} cartCount={cart.count} statusOffset={statusOffset} />
        <Hero onOpenCart={() => setCartOpen(true)} onScrollSaveurs={scrollSaveurs} hero={settings.hero} />
        <Saveurs onAdd={(p, f, q) => cart.add(p, f, q)} products={displayProducts} formats={settings.formats} />
        <AtelierGallery />
        <Formats formats={settings.formats} />
        <Pourquoi benefits={settings.benefits} />
        <Livraison schedule={settings.schedule} contact={settings.contact} />
        <Testimonials testimonials={settings.testimonials} />
        <Footer contact={settings.contact} />
        <FloatingWhatsApp whatsapp={settings.contact?.whatsapp} />
        <StickyMobileCart count={cart.count} total={cart.total} onOpen={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} whatsapp={settings.contact?.whatsapp} schedule={settings.schedule} />
      </div>
    </>
  )
}

export default App
