
const express = require('express')
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const { protect, allowRoles } = require('../middleware/authMiddleware')
const router = express.Router()

// Create a new order
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      items,
    } = req.body

    if (
      !customerName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message: 'Please provide all customer and delivery details.',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Your order must contain at least one product.',
      })
    }

    const orderItems = []
    let totalAmount = 0

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: 'Invalid product or quantity.',
        })
      }

      const product = await Product.findById(item.productId)

      if (!product) {
        return res.status(404).json({
          message: 'A product in your cart could not be found.',
        })
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      })

      totalAmount += product.price * item.quantity
    }

    const order = await Order.create({
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      items: orderItems,
      totalAmount,
    })

    res.status(201).json({
      message: 'Order placed successfully!',
      order,
    })
  } catch (error) {
    console.error('Order creation failed:', error.message)

    res.status(500).json({
      message: 'Unable to place your order. Please try again.',
    })
  }
})


router.get('/', protect, allowRoles('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image')

    res.json(orders)
  } catch (error) {
    console.error('Fetch orders error:', error)
    res.status(500).json({ message: 'Unable to fetch orders.' })
  }
})


router.put('/:id/status', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body

    const allowedStatuses = [
      'Pending',
      'Confirmed',
      'Shipped',
      'Delivered',
      'Cancelled',
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status.',
      })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      })
    }

    res.json({
      message: 'Order status updated successfully.',
      order,
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid order ID.',
      })
    }

    console.error('Update order status error:', error)
    res.status(500).json({
      message: 'Unable to update order status.',
    })
  }
})


module.exports = router
