/* 
   ================================================================
   REGISTER.JS - Registration Page JavaScript
   ================================================================
   This file handles:
   - Registration form validation
   - Email format validation using regex
   - Password matching validation
   - Age calculation from date of birth
   - Creating new user accounts
   
   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   DOM ELEMENT REFERENCES
   ================================================================
   DOM MANIPULATION: Getting references to form elements.
   ================================================================ */

// Get reference to the form
var form = document.getElementById('register-form');

// Get references to all input fields
var fullName = document.getElementById('fullName');
var email = document.getElementById('email');
var dob = document.getElementById('dob');
var phone = document.getElementById('phone');
var username = document.getElementById('username');
var password = document.getElementById('password');
var confirmPassword = document.getElementById('confirmPassword');


/* ================================================================
   EVENT HANDLING: Form Submit Event
   ================================================================
   Fires when user clicks Register button.
   Validates all fields before creating account.
   ================================================================ */
form.addEventListener('submit', function(e) {
    // Prevent default form submission (page reload)
    e.preventDefault();
    
    // Clear any previous errors
    clearErrors();
    
    // Validate form - if valid, register the user
    if (validateForm()) {
        registerUser();
    }
});


/* ================================================================
   EVENT HANDLING: Blur Events for Real-Time Validation
   ================================================================
   'blur' event fires when user leaves a field.
   This provides immediate feedback as user fills out form.
   ================================================================ */

// Validate full name when user leaves field
fullName.addEventListener('blur', validateFullName);

// Validate email when user leaves field
email.addEventListener('blur', validateEmail);

// Validate date of birth when user leaves field
dob.addEventListener('blur', validateDOB);

// Validate phone when user leaves field
phone.addEventListener('blur', validatePhone);

// Validate username when user leaves field
username.addEventListener('blur', validateUsername);

// Validate password when user leaves field
password.addEventListener('blur', validatePassword);

// Validate confirm password when user leaves field
confirmPassword.addEventListener('blur', validateConfirmPassword);


/* ================================================================
   VALIDATE ENTIRE FORM
   ================================================================
   Calls all individual validation functions.
   Returns true only if ALL fields are valid.
   ================================================================ */
function validateForm() {
    var isValid = true;
    
    // Call each validation function
    // If any returns false, form is invalid
    if (!validateFullName()) isValid = false;
    if (!validateEmail()) isValid = false;
    if (!validateDOB()) isValid = false;
    if (!validatePhone()) isValid = false;
    if (!validateUsername()) isValid = false;
    if (!validatePassword()) isValid = false;
    if (!validateConfirmPassword()) isValid = false;
    
    return isValid;
}


/* ================================================================
   FORM VALIDATION: Full Name
   ================================================================
   Rules:
   - Cannot be empty
   - Must be at least 2 characters
   ================================================================ */
function validateFullName() {
    // Get value and remove extra spaces
    var value = fullName.value.trim();
    
    // VALIDATION: Check if empty
    if (value === '') {
        showError('fullName', 'Full name is required');
        return false;
    }
    
    // VALIDATION: Check minimum length
    if (value.length < 2) {
        showError('fullName', 'Name must be at least 2 characters');
        return false;
    }
    
    hideError('fullName');
    return true;
}


/* ================================================================
   FORM VALIDATION: Email
   ================================================================
   Rules:
   - Cannot be empty
   - Must match email format (using Regular Expression)
   
   REGEX PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   Explanation:
   - ^        = Start of string
   - [^\s@]+  = One or more characters that are NOT space or @
   - @        = Literal @ symbol
   - [^\s@]+  = One or more characters that are NOT space or @
   - \.       = Literal dot (period)
   - [^\s@]+  = One or more characters that are NOT space or @
   - $        = End of string
   ================================================================ */
function validateEmail() {
    var value = email.value.trim();
    
    // VALIDATION: Check if empty
    if (value === '') {
        showError('email', 'Email is required');
        return false;
    }
    
    // VALIDATION: Check format using Regular Expression
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // test() returns true if value matches pattern
    if (!emailRegex.test(value)) {
        showError('email', 'Please enter a valid email address');
        return false;
    }
    
    hideError('email');
    return true;
}


/* ================================================================
   FORM VALIDATION: Date of Birth
   ================================================================
   Rules:
   - Cannot be empty
   - User must be at least 13 years old
   
   This demonstrates ARITHMETIC (age calculation).
   ================================================================ */
function validateDOB() {
    // VALIDATION: Check if empty
    if (dob.value === '') {
        showError('dob', 'Date of birth is required');
        return false;
    }
    
    // Create Date objects for comparison
    var birthDate = new Date(dob.value);
    var today = new Date();
    
    /* ============================================================
       AGE CALCULATION (ARITHMETIC)
       ============================================================
       Step 1: Subtract birth year from current year
       Step 2: Adjust if birthday hasn't occurred yet this year
       ============================================================ */
    
    // ARITHMETIC: Subtraction to get base age
    var age = today.getFullYear() - birthDate.getFullYear();
    
    // Get the month difference
    var monthDiff = today.getMonth() - birthDate.getMonth();
    
    // IF/ELSE: Adjust age if birthday hasn't occurred yet
    if (monthDiff < 0) {
        // Birthday month is later in the year
        // ARITHMETIC: Subtraction (decrement age by 1)
        age = age - 1;
    } else if (monthDiff === 0 && today.getDate() < birthDate.getDate()) {
        // Same month but day hasn't passed yet
        age = age - 1;
    }
    
    // VALIDATION: Check minimum age
    if (age < 13) {
        showError('dob', 'You must be at least 13 years old');
        return false;
    }
    
    hideError('dob');
    return true;
}


/* ================================================================
   FORM VALIDATION: Phone Number
   ================================================================
   Rules:
   - Cannot be empty
   - Must be 7-15 digits (after removing formatting)
   ================================================================ */
function validatePhone() {
    var value = phone.value.trim();
    
    // VALIDATION: Check if empty
    if (value === '') {
        showError('phone', 'Phone number is required');
        return false;
    }
    
    // Remove formatting characters (spaces, dashes, parentheses, plus)
    // replace() with regex removes all these characters
    var cleanPhone = value.replace(/[\s\-\(\)\+]/g, '');
    
    // VALIDATION: Check if 7-15 digits
    if (!/^\d{7,15}$/.test(cleanPhone)) {
        showError('phone', 'Please enter a valid phone number');
        return false;
    }
    
    hideError('phone');
    return true;
}


/* ================================================================
   FORM VALIDATION: Username
   ================================================================
   Rules:
   - Cannot be empty
   - Must be at least 3 characters
   - Must not already exist (check localStorage)
   ================================================================ */
function validateUsername() {
    var value = username.value.trim();
    
    // VALIDATION: Check if empty
    if (value === '') {
        showError('username', 'Username is required');
        return false;
    }
    
    // VALIDATION: Check minimum length
    if (value.length < 3) {
        showError('username', 'Username must be at least 3 characters');
        return false;
    }
    
    // VALIDATION: Check if username already exists
    var users = JSON.parse(localStorage.getItem('seoulBiteUsers')) || [];
    
    // FOR LOOP: Check each existing user
    for (var i = 0; i < users.length; i++) {
        // Case-insensitive comparison using toLowerCase()
        if (users[i].username.toLowerCase() === value.toLowerCase()) {
            showError('username', 'Username already taken');
            return false;
        }
    }
    
    hideError('username');
    return true;
}


/* ================================================================
   FORM VALIDATION: Password
   ================================================================
   Rules:
   - Cannot be empty
   - Must be at least 8 characters
   - Must contain both letters and numbers
   ================================================================ */
function validatePassword() {
    var value = password.value;
    
    // VALIDATION: Check if empty
    if (value === '') {
        showError('password', 'Password is required');
        return false;
    }
    
    // VALIDATION: Check minimum length
    if (value.length < 8) {
        showError('password', 'Password must be at least 8 characters');
        return false;
    }
    
    // VALIDATION: Check for letters and numbers
    // /[a-zA-Z]/ matches any letter (upper or lowercase)
    // /[0-9]/ matches any digit
    var hasLetters = /[a-zA-Z]/.test(value);
    var hasNumbers = /[0-9]/.test(value);
    
    if (!hasLetters || !hasNumbers) {
        showError('password', 'Password must contain letters and numbers');
        return false;
    }
    
    hideError('password');
    return true;
}


/* ================================================================
   FORM VALIDATION: Confirm Password
   ================================================================
   Rules:
   - Cannot be empty
   - Must match the password field
   ================================================================ */
function validateConfirmPassword() {
    // VALIDATION: Check if empty
    if (confirmPassword.value === '') {
        showError('confirmPassword', 'Please confirm your password');
        return false;
    }
    
    // VALIDATION: Check if passwords match
    if (confirmPassword.value !== password.value) {
        showError('confirmPassword', 'Passwords do not match');
        return false;
    }
    
    hideError('confirmPassword');
    return true;
}


/* ================================================================
   SHOW ERROR FUNCTION
   ================================================================
   DOM MANIPULATION: Displays error message for a field.
   ================================================================ */
function showError(fieldId, message) {
    // Get the error element for this field
    var errorEl = document.getElementById(fieldId + '-error');
    
    // Get the input element
    var input = document.getElementById(fieldId);
    
    // DOM MANIPULATION: Set error text and show it
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
    
    // DOM MANIPULATION: Add error styling to input
    if (input) {
        input.classList.add('input-error');
    }
}


/* ================================================================
   HIDE ERROR FUNCTION
   ================================================================
   DOM MANIPULATION: Hides error message for a field.
   ================================================================ */
function hideError(fieldId) {
    var errorEl = document.getElementById(fieldId + '-error');
    var input = document.getElementById(fieldId);
    
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }
    
    if (input) {
        input.classList.remove('input-error');
    }
}


/* ================================================================
   CLEAR ALL ERRORS FUNCTION
   ================================================================
   Clears all error messages on the form.
   ================================================================ */
function clearErrors() {
    var fields = ['fullName', 'email', 'dob', 'phone', 'username', 'password', 'confirmPassword'];
    
    // FOR LOOP: Clear error for each field
    for (var i = 0; i < fields.length; i++) {
        hideError(fields[i]);
    }
}


/* ================================================================
   REGISTER USER FUNCTION
   ================================================================
   Creates new user account and saves to localStorage.
   ================================================================ */
function registerUser() {
    // Create user object with form data
    var newUser = {
        id: 'USR' + Date.now(),
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        dob: dob.value,
        phone: phone.value.trim(),
        username: username.value.trim(),
        password: password.value,
        createdAt: new Date().toISOString()
    };
    
    // Get existing users from localStorage (or empty array)
    var users = JSON.parse(localStorage.getItem('seoulBiteUsers')) || [];
    
    // Add new user to array
    users.push(newUser);
    
    // Save updated array to localStorage
    localStorage.setItem('seoulBiteUsers', JSON.stringify(users));
    
    // Show success message
    showToast('Registration successful! Please login.', 'success');
    
    // Redirect to login page after 1.5 seconds
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1500);
}


console.log('Register.js loaded successfully');
