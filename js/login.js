/* 
   ================================================================
   LOGIN.JS - Login Page JavaScript
   ================================================================
   This file handles:
   - Login form validation
   - User authentication
   - Session creation
   
   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   DOM ELEMENT REFERENCES
   ================================================================
   We get references to HTML elements using getElementById.
   This is called "DOM Manipulation" - accessing elements in the page.
   
   The DOM (Document Object Model) is a tree structure representing
   all the HTML elements on the page.
   ================================================================ */

// Get reference to the login form element
// This allows us to listen for when the form is submitted
var loginForm = document.getElementById('login-form');

// Get references to the input fields
// We need these to read what the user types
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');

// Get references to error message elements
// We'll use these to show validation errors
var usernameError = document.getElementById('username-error');
var passwordError = document.getElementById('password-error');
var loginError = document.getElementById('login-error');


/* ================================================================
   DEFAULT USER ACCOUNTS
   ================================================================
   This array stores user accounts for testing.
   In a real website, this would come from a database.
   
   We also load any users that registered on this device.
   ================================================================ */
var registeredUsers = JSON.parse(localStorage.getItem('seoulBiteUsers')) || [
    // Default demo accounts for testing
    { username: "admin", password: "admin123", email: "admin@seoulbite.com", fullName: "Admin User" },
    { username: "demo", password: "demo1234", email: "demo@seoulbite.com", fullName: "Demo User" }
];


/* ================================================================
   EVENT HANDLING: Form Submit Event
   ================================================================
   addEventListener() attaches a function to run when an event occurs.
   
   The 'submit' event fires when user clicks the Login button
   or presses Enter in a form field.
   
   e.preventDefault() stops the form from submitting normally
   (which would reload the page).
   ================================================================ */
loginForm.addEventListener('submit', function(e) {
    // Prevent the browser's default form submission behavior
    // Without this, the page would reload and lose all data
    e.preventDefault();
    
    // Clear any previous error messages
    clearErrors();
    
    // Validate the form - if valid, try to log in
    if (validateLoginForm()) {
        attemptLogin();
    }
});


/* ================================================================
   EVENT HANDLING: Blur Events
   ================================================================
   The 'blur' event fires when a user leaves an input field
   (clicks away or tabs to another field).
   
   We use this to validate fields as the user fills out the form.
   ================================================================ */

// When user leaves username field, validate it
usernameInput.addEventListener('blur', function() {
    validateUsername();
});

// When user leaves password field, validate it
passwordInput.addEventListener('blur', function() {
    validatePassword();
});


/* ================================================================
   EVENT HANDLING: Focus Events
   ================================================================
   The 'focus' event fires when a user clicks into an input field.
   
   We use this to clear error messages when user starts typing again.
   ================================================================ */

// When user clicks into username field, clear its error
usernameInput.addEventListener('focus', function() {
    hideError(usernameInput, usernameError);
});

// When user clicks into password field, clear its error
passwordInput.addEventListener('focus', function() {
    hideError(passwordInput, passwordError);
});


/* ================================================================
   FORM VALIDATION: Validate Entire Form
   ================================================================
   This function validates all form fields.
   Returns true if ALL fields are valid, false otherwise.
   ================================================================ */
function validateLoginForm() {
    var isValid = true;
    
    // Validate each field - if any fail, form is invalid
    if (!validateUsername()) {
        isValid = false;
    }
    
    if (!validatePassword()) {
        isValid = false;
    }
    
    return isValid;
}


/* ================================================================
   FORM VALIDATION: Validate Username
   ================================================================
   Checks if username field is valid.
   
   Validation rules:
   1. Cannot be empty
   2. Must be at least 3 characters
   
   Returns true if valid, false if invalid
   ================================================================ */
function validateUsername() {
    // Get the value from the input field
    // .value gets what the user typed
    // .trim() removes spaces from start and end
    var username = usernameInput.value.trim();
    
    // VALIDATION: Check if field is empty
    if (username === '') {
        // Show error message to user
        showError(usernameInput, usernameError, 'Username is required');
        return false;
    }
    
    // VALIDATION: Check minimum length
    if (username.length < 3) {
        showError(usernameInput, usernameError, 'Username must be at least 3 characters');
        return false;
    }
    
    // If we get here, username is valid
    hideError(usernameInput, usernameError);
    return true;
}


/* ================================================================
   FORM VALIDATION: Validate Password
   ================================================================
   Checks if password field is valid.
   
   Validation rules:
   1. Cannot be empty
   2. Must be at least 8 characters
   
   Returns true if valid, false if invalid
   ================================================================ */
function validatePassword() {
    // Get the password value (don't trim - spaces might be intentional)
    var password = passwordInput.value;
    
    // VALIDATION: Check if empty
    if (password === '') {
        showError(passwordInput, passwordError, 'Password is required');
        return false;
    }
    
    // VALIDATION: Check minimum length
    if (password.length < 8) {
        showError(passwordInput, passwordError, 'Password must be at least 8 characters');
        return false;
    }
    
    hideError(passwordInput, passwordError);
    return true;
}


/* ================================================================
   AUTHENTICATION: Attempt Login
   ================================================================
   Tries to find a matching user in our user list.
   
   Uses a FOR LOOP to check each user account.
   ================================================================ */
function attemptLogin() {
    // Get the entered values
    var username = usernameInput.value.trim().toLowerCase();
    var password = passwordInput.value;
    
    // Variables to track if we find a match
    var userFound = false;
    var matchedUser = null;
    
    // FOR LOOP: Check each user in the array
    for (var i = 0; i < registeredUsers.length; i++) {
        // Check if username AND password match
        // toLowerCase() makes comparison case-insensitive
        if (registeredUsers[i].username.toLowerCase() === username && 
            registeredUsers[i].password === password) {
            
            // Found a match!
            userFound = true;
            matchedUser = registeredUsers[i];
            
            // break exits the loop early (no need to keep checking)
            break;
        }
    }
    
    // IF/ELSE: Handle the result
    if (userFound) {
        loginSuccess(matchedUser);
    } else {
        loginFailed();
    }
}


/* ================================================================
   LOGIN SUCCESS HANDLER
   ================================================================
   Called when user successfully logs in.
   
   What it does:
   1. Creates a session object with user info
   2. Stores session in localStorage
   3. Shows success message
   4. Redirects to products page
   ================================================================ */
function loginSuccess(user) {
    // Create session object with user information
    var session = {
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        loggedInAt: new Date().toISOString()
    };
    
    // Store session in localStorage
    localStorage.setItem('seoulBiteSession', JSON.stringify(session));
    
    // Show success message using toast
    showToast('Login successful! Redirecting...', 'success');
    
    // Redirect to products page after 1.5 seconds
    setTimeout(function() {
        window.location.href = 'products.html';
    }, 1500);
}


/* ================================================================
   LOGIN FAILED HANDLER
   ================================================================
   Called when login credentials don't match.
   
   What it does:
   1. Shows error message
   2. Adds shake animation to form
   ================================================================ */
function loginFailed() {
    // DOM MANIPULATION: Show error message
    loginError.textContent = 'Invalid username or password. Please try again.';
    loginError.classList.add('show');
    
    // Add shake animation to the form (visual feedback)
    loginForm.style.animation = 'shake 0.5s ease';
    
    // Remove animation after it completes
    setTimeout(function() {
        loginForm.style.animation = '';
    }, 500);
}


/* ================================================================
   SHOW ERROR FUNCTION
   ================================================================
   Displays an error message for a specific input field.
   
   DOM MANIPULATION:
   - Adds 'input-error' class to highlight the field in red
   - Sets error message text
   - Adds 'show' class to make error visible
   ================================================================ */
function showError(input, errorElement, message) {
    // Add red border to input field
    input.classList.add('input-error');
    
    // Set the error message text
    errorElement.textContent = message;
    
    // Make the error message visible
    errorElement.classList.add('show');
}


/* ================================================================
   HIDE ERROR FUNCTION
   ================================================================
   Hides the error message for a specific input field.
   ================================================================ */
function hideError(input, errorElement) {
    // Remove red border from input
    input.classList.remove('input-error');
    
    // Clear the error message
    errorElement.textContent = '';
    
    // Hide the error element
    errorElement.classList.remove('show');
}


/* ================================================================
   CLEAR ALL ERRORS FUNCTION
   ================================================================
   Clears all error messages on the form.
   Called before re-validating the form.
   ================================================================ */
function clearErrors() {
    hideError(usernameInput, usernameError);
    hideError(passwordInput, passwordError);
    loginError.textContent = '';
    loginError.classList.remove('show');
}


/* ================================================================
   PAGE LOAD CHECK
   ================================================================
   EVENT HANDLING: DOMContentLoaded event
   
   This event fires when the HTML is fully loaded.
   We check if user is already logged in and redirect if so.
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    var session = localStorage.getItem('seoulBiteSession');
    
    if (session) {
        // User already logged in, redirect to products
        window.location.href = 'products.html';
    }
});


console.log('Login.js loaded successfully');
