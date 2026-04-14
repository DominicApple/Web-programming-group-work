/* 
   ================================================================
   LOGIN.JS - Login Page JavaScript
   ================================================================
   This file handles:
   - Login form validation
   - User authentication via TRN and password
   - 3 login attempts before account lock redirect
   - Session creation
   - Cancel button (clear form)
   - Reset Password link

   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   DOM ELEMENT REFERENCES
   ================================================================ */

// Get reference to the login form element
var loginForm = document.getElementById('login-form');

// Get references to the input fields (TRN replaces username)
var trnInput      = document.getElementById('trn');
var passwordInput = document.getElementById('password');

// Get references to error message elements
var trnError      = document.getElementById('trn-error');
var passwordError = document.getElementById('password-error');
var loginError    = document.getElementById('login-error');

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
   EVENT HANDLING: Form Submit Event
   ================================================================ */
loginForm.addEventListener('submit', function(e) {
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
   ================================================================ */
trnInput.addEventListener('blur', function() {
    validateTRN();
});

passwordInput.addEventListener('blur', function() {
    validatePassword();
});


/* ================================================================
   EVENT HANDLING: Focus Events (clear errors on re-entry)
   ================================================================ */
trnInput.addEventListener('focus', function() {
    hideError(trnInput, trnError);
});

passwordInput.addEventListener('focus', function() {
    hideError(passwordInput, passwordError);
});

/* Auto-format TRN as user types */
trnInput.addEventListener('input', function() {
    var digits = this.value.replace(/\D/g, '');
    if (digits.length > 6) {
        this.value = digits.substring(0,3) + '-' + digits.substring(3,6) + '-' + digits.substring(6,9);
    } else if (digits.length > 3) {
        this.value = digits.substring(0,3) + '-' + digits.substring(3,6);
    } else {
        this.value = digits;
    }
});


/* ================================================================
   FORM VALIDATION: Validate Entire Form
   ================================================================ */
function validateLoginForm() {
    var isValid = true;

    if (!validateTRN())      isValid = false;
    if (!validatePassword()) isValid = false;

    return isValid;
}


/* ================================================================
   FORM VALIDATION: Validate TRN
   ================================================================
   Question 1b (i): Login uses TRN (000-000-000 format).

   Rules:
   1. Cannot be empty
   2. Must match format 000-000-000
   ================================================================ */
function validateTRN() {
    var trnValue = trnInput.value.trim();

    if (trnValue === '') {
        showError(trnInput, trnError, 'TRN is required');
        return false;
    }

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
   AUTHENTICATION: Attempt Login
   ================================================================
   Question 1b (ii): Validate login data by checking the entered
   TRN and password against data in localStorage key RegistrationData.

   Question 1b (iii): Visitor is given 3 attempts. If login is
   successful, redirect to the product catalog. Otherwise, after
   3 failed attempts, redirect to the account locked page.
   ================================================================ */
function attemptLogin() {
    // Check if already at or over max attempts (edge case guard)
    if (loginAttempts >= MAX_ATTEMPTS) {
        window.location.href = 'account-locked.html';
        return;
    }

    var enteredTRN  = trnInput.value.trim();
    var enteredPass = passwordInput.value;

    // Question 1b (ii): Load users from RegistrationData key
    var registeredUsers = JSON.parse(localStorage.getItem('RegistrationData')) || [];

    var userFound   = false;
    var matchedUser = null;

    // FOR LOOP: Check each user in the RegistrationData array
    for (var i = 0; i < registeredUsers.length; i++) {
        if (registeredUsers[i].trn === enteredTRN &&
            registeredUsers[i].password === enteredPass) {
            userFound   = true;
            matchedUser = registeredUsers[i];
            break;
        }
    }

    if (userFound) {
        // Reset attempt counter on successful login
        sessionStorage.removeItem('loginAttempts');
        loginSuccess(matchedUser);
    } else {
        // Increment attempt counter
        loginAttempts++;
        sessionStorage.setItem('loginAttempts', loginAttempts);

        var attemptsLeft = MAX_ATTEMPTS - loginAttempts;

        // Question 1b (iii): After 3 failed attempts, redirect to locked page
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
   3. Shows success message
   4. Redirects to products page
   ================================================================ */
function loginSuccess(user) {
    var session = {
        trn:       user.trn,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        loggedInAt: new Date().toISOString()
    };

    // Store session in localStorage
    localStorage.setItem('seoulBiteSession', JSON.stringify(session));

    // Show success toast
    showToast('Login successful! Redirecting...', 'success');

    // Redirect to products page after 1.5 seconds
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
   ================================================================ */
function showError(input, errorElement, message) {
    input.classList.add('input-error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}


/* ================================================================
   HIDE ERROR FUNCTION
   ================================================================ */
function hideError(input, errorElement) {
    input.classList.remove('input-error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}


/* ================================================================
   CLEAR ALL ERRORS FUNCTION
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
   If user is already logged in, redirect to products page.
   Also redirect to locked page if max attempts already reached.
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    var session = localStorage.getItem('seoulBiteSession');
    if (session) {
        window.location.href = 'products.html';
        return;
    }

    // Redirect if max attempts already exceeded
    if (loginAttempts >= MAX_ATTEMPTS) {
        window.location.href = 'account-locked.html';
    }
});


console.log('Login.js loaded successfully');
