
const express = require('express')
const Product = require('../models/Product')
const { protect, allowRoles } = require('../middleware/authMiddleware')
const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a new product
router.post('/',protect, allowRoles('admin'), async (req, res) => {
  try {
    const product = new Product(req.body)
    const savedProduct = await product.save()

    res.status(201).json(savedProduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { name, category, price, image, description, stock } = req.body

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    if (name !== undefined) product.name = name
    if (category !== undefined) product.category = category
    if (price !== undefined) product.price = price
    if (image !== undefined) product.image = image
    if (description !== undefined) product.description = description
    if (stock !== undefined) product.stock = stock

    await product.save()

    res.json({
      message: 'Product updated successfully.',
      product,
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid product ID.',
      })
    }

    res.status(500).json({
      message: 'Unable to update product.',
    })
  }
})

router.delete('/:id', protect, allowRoles('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    res.json({ message: 'Product deleted successfully.' })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID.' })
    }

    res.status(500).json({ message: 'Unable to delete product.' })
  }
})


module.exports = router
