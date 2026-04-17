/* 
   ================================================================
   LOGIN.JS - Login Page JavaScript
   ================================================================
   This file handles:
   - Login form validation with TRN (Tax Registration Number)
   - User authentication against localStorage RegistrationData
   - 3-attempt limit with account lockout
   - Password reset functionality by matching TRN
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
var trnInput = document.getElementById('trn');
var passwordInput = document.getElementById('password');

// Get references to error message elements
// We'll use these to show validation errors
var trnError = document.getElementById('trn-error');
var passwordError = document.getElementById('password-error');
var loginError = document.getElementById('login-error');

// Get reference to attempt warning element
var attemptWarning = document.getElementById('attempt-warning');

// Get reference to reset password link
var resetPasswordLink = document.getElementById('reset-password-link');

// Get reference to cancel button
var cancelBtn = document.getElementById('cancel-btn');


/* ================================================================
   ATTEMPT TRACKING VARIABLES
   ================================================================
   These variables track how many failed login attempts the user has made.
   Maximum attempts = 3 before account is locked.
   ================================================================ */
var ATTEMPTS_KEY = 'login_attempts_count';
var MAX_ATTEMPTS = 3;


/* ================================================================
   HELPER FUNCTION: Get Attempts
   ================================================================
   Retrieves the current number of failed attempts from sessionStorage.
   Uses JSON.parse() to convert the stored JSON string back to a number.
   ================================================================ */
function getAttempts() {
    var attemptsData = sessionStorage.getItem(ATTEMPTS_KEY);
    
    if (!attemptsData) {
        return 0;
    }
    
    try {
        // Use JSON.parse() to convert JSON string back to number
        return JSON.parse(attemptsData);
    } catch (e) {
        // Fallback to parseInt if JSON parsing fails
        return parseInt(attemptsData, 10) || 0;
    }
}


/* ================================================================
   HELPER FUNCTION: Increment Attempts
   ================================================================
   Increases the failed attempt counter by 1.
   Uses JSON.stringify() to store the number as a JSON string.
   ================================================================ */
function incrementAttempts() {
    var currentAttempts = getAttempts();
    var newAttempts = currentAttempts + 1;
    
    // Use JSON.stringify() to convert number to JSON string
    sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(newAttempts));
    
    return newAttempts;
}


/* ================================================================
   HELPER FUNCTION: Reset Attempts
   ================================================================
   Clears the failed attempt counter on successful login or password reset.
   ================================================================ */
function resetAttempts() {
    sessionStorage.removeItem(ATTEMPTS_KEY);
}


/* ================================================================
   HELPER FUNCTION: Is Account Locked
   ================================================================
   Checks if the account is locked due to too many failed attempts.
   Returns true if attempts >= 3, false otherwise.
   ================================================================ */
function isAccountLocked() {
    return getAttempts() >= MAX_ATTEMPTS;
}


/* ================================================================
   HELPER FUNCTION: Update Attempts Display
   ================================================================
   Updates the UI to show how many attempts remain.
   Shows a warning message when attempts are running low.
   ================================================================ */
function updateAttemptsDisplay() {
    var attemptsUsed = getAttempts();
    var remaining = Math.max(0, MAX_ATTEMPTS - attemptsUsed);
    
    if (attemptWarning) {
        if (remaining === 0) {
            attemptWarning.innerHTML = '<span style="color:#d32f2f;">⚠️ Too many failed attempts. Account temporarily locked. Please reset your password.</span>';
            attemptWarning.style.display = 'block';
        } else {
            attemptWarning.innerHTML = '<span> Remaining attempts: ' + remaining + ' of ' + MAX_ATTEMPTS + '</span>';
            attemptWarning.style.display = 'block';
        }
    }
}


/* ================================================================
   HELPER FUNCTION: Get Registration Data
   ================================================================
   Retrieves user registration data from localStorage.
   Uses JSON.parse() to convert the stored JSON string back to an array.
   
   The data is stored under the key 'RegistrationData'.
   ================================================================ */
function getRegistrationData() {
    var rawData = localStorage.getItem('RegistrationData');
    
    // If no data exists, return empty array
    if (!rawData) {
        return [];
    }
    
    try {
        // Use JSON.parse() to convert JSON string back to array/object
        var parsedData = JSON.parse(rawData);
        
        // Ensure we return an array
        if (Array.isArray(parsedData)) {
            return parsedData;
        }
        return [];
    } catch (e) {
        console.error('Error parsing RegistrationData with JSON.parse():', e);
        return [];
    }
}


/* ================================================================
   HELPER FUNCTION: Save Registration Data
   ================================================================
   Saves user registration data to localStorage.
   Uses JSON.stringify() to convert the array to a JSON string.
   ================================================================ */
function saveRegistrationData(data) {
    try {
        // Use JSON.stringify() to convert array to JSON string
        var jsonString = JSON.stringify(data);
        localStorage.setItem('RegistrationData', jsonString);
        return true;
    } catch (e) {
        console.error('Error stringifying RegistrationData with JSON.stringify():', e);
        return false;
    }
}


/* ================================================================
   HELPER FUNCTION: Validate Credentials
   ================================================================
   Checks if the provided TRN and password match any user in
   the RegistrationData stored in localStorage.
   
   Uses a FOR LOOP to iterate through the array of registered users.
   ================================================================ */
function validateCredentials(trn, password) {
    var registrations = getRegistrationData();
    
    if (!registrations.length) {
        return false;
    }
    
    // FOR LOOP: Check each registered user for a match
    for (var i = 0; i < registrations.length; i++) {
        var user = registrations[i];
        
        // Compare TRN (case-insensitive trim) and password
        if (user.trn && user.trn.toString().trim() === trn.toString().trim() &&
            user.password === password) {
            return true;
        }
    }
    
    return false;
}


/* ================================================================
   HELPER FUNCTION: Find User By TRN
   ================================================================
   Searches for a user in RegistrationData by their TRN.
   Returns the user object if found, null otherwise.
   ================================================================ */
function findUserByTRN(trn) {
    var registrations = getRegistrationData();
    
    for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].trn && registrations[i].trn.toString().trim() === trn.toString().trim()) {
            return registrations[i];
        }
    }
    
    return null;
}


/* ================================================================
   HELPER FUNCTION: Update User Password
   ================================================================
   Updates the password for a user identified by TRN.
   Uses findUserByTRN to locate the user, then saves the updated data.
   ================================================================ */
function updateUserPassword(trn, newPassword) {
    var registrations = getRegistrationData();
    var userFound = false;
    
    for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].trn && registrations[i].trn.toString().trim() === trn.toString().trim()) {
            registrations[i].password = newPassword;
            userFound = true;
            break;
        }
    }
    
    if (userFound) {
        return saveRegistrationData(registrations);
    }
    
    return false;
}


/* ================================================================
   TOAST NOTIFICATION FUNCTION
   ================================================================
   Shows a temporary popup message that fades away after 3 seconds.
   Used for success and error feedback.
   ================================================================ */
function showToast(message, isError) {
    var toast = document.getElementById('toast');
    
    if (!toast) {
        return;
    }
    
    toast.textContent = message;
    
    if (isError) {
        toast.style.backgroundColor = '#d32f2f';
    } else {
        toast.style.backgroundColor = '#2e7d32';
    }
    
    toast.style.opacity = '1';
    
    setTimeout(function() {
        toast.style.opacity = '0';
    }, 3000);
}


/* ================================================================
   REDIRECT FUNCTIONS
   ================================================================
   Handles navigation to different pages based on login outcome.
   ================================================================ */
function redirectToCatalog() {
    window.location.href = 'product-catalog.html';
}

function redirectToLockedPage() {
    window.location.href = 'error-locked.html';
}


/* ================================================================
   PASSWORD RESET FUNCTIONALITY
   ================================================================
   Allows user to reset their password by matching their TRN.
   
   Process:
   1. Prompt user for their TRN
   2. Search for matching TRN in RegistrationData
   3. If found, prompt for new password
   4. Update the password in localStorage
   5. Reset attempt counter
   ================================================================ */
function handlePasswordReset() {
    var trnToReset = prompt('Please enter your TRN to reset password:');
    
    if (!trnToReset || trnToReset.trim() === '') {
        showToast('TRN is required for password reset', true);
        return;
    }
    
    var registrations = getRegistrationData();
    
    if (!registrations.length) {
        showToast('No registered users found. Please register first.', true);
        return;
    }
    
    // Find user by TRN
    var userIndex = -1;
    for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].trn && registrations[i].trn.toString().trim() === trnToReset.trim()) {
            userIndex = i;
            break;
        }
    }
    
    if (userIndex === -1) {
        showToast('No account found with that TRN. Please check and try again.', true);
        return;
    }
    
    // Ask for new password
    var newPassword = prompt('Enter new password (minimum 4 characters):');
    
    if (!newPassword || newPassword.trim().length < 4) {
        showToast('Password must be at least 4 characters. Reset cancelled.', true);
        return;
    }
    
    var confirmPassword = prompt('Confirm new password:');
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match. Reset cancelled.', true);
        return;
    }
    
    // Update the password
    registrations[userIndex].password = newPassword;
    
    // Save back to localStorage using JSON.stringify()
    var saveSuccess = saveRegistrationData(registrations);
    
    if (saveSuccess) {
        // Reset attempts on successful password reset
        resetAttempts();
        updateAttemptsDisplay();
        
        showToast('Password successfully reset! You can now login with your new password.', false);
        
        // Clear form fields
        clearForm();
        clearErrors();
        
        console.log('Password reset successful. RegistrationData updated.');
    } else {
        showToast('Error saving new password. Please try again.', true);
    }
}


/* ================================================================
   CANCEL BUTTON FUNCTION
   ================================================================
   Clears all data from the login form when cancel button is clicked.
   ================================================================ */
function onCancel() {
    clearForm();
    clearErrors();
    showToast('Form cleared', false);
}


/* ================================================================
   CLEAR FORM FUNCTION
   ================================================================
   Resets all input fields in the login form to empty.
   ================================================================ */
function clearForm() {
    if (trnInput) trnInput.value = '';
    if (passwordInput) passwordInput.value = '';
}


/* ================================================================
   FORM VALIDATION: Validate TRN
   ================================================================
   Checks if TRN field is valid.
   
   Validation rules:
   1. Cannot be empty
   2. Must be at least 9 characters (minimum TRN length)
   
   Returns true if valid, false if invalid
   ================================================================ */
function validateTRN() {
    var trn = trnInput.value.trim();
    
    // VALIDATION: Check if field is empty
    if (trn === '') {
        showError(trnInput, trnError, 'TRN is required');
        return false;
    }
    
    // VALIDATION: Check minimum length
    if (trn.length < 9) {
        showError(trnInput, trnError, 'TRN must be at least 9 characters');
        return false;
    }
    
    // If we get here, TRN is valid
    hideError(trnInput, trnError);
    return true;
}


/* ================================================================
   FORM VALIDATION: Validate Password
   ================================================================
   Checks if password field is valid.
   
   Validation rules:
   1. Cannot be empty
   
   Returns true if valid, false if invalid
   ================================================================ */
function validatePassword() {
    var password = passwordInput.value;
    
    // VALIDATION: Check if empty
    if (password === '') {
        showError(passwordInput, passwordError, 'Password is required');
        return false;
    }
    
    hideError(passwordInput, passwordError);
    return true;
}


/* ================================================================
   FORM VALIDATION: Validate Entire Form
   ================================================================
   This function validates all form fields.
   Returns true if ALL fields are valid, false otherwise.
   ================================================================ */
function validateLoginForm() {
    var isValid = true;
    
    // Validate each field - if any fail, form is invalid
    if (!validateTRN()) {
        isValid = false;
    }
    
    if (!validatePassword()) {
        isValid = false;
    }
    
    return isValid;
}


/* ================================================================
   AUTHENTICATION: Attempt Login
   ================================================================
   Tries to find a matching user in RegistrationData.
   
   Features:
   - Checks if account is locked due to too many attempts
   - Validates TRN and password against localStorage data
   - Tracks failed attempts (max 3)
   - Redirects to product catalog on success
   - Redirects to locked page after 3 failed attempts
   ================================================================ */
function attemptLogin() {
    // Check if account is already locked
    if (isAccountLocked()) {
        loginError.textContent = 'Account locked due to multiple failed attempts. Redirecting to locked page...';
        loginError.classList.add('show');
        
        setTimeout(function() {
            redirectToLockedPage();
        }, 1500);
        return;
    }
    
    // Get the entered values
    var trn = trnInput.value.trim();
    var password = passwordInput.value;
    
    // Validate credentials against RegistrationData
    var credentialsValid = validateCredentials(trn, password);
    
    if (credentialsValid) {
        // SUCCESS: Reset attempts and redirect to catalog
        resetAttempts();
        updateAttemptsDisplay();
        
        // Get user info for session
        var user = findUserByTRN(trn);
        
        loginSuccess(user);
    } else {
        // Failed attempt - increment counter
        var newAttemptCount = incrementAttempts();
        updateAttemptsDisplay();
        
        var remaining = MAX_ATTEMPTS - newAttemptCount;
        
        if (newAttemptCount >= MAX_ATTEMPTS) {
            // Account now locked
            loginError.textContent = 'Invalid TRN or password. Three attempts exceeded. Redirecting to account locked page...';
            loginError.classList.add('show');
            
            setTimeout(function() {
                redirectToLockedPage();
            }, 2000);
        } else {
            // Show remaining attempts
            loginError.textContent = 'Invalid TRN or password. You have ' + remaining + ' attempt(s) remaining.';
            loginError.classList.add('show');
            showToast('Invalid credentials', true);
            
            // Add shake animation to the form (visual feedback)
            loginForm.style.animation = 'shake 0.5s ease';
            
            setTimeout(function() {
                loginForm.style.animation = '';
            }, 500);
        }
        
        // Clear password field for security
        passwordInput.value = '';
    }
}


/* ================================================================
   LOGIN SUCCESS HANDLER
   ================================================================
   Called when user successfully logs in.
   
   What it does:
   1. Creates a session object with user info
   2. Stores session in localStorage using JSON.stringify()
   3. Shows success message
   4. Redirects to product catalog page
   ================================================================ */
function loginSuccess(user) {
    // Create session object with user information
    var session = {
        trn: user.trn,
        email: user.email || '',
        fullName: user.fullName || user.name || 'User',
        loggedInAt: new Date().toISOString()
    };
    
    // Use JSON.stringify() to store session in localStorage
    localStorage.setItem('seoulBiteSession', JSON.stringify(session));
    
    // Show success message using toast
    showToast('Login successful! Redirecting to catalog...', false);
    
    // Redirect to product catalog page after 1.5 seconds
    setTimeout(function() {
        redirectToCatalog();
    }, 1500);
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
    hideError(trnInput, trnError);
    hideError(passwordInput, passwordError);
    
    if (loginError) {
        loginError.textContent = '';
        loginError.classList.remove('show');
    }
}


/* ================================================================
   EVENT HANDLING: Form Submit Event
   ================================================================
   addEventListener() attaches a function to run when an event occurs.
   
   The 'submit' event fires when user clicks the Login button
   or presses Enter in a form field.
   
   e.preventDefault() stops the form from submitting normally
   (which would reload the page).
   ================================================================ */
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        // Prevent the browser's default form submission behavior
        e.preventDefault();
        
        // Clear any previous error messages
        clearErrors();
        
        // Validate the form - if valid, try to log in
        if (validateLoginForm()) {
            attemptLogin();
        }
    });
}


/* ================================================================
   EVENT HANDLING: Blur Events
   ================================================================
   The 'blur' event fires when a user leaves an input field
   (clicks away or tabs to another field).
   
   We use this to validate fields as the user fills out the form.
   ================================================================ */

// When user leaves TRN field, validate it
if (trnInput) {
    trnInput.addEventListener('blur', function() {
        validateTRN();
    });
}

// When user leaves password field, validate it
if (passwordInput) {
    passwordInput.addEventListener('blur', function() {
        validatePassword();
    });
}


/* ================================================================
   EVENT HANDLING: Focus Events
   ================================================================
   The 'focus' event fires when a user clicks into an input field.
   
   We use this to clear error messages when user starts typing again.
   ================================================================ */

// When user clicks into TRN field, clear its error
if (trnInput) {
    trnInput.addEventListener('focus', function() {
        hideError(trnInput, trnError);
    });
}

// When user clicks into password field, clear its error
if (passwordInput) {
    passwordInput.addEventListener('focus', function() {
        hideError(passwordInput, passwordError);
    });
}


/* ================================================================
   EVENT HANDLING: Cancel Button
   ================================================================ */
if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        onCancel();
    });
}


/* ================================================================
   EVENT HANDLING: Reset Password Link
   ================================================================ */
if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        handlePasswordReset();
    });
}


/* ================================================================
   PAGE LOAD CHECK
   ================================================================
   EVENT HANDLING: DOMContentLoaded event
   
   This event fires when the HTML is fully loaded.
   We check if user is already logged in and redirect if so.
   Also updates attempt display.
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    // Update attempts display
    updateAttemptsDisplay();
    
    // Check if user is already logged in
    var session = localStorage.getItem('seoulBiteSession');
    
    if (session) {
        // User already logged in, redirect to product catalog
        window.location.href = 'product-catalog.html';
    }
    
    // Show locked message if account is locked
    if (isAccountLocked()) {
        loginError.textContent = 'Account temporarily locked due to multiple failed attempts. Please use "Reset Password" to recover.';
        loginError.classList.add('show');
    }
});


console.log('Login.js loaded successfully - TRN-based authentication with 3-attempt limit');

console.log('Login.js loaded successfully');
