const Order = require("../models/Order");
const Product = require("../models/Product");
const SubscriptionPlan = require("../models/SubscriptionPlan");

// User places an order
exports.placeOrder = async (req, res) => {
  try {
    const { user, orderDetails, paymentMethod, delivery, subscriptionPlanId } = req.body;

    let totalPrice = 0;
    const orderItems = [];

    // Check if the order is for products
    if (orderDetails && orderDetails.length > 0) {
      for (const item of orderDetails) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        totalPrice += product.price * item.quantity;
        orderItems.push({ product: product._id, quantity: item.quantity });
      }
    }

    // Check if the order is a subscription package
    let subscriptionPlan;
    if (subscriptionPlanId) {
      subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
      if (!subscriptionPlan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      totalPrice += subscriptionPlan.pricing;
    }

    const newOrder = new Order({
      user,
      orderDetails: orderItems,
      totalPrice,
      paymentMethod,
      delivery,
      approvalStatus: "Pending",
      subscriptionPlan: subscriptionPlan ? subscriptionPlan._id : null, // Attach subscription plan if applicable
    });

    const savedOrder = await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    res.status(500).json({ error: "Error placing order", details: error });
  }
};

// Admin approves or rejects an order
exports.approveOrder = async (req, res) => {
  try {
    const { decision } = req.body; // 'approve' or 'reject'
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    order.approvalStatus = decision === "approve" ? "Approved" : "Rejected";
    await order.save();

    res
      .status(200)
      .json({ message: `Order ${decision}ed successfully`, order });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating order approval", details: error });
  }
};

// Get all orders (for admin view)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("orderDetails.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "orderDetails.product"
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Error fetching order", details: error });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    order.delivery.deliveryStatus = deliveryStatus;
    await order.save();

    res
      .status(200)
      .json({ message: "Delivery status updated successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating delivery status", details: error });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully', deletedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting order' });
  }
};