// ============================================
// PRODUCT VARIANT MODAL COMPONENT
// ============================================

class VariantModal {
    constructor() {
        this.modal = null;
        this.currentProduct = null;
        this.selectedColor = null;
        this.selectedSize = null;
        this.init();
    }

    init() {
        this.createModal();
        this.attachEventListeners();
    }

    createModal() {
        const modalHTML = `
      <div id="variant-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Select Options</h2>
            <button class="modal-close" aria-label="Close modal">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div id="product-preview" class="mb-6">
              <div class="flex gap-4">
                <img id="modal-product-image" src="" alt="" class="w-24 h-24 object-cover rounded-lg">
                <div>
                  <h3 id="modal-product-name" class="text-xl font-bold text-charcoal mb-2"></h3>
                  <p id="modal-product-price" class="text-2xl font-bold text-primary"></p>
                </div>
              </div>
            </div>
            
            <div id="color-selection" class="variant-section">
              <label class="variant-label">Choose Color</label>
              <div id="color-options" class="color-options"></div>
            </div>
            
            <div id="size-selection" class="variant-section" style="display: none;">
              <label class="variant-label">Choose Size</label>
              <div id="size-options" class="size-options"></div>
            </div>
            
            <div id="variant-error" class="text-red-600 text-sm mt-4" style="display: none;"></div>
          </div>
          <div class="modal-footer">
            <button id="cancel-variant" class="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-charcoal hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button id="confirm-add-to-cart" class="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-[hsl(10,60%,33%)] transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('variant-modal');
    }

    attachEventListeners() {
        const closeBtn = this.modal.querySelector('.modal-close');
        const cancelBtn = this.modal.querySelector('#cancel-variant');
        const confirmBtn = this.modal.querySelector('#confirm-add-to-cart');

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        confirmBtn.addEventListener('click', () => this.addToCart());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    open(product) {
        this.currentProduct = product;
        this.selectedColor = null;
        this.selectedSize = null;

        // Populate product info
        const modalImage = document.getElementById('modal-product-image');
        const modalName = document.getElementById('modal-product-name');
        const modalPrice = document.getElementById('modal-product-price');

        if (modalImage) modalImage.src = product.image;
        if (modalName) modalName.textContent = product.name;
        if (modalPrice) modalPrice.textContent = `$${product.price}`;

        // Get variants for this product
        const variants = ProductVariants[product.name];

        if (variants) {
            // Render color options
            this.renderColorOptions(variants.colors);

            // Render size options if available
            const sizeSelection = document.getElementById('size-selection');
            if (variants.sizes && sizeSelection) {
                sizeSelection.style.display = 'block';
                this.renderSizeOptions(variants.sizes);
            } else if (sizeSelection) {
                sizeSelection.style.display = 'none';
            }
        } else {
            // If no variants defined, create default ones
            this.renderColorOptions([
                { name: 'Black', hex: '#000000' },
                { name: 'White', hex: '#ffffff' }
            ]);
            const sizeSelection = document.getElementById('size-selection');
            if (sizeSelection) {
                sizeSelection.style.display = 'none';
            }
        }

        // Show modal
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    renderColorOptions(colors) {
        const container = document.getElementById('color-options');
        container.innerHTML = colors.map((color, index) => `
      <label class="color-option">
        <input type="radio" name="color" value="${color.name}" data-index="${index}">
        <div class="color-swatch" style="background-color: ${color.hex}"></div>
        <span class="color-name">${color.name}</span>
      </label>
    `).join('');

        // Add event listeners
        container.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedColor = e.target.value;
                this.clearError();
            });
        });
    }

    renderSizeOptions(sizes) {
        const container = document.getElementById('size-options');
        container.innerHTML = sizes.map((size, index) => `
      <label class="size-option">
        <input type="radio" name="size" value="${size}" data-index="${index}">
        <div class="size-button">${size}</div>
      </label>
    `).join('');

        // Add event listeners
        container.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedSize = e.target.value;
                this.clearError();
            });
        });
    }

    showError(message) {
        const errorDiv = document.getElementById('variant-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    clearError() {
        const errorDiv = document.getElementById('variant-error');
        errorDiv.style.display = 'none';
    }

    addToCart() {
        // Validate selections
        if (!this.selectedColor) {
            this.showError('Please select a color');
            return;
        }

        const variants = ProductVariants[this.currentProduct.name];
        if (variants && variants.sizes && !this.selectedSize) {
            this.showError('Please select a size');
            return;
        }

        // Create product with variants
        const productWithVariants = {
            id: `${this.currentProduct.id}-${this.selectedColor.replace(/\s+/g, '-')}-${this.selectedSize ? this.selectedSize.replace(/\s+/g, '-') : 'default'}`,
            name: this.currentProduct.name,
            price: this.currentProduct.price,
            image: this.currentProduct.image,
            color: this.selectedColor,
            size: this.selectedSize
        };

        // Add to cart using StorageManager
        StorageManager.addToCart(productWithVariants);

        // Update cart UI
        if (window.cartManager) {
            window.cartManager.updateCart();
        }

        // Show success feedback
        this.showSuccessFeedback();

        // Close modal
        this.close();
    }

    showSuccessFeedback() {
        // Create a temporary success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-24 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.textContent = 'Added to cart successfully!';
        document.body.appendChild(successMsg);

        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.clearError();
    }
}

// Initialize variant modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.variantModal = new VariantModal();
});
