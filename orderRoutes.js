const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// User places an order
router.post('/', orderController.placeOrder);

// Get all orders (admin and user)
router.get('/', orderController.getAllOrders);

// Get a specific order by ID (admin and user)
router.get('/:id', orderController.getOrderById);

// Admin approves or rejects an order
router.put('/:id/approve', orderController.approveOrder);

// Update delivery status
router.put('/:id/delivery', orderController.updateDeliveryStatus);

// Delete an order (admin only)
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
