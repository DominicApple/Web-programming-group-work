/* 
   ================================================================
   LOGIN.JS - Login Page JavaScript
   ================================================================
   This file handles:
   - Login form validation with TRN (Tax Registration Number)
   - User authentication against localStorage RegistrationData
   - 3-attempt limit with account lockout redirect
   - Cancel button (clear form)
   - Reset Password link (redirects to reset-password.html)
   - Session creation on successful login

   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   DOM ELEMENT REFERENCES
   ================================================================
   DOM MANIPULATION: Getting references to HTML elements using
   getElementById. The DOM (Document Object Model) represents all
   HTML elements as a tree we can read and change with JavaScript.
   ================================================================ */

// Get reference to the login form element
var loginForm = document.getElementById('login-form');

// Get references to the input fields (TRN replaces username - Q1b i)
var trnInput      = document.getElementById('trn');
var passwordInput = document.getElementById('password');

// Get references to error message elements
var trnError      = document.getElementById('trn-error');
var passwordError = document.getElementById('password-error');
var loginError    = document.getElementById('login-error');

// Attempt warning display
var attemptWarning = document.getElementById('attempt-warning');

// Cancel button
var cancelBtn = document.getElementById('cancel-btn');


/* ================================================================
   LOGIN ATTEMPT COUNTER
   ================================================================
   Question 1b (iii): A visitor is given THREE attempts to enter a
   correct TRN and password. On failure after 3 attempts they are
   redirected to an account locked page.

   The counter is stored in sessionStorage so it resets when the
   browser tab is closed, but persists across page refreshes
   within the same session.
   ================================================================ */
var loginAttempts = parseInt(sessionStorage.getItem('loginAttempts')) || 0;
var MAX_ATTEMPTS  = 3;


/* ================================================================
   HELPER FUNCTION: Update Attempts Display
   ================================================================
   Updates the on-screen warning showing how many attempts remain.
   ================================================================ */
function updateAttemptsDisplay() {
    if (!attemptWarning) return;

    var remaining = MAX_ATTEMPTS - loginAttempts;

    if (loginAttempts > 0 && loginAttempts < MAX_ATTEMPTS) {
        attemptWarning.innerHTML = '<span>Remaining attempts: ' + remaining + ' of ' + MAX_ATTEMPTS + '</span>';
        attemptWarning.classList.add('show');
    } else if (loginAttempts >= MAX_ATTEMPTS) {
        attemptWarning.innerHTML = '<span style="color:#d32f2f;">Account locked. Please reset your password.</span>';
        attemptWarning.classList.add('show');
    } else {
        attemptWarning.classList.remove('show');
    }
}


/* ================================================================
   HELPER FUNCTION: Get Registration Data
   ================================================================
   Retrieves the user array from localStorage key 'RegistrationData'.
   Uses JSON.parse() to convert the stored JSON string back to an array.
   ================================================================ */
function getRegistrationData() {
    var rawData = localStorage.getItem('RegistrationData');

    if (!rawData) {
        return [];
    }

    try {
        // JSON.parse() converts JSON string back to JavaScript array
        var parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Error parsing RegistrationData:', e);
        return [];
    }
}


/* ================================================================
   EVENT HANDLING: Form Submit Event
   ================================================================
   addEventListener attaches a function to run when an event occurs.
   The 'submit' event fires when user clicks Login or presses Enter.
   e.preventDefault() stops the page from reloading.
   ================================================================ */
loginForm.addEventListener('submit', function(e) {
    // Prevent the browser's default form submission (page reload)
    e.preventDefault();

    // Clear any previous error messages
    clearErrors();

    // Validate the form - if valid, try to log in
    if (validateLoginForm()) {
        attemptLogin();
    }
});


/* ================================================================
   EVENT HANDLING: Cancel Button
   ================================================================
   Question 1b (v): Cancel button clears data from the Login form.
   ================================================================ */
cancelBtn.addEventListener('click', function() {
    loginForm.reset();
    clearErrors();
});


/* ================================================================
   EVENT HANDLING: Blur Events (real-time validation)
   ================================================================
   The 'blur' event fires when a user leaves an input field.
   We validate as they fill out the form for immediate feedback.
   ================================================================ */
trnInput.addEventListener('blur', function() {
    validateTRN();
});

passwordInput.addEventListener('blur', function() {
    validatePassword();
});


/* ================================================================
   EVENT HANDLING: Focus Events (clear errors on re-entry)
   ================================================================
   The 'focus' event fires when user clicks into an input field.
   Clears the error so they can try again cleanly.
   ================================================================ */
trnInput.addEventListener('focus', function() {
    hideError(trnInput, trnError);
});

passwordInput.addEventListener('focus', function() {
    hideError(passwordInput, passwordError);
});


/* ================================================================
   EVENT HANDLING: TRN Auto-Format
   ================================================================
   Auto-formats TRN as user types: inserts dashes after digit 3
   and 6 so it matches the required format 000-000-000.
   ================================================================ */
trnInput.addEventListener('input', function() {
    // Strip everything that is not a digit
    var digits = this.value.replace(/\D/g, '');

    // Rebuild with dashes: 000-000-000
    if (digits.length > 6) {
        this.value = digits.substring(0,3) + '-' + digits.substring(3,6) + '-' + digits.substring(6,9);
    } else if (digits.length > 3) {
        this.value = digits.substring(0,3) + '-' + digits.substring(3,6);
    } else {
        this.value = digits;
    }
});


/* ================================================================
   FORM VALIDATION: Validate TRN
   ================================================================
   Question 1b (i): Login uses TRN in format 000-000-000.

   Rules:
   1. Cannot be empty
   2. Must match format 000-000-000 exactly (regex check)
   ================================================================ */
function validateTRN() {
    var trnValue = trnInput.value.trim();

    if (trnValue === '') {
        showError(trnInput, trnError, 'TRN is required');
        return false;
    }

    // Regex: exactly 3 digits, dash, 3 digits, dash, 3 digits
    var trnRegex = /^\d{3}-\d{3}-\d{3}$/;
    if (!trnRegex.test(trnValue)) {
        showError(trnInput, trnError, 'TRN must be in the format 000-000-000');
        return false;
    }

    hideError(trnInput, trnError);
    return true;
}


/* ================================================================
   FORM VALIDATION: Validate Password
   ================================================================
   Rules:
   1. Cannot be empty
   2. Must be at least 8 characters
   ================================================================ */
function validatePassword() {
    var pass = passwordInput.value;

    if (pass === '') {
        showError(passwordInput, passwordError, 'Password is required');
        return false;
    }

    if (pass.length < 8) {
        showError(passwordInput, passwordError, 'Password must be at least 8 characters');
        return false;
    }

    hideError(passwordInput, passwordError);
    return true;
}


/* ================================================================
   FORM VALIDATION: Validate Entire Login Form
   ================================================================
   Calls both field validators.
   Returns true only if ALL fields are valid.
   ================================================================ */
function validateLoginForm() {
    var isValid = true;

    if (!validateTRN())      isValid = false;
    if (!validatePassword()) isValid = false;

    return isValid;
}


/* ================================================================
   AUTHENTICATION: Attempt Login
   ================================================================
   Question 1b (ii): Validates the entered TRN and password against
   data stored in localStorage key 'RegistrationData'.

   Question 1b (iii): Visitor is given 3 attempts. If login is
   successful, redirect to the product catalog. Otherwise, after
   3 failed attempts, redirect to account-locked.html.
   ================================================================ */
function attemptLogin() {
    // Guard: if already locked before this attempt, redirect immediately
    if (loginAttempts >= MAX_ATTEMPTS) {
        window.location.href = 'account-locked.html';
        return;
    }

    var enteredTRN  = trnInput.value.trim();
    var enteredPass = passwordInput.value;

    // Question 1b (ii): Load users array from RegistrationData key
    var registeredUsers = getRegistrationData();

    var userFound   = false;
    var matchedUser = null;

    // FOR LOOP: Check each registered user for matching TRN + password
    for (var i = 0; i < registeredUsers.length; i++) {
        if (registeredUsers[i].trn === enteredTRN &&
            registeredUsers[i].password === enteredPass) {
            userFound   = true;
            matchedUser = registeredUsers[i];
            break;
        }
    }

    if (userFound) {
        // SUCCESS: reset attempt counter and redirect to products
        sessionStorage.removeItem('loginAttempts');
        loginAttempts = 0;
        updateAttemptsDisplay();
        loginSuccess(matchedUser);
    } else {
        // FAILED: increment counter
        loginAttempts++;
        sessionStorage.setItem('loginAttempts', loginAttempts);
        updateAttemptsDisplay();

        var attemptsLeft = MAX_ATTEMPTS - loginAttempts;

        // Question 1b (iii): After 3 failed attempts redirect to locked page
        if (loginAttempts >= MAX_ATTEMPTS) {
            showToast('Account locked. Too many failed attempts.', 'error');
            setTimeout(function() {
                window.location.href = 'account-locked.html';
            }, 1500);
        } else {
            loginFailed(attemptsLeft);
        }
    }
}


/* ================================================================
   LOGIN SUCCESS HANDLER
   ================================================================
   1. Creates a session object with user info
   2. Stores session in localStorage (key: seoulBiteSession)
      using JSON.stringify() to convert the object to a string
   3. Shows success toast message
   4. Redirects to products.html (the product catalogue)
   ================================================================ */
function loginSuccess(user) {
    // Build session object using firstName/lastName stored by register.js
    var session = {
        trn:        user.trn,
        firstName:  user.firstName,
        lastName:   user.lastName,
        email:      user.email,
        loggedInAt: new Date().toISOString()
    };

    // JSON.stringify() converts the object to a string for localStorage
    localStorage.setItem('seoulBiteSession', JSON.stringify(session));

    showToast('Login successful! Redirecting...', 'success');

    // Redirect to products.html - the product catalogue
    setTimeout(function() {
        window.location.href = 'products.html';
    }, 1500);
}


/* ================================================================
   LOGIN FAILED HANDLER
   ================================================================
   Shows error message with remaining attempts and shakes the form.
   ================================================================ */
function loginFailed(attemptsLeft) {
    var message = 'Invalid TRN or password. ';
    message    += attemptsLeft + ' attempt' + (attemptsLeft === 1 ? '' : 's') + ' remaining.';

    loginError.textContent = message;
    loginError.classList.add('show');

    // Shake animation as visual feedback
    loginForm.style.animation = 'shake 0.5s ease';
    setTimeout(function() {
        loginForm.style.animation = '';
    }, 500);
}


/* ================================================================
   SHOW ERROR FUNCTION
   ================================================================
   DOM MANIPULATION: Highlights a field and shows an error message.
   ================================================================ */
function showError(input, errorElement, message) {
    input.classList.add('input-error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}


/* ================================================================
   HIDE ERROR FUNCTION
   ================================================================
   DOM MANIPULATION: Removes error highlight and hides message.
   ================================================================ */
function hideError(input, errorElement) {
    input.classList.remove('input-error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}


/* ================================================================
   CLEAR ALL ERRORS FUNCTION
   ================================================================
   Clears all error messages. Called before re-validating.
   ================================================================ */
function clearErrors() {
    hideError(trnInput,      trnError);
    hideError(passwordInput, passwordError);
    loginError.textContent = '';
    loginError.classList.remove('show');
}


/* ================================================================
   PAGE LOAD CHECK
   ================================================================
   EVENT HANDLING: DOMContentLoaded fires once the HTML is ready.
   - If user is already logged in, redirect to products page.
   - If max attempts already exceeded, redirect to locked page.
   - Update the attempts display.
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    // Update attempts display on page load
    updateAttemptsDisplay();

    // Redirect if already logged in
    var session = localStorage.getItem('seoulBiteSession');
    if (session) {
        window.location.href = 'products.html';
        return;
    }

    // Redirect if already locked
    if (loginAttempts >= MAX_ATTEMPTS) {
        window.location.href = 'account-locked.html';
    }
});


console.log('Login.js loaded successfully');
