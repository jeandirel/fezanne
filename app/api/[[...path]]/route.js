import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_SETTINGS } from '@/lib/defaultSettings'

const defaultProducts = [
  { id: 'bissap', name: 'Bissap Boost', tagline: 'Énergie tropicale', description: "Le rouge profond de l'hibiscus, l'éclat de l'ananas et la fraîcheur de la menthe.", ingredients: ['Bissap', 'Ananas', 'Menthe'], color: 'from-rose-700 via-red-800 to-rose-900', imagePos: '61% 72%', emoji: '🌺', price: 5, imageZoom: 380, imageBrightness: 100, imageContrast: 100, image: '' },
  { id: 'detox', name: 'Fresh Detox', tagline: 'Purifiant & vif', description: 'Pomme verte, gingembre piquant, citron éclatant et menthe fraîche. La detox premium.', ingredients: ['Pomme', 'Gingembre', 'Citron', 'Menthe'], color: 'from-lime-500 via-yellow-500 to-amber-600', imagePos: '16% 72%', emoji: '🍏', price: 5, imageZoom: 380, imageBrightness: 100, imageContrast: 100, image: '' },
  { id: 'vita', name: 'Vita Orange', tagline: 'Vitamine pure', description: 'Carotte sucrée, orange juteuse et touche de menthe. Le boost solaire matinal.', ingredients: ['Carotte', 'Orange', 'Menthe'], color: 'from-orange-400 via-amber-500 to-orange-600', imagePos: '39% 72%', emoji: '🍊', price: 5, imageZoom: 380, imageBrightness: 100, imageContrast: 100, image: '' },
  { id: 'water', name: 'Water Fresh', tagline: 'Hydratation extrême', description: 'Pastèque juteuse, citron pétillant et menthe glaciale. La fraîcheur ultime de l\'été.', ingredients: ['Pastèque', 'Citron', 'Menthe'], color: 'from-pink-500 via-rose-500 to-red-600', imagePos: '84% 72%', emoji: '🍉', price: 5, imageZoom: 380, imageBrightness: 100, imageContrast: 100, image: '' }
]

const json = (data, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-username, x-admin-password',
    },
  })

function checkAuth(request) {
  const username = request.headers.get('x-admin-username')
  const password = request.headers.get('x-admin-password')
  const expectedUsername = 'fezane'
  const expectedPassword = process.env.ADMIN_PASSWORD || 'jusfraismaisoncode'
  return username === expectedUsername && password === expectedPassword
}

export async function OPTIONS() {
  return json({})
}

export async function GET(request, { params }) {
  const path = (params?.path || []).join('/')
  try {
    if (path === '' || path === 'health') {
      return json({ status: 'ok', service: 'jus-frais-maison', time: new Date().toISOString() })
    }
    
    if (path === 'products') {
      if (!supabase) {
        console.warn('Supabase not configured. Falling back to default products.')
        return json(defaultProducts)
      }

      const { data, error } = await supabase
        .from('jfm_products')
        .select('*')

      if (error) {
        console.error('Supabase fetch error:', error.message)
        return json(defaultProducts)
      }

      if (!data || data.length === 0) {
        // Seed default products
        const { error: seedError } = await supabase
          .from('jfm_products')
          .insert(defaultProducts)
        
        if (seedError) {
          console.error('Supabase seed error:', seedError.message)
          return json(defaultProducts)
        }
        return json(defaultProducts)
      }

      return json(data)
    }

    if (path === 'settings') {
      if (!supabase) return json(DEFAULT_SETTINGS)

      const { data, error } = await supabase
        .from('jfm_settings')
        .select('value')
        .eq('key', 'site_settings')
        .single()

      if (error || !data) return json(DEFAULT_SETTINGS)
      return json({ ...DEFAULT_SETTINGS, ...data.value })
    }

    if (path === 'orders') {
      if (!checkAuth(request)) {
        return json({ error: 'unauthorized' }, 401)
      }

      if (!supabase) {
        return json([])
      }

      const { data, error } = await supabase
        .from('jfm_orders')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase orders error:', error.message)
        return json([])
      }

      return json(data || [])
    }

    if (path === 'orders/stats') {
      if (!supabase) {
        return json({ count: 0, totalRevenue: 0 })
      }

      const { data, error } = await supabase
        .from('jfm_orders')
        .select('total')

      if (error) {
        console.error('Supabase stats error:', error.message)
        return json({ count: 0, totalRevenue: 0 })
      }

      const count = data.length
      const totalRevenue = data.reduce((sum, o) => sum + Number(o.total || 0), 0)

      return json({ count, totalRevenue })
    }

    return json({ error: 'not_found' }, 404)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function POST(request, { params }) {
  const path = (params?.path || []).join('/')
  try {
    if (path === 'admin/login') {
      if (checkAuth(request)) {
        return json({ ok: true })
      }
      return json({ error: 'unauthorized' }, 401)
    }

    if (path === 'settings') {
      if (!checkAuth(request)) return json({ error: 'unauthorized' }, 401)

      const body = await request.json()

      if (!supabase) return json({ ok: true })

      const { error } = await supabase
        .from('jfm_settings')
        .upsert({ key: 'site_settings', value: body })

      if (error) throw new Error(error.message)
      return json({ ok: true })
    }

    if (path === 'products') {
      if (!checkAuth(request)) {
        return json({ error: 'unauthorized' }, 401)
      }

      const body = await request.json()
      
      const product = {
        id: body.id,
        name: body.name,
        tagline: body.tagline,
        description: body.description,
        ingredients: Array.isArray(body.ingredients) ? body.ingredients : (body.ingredients || '').split(',').map(i => i.trim()).filter(Boolean),
        color: body.color,
        imagePos: body.imagePos || 'center',
        emoji: body.emoji || '🌿',
        price: Number(body.price) || 5,
        imageZoom: Number(body.imageZoom) || 380,
        imageBrightness: Number(body.imageBrightness) || 100,
        imageContrast: Number(body.imageContrast) || 100,
        image: body.image || '',
        updatedAt: new Date().toISOString()
      }

      if (!supabase) {
        console.warn('Supabase not configured. Mocking product insert/update.')
        return json({ ok: true, product })
      }

      const { error } = await supabase
        .from('jfm_products')
        .upsert(product)

      if (error) throw new Error(error.message)

      return json({ ok: true, product })
    }

    if (path === 'orders') {
      const body = await request.json()
      const order = {
        id: uuidv4(),
        items: body.items || [],
        total: body.total || 0,
        createdAt: new Date().toISOString(),
      }

      if (!supabase) {
        console.warn('Supabase not configured. Mocking order submission.')
        return json({ ok: true, id: order.id })
      }

      const { error } = await supabase
        .from('jfm_orders')
        .insert(order)

      if (error) throw new Error(error.message)

      return json({ ok: true, id: order.id })
    }

    return json({ error: 'not_found' }, 404)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function DELETE(request, { params }) {
  const path = (params?.path || []).join('/')
  try {
    if (path === 'products') {
      if (!checkAuth(request)) {
        return json({ error: 'unauthorized' }, 401)
      }

      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      if (!id) {
        return json({ error: 'bad_request' }, 400)
      }

      if (!supabase) {
        console.warn('Supabase not configured. Mocking product deletion.')
        return json({ ok: true })
      }

      const { error } = await supabase
        .from('jfm_products')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message)

      return json({ ok: true })
    }

    return json({ error: 'not_found' }, 404)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}
