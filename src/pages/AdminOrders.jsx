
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const navigate = useNavigate()

  async function fetchOrders() {
    try {
      const token = localStorage.getItem('token')

      const response = await axios.get(
        'http://localhost:5000/api/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setOrders(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Unable to load orders.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  async function updateStatus(orderId, status) {
    try {
      setUpdatingId(orderId)
      setMessage('')

      const token = localStorage.getItem('token')

      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setMessage('Order status updated successfully!')
      await fetchOrders()
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Unable to update order status.'
      )
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="website">
      <header className="navbar">
        <h2>Swarna Mahal</h2>
        <h3>Order Management</h3>
        <button onClick={() => navigate('/admin')}>
          Back to Products
        </button>
      </header>

      <main className="admin-dashboard">
        <h1>Customer Orders</h1>
        <p>View purchases and manage their delivery status.</p>

        {message && (
          <p className="admin-form-message" role="status">
            {message}
          </p>
        )}

        {loading && <p>Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <p>No orders found yet.</p>
        )}

        <div className="admin-orders-list">
          {orders.map((order) => (
            <article className="admin-order-card" key={order._id}>
              <div className="admin-order-heading">
                <div>
                  <h2>Order #{order._id.slice(-6)}</h2>
                  <p>
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>

                <strong>
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="admin-order-customer">
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p>
                  <strong>Address:</strong>{' '}
                  {order.address}, {order.city} - {order.pincode}
                </p>
              </div>

              <div className="admin-order-items">
                <h3>Ordered Jewellery</h3>

                {order.items.map((item, index) => (
                  <div
                    className="admin-order-item"
                    key={item._id || `${item.product}-${index}`}
                  >
                    <span>{item.name}</span>
                    <span>
                      {item.quantity} × ₹
                      {Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="admin-order-status">
                <label htmlFor={`status-${order._id}`}>
                  Order Status
                </label>

                <select
                  id={`status-${order._id}`}
                  value={order.status}
                  disabled={updatingId === order._id}
                  onChange={(event) =>
                    updateStatus(order._id, event.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {updatingId === order._id && (
                  <span>Updating...</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AdminOrders
