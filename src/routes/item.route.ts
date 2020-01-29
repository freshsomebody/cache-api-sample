import express from 'express'
import * as ItemModel from '../models/item.model'
import { CacheStrategies } from '../types/cache.type'

const router = express.Router()

/**
 * Get item data by name
 * Endpoint: [GET] /cache/data?name=ITEMNAME
 */
router.get('/data', async (req, res) => {
  try {
    const itemName = req.query.name
    if (!itemName) {
      res.status(400).send('Missing item name')
      return
    }
    const ItemData = await ItemModel.findByName(itemName, { strategy: CacheStrategies.StaleWhileRevalidate })
    res.status(200).send(ItemData)
  } catch (error) {
    if (error.message === '404') {
      res.status(404).send('Item not found')
      return
    }
    res.status(500).send(error)
  }
})

export default router
