/* 
   ================================================================
   CART.JS - Shopping Cart Page JavaScript
   ================================================================
   This file handles:
   - Displaying cart items
   - Updating quantities
   - Calculating totals (subtotal, discount, tax, delivery, total)
   - Removing items from cart
   
   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   CONSTANTS FOR CALCULATIONS
   ================================================================
   These values are used in the price calculations.
   Using constants makes it easy to change values later.
   ================================================================ */
var DISCOUNT_RATE = 0.10;           // 10% discount (0.10 = 10/100)
var TAX_RATE = 0.15;                // 15% GCT tax (0.15 = 15/100)
var DELIVERY_FEE = 500;             // J$500 delivery fee
var FREE_DELIVERY_THRESHOLD = 5000; // Free delivery if subtotal >= J$5000


/* ================================================================
   DOM ELEMENT REFERENCES
   ================================================================
   Getting references to HTML elements we need to manipulate.
   ================================================================ */

// DOM MANIPULATION: Get container where cart items will be displayed
var cartItemsContainer = document.getElementById('cart-items');

// Get the main cart content container
var cartContent = document.getElementById('cart-content');

// Get the empty cart message container
var emptyCart = document.getElementById('empty-cart');

// Get cart count in navigation
var cartCountElement = document.getElementById('cart-count');

// Get summary display elements
var subtotalElement = document.getElementById('subtotal');
var discountElement = document.getElementById('discount');
var taxElement = document.getElementById('tax');
var deliveryFeeElement = document.getElementById('delivery-fee');
var totalElement = document.getElementById('total');

// Get button elements
var clearCartBtn = document.getElementById('clear-cart-btn');
var checkoutBtn = document.getElementById('checkout-btn');
var menuToggle = document.getElementById('menu-toggle');
var navMenu = document.getElementById('nav-menu');

// Get modal elements
var confirmModal = document.getElementById('confirm-modal');
var modalTitle = document.getElementById('modal-title');
var modalMessage = document.getElementById('modal-message');
var modalCancel = document.getElementById('modal-cancel');
var modalConfirm = document.getElementById('modal-confirm');


/* ================================================================
   PAGE LOAD EVENT
   ================================================================
   EVENT HANDLING: DOMContentLoaded fires when page is ready.
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    // Load and display cart contents
    loadCart();
    
    // Update login/logout link
    updateAuthLink();
});


/* ================================================================
   LOAD CART FUNCTION
   ================================================================
   Loads cart from localStorage and displays items.
   ================================================================ */
function loadCart() {
    // Get cart from localStorage
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    
    // IF/ELSE: Check if cart is empty
    if (cart.length === 0) {
        showEmptyCart();
    } else {
        renderCartItems(cart);
        calculateTotals(cart);
    }
    
    // Update cart count in navigation
    updateCartCountDisplay();
}


/* ================================================================
   SHOW EMPTY CART MESSAGE
   ================================================================
   Shows the "Your cart is empty" message and hides cart content.
   ================================================================ */
function showEmptyCart() {
    // DOM MANIPULATION: Show empty message, hide cart content
    emptyCart.classList.remove('hidden');
    cartContent.classList.add('hidden');
}


/* ================================================================
   SHOW CART CONTENT
   ================================================================
   Shows the cart content and hides empty message.
   ================================================================ */
function showCartContent() {
    emptyCart.classList.add('hidden');
    cartContent.classList.remove('hidden');
}


/* ================================================================
   RENDER CART ITEMS FUNCTION
   ================================================================
   Creates HTML for each item in the cart.
   
   Uses FOR LOOP to iterate through cart items.
   ================================================================ */
function renderCartItems(cart) {
    // Show cart content section
    showCartContent();
    
    // DOM MANIPULATION: Clear existing items
    cartItemsContainer.innerHTML = '';
    
    // FOR LOOP: Create element for each cart item
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        
        // Create the HTML element for this item
        var itemElement = createCartItemElement(item);
        
        // DOM MANIPULATION: Add element to container
        cartItemsContainer.appendChild(itemElement);
    }
}


/* ================================================================
   CREATE CART ITEM ELEMENT FUNCTION
   ================================================================
   Creates the HTML element for a single cart item.
   
   Demonstrates DOM Manipulation and Event Handling.
   ================================================================ */
function createCartItemElement(item) {
    // DOM MANIPULATION: Create a new div element
    var div = document.createElement('div');
    div.className = 'cart-item';
    div.setAttribute('data-id', item.id);
    
    // ARITHMETIC: Calculate item subtotal (price × quantity)
    var itemSubtotal = item.price * item.quantity;
    
    // DOM MANIPULATION: Set innerHTML with item details
    div.innerHTML = 
        '<img src="' + item.image + '" alt="' + item.name + '" onerror="this.src=\'../Assets/placeholder.svg\'">' +
        '<div class="cart-item-details">' +
            '<h4>' + item.name + '</h4>' +
            '<p>J$' + item.price.toLocaleString() + ' each</p>' +
            '<div class="quantity-control" style="margin-top: 10px;">' +
                '<button type="button" class="qty-decrease" data-id="' + item.id + '">-</button>' +
                '<input type="number" class="qty-input" value="' + item.quantity + '" min="1" max="10" data-id="' + item.id + '">' +
                '<button type="button" class="qty-increase" data-id="' + item.id + '">+</button>' +
            '</div>' +
        '</div>' +
        '<div class="cart-item-price">J$' + itemSubtotal.toLocaleString() + '</div>' +
        '<button class="cart-item-remove" data-id="' + item.id + '">✕</button>';
    
    // DOM MANIPULATION: querySelector to find elements inside this div
    var decreaseBtn = div.querySelector('.qty-decrease');
    var increaseBtn = div.querySelector('.qty-increase');
    var qtyInput = div.querySelector('.qty-input');
    var removeBtn = div.querySelector('.cart-item-remove');
    
    // EVENT HANDLING: Decrease quantity button
    decreaseBtn.addEventListener('click', function() {
        // ARITHMETIC: -1 means decrease by 1
        updateItemQuantity(item.id, -1);
    });
    
    // EVENT HANDLING: Increase quantity button
    increaseBtn.addEventListener('click', function() {
        // ARITHMETIC: +1 means increase by 1
        updateItemQuantity(item.id, 1);
    });
    
    // EVENT HANDLING: Quantity input change
    qtyInput.addEventListener('change', function() {
        var newQty = parseInt(this.value);
        setItemQuantity(item.id, newQty);
    });
    
    // EVENT HANDLING: Remove item button
    removeBtn.addEventListener('click', function() {
        removeItem(item.id);
    });
    
    return div;
}


/* ================================================================
   CALCULATE TOTALS FUNCTION
   ================================================================
   This is the main ARITHMETIC demonstration function!
   
   Calculates:
   1. Subtotal = sum of (price × quantity) for all items
   2. Discount = subtotal × 10%
   3. Tax = (subtotal - discount) × 15%
   4. Delivery = J$500 (or free if subtotal >= J$5000)
   5. Total = subtotal - discount + tax + delivery
   ================================================================ */
function calculateTotals(cart) {
    
    /* ============================================================
       STEP 1: CALCULATE SUBTOTAL
       ============================================================
       Use a FOR LOOP to add up all item totals.
       Each item total = price × quantity
       ============================================================ */
    var subtotal = 0;  // Start with zero
    
    // FOR LOOP: Go through each item in cart
    for (var i = 0; i < cart.length; i++) {
        // Get this item's price and quantity
        var itemPrice = cart[i].price;
        var itemQuantity = cart[i].quantity;
        
        // ARITHMETIC: Multiplication - calculate item total
        var itemTotal = itemPrice * itemQuantity;
        
        // ARITHMETIC: Addition - add to running subtotal
        subtotal = subtotal + itemTotal;
    }
    
    /* ============================================================
       STEP 2: CALCULATE DISCOUNT (10%)
       ============================================================
       ARITHMETIC: Multiplication
       discount = subtotal × 0.10
       ============================================================ */
    var discount = subtotal * DISCOUNT_RATE;
    
    /* ============================================================
       STEP 3: CALCULATE AMOUNT AFTER DISCOUNT
       ============================================================
       ARITHMETIC: Subtraction
       afterDiscount = subtotal - discount
       ============================================================ */
    var afterDiscount = subtotal - discount;
    
    /* ============================================================
       STEP 4: CALCULATE TAX (15% GCT)
       ============================================================
       ARITHMETIC: Multiplication
       Tax is calculated on the discounted amount
       tax = afterDiscount × 0.15
       ============================================================ */
    var tax = afterDiscount * TAX_RATE;
    
    /* ============================================================
       STEP 5: DETERMINE DELIVERY FEE
       ============================================================
       IF/ELSE: Conditional logic
       - If subtotal >= J$5000, delivery is FREE
       - Otherwise, delivery is J$500
       ============================================================ */
    var deliveryFee;
    
    if (subtotal >= FREE_DELIVERY_THRESHOLD) {
        deliveryFee = 0;  // Free delivery!
    } else {
        deliveryFee = DELIVERY_FEE;  // J$500
    }
    
    /* ============================================================
       STEP 6: CALCULATE FINAL TOTAL
       ============================================================
       ARITHMETIC: Addition
       total = afterDiscount + tax + deliveryFee
       ============================================================ */
    var total = afterDiscount + tax + deliveryFee;
    
    /* ============================================================
       STEP 7: UPDATE DISPLAY
       ============================================================
       DOM MANIPULATION: Update text content of summary elements
       ============================================================ */
    
    // Display subtotal
    subtotalElement.textContent = 'J$' + subtotal.toLocaleString();
    
    // Display discount (with minus sign since it's a reduction)
    discountElement.textContent = '-J$' + discount.toLocaleString();
    
    // Display tax (rounded to whole number)
    taxElement.textContent = 'J$' + Math.round(tax).toLocaleString();
    
    // Display delivery fee (with special styling if free)
    if (deliveryFee === 0) {
        deliveryFeeElement.textContent = 'FREE';
        deliveryFeeElement.style.color = '#4cff4c';  // Green color
    } else {
        deliveryFeeElement.textContent = 'J$' + deliveryFee.toLocaleString();
        deliveryFeeElement.style.color = '';  // Reset to default
    }
    
    // Display total (rounded to whole number)
    totalElement.textContent = 'J$' + Math.round(total).toLocaleString();
    
    /* ============================================================
       STEP 8: STORE TOTALS FOR CHECKOUT PAGE
       ============================================================
       Save calculated totals to localStorage so checkout page
       can access them.
       ============================================================ */
    localStorage.setItem('seoulBiteOrderTotals', JSON.stringify({
        subtotal: subtotal,
        discount: discount,
        tax: Math.round(tax),
        deliveryFee: deliveryFee,
        total: Math.round(total)
    }));
}


/* ================================================================
   UPDATE ITEM QUANTITY FUNCTION
   ================================================================
   Changes item quantity by a delta value (+1 or -1).
   
   Parameters:
   - itemId: which item to update
   - delta: how much to change (positive to increase, negative to decrease)
   ================================================================ */
function updateItemQuantity(itemId, delta) {
    // Get current cart
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    
    // FOR LOOP: Find the item to update
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === itemId) {
            // ARITHMETIC: Add delta to current quantity
            cart[i].quantity = cart[i].quantity + delta;
            
            // Enforce minimum of 1
            if (cart[i].quantity < 1) {
                cart[i].quantity = 1;
            }
            
            // Enforce maximum of 10
            if (cart[i].quantity > 10) {
                cart[i].quantity = 10;
            }
            
            break;  // Exit loop once found
        }
    }
    
    // Save and refresh display
    saveAndRefreshCart(cart);
}


/* ================================================================
   SET ITEM QUANTITY FUNCTION
   ================================================================
   Sets item quantity to a specific value.
   ================================================================ */
function setItemQuantity(itemId, newQty) {
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    
    // FORM VALIDATION: Validate the input
    if (isNaN(newQty) || newQty < 1) {
        newQty = 1;
    }
    if (newQty > 10) {
        newQty = 10;
    }
    
    // Find and update the item
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === itemId) {
            cart[i].quantity = newQty;
            break;
        }
    }
    
    saveAndRefreshCart(cart);
}


/* ================================================================
   REMOVE ITEM FUNCTION
   ================================================================
   Removes an item from the cart completely.
   ================================================================ */
function removeItem(itemId) {
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    
    // Create new array without the removed item
    var newCart = [];
    
    // FOR LOOP: Copy all items except the one to remove
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id !== itemId) {
            newCart.push(cart[i]);
        }
    }
    
    saveAndRefreshCart(newCart);
    showToast('Item removed from cart', 'success');
}


/* ================================================================
   SAVE AND REFRESH CART FUNCTION
   ================================================================
   Saves cart to localStorage and reloads the display.
   ================================================================ */
function saveAndRefreshCart(cart) {
    localStorage.setItem('seoulBiteCart', JSON.stringify(cart));
    loadCart();  // Reload the display
}


/* ================================================================
   EVENT HANDLING: Clear Cart Button
   ================================================================
   Shows confirmation modal, then clears cart if confirmed.
   ================================================================ */
clearCartBtn.addEventListener('click', function() {
    showModal('Clear Cart', 'Are you sure you want to remove all items?', function() {
        // Clear cart from localStorage
        localStorage.removeItem('seoulBiteCart');
        localStorage.removeItem('seoulBiteOrderTotals');
        
        // Reload display
        loadCart();
        
        // Show message
        showToast('Cart cleared', 'success');
        
        // Hide modal
        hideModal();
    });
});


/* ================================================================
   EVENT HANDLING: Checkout Button
   ================================================================
   Checks if user is logged in before proceeding to checkout.
   ================================================================ */
checkoutBtn.addEventListener('click', function() {
    var session = localStorage.getItem('seoulBiteSession');
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    
    // FORM VALIDATION: Check if cart is empty
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    // Check if logged in
    if (!session) {
        // Show login required modal
        showModal('Login Required', 'Please login to checkout.', function() {
            window.location.href = 'index.html';
        });
        modalConfirm.textContent = 'Login';
        modalConfirm.className = 'btn btn-primary';
    } else {
        // Proceed to checkout
        window.location.href = 'checkout.html';
    }
});


/* ================================================================
   MODAL FUNCTIONS
   ================================================================
   Show and hide the confirmation modal.
   ================================================================ */

// Show modal with title, message, and confirm action
function showModal(title, message, onConfirm) {
    // DOM MANIPULATION: Set modal content
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Show the modal
    confirmModal.classList.add('show');
    
    // Set default button appearance
    modalConfirm.textContent = 'Confirm';
    modalConfirm.className = 'btn btn-danger';
    
    // Set confirm button action
    modalConfirm.onclick = onConfirm;
}

// Hide modal
function hideModal() {
    confirmModal.classList.remove('show');
}

// EVENT HANDLING: Cancel button closes modal
modalCancel.addEventListener('click', hideModal);

// EVENT HANDLING: Clicking outside modal closes it
confirmModal.addEventListener('click', function(e) {
    // Only close if clicked on overlay, not modal content
    if (e.target === confirmModal) {
        hideModal();
    }
});


/* ================================================================
   MOBILE MENU TOGGLE
   ================================================================
   EVENT HANDLING: Toggle navigation menu on mobile
   ================================================================ */
menuToggle.addEventListener('click', function() {
    navMenu.classList.toggle('show');
});


console.log('Cart.js loaded successfully');
