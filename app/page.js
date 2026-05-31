'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Leaf, ShoppingBag, Instagram, Phone, MapPin, Clock, Moon, Sun,
  Plus, Minus, MessageCircle, Sparkles, Snowflake, Heart, Truck, Apple, QrCode, X, Menu, Check, Star
} from 'lucide-react'

const WHATSAPP_NUMBER = '33650711629' // +33 6 50 71 16 29
const INSTAGRAM_URL = 'https://instagram.com/jusfraismaison'

const PRODUCTS = [
  {
    id: 'bissap',
    name: 'Bissap Boost',
    tagline: 'Énergie tropicale',
    description: 'Le rouge profond de l\u0027hibiscus, l\u0027éclat de l\u0027ananas et la fraîcheur de la menthe.',
    ingredients: ['Bissap', 'Ananas', 'Menthe'],
    color: 'from-rose-600 via-red-500 to-rose-700',
    accent: '#a02440',
    image: 'https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/k5x9r7kb_WhatsApp%20Image%202026-05-31%20at%2019.09.03.jpeg',
    emoji: '🌺',
  },
  {
    id: 'detox',
    name: 'Fresh Detox',
    tagline: 'Purifiant & vif',
    description: 'Pomme verte, gingembre piquant, citron éclatant et menthe fraîche. La detox premium.',
    ingredients: ['Pomme', 'Gingembre', 'Citron', 'Menthe'],
    color: 'from-emerald-500 via-green-600 to-emerald-700',
    accent: '#2e7d4f',
    image: 'https://images.unsplash.com/photo-1622597467836-f3e6707e1191?w=800&q=80',
    emoji: '🍏',
  },
  {
    id: 'vita',
    name: 'Vita Orange',
    tagline: 'Vitamine pure',
    description: 'Carotte sucrée, orange juteuse et touche de menthe. Le boost solaire matinal.',
    ingredients: ['Carotte', 'Orange', 'Menthe'],
    color: 'from-orange-400 via-amber-500 to-orange-600',
    accent: '#e67e22',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
    emoji: '🍊',
  },
  {
    id: 'water',
    name: 'Water Fresh',
    tagline: 'Hydratation extrême',
    description: 'Pastèque juteuse, citron pétillant et menthe glaciale. La fraîcheur ultime de l\u0027été.',
    ingredients: ['Pastèque', 'Citron', 'Menthe'],
    color: 'from-pink-500 via-rose-500 to-red-500',
    accent: '#d63951',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80',
    emoji: '🍉',
  },
]

const FORMATS = [
  { size: '250ml', price: 3, label: 'Découverte' },
  { size: '380ml', price: 4, label: 'Classique', popular: true },
  { size: '500ml', price: 5, label: 'Grande soif' },
]

const BENEFITS = [
  { icon: Leaf, title: '100% Naturel', text: 'Que des fruits, rien d\u0027autre.' },
  { icon: Sparkles, title: 'Sans conservateurs', text: 'Préparé pour être bu vite.' },
  { icon: Heart, title: 'Préparé le jour même', text: 'Chaque matin, à la main.' },
  { icon: Snowflake, title: 'Pressé à froid', text: 'Vitamines & nutriments préservés.' },
  { icon: Truck, title: 'Livraison Marseille', text: 'Au Vieux-Port et alentours.' },
  { icon: Apple, title: 'Ingrédients frais', text: 'Sélectionnés chaque matin.' },
]

const SCHEDULE = [
  { day: 'Lundi', hours: '18h — 19h' },
  { day: 'Mercredi', hours: '18h — 19h45' },
  { day: 'Vendredi', hours: '18h — 21h' },
  { day: 'Week-end & jours fériés', hours: '14h — 19h' },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'Le Bissap Boost est juste incroyable. Goût authentique, fraîcheur dingue.', rating: 5, area: 'Vieux-Port' },
  { name: 'Karim D.', text: 'Je commande chaque semaine le Fresh Detox. La meilleure routine matin.', rating: 5, area: 'Castellane' },
  { name: 'Léa B.', text: 'Livraison rapide, packaging super propre, et surtout : le goût est là.', rating: 5, area: 'Cours Julien' },
]

function Loader({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f3a2e]"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full border-4 border-amber-200/20 border-t-amber-300" />
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
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

function Navbar({ dark, setDark, openMenu, setOpenMenu, onOrder }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [
    { href: '#saveurs', label: 'Saveurs' },
    { href: '#formats', label: 'Formats' },
    { href: '#pourquoi', label: 'Pourquoi nous' },
    { href: '#livraison', label: 'Livraison' },
  ]
  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}
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
            <Button onClick={onOrder} className="hidden md:inline-flex bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50 rounded-full px-5 btn-shine">
              Commander
            </Button>
            <button onClick={() => setOpenMenu(true)} className="md:hidden w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center" aria-label="menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpenMenu(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="font-serif text-lg">Menu</div>
                <button onClick={() => setOpenMenu(false)} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpenMenu(false)}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="font-serif text-3xl py-3 border-b border-border/50"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </div>
              <Button onClick={() => { setOpenMenu(false); onOrder() }} className="mt-auto bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50 rounded-full h-14 text-base btn-shine">
                <MessageCircle className="w-5 h-5 mr-2" /> Commander sur WhatsApp
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Hero({ onOrder, onScrollSaveurs }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} id="top" className="relative min-h-[100svh] gradient-hero overflow-hidden pt-24 md:pt-28 pb-16">
      <FloatingLeaves />
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center relative">
        <motion.div style={{ y, opacity }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-[0.2em] mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Préparé ce matin à Marseille
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-serif text-[42px] leading-[1.02] sm:text-6xl lg:text-7xl font-medium tracking-tight text-balance"
          >
            Des jus <span className="italic text-[#a02440]">frais</span> maison,<br />
            préparés <span className="italic">chaque jour</span><br />
            à <span className="text-[#1f3a2e]">Marseille</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl text-balance"
          >
            Des recettes artisanales, des ingrédients sélectionnés à la main, pressés à froid. Commandez en 30 secondes via WhatsApp, livré au Vieux-Port.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button onClick={onOrder} size="lg" className="bg-[#1f3a2e] hover:bg-[#264a3a] text-amber-50 rounded-full h-14 px-8 text-base btn-shine pulse-glow">
              <ShoppingBag className="w-5 h-5 mr-2" /> Commander maintenant
            </Button>
            <Button onClick={onScrollSaveurs} variant="outline" size="lg" className="rounded-full h-14 px-7 text-base border-foreground/20 hover:bg-foreground/5">
              Voir les saveurs
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {['100% Naturel', 'Fait maison', 'Livraison Marseille'].map(b => (
              <Badge key={b} variant="secondary" className="glass border-foreground/10 px-3 py-1.5 text-xs font-medium">
                <Check className="w-3 h-3 mr-1.5 text-emerald-600" /> {b}
              </Badge>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 1, type: 'spring' }}
          className="relative z-10"
        >
          <div className="relative aspect-[4/5] max-w-[520px] mx-auto">
            <div className="absolute -inset-8 bg-gradient-to-br from-amber-200/40 via-rose-200/30 to-emerald-200/40 blur-3xl rounded-full" />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5"
            >
              <img
                src="https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/non7tytf_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%284%29.jpeg"
                alt="Jus Frais Maison"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -left-4 sm:-left-10 top-10 glass rounded-2xl p-3 shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pressé</div>
                <div className="font-semibold text-sm">à froid</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -right-4 sm:-right-8 bottom-16 glass rounded-2xl p-3 shadow-xl"
            >
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

function ProductCard({ p, idx, onOrder }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: idx * 0.08, duration: 0.6 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Card className="overflow-hidden border-foreground/10 rounded-3xl bg-card hover:shadow-2xl transition-all duration-500">
        <div className={`relative aspect-[4/5] bg-gradient-to-br ${p.color} overflow-hidden`}>
          <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <Badge className="glass border-white/30 text-white text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">{p.tagline}</Badge>
            <div className="text-3xl drop-shadow-lg">{p.emoji}</div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="font-serif text-3xl font-semibold drop-shadow-lg">{p.name}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {p.ingredients.map(i => (
                <span key={i} className="text-[10px] uppercase tracking-wider bg-white/15 backdrop-blur px-2 py-0.5 rounded-full border border-white/20">{i}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{p.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">à partir de</div>
              <div className="font-serif text-2xl font-semibold">3€<span className="text-sm font-normal text-muted-foreground">/250ml</span></div>
            </div>
            <Button onClick={() => onOrder(p)} className="rounded-full bg-foreground text-background hover:opacity-90 btn-shine">
              Commander
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function Saveurs({ onOrder }) {
  return (
    <section id="saveurs" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Nos saveurs</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">Quatre recettes, <span className="italic">une obsession</span> : la fraîcheur.</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {PRODUCTS.map((p, i) => <ProductCard key={p.id} p={p} idx={i} onOrder={onOrder} />)}
        </div>
      </div>
    </section>
  )
}

function Formats() {
  return (
    <section id="formats" className="py-24 md:py-32 bg-secondary/40 relative overflow-hidden">
      <FloatingLeaves />
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Formats & prix</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">Choisissez votre <span className="italic">soif</span>.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {FORMATS.map((f, i) => (
            <motion.div
              key={f.size}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl p-8 text-center border ${f.popular ? 'bg-[#1f3a2e] text-amber-50 border-[#1f3a2e] shadow-2xl scale-[1.03]' : 'glass border-foreground/10'}`}
            >
              {f.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a02440] text-white border-0 px-3">Plus populaire</Badge>
              )}
              <div className={`text-xs uppercase tracking-[0.25em] mb-3 ${f.popular ? 'text-amber-200/80' : 'text-muted-foreground'}`}>{f.label}</div>
              <div className="font-serif text-5xl md:text-6xl font-semibold mb-3">{f.size}</div>
              <div className={`text-4xl font-serif ${f.popular ? 'text-amber-200' : 'text-[#a02440]'}`}>{f.price}€</div>
              <div className={`text-xs mt-4 ${f.popular ? 'text-amber-100/70' : 'text-muted-foreground'}`}>Toutes saveurs disponibles</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pourquoi() {
  return (
    <section id="pourquoi" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Pourquoi nous</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">L\u0027exigence du <span className="italic">vrai frais</span>.</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group rounded-3xl p-7 bg-card border border-border hover:border-[#1f3a2e]/40 hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1f3a2e] text-amber-50 flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                <b.icon className="w-6 h-6" />
              </div>
              <div className="font-serif text-2xl font-medium mb-1.5">{b.title}</div>
              <div className="text-sm text-muted-foreground">{b.text}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Livraison() {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=ffffff&color=1f3a2e&data=https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour Jus Frais Maison, je souhaite commander :')}`
  return (
    <section id="livraison" className="py-24 md:py-32 bg-[#1f3a2e] text-amber-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <Leaf className="absolute top-10 left-10 w-40 h-40 text-amber-200 float-leaf" />
        <Leaf className="absolute bottom-10 right-10 w-32 h-32 text-amber-200 float-leaf-2" />
      </div>
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70 mb-4">Livraison locale</div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">Marseille, <span className="italic text-amber-200">Vieux-Port</span>.</h2>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 border-white/10"
          >
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
              {SCHEDULE.map((s, i) => (
                <motion.div
                  key={s.day}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="font-medium">{s.day}</div>
                  <div className="font-serif text-amber-200 text-lg">{s.hours}</div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-6 text-amber-200/80">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">3 Rue Curiol, 13001 Marseille — Vieux-Port</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 border-white/10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-200/10 text-amber-200 text-xs uppercase tracking-[0.2em] mb-5">
              <QrCode className="w-3 h-3" /> Scan & commande
            </div>
            <div className="font-serif text-3xl md:text-4xl mb-3">Commandez en 1 scan</div>
            <p className="text-amber-100/70 text-sm mb-7 max-w-sm mx-auto">Pointez votre téléphone, parlez-nous directement sur WhatsApp.</p>
            <div className="inline-block p-4 bg-white rounded-2xl shadow-2xl">
              <img src={qrUrl} alt="QR WhatsApp" className="w-48 h-48 md:w-56 md:h-56" />
            </div>
            <div className="mt-6 text-sm text-amber-100/80">+33 6 50 71 16 29</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Ils en parlent</div>
          <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">Marseille adore.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl p-7 bg-card border border-border"
            >
              <div className="flex gap-0.5 mb-4 text-amber-500">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="font-serif text-lg leading-snug mb-5">“{t.text}”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1f3a2e] to-[#a02440] flex items-center justify-center text-amber-50 text-sm font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.area} • Marseille</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function InstagramPreview() {
  const imgs = [
    'https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/k5x9r7kb_WhatsApp%20Image%202026-05-31%20at%2019.09.03.jpeg',
    'https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/ad1rlr8v_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%281%29.jpeg',
    'https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/hzsafklx_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%282%29.jpeg',
    'https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/a6bekafm_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%283%29.jpeg',
    'https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/non7tytf_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%284%29.jpeg',
  ]
  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Instagram</div>
            <h3 className="font-serif text-3xl md:text-4xl">@jusfraismaison</h3>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
            <Instagram className="w-4 h-4" /> Suivez-nous
          </a>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {imgs.map((src, i) => (
            <motion.a
              key={i}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.03 }}
              className="relative flex-shrink-0 w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden group shadow-md"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                <Instagram className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0f1f18] text-amber-50/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <div className="font-serif text-xl">JUS FRAIS MAISON</div>
            </div>
            <p className="text-sm text-amber-50/60 max-w-xs">Des jus frais artisanaux préparés chaque matin à Marseille. 100% naturel, sans conservateurs.</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] mb-4 text-amber-200/70">Contact</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> 06 50 71 16 29</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 3 Rue Curiol, 13001 Marseille</div>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-200"><Instagram className="w-4 h-4" /> @jusfraismaison</a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-200"><MessageCircle className="w-4 h-4" /> WhatsApp direct</a>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] mb-4 text-amber-200/70">Le shop</div>
            <div className="space-y-2 text-sm">
              <a href="#saveurs" className="block hover:text-amber-200">Nos saveurs</a>
              <a href="#formats" className="block hover:text-amber-200">Formats & prix</a>
              <a href="#livraison" className="block hover:text-amber-200">Livraison Marseille</a>
              <a href="#pourquoi" className="block hover:text-amber-200">Pourquoi nous</a>
            </div>
          </div>
        </div>
        <div className="border-t border-amber-50/10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-50/50">
          <div>© {new Date().getFullYear()} Jus Frais Maison — Marseille. Fait avec ❤️.</div>
          <div>Site premium — 100% artisanal</div>
        </div>
      </div>
    </footer>
  )
}

function OrderModal({ open, onClose, prefillProduct }) {
  const [items, setItems] = useState({})

  useEffect(() => {
    if (open && prefillProduct) {
      const key = `${prefillProduct.id}_380ml`
      setItems({ [key]: { productId: prefillProduct.id, name: prefillProduct.name, size: '380ml', price: 4, qty: 1 } })
    } else if (open) {
      setItems({})
    }
  }, [open, prefillProduct])

  const setQty = (productId, name, size, price, qty) => {
    const key = `${productId}_${size}`
    setItems(prev => {
      const next = { ...prev }
      if (qty <= 0) delete next[key]
      else next[key] = { productId, name, size, price, qty }
      return next
    })
  }

  const total = Object.values(items).reduce((s, it) => s + it.price * it.qty, 0)
  const totalCount = Object.values(items).reduce((s, it) => s + it.qty, 0)

  const sendOrder = async () => {
    const lines = Object.values(items).map(it => `${it.qty}x ${it.name} ${it.size} — ${(it.price * it.qty).toFixed(2)}€`)
    const message = `Bonjour Jus Frais Maison, je souhaite commander :\n\n${lines.join('\n')}\n\nTotal : ${total.toFixed(2)}€\n\nMerci !`
    // log in background
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: Object.values(items), total })
      })
    } catch (e) {}
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28 }}
            className="relative w-full md:max-w-2xl bg-background rounded-t-3xl md:rounded-3xl max-h-[92svh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Commande rapide</div>
                <div className="font-serif text-2xl">Composez votre commande</div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {PRODUCTS.map(p => (
                <div key={p.id} className="rounded-2xl border border-border p-4 bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-xl`}>{p.emoji}</div>
                    <div>
                      <div className="font-serif text-lg leading-tight">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.ingredients.join(' • ')}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {FORMATS.map(f => {
                      const key = `${p.id}_${f.size}`
                      const qty = items[key]?.qty || 0
                      return (
                        <div key={f.size} className={`rounded-xl p-2.5 border ${qty > 0 ? 'border-[#1f3a2e] bg-[#1f3a2e]/5' : 'border-border'}`}>
                          <div className="text-center mb-2">
                            <div className="font-semibold text-sm">{f.size}</div>
                            <div className="text-[#a02440] font-serif text-base">{f.price}€</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setQty(p.id, p.name, f.size, f.price, qty - 1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-full bg-secondary disabled:opacity-30 flex items-center justify-center"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <div className="font-semibold text-sm w-5 text-center">{qty}</div>
                            <button
                              onClick={() => setQty(p.id, p.name, f.size, f.price, qty + 1)}
                              className="w-7 h-7 rounded-full bg-[#1f3a2e] text-amber-50 flex items-center justify-center"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-5 bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">{totalCount} {totalCount > 1 ? 'jus' : 'jus'} • Total</div>
                <div className="font-serif text-3xl font-semibold">{total.toFixed(2)}€</div>
              </div>
              <Button
                onClick={sendOrder}
                disabled={totalCount === 0}
                className="w-full h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white text-base disabled:opacity-40 btn-shine"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {totalCount === 0 ? 'Ajoutez des jus' : 'Envoyer la commande sur WhatsApp'}
              </Button>
              <div className="text-center text-[11px] text-muted-foreground mt-2">Vous serez redirigé vers WhatsApp avec votre commande pré-remplie.</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StickyMobileCTA({ onOrder }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1.5, type: 'spring' }}
      className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
    >
      <Button
        onClick={onOrder}
        className="w-full h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white text-base shadow-2xl btn-shine"
      >
        <MessageCircle className="w-5 h-5 mr-2" /> Commander sur WhatsApp
      </Button>
    </motion.div>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [prefill, setPrefill] = useState(null)

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

  const handleOrder = (product = null) => {
    setPrefill(product)
    setOrderOpen(true)
  }
  const scrollSaveurs = () => {
    document.getElementById('saveurs')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar dark={dark} setDark={setDark} openMenu={openMenu} setOpenMenu={setOpenMenu} onOrder={() => handleOrder()} />
        <Hero onOrder={() => handleOrder()} onScrollSaveurs={scrollSaveurs} />
        <Saveurs onOrder={handleOrder} />
        <Formats />
        <Pourquoi />
        <Livraison />
        <Testimonials />
        <InstagramPreview />
        <Footer />
        <StickyMobileCTA onOrder={() => handleOrder()} />
        <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} prefillProduct={prefill} />
      </div>
    </>
  )
}

export default App
