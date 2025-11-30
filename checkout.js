// ============================================
// CHECKOUT & ADDRESS MANAGEMENT
// ============================================

class CheckoutManager {
    constructor() {
        this.currentAddress = null;
        this.init();
    }

    init() {
        // Require authentication
        if (!window.authManager || !window.authManager.requireAuth()) {
            return;
        }

        this.loadDefaultAddress();
        this.attachEventListeners();
    }

    attachEventListeners() {
        const checkoutForm = document.getElementById('checkout-form');
        const useDefaultBtn = document.getElementById('use-default-address');
        const clearFormBtn = document.getElementById('clear-form');

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCheckout();
            });
        }

        if (useDefaultBtn) {
            useDefaultBtn.addEventListener('click', () => this.loadDefaultAddress());
        }

        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => this.clearForm());
        }

        // Real-time validation
        const inputs = document.querySelectorAll('.checkout-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    loadDefaultAddress() {
        if (!window.authManager) return;

        const defaultAddress = window.authManager.getDefaultAddress();

        if (defaultAddress) {
            this.fillForm(defaultAddress);
            this.showNotification('Default address loaded', 'success');
        } else {
            this.showNotification('No default address found', 'info');
        }
    }

    fillForm(address) {
        document.getElementById('checkout-name').value = address.name || '';
        document.getElementById('checkout-mobile').value = address.mobile || '';
        document.getElementById('checkout-street').value = address.street || '';
        document.getElementById('checkout-barangay').value = address.barangay || '';
        document.getElementById('checkout-city').value = address.city || '';
        document.getElementById('checkout-province').value = address.province || '';
        document.getElementById('checkout-postal').value = address.postalCode || '';
        document.getElementById('checkout-default').checked = address.isDefault || false;
    }

    clearForm() {
        document.getElementById('checkout-form').reset();
        this.clearAllErrors();
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.dataset.fieldName || input.name;
        let error = '';

        switch (input.id) {
            case 'checkout-name':
                if (!value || value.length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;

            case 'checkout-mobile':
                // Philippine mobile number format: 09XX-XXX-XXXX or +639XX-XXX-XXXX
                const mobileRegex = /^(\+639|09)\d{9}$/;
                const cleanMobile = value.replace(/[-\s]/g, '');
                if (!mobileRegex.test(cleanMobile)) {
                    error = 'Please enter a valid Philippine mobile number (e.g., 09XX-XXX-XXXX)';
                }
                break;

            case 'checkout-street':
                if (!value || value.length < 5) {
                    error = 'Street address must be at least 5 characters';
                }
                break;

            case 'checkout-barangay':
                if (!value || value.length < 2) {
                    error = 'Barangay is required';
                }
                break;

            case 'checkout-city':
                if (!value || value.length < 2) {
                    error = 'City is required';
                }
                break;

            case 'checkout-province':
                if (!value || value.length < 2) {
                    error = 'Province is required';
                }
                break;

            case 'checkout-postal':
                // Philippine postal code: 4 digits
                const postalRegex = /^\d{4}$/;
                if (!postalRegex.test(value)) {
                    error = 'Postal code must be 4 digits';
                }
                break;
        }

        if (error) {
            this.showFieldError(input, error);
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }

    showFieldError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.field-error') || document.createElement('div');

        errorDiv.className = 'field-error';
        errorDiv.textContent = message;

        if (!formGroup.querySelector('.field-error')) {
            formGroup.appendChild(errorDiv);
        }

        input.classList.add('error');
    }

    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.field-error');

        if (errorDiv) {
            errorDiv.remove();
        }

        input.classList.remove('error');
    }

    clearAllErrors() {
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    validateAllFields() {
        const inputs = document.querySelectorAll('.checkout-input');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    getFormData() {
        const mobile = document.getElementById('checkout-mobile').value.trim();

        return {
            name: document.getElementById('checkout-name').value.trim(),
            mobile: mobile.replace(/[-\s]/g, ''), // Clean mobile number
            street: document.getElementById('checkout-street').value.trim(),
            barangay: document.getElementById('checkout-barangay').value.trim(),
            city: document.getElementById('checkout-city').value.trim(),
            province: document.getElementById('checkout-province').value.trim(),
            postalCode: document.getElementById('checkout-postal').value.trim(),
            isDefault: document.getElementById('checkout-default').checked
        };
    }

    handleCheckout() {
        // Clear previous errors
        this.clearAllErrors();

        // Validate all fields
        if (!this.validateAllFields()) {
            this.showNotification('Please fix all errors before proceeding', 'error');
            return;
        }

        // Get form data
        const addressData = this.getFormData();

        // Save address to user profile
        if (window.authManager) {
            window.authManager.addAddress(addressData);
        }

        // Get cart items
        const cart = StorageManager.getCart();

        if (cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        // Calculate total
        const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        // Create order with address
        const order = StorageManager.createOrder(cart, total);

        // Add address to order
        const orders = StorageManager.getOrders();
        const orderIndex = orders.findIndex(o => o.id === order.id);
        if (orderIndex > -1) {
            orders[orderIndex].shippingAddress = addressData;
            StorageManager.saveOrders(orders);
        }

        // Show success and redirect
        this.showNotification('Order placed successfully!', 'success');

        setTimeout(() => {
            window.location.href = 'order-confirmation.html?orderId=' + order.id;
        }, 1500);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.checkout-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `checkout-notification ${type}`;
        notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

        document.body.appendChild(notification);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize checkout manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checkout-form')) {
        window.checkoutManager = new CheckoutManager();
    }
});
