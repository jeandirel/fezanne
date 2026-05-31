import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

let client
let db

async function getDb() {
  if (db) return db
  client = new MongoClient(process.env.MONGO_URL)
  await client.connect()
  const dbName = process.env.DB_NAME || 'jusfraismaison'
  db = client.db(dbName)
  return db
}

const json = (data, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })

export async function OPTIONS() {
  return json({})
}

export async function GET(request, { params }) {
  const path = (params?.path || []).join('/')
  try {
    if (path === '' || path === 'health') {
      return json({ status: 'ok', service: 'jus-frais-maison', time: new Date().toISOString() })
    }
    if (path === 'orders/stats') {
      const database = await getDb()
      const count = await database.collection('orders').countDocuments()
      const totalAgg = await database.collection('orders').aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).toArray()
      return json({ count, totalRevenue: totalAgg[0]?.total || 0 })
    }
    return json({ error: 'not_found' }, 404)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export async function POST(request, { params }) {
  const path = (params?.path || []).join('/')
  try {
    if (path === 'orders') {
      const body = await request.json()
      const database = await getDb()
      const order = {
        id: uuidv4(),
        items: body.items || [],
        total: body.total || 0,
        createdAt: new Date().toISOString(),
      }
      await database.collection('orders').insertOne(order)
      return json({ ok: true, id: order.id })
    }
    return json({ error: 'not_found' }, 404)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}
