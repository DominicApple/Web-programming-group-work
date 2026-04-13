/* 
   ================================================================
   COMMON.JS - Shared JavaScript Functions
   ================================================================
   This file contains utility functions that are used across 
   multiple pages of the Seoul Bite website.
   
   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   TOAST NOTIFICATION FUNCTION
   ================================================================
   What it does:
   - Shows a small popup message at the bottom-right of the screen
   - Used to give feedback to users (e.g., "Item added to cart!")
   - Automatically disappears after 3 seconds
   
   Parameters:
   - message: The text to display in the toast
   - type: The style of toast ('success' = green, 'error' = red)
   
   How it works:
   1. Gets the toast element from the HTML using getElementById
   2. Sets the text content of the toast
   3. Adds CSS classes to show the toast and style it
   4. Uses setTimeout to hide it after 3 seconds
   ================================================================ */
function showToast(message, type) {
    // DOM MANIPULATION: getElementById returns the HTML element with id="toast"
    var toast = document.getElementById('toast');
    
    // Check if toast element exists (safety check)
    if (!toast) {
        console.warn('Toast element not found');
        return;
    }
    
    // DOM MANIPULATION: textContent sets the text inside an element
    toast.textContent = message;
    
    // DOM MANIPULATION: classList.remove() removes CSS classes from an element
    toast.classList.remove('success', 'error', 'info');
    
    // Add the appropriate class based on the type parameter
    if (type === 'success') {
        // DOM MANIPULATION: classList.add() adds a CSS class to an element
        toast.classList.add('success');
    } else if (type === 'error') {
        toast.classList.add('error');
    }
    
    // Show the toast by adding the 'show' class
    toast.classList.add('show');
    
    // setTimeout runs a function after a specified delay (3000ms = 3 seconds)
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}


/* ================================================================
   CURRENCY FORMATTING FUNCTION
   ================================================================
   What it does:
   - Takes a number and formats it as Jamaican currency
   - Adds the J$ prefix and comma separators
   
   Example:
   - formatCurrency(2500) returns "J$2,500"
   - formatCurrency(10000) returns "J$10,000"
   ================================================================ */
function formatCurrency(amount) {
    // toLocaleString converts number to string with commas
    return 'J$' + amount.toLocaleString('en-JM');
}


/* ================================================================
   EMAIL VALIDATION FUNCTION
   ================================================================
   What it does:
   - Checks if an email address is in valid format
   - Returns true if valid, false if invalid
   
   Regex pattern explanation:
   - ^[^\s@]+  = Start with one or more characters (not space or @)
   - @         = Must have exactly one @ symbol
   - [^\s@]+   = Followed by one or more characters (not space or @)
   - \.        = Must have a dot (period)
   - [^\s@]+$  = End with one or more characters (not space or @)
   ================================================================ */
function isValidEmail(email) {
    // Regular Expression pattern for email validation
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // test() returns true if email matches the pattern, false otherwise
    return emailPattern.test(email);
}


/* ================================================================
   PHONE NUMBER VALIDATION FUNCTION
   ================================================================
   What it does:
   - Checks if a phone number is valid
   - Allows digits, spaces, hyphens, parentheses, plus sign
   - Must have between 7 and 15 digits
   ================================================================ */
function isValidPhone(phone) {
    // Remove all formatting characters, keep only digits
    // replace() with regex removes spaces, dashes, parentheses, plus signs
    var cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Check if cleaned phone is 7-15 digits only
    return /^\d{7,15}$/.test(cleanPhone);
}


/* ================================================================
   GET CART FUNCTION
   ================================================================
   What it does:
   - Retrieves the shopping cart from localStorage
   - localStorage is browser storage that persists after closing browser
   
   Returns:
   - An array of cart items, or empty array if no cart exists
   ================================================================ */
function getCart() {
    // localStorage.getItem() retrieves data stored in the browser
    var cartData = localStorage.getItem('seoulBiteCart');
    
    if (cartData) {
        // JSON.parse() converts JSON string back to JavaScript array
        return JSON.parse(cartData);
    }
    
    return [];
}


/* ================================================================
   SAVE CART FUNCTION
   ================================================================
   What it does:
   - Saves the shopping cart to localStorage
   - Converts the cart array to a string for storage
   ================================================================ */
function saveCart(cart) {
    // JSON.stringify() converts array to string (localStorage only stores strings)
    localStorage.setItem('seoulBiteCart', JSON.stringify(cart));
}


/* ================================================================
   GET CART ITEM COUNT FUNCTION
   ================================================================
   What it does:
   - Calculates total number of items in the cart
   - Adds up all quantities (not just unique items)
   
   Example:
   - Cart has 2 Bibimbap and 3 Chicken = returns 5
   
   Uses FOR LOOP to iterate through each cart item
   ================================================================ */
function getCartItemCount() {
    var cart = getCart();
    var count = 0;
    
    // FOR LOOP: repeats for each item in cart array
    // i=0: start at first item (index 0)
    // i < cart.length: continue while i is less than array length
    // i++: add 1 to i after each loop
    for (var i = 0; i < cart.length; i++) {
        // ARITHMETIC: add this item's quantity to running total
        count = count + cart[i].quantity;
    }
    
    return count;
}


/* ================================================================
   CHECK IF USER IS LOGGED IN
   ================================================================
   Returns true if user is logged in, false otherwise
   ================================================================ */
function isLoggedIn() {
    var session = localStorage.getItem('seoulBiteSession');
    return session !== null;
}


/* ================================================================
   GET SESSION DATA
   ================================================================
   Returns the current user's session information (username, etc.)
   ================================================================ */
function getSession() {
    var sessionData = localStorage.getItem('seoulBiteSession');
    
    if (sessionData) {
        return JSON.parse(sessionData);
    }
    
    return null;
}


/* ================================================================
   CLEAR SESSION (LOGOUT)
   ================================================================
   Removes user session from localStorage (logs user out)
   ================================================================ */
function clearSession() {
    localStorage.removeItem('seoulBiteSession');
}


/* ================================================================
   GENERATE ORDER NUMBER
   ================================================================
   Creates unique order number: SB + timestamp + random digits
   Example: SB123456789
   ================================================================ */
function generateOrderNumber() {
    // Get last 6 digits of current timestamp
    var timestamp = Date.now().toString().slice(-6);
    
    // Generate random number 0-999
    var random = Math.floor(Math.random() * 1000);
    var randomStr = random.toString();
    
    // Pad with zeros if needed (5 becomes "005")
    while (randomStr.length < 3) {
        randomStr = '0' + randomStr;
    }
    
    return 'SB' + timestamp + randomStr;
}


/* ================================================================
   TOGGLE MOBILE MENU
   ================================================================
   Shows/hides navigation menu on mobile devices
   ================================================================ */
function toggleMobileMenu() {
    var navMenu = document.getElementById('nav-menu');
    
    if (navMenu) {
        // DOM MANIPULATION: toggle() adds class if missing, removes if present
        navMenu.classList.toggle('show');
    }
}


/* ================================================================
   UPDATE AUTH LINK
   ================================================================
   Updates Login/Logout link based on session state
   ================================================================ */
function updateAuthLink() {
    // DOM MANIPULATION: get the auth link element
    var authLink = document.getElementById('auth-link');
    
    if (!authLink) {
        return;
    }
    
    if (isLoggedIn()) {
        // DOM MANIPULATION: change text content
        authLink.textContent = 'Logout';
        authLink.href = '#';
        
        // EVENT HANDLING: onclick event for logout
        authLink.onclick = function(e) {
            e.preventDefault();
            clearSession();
            showToast('Logged out successfully', 'success');
            
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1000);
        };
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'index.html';
    }
}


/* ================================================================
   UPDATE CART COUNT DISPLAY
   ================================================================
   Updates the number shown next to "Cart" in navigation
   ================================================================ */
function updateCartCountDisplay() {
    // DOM MANIPULATION: get element and update its text
    var cartCountElement = document.getElementById('cart-count');
    
    if (cartCountElement) {
        cartCountElement.textContent = getCartItemCount();
    }
}


/* ================================================================
   PAGE TRANSITION - Smooth Exit Before Navigation
   ================================================================
   What it does:
   - Intercepts clicks on internal navigation links
   - Adds the CSS class "page-exit" to <body> to trigger a
     fade-out + upward-slide animation (defined in common.css)
   - Navigates to the new page after 300ms (matches animation)

   Why this works:
   - The CSS @keyframes "pageEnter" runs automatically when any page
     loads (body { animation: pageEnter ... })
   - The CSS @keyframes "pageExit" only runs when we add the class
   - Together they create a seamless fade-slide between every page

   Links excluded from the transition:
   - Anchor links (#...) — scroll the current page, no navigation
   - mailto: and tel: — not page navigations
   - External URLs (http/https) — opening new tabs/windows
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {

    /* Select all <a> tags that point to internal HTML pages */
    var allLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="tel"]):not([href^="http"]):not([href^="//"])'
    );

    allLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var destination = this.getAttribute('href');

            /* Only animate if we have a real destination */
            if (destination && destination !== '') {
                e.preventDefault();  /* Stop the browser from navigating immediately */

                /* Add the exit class to trigger the CSS animation */
                document.body.classList.add('page-exit');

                /* Wait for the animation to finish, then navigate */
                setTimeout(function () {
                    window.location.href = destination;
                }, 300);
            }
        });
    });
});


console.log('Common.js loaded successfully');
