/* 
   ================================================================
   PRODUCTS.JS - Products/Menu Page JavaScript
   ================================================================
   This file handles:
   - Displaying products from an array
   - Filtering products by category
   - Adding items to the shopping cart
   
   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/
var products = [
    // MAIN DISHES
    {
        id: 1,
        name: "Classic Bibimbap",
        description: "Mixed rice bowl with seasoned vegetables, beef, fried egg, and spicy gochujang sauce",
        price: 2500,
        category: "main",
        // IMAGE: Add your image as Assets/bibimbap.jpg
        image: "../Assets/bibimbap.jpg",
        popular: true
    },
    {
        id: 2,
        name: "Korean Fried Chicken",
        description: "Crispy double-fried chicken with sweet and spicy yangnyeom sauce",
        price: 2800,
        category: "main",
        // IMAGE: Add your image as Assets/fried-chicken.jpg
        image: "../Assets/fried-chicken.jpg",
        popular: true
    },
    {
        id: 3,
        name: "Bulgogi",
        description: "Tender marinated beef grilled to perfection with onions and scallions",
        price: 3200,
        category: "main",
        image: "../Assets/Bulgogi.jpg",
        popular: true
    },
    {
        id: 4,
        name: "Kimchi Jjigae",
        description: "Hearty fermented kimchi stew with pork and tofu, served bubbling hot",
        price: 1800,
        category: "soup",
        // IMAGE: Add your image as Assets/kimchi-jjigae.jpg
        image: "../Assets/kimchi-jjigae.jpg",
        popular: true
    },
    
    // APPETIZERS
    {
        id: 5,
        name: "Tteokbokki",
        description: "Chewy rice cakes in sweet and spicy gochujang sauce with fish cakes",
        price: 1400,
        category: "appetizer",
        // IMAGE: Add your image as Assets/tteokbokki.jpg
        image: "../Assets/tteokbokki.jpg",
        popular: true
    },
    {
        id: 6,
        name: "Mandu (Dumplings)",
        description: "Pan-fried Korean dumplings filled with pork and vegetables (6 pcs)",
        price: 1200,
        category: "appetizer",
        // IMAGE: Add your image as Assets/mandu.jpg
        image: "../Assets/mandu.jpg",
        popular: true
    },
    {
        id: 7,
        name: "Kimbap",
        description: "Korean rice rolls with vegetables, egg, and beef (8 pieces)",
        price: 1300,
        category: "appetizer",
        // IMAGE: Add your image as Assets/kimbap.jpg
        image: "../Assets/kimbap.jpg",
        popular: false
    },
    
    // DRINKS
    {
        id: 8,
        name: "Soju",
        description: "Traditional Korean rice spirit (360ml bottle)",
        price: 1200,
        category: "drink",
        // IMAGE: Add your image as Assets/soju.jpg
        image: "../Assets/soju.jpg",
        popular: true
    }
];


/* ================================================================
   DOM ELEMENT REFERENCES
   ================================================================
   Getting references to HTML elements we need to manipulate.
   ================================================================ */

// DOM MANIPULATION: Get the container where products will be displayed
var productsGrid = document.getElementById('products-grid');

// DOM MANIPULATION: Get the "no products" message element
var noProductsMessage = document.getElementById('no-products');

// DOM MANIPULATION: Get cart count element in navigation
var cartCountElement = document.getElementById('cart-count');

// DOM MANIPULATION: Get mobile menu elements
var menuToggle = document.getElementById('menu-toggle');
var navMenu = document.getElementById('nav-menu');

// DOM MANIPULATION: querySelectorAll returns ALL elements matching the selector
// Returns a NodeList (like an array) of all filter buttons
var filterButtons = document.querySelectorAll('.filter-btn');


/* ================================================================
   PAGE LOAD EVENT
   ================================================================
   EVENT HANDLING: DOMContentLoaded fires when HTML is fully loaded.
   We initialize the page by rendering products and updating UI.
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    // Render all products initially (category 'all')
    renderProducts('all');
    
    // Update the cart count in navigation
    updateCartCountDisplay();
    
    // Update login/logout link
    updateAuthLink();
    
    // Setup filter button events AFTER DOM is loaded
    setupFilterButtons();
});


/* ================================================================
   RENDER PRODUCTS FUNCTION
   ================================================================
   Displays products on the page based on selected category.  
   This function demonstrates:
   - DOM Manipulation (innerHTML, appendChild)
   - Array filtering
   - FOR EACH loop
   ================================================================ */
function renderProducts(category) {
    // DOM MANIPULATION: Clear existing products by setting innerHTML to empty
    productsGrid.innerHTML = '';
    
    // Filter products based on category
    var filteredProducts;
    
    if (category === 'all') {
        // Show all products
        filteredProducts = products;
    } else {
        // ARRAY FILTER: filter() creates new array with items that pass the test
        // The function inside is called for each item
        // If it returns true, item is included in new array
        filteredProducts = products.filter(function(product) {
            return product.category === category;
        });
    }
    
    // Check if any products found
    if (filteredProducts.length === 0) {
        // DOM MANIPULATION: Show "no products" message
        noProductsMessage.classList.remove('hidden');
        return;
    } else {
        // DOM MANIPULATION: Hide "no products" message
        noProductsMessage.classList.add('hidden');
    }
    
    // FOR EACH LOOP: iterate through filtered products
    // forEach is an array method that runs function for each item
    filteredProducts.forEach(function(product) {
        // Create a card element for this product
        var card = createProductCard(product);
        
        // DOM MANIPULATION: appendChild adds the card to the grid
        productsGrid.appendChild(card);
    });
}


/* ================================================================
   CREATE PRODUCT CARD FUNCTION
   ================================================================
   Creates the HTML element for a single product card.
   
   Parameters:
   - product: the product object with name, price, etc.
   
   Returns:
   - The created HTML element (div) for the product card
   
   This function demonstrates:
   - DOM Manipulation (createElement, innerHTML, querySelector)
   - Event Handling (addEventListener for buttons)
   ================================================================ */
function createProductCard(product) {
    // DOM MANIPULATION: createElement creates a new HTML element
    var card = document.createElement('div');
    
    // DOM MANIPULATION: className sets the CSS class
    card.className = 'product-card';
    
    // DOM MANIPULATION: setAttribute adds HTML attributes
    card.setAttribute('data-id', product.id);
    
    // Format price with currency symbol
    var formattedPrice = 'J$' + product.price.toLocaleString();
    
    // Create "Popular" badge if item is popular
    var popularBadge = '';
    if (product.popular) {
        popularBadge = '<span class="popular-badge">★ Popular</span>';
    }
    
    // DOM MANIPULATION: innerHTML sets the HTML content inside the element
    // Using string concatenation to build HTML
    card.innerHTML = 
        '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.src=\'../Assets/placeholder.svg\'">' +
        '<div class="product-info">' +
            popularBadge +
            '<h3>' + product.name + '</h3>' +
            '<p class="description">' + product.description + '</p>' +
            '<p class="price">' + formattedPrice + '</p>' +
            '<div class="product-actions">' +
                '<div class="quantity-control">' +
                    '<button type="button" class="qty-decrease">-</button>' +
                    '<input type="number" class="qty-input" value="1" min="1" max="10">' +
                    '<button type="button" class="qty-increase">+</button>' +
                '</div>' +
                '<button class="btn btn-primary btn-sm add-to-cart-btn">Add to Cart</button>' +
            '</div>' +
        '</div>';
    
    // DOM MANIPULATION: querySelector finds element INSIDE the card
    // Unlike getElementById which searches whole document,
    // querySelector on an element searches only within that element
    var qtyInput = card.querySelector('.qty-input');
    var decreaseBtn = card.querySelector('.qty-decrease');
    var increaseBtn = card.querySelector('.qty-increase');
    var addToCartBtn = card.querySelector('.add-to-cart-btn');
    
    // EVENT HANDLING: Add click event for decrease button
    decreaseBtn.addEventListener('click', function() {
        // Get current quantity and convert to number
        var qty = parseInt(qtyInput.value);
        
        // IF statement: only decrease if greater than 1
        if (qty > 1) {
            // ARITHMETIC: subtract 1 from quantity
            qtyInput.value = qty - 1;
        }
    });
    
    // EVENT HANDLING: Add click event for increase button
    increaseBtn.addEventListener('click', function() {
        var qty = parseInt(qtyInput.value);
        
        // IF statement: only increase if less than 10
        if (qty < 10) {
            // ARITHMETIC: add 1 to quantity
            qtyInput.value = qty + 1;
        }
    });
    
    // EVENT HANDLING: Add click event for Add to Cart button
    addToCartBtn.addEventListener('click', function() {
        // Get the quantity from input field
        var quantity = parseInt(qtyInput.value);
        
        // Call addToCart function
        addToCart(product, quantity);
    });
    
    // Return the completed card element
    return card;
}


/* ================================================================
   ADD TO CART FUNCTION
   ================================================================
   Adds a product to the shopping cart.
   
   Parameters:
   - product: the product object to add
   - quantity: how many to add
   
   Uses localStorage to persist cart data.
   ================================================================ */
function addToCart(product, quantity) {
    // Get current cart from localStorage
    var cart = JSON.parse(localStorage.getItem('seoulBiteCart')) || [];
    
    // Check if product already exists in cart
    // FOR LOOP to search through cart items
    var existingIndex = -1;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id) {
            existingIndex = i;
            break;
        }
    }
    
    // IF/ELSE: Update existing item or add new item
    if (existingIndex !== -1) {
        // Product exists - add to quantity
        // ARITHMETIC: addition
        cart[existingIndex].quantity = cart[existingIndex].quantity + quantity;
        
        // Cap at maximum of 10
        if (cart[existingIndex].quantity > 10) {
            cart[existingIndex].quantity = 10;
        }
    } else {
        // New product - add to cart array
        // push() adds item to end of array
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('seoulBiteCart', JSON.stringify(cart));
    
    // Update cart count in navigation
    updateCartCountDisplay();
    
    // Show success message
    showToast(product.name + ' added to cart!', 'success');
}


/* ================================================================
   SETUP FILTER BUTTON EVENTS
   ================================================================
   EVENT HANDLING: Add click event to each filter button.
   
   Uses FOR LOOP to iterate through all buttons.
   ================================================================ */
function setupFilterButtons() {
    // Get all filter buttons
    var filterButtons = document.querySelectorAll('.filter-btn');
    
    for (var i = 0; i < filterButtons.length; i++) {
        // EVENT HANDLING: Add click listener to each button
        filterButtons[i].addEventListener('click', function() {
            
            // Remove 'active' class from ALL buttons
            var allButtons = document.querySelectorAll('.filter-btn');
            for (var j = 0; j < allButtons.length; j++) {
                // DOM MANIPULATION: classList.remove
                allButtons[j].classList.remove('active');
            }
            
            // Add 'active' class to the clicked button
            // 'this' refers to the button that was clicked
            // DOM MANIPULATION: classList.add
            this.classList.add('active');
            
            // Get the category from the button's data attribute
            // getAttribute reads HTML attributes
            var category = this.getAttribute('data-category');
            
            // Render products for this category
            renderProducts(category);
        });
    }
}


/* ================================================================
   MOBILE MENU TOGGLE
   ================================================================
   EVENT HANDLING: Toggle menu visibility on mobile
   ================================================================ */
if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        // DOM MANIPULATION: toggle adds/removes class
        navMenu.classList.toggle('show');
    });
}


console.log('Products.js loaded successfully');
