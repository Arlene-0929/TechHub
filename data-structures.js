// ============================================
// DATA STRUCTURES & STORAGE MANAGEMENT
// ============================================

const StorageManager = {
    // Cart Management
    getCart: () => {
        const cart = localStorage.getItem('techub_cart');
        return cart ? JSON.parse(cart) : [];
    },

    saveCart: (cart) => {
        localStorage.setItem('techub_cart', JSON.stringify(cart));
    },

    addToCart: (product) => {
        const cart = StorageManager.getCart();
        const existingIndex = cart.findIndex(
            item => item.id === product.id &&
                item.color === product.color &&
                item.size === product.size
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                color: product.color,
                size: product.size || null,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        StorageManager.saveCart(cart);
        return cart;
    },

    removeFromCart: (index) => {
        const cart = StorageManager.getCart();
        cart.splice(index, 1);
        StorageManager.saveCart(cart);
        return cart;
    },

    updateCartQuantity: (index, quantity) => {
        const cart = StorageManager.getCart();
        if (quantity <= 0) {
            return StorageManager.removeFromCart(index);
        }
        cart[index].quantity = quantity;
        StorageManager.saveCart(cart);
        return cart;
    },

    clearCart: () => {
        localStorage.removeItem('techub_cart');
    },

    // Favorites Management (per user)
    getFavorites: () => {
        const currentUser = localStorage.getItem('techub_current_user');
        if (!currentUser) return [];

        const user = JSON.parse(currentUser);
        const favorites = localStorage.getItem(`techub_favorites_${user.id}`);
        return favorites ? JSON.parse(favorites) : [];
    },

    saveFavorites: (favorites) => {
        const currentUser = localStorage.getItem('techub_current_user');
        if (!currentUser) return;

        const user = JSON.parse(currentUser);
        localStorage.setItem(`techub_favorites_${user.id}`, JSON.stringify(favorites));
    },

    toggleFavorite: (product) => {
        const favorites = StorageManager.getFavorites();
        const existingIndex = favorites.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            favorites.splice(existingIndex, 1);
        } else {
            favorites.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                addedAt: new Date().toISOString()
            });
        }

        StorageManager.saveFavorites(favorites);
        return favorites;
    },

    isFavorite: (productId) => {
        const favorites = StorageManager.getFavorites();
        return favorites.some(item => item.id === productId);
    },

    // Orders Management (per user)
    getOrders: () => {
        const currentUser = localStorage.getItem('techub_current_user');
        if (!currentUser) return [];

        const user = JSON.parse(currentUser);
        const orders = localStorage.getItem(`techub_orders_${user.id}`);
        return orders ? JSON.parse(orders) : [];
    },

    saveOrders: (orders) => {
        const currentUser = localStorage.getItem('techub_current_user');
        if (!currentUser) return;

        const user = JSON.parse(currentUser);
        localStorage.setItem(`techub_orders_${user.id}`, JSON.stringify(orders));
    },

    createOrder: (cartItems, total) => {
        const orders = StorageManager.getOrders();
        const newOrder = {
            id: 'ORD-' + Date.now(),
            items: cartItems,
            total: total,
            status: 'pending',
            orderDate: new Date().toISOString(),
            statusHistory: [
                {
                    status: 'pending',
                    date: new Date().toISOString(),
                    message: 'Order placed successfully'
                }
            ]
        };

        orders.unshift(newOrder);
        StorageManager.saveOrders(orders);
        StorageManager.clearCart();
        return newOrder;
    },

    updateOrderStatus: (orderId, newStatus) => {
        const orders = StorageManager.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex > -1) {
            orders[orderIndex].status = newStatus;
            orders[orderIndex].statusHistory.push({
                status: newStatus,
                date: new Date().toISOString(),
                message: StorageManager.getStatusMessage(newStatus)
            });
            StorageManager.saveOrders(orders);
        }

        return orders;
    },

    cancelOrder: (orderId) => {
        const orders = StorageManager.getOrders();
        const order = orders.find(order => order.id === orderId);

        if (order && (order.status === 'pending' || order.status === 'packed')) {
            return StorageManager.updateOrderStatus(orderId, 'cancelled');
        }

        return null;
    },

    getStatusMessage: (status) => {
        const messages = {
            'pending': 'Order placed successfully',
            'packed': 'Order has been packed',
            'shipped': 'Order is on the way',
            'delivered': 'Order delivered successfully',
            'cancelled': 'Order has been cancelled'
        };
        return messages[status] || 'Status updated';
    }
};

// Product Variants Configuration
const ProductVariants = {
    'Pro Smartphone X': {
        colors: [
            { name: 'Midnight Black', hex: '#1a1a1a' },
            { name: 'Silver', hex: '#c0c0c0' },
            { name: 'Deep Blue', hex: '#1e3a8a' },
            { name: 'Rose Gold', hex: '#b76e79' }
        ],
        sizes: ['128GB', '256GB', '512GB']
    },
    'Gaming Laptop Pro': {
        colors: [
            { name: 'Space Gray', hex: '#4a5568' },
            { name: 'Midnight Black', hex: '#1a1a1a' }
        ],
        sizes: ['16GB RAM', '32GB RAM', '64GB RAM']
    },
    'Wireless Headphones': {
        colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'White', hex: '#ffffff' },
            { name: 'Red', hex: '#dc2626' },
            { name: 'Blue', hex: '#2563eb' }
        ],
        sizes: null
    },
    'Smart Watch Ultra': {
        colors: [
            { name: 'Titanium', hex: '#71717a' },
            { name: 'Black', hex: '#000000' },
            { name: 'Gold', hex: '#d4af37' }
        ],
        sizes: ['40mm', '44mm', '48mm']
    },
    'Wireless Earbuds Pro': {
        colors: [
            { name: 'White', hex: '#ffffff' },
            { name: 'Black', hex: '#000000' }
        ],
        sizes: null
    },
    'Tablet Pro 12.9"': {
        colors: [
            { name: 'Space Gray', hex: '#4a5568' },
            { name: 'Silver', hex: '#c0c0c0' }
        ],
        sizes: ['128GB', '256GB', '512GB', '1TB']
    },
    'Portable Speaker': {
        colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'Blue', hex: '#2563eb' },
            { name: 'Red', hex: '#dc2626' },
            { name: 'Green', hex: '#16a34a' }
        ],
        sizes: null
    },
    '4K Action Camera': {
        colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'White', hex: '#ffffff' }
        ],
        sizes: null
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, ProductVariants };
}
