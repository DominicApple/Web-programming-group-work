/* 
   ================================================================
   CHECKOUT.JS - Checkout Page JavaScript
   ================================================================
   This file handles:
   - Displaying order summary
   - Shipping form validation
   - Payment method selection
   - Order processing
   
   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   PAGE LOAD CHECK
   ================================================================
   EVENT HANDLING: Check if user can access checkout.
   - Must be logged in
   - Must have items in cart
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    // Check if logged in
    var session = localStorage.getItem('seoulBiteSession');
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    
    // IF: Not logged in - redirect to login
    if (!session) {
        alert('Please login to checkout');
        window.location.href = 'index.html';
        return;
    }
    
    // IF: Cart is empty - redirect to products
    if (cart.length === 0) {
        alert('Your cart is empty');
        window.location.href = 'products.html';
        return;
    }
    
    // Display order summary
    displayOrderSummary();
});


/* ================================================================
   DISPLAY ORDER SUMMARY
   ================================================================
   Shows the items and total from the cart.
   ================================================================ */
function displayOrderSummary() {
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    var totals = JSON.parse(localStorage.getItem('seoulBiteOrderTotals')) || {};
    
    // DOM MANIPULATION: Get order items container
    var orderItems = document.getElementById('order-items');
    
    // Build HTML for each item using FOR LOOP
    var html = '';
    for (var i = 0; i < cart.length; i++) {
        // ARITHMETIC: Multiply price by quantity
        var itemTotal = cart[i].price * cart[i].quantity;
        
        // String concatenation to build HTML
        html += '<div class="order-item">' +
            '<span>' + cart[i].name + ' × ' + cart[i].quantity + '</span>' +
            '<span>J$' + itemTotal.toLocaleString() + '</span>' +
        '</div>';
    }
    
    // DOM MANIPULATION: Set innerHTML
    orderItems.innerHTML = html;
    
    // DOM MANIPULATION: Update total
    document.getElementById('order-total').textContent = 'J$' + (totals.total || 0).toLocaleString();
}


/* ================================================================
   PAYMENT METHOD CHANGE
   ================================================================
   EVENT HANDLING: Show/hide card details based on payment selection.
   ================================================================ */

// DOM MANIPULATION: Get all payment option radio buttons
var paymentOptions = document.querySelectorAll('input[name="payment"]');

// DOM MANIPULATION: Get card details container
var cardDetails = document.getElementById('card-details');

// FOR LOOP: Add change event to each payment option
for (var i = 0; i < paymentOptions.length; i++) {
    
    // EVENT HANDLING: Change event fires when selection changes
    paymentOptions[i].addEventListener('change', function() {
        
        // DOM MANIPULATION: Remove 'selected' class from all options
        var allOptions = document.querySelectorAll('.payment-option');
        for (var j = 0; j < allOptions.length; j++) {
            allOptions[j].classList.remove('selected');
        }
        
        // DOM MANIPULATION: Add 'selected' class to parent of clicked radio
        // 'this' refers to the radio button that changed
        // parentElement gets the label that contains it
        this.parentElement.classList.add('selected');
        
        // IF/ELSE: Show or hide card details
        if (this.value === 'card') {
            // DOM MANIPULATION: Show card details
            cardDetails.classList.remove('hidden');
        } else {
            // DOM MANIPULATION: Hide card details
            cardDetails.classList.add('hidden');
        }
    });
}


/* ================================================================
   FORM SUBMIT EVENT
   ================================================================
   EVENT HANDLING: Validate form and process order on submit.
   ================================================================ */
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    // Prevent default form submission
    e.preventDefault();
    
    // Validate form - if valid, process order
    if (validateCheckoutForm()) {
        processOrder();
    }
});


/* ================================================================
   VALIDATE CHECKOUT FORM
   ================================================================
   FORM VALIDATION: Validates all shipping and payment fields.
   ================================================================ */
function validateCheckoutForm() {
    var isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    /* ============================================================
       VALIDATE SHIPPING FIELDS
       ============================================================ */
    
    // VALIDATION: Full Name - check if empty
    var fullName = document.getElementById('fullName').value.trim();
    if (fullName === '') {
        showError('fullName', 'Full name is required');
        isValid = false;
    }
    
    // VALIDATION: Phone - check format
    var phone = document.getElementById('phone').value.trim();
    if (phone === '') {
        showError('phone', 'Phone number is required');
        isValid = false;
    } else if (!/^[\d\s\-\+\(\)]{7,}$/.test(phone)) {
        // Regex checks for at least 7 characters of digits and formatting
        showError('phone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // VALIDATION: Address - check if empty
    var address = document.getElementById('address').value.trim();
    if (address === '') {
        showError('address', 'Delivery address is required');
        isValid = false;
    }
    
    // VALIDATION: Parish - check if selected
    var parish = document.getElementById('parish').value;
    if (parish === '') {
        showError('parish', 'Please select a parish');
        isValid = false;
    }
    
    /* ============================================================
       VALIDATE CARD FIELDS (only if card payment selected)
       ============================================================ */
    
    // Get selected payment method
    var paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // IF: Card payment selected, validate card fields
    if (paymentMethod === 'card') {
        
        // VALIDATION: Card Number
        var cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        if (cardNumber === '') {
            showError('cardNumber', 'Card number is required');
            isValid = false;
        } else if (!/^\d{13,19}$/.test(cardNumber)) {
            // Card numbers are typically 13-19 digits
            showError('cardNumber', 'Please enter a valid card number');
            isValid = false;
        }
        
        // VALIDATION: Cardholder Name
        var cardName = document.getElementById('cardName').value.trim();
        if (cardName === '') {
            showError('cardName', 'Cardholder name is required');
            isValid = false;
        }
        
        // VALIDATION: Expiry Date (format MM/YY)
        var expiry = document.getElementById('expiry').value;
        if (expiry === '') {
            showError('expiry', 'Expiry date is required');
            isValid = false;
        } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            // Regex checks for format: 2 digits, slash, 2 digits
            showError('expiry', 'Use format MM/YY');
            isValid = false;
        }
        
        // VALIDATION: CVV (3-4 digits)
        var cvv = document.getElementById('cvv').value;
        if (cvv === '') {
            showError('cvv', 'CVV is required');
            isValid = false;
        } else if (!/^\d{3,4}$/.test(cvv)) {
            // Regex checks for 3 or 4 digits only
            showError('cvv', 'CVV must be 3-4 digits');
            isValid = false;
        }
    }
    
    return isValid;
}


/* ================================================================
   SHOW ERROR FUNCTION
   ================================================================
   DOM MANIPULATION: Displays error for a form field.
   ================================================================ */
function showError(fieldId, message) {
    // Get input and error elements
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    
    // DOM MANIPULATION: Add error class to input
    if (input) {
        input.classList.add('input-error');
    }
    
    // DOM MANIPULATION: Set and show error message
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}


/* ================================================================
   CLEAR ALL ERRORS FUNCTION
   ================================================================
   DOM MANIPULATION: Removes all error states from form.
   ================================================================ */
function clearAllErrors() {
    // Get all error message elements
    var errorMessages = document.querySelectorAll('.error-message');
    
    // FOR LOOP: Clear each error message
    for (var i = 0; i < errorMessages.length; i++) {
        errorMessages[i].textContent = '';
        errorMessages[i].classList.remove('show');
    }
    
    // Get all inputs with error class
    var errorInputs = document.querySelectorAll('.input-error');
    
    // FOR LOOP: Remove error class from each
    for (var j = 0; j < errorInputs.length; j++) {
        errorInputs[j].classList.remove('input-error');
    }
}


/* ================================================================
   PROCESS ORDER FUNCTION
   ================================================================
   Creates the order and saves it to localStorage.
   ================================================================ */
function processOrder() {
    // Generate unique order number
    var timestamp = Date.now().toString().slice(-6);
    var random = Math.floor(Math.random() * 1000);
    var orderNumber = 'SB' + timestamp + random;
    
    // Create order object
    var order = {
        orderNumber: orderNumber,
        items: JSON.parse(localStorage.getItem('seoulBiteCart')),
        totals: JSON.parse(localStorage.getItem('seoulBiteOrderTotals')),
        shipping: {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            parish: document.getElementById('parish').value
        },
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        createdAt: new Date().toISOString()
    };
    
    // Get existing orders and add new one
    var orders = JSON.parse(localStorage.getItem('seoulBiteOrders')) || [];
    orders.push(order);
    
    // Save orders
    localStorage.setItem('seoulBiteOrders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('seoulBiteCart');
    localStorage.removeItem('seoulBiteOrderTotals');
    
    // DOM MANIPULATION: Show confirmation modal
    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('confirmation-modal').classList.add('show');
}


/* ================================================================
   EVENT HANDLING: Done Button
   ================================================================
   Redirects to products page after order completion.
   ================================================================ */
document.getElementById('done-btn').addEventListener('click', function() {
    window.location.href = 'products.html';
});


/* ================================================================
   CARD NUMBER FORMATTING
   ================================================================
   EVENT HANDLING: Format card number as user types.
   Adds spaces every 4 digits (e.g., 1234 5678 9012 3456)
   ================================================================ */
document.getElementById('cardNumber').addEventListener('input', function(e) {
    // Get value and remove all non-digits
    var value = e.target.value.replace(/\D/g, '');
    
    // Add space every 4 digits using regex
    // (\d{4}) captures groups of 4 digits
    // $1 space replaces with the group plus a space
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    
    // DOM MANIPULATION: Set the formatted value
    e.target.value = value;
});


/* ================================================================
   EXPIRY DATE FORMATTING
   ================================================================
   EVENT HANDLING: Format expiry as MM/YY as user types.
   ================================================================ */
document.getElementById('expiry').addEventListener('input', function(e) {
    // Get value and remove all non-digits
    var value = e.target.value.replace(/\D/g, '');
    
    // If 2+ characters, add slash after first 2
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    // DOM MANIPULATION: Set the formatted value
    e.target.value = value;
});


console.log('Checkout.js loaded successfully');
