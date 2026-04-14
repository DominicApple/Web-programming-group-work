/* 
   ================================================================
   REGISTER.JS - Registration Page JavaScript
   ================================================================
   This file handles:
   - Registration form validation
   - Email format validation using regex
   - Password matching validation
   - Age calculation from date of birth (must be 18+)
   - TRN format and uniqueness validation (000-000-000)
   - Creating new user accounts stored in RegistrationData

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
var firstName       = document.getElementById('firstName');
var lastName        = document.getElementById('lastName');
var email           = document.getElementById('email');
var dob             = document.getElementById('dob');
var gender          = document.getElementById('gender');
var phone           = document.getElementById('phone');
var trn             = document.getElementById('trn');
var password        = document.getElementById('password');
var confirmPassword = document.getElementById('confirmPassword');

// Cancel button reference
var cancelBtn = document.getElementById('cancel-btn');


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
   EVENT HANDLING: Cancel Button
   ================================================================
   Question 1a (viii): Cancel button clears all data from the
   registration form.
   ================================================================ */
cancelBtn.addEventListener('click', function() {
    // Reset all form fields to blank/default
    form.reset();

    // Clear all error messages too
    clearErrors();
});


/* ================================================================
   EVENT HANDLING: Blur Events for Real-Time Validation
   ================================================================
   'blur' event fires when user leaves a field.
   This provides immediate feedback as user fills out form.
   ================================================================ */
firstName.addEventListener('blur',       validateFirstName);
lastName.addEventListener('blur',        validateLastName);
email.addEventListener('blur',           validateEmail);
dob.addEventListener('blur',             validateDOB);
gender.addEventListener('blur',          validateGender);
phone.addEventListener('blur',           validatePhone);
trn.addEventListener('blur',             validateTRN);
password.addEventListener('blur',        validatePassword);
confirmPassword.addEventListener('blur', validateConfirmPassword);

/* Auto-format TRN as user types (inserts dashes at positions 3 and 7) */
trn.addEventListener('input', function() {
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
   VALIDATE ENTIRE FORM
   ================================================================
   Calls all individual validation functions.
   Returns true only if ALL fields are valid.
   ================================================================ */
function validateForm() {
    var isValid = true;

    if (!validateFirstName())       isValid = false;
    if (!validateLastName())        isValid = false;
    if (!validateEmail())           isValid = false;
    if (!validateDOB())             isValid = false;
    if (!validateGender())          isValid = false;
    if (!validatePhone())           isValid = false;
    if (!validateTRN())             isValid = false;
    if (!validatePassword())        isValid = false;
    if (!validateConfirmPassword()) isValid = false;

    return isValid;
}


/* ================================================================
   FORM VALIDATION: First Name
   ================================================================
   Rules:
   - Cannot be empty
   - Must be at least 2 characters
   ================================================================ */
function validateFirstName() {
    var value = firstName.value.trim();

    if (value === '') {
        showError('firstName', 'First name is required');
        return false;
    }
    if (value.length < 2) {
        showError('firstName', 'First name must be at least 2 characters');
        return false;
    }

    hideError('firstName');
    return true;
}


/* ================================================================
   FORM VALIDATION: Last Name
   ================================================================
   Rules:
   - Cannot be empty
   - Must be at least 2 characters
   ================================================================ */
function validateLastName() {
    var value = lastName.value.trim();

    if (value === '') {
        showError('lastName', 'Last name is required');
        return false;
    }
    if (value.length < 2) {
        showError('lastName', 'Last name must be at least 2 characters');
        return false;
    }

    hideError('lastName');
    return true;
}


/* ================================================================
   FORM VALIDATION: Email
   ================================================================
   Rules:
   - Cannot be empty
   - Must match email format (Regular Expression)
   ================================================================ */
function validateEmail() {
    var value = email.value.trim();

    if (value === '') {
        showError('email', 'Email is required');
        return false;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
   - Visitor must be OVER 18 years old (Question 1a iv)

   AGE CALCULATION (ARITHMETIC):
   - Subtract birth year from current year
   - Adjust if birthday hasn't occurred yet this year
   ================================================================ */
function validateDOB() {
    // Question 1a (iv): visitor must be over 18 to register.
    // Calculate age using JavaScript.

    if (dob.value === '') {
        showError('dob', 'Date of birth is required');
        return false;
    }

    var birthDate = new Date(dob.value);
    var today     = new Date();

    // ARITHMETIC: Subtraction to get base age
    var age       = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth()    - birthDate.getMonth();

    // Adjust if birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age = age - 1;
    }

    // Must be at least 18
    if (age < 18) {
        showError('dob', 'You must be at least 18 years old to register');
        return false;
    }

    hideError('dob');
    return true;
}


/* ================================================================
   FORM VALIDATION: Gender
   ================================================================
   Rules:
   - A gender option must be selected
   ================================================================ */
function validateGender() {
    var value = gender.value;

    if (value === '') {
        showError('gender', 'Please select your gender');
        return false;
    }

    hideError('gender');
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

    if (value === '') {
        showError('phone', 'Phone number is required');
        return false;
    }

    var cleanPhone = value.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d{7,15}$/.test(cleanPhone)) {
        showError('phone', 'Please enter a valid phone number');
        return false;
    }

    hideError('phone');
    return true;
}


/* ================================================================
   FORM VALIDATION: TRN (Tax Registration Number)
   ================================================================
   Question 1a (v): TRN is unique; must be of length and in the
   format (000-000-000). TRN is used instead of username for login.

   Rules:
   - Cannot be empty
   - Must match format: exactly 3 digits, dash, 3 digits, dash, 3 digits
   - Must not already exist in RegistrationData
   ================================================================ */
function validateTRN() {
    var value = trn.value.trim();

    // VALIDATION: Check if empty
    if (value === '') {
        showError('trn', 'TRN is required');
        return false;
    }

    // VALIDATION: Must match 000-000-000 format exactly
    var trnRegex = /^\d{3}-\d{3}-\d{3}$/;
    if (!trnRegex.test(value)) {
        showError('trn', 'TRN must be in the format 000-000-000');
        return false;
    }

    // VALIDATION: Check if TRN already exists in RegistrationData
    // Question 1a (vi): data stored under localStorage key RegistrationData
    var users = JSON.parse(localStorage.getItem('RegistrationData')) || [];

    // FOR LOOP: Check each existing user for duplicate TRN
    for (var i = 0; i < users.length; i++) {
        if (users[i].trn === value) {
            showError('trn', 'This TRN is already registered');
            return false;
        }
    }

    hideError('trn');
    return true;
}


/* ================================================================
   FORM VALIDATION: Password
   ================================================================
   Question 1a (iii): Passwords should be at least 8 characters.

   Rules:
   - Cannot be empty
   - Must be at least 8 characters
   - Must contain both letters and numbers
   ================================================================ */
function validatePassword() {
    var value = password.value;

    if (value === '') {
        showError('password', 'Password is required');
        return false;
    }

    // Question 1a (iii): at least 8 characters long
    if (value.length < 8) {
        showError('password', 'Password must be at least 8 characters');
        return false;
    }

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
    if (confirmPassword.value === '') {
        showError('confirmPassword', 'Please confirm your password');
        return false;
    }

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
    var errorEl = document.getElementById(fieldId + '-error');
    var input   = document.getElementById(fieldId);

    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
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
    var input   = document.getElementById(fieldId);

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
    var fields = ['firstName', 'lastName', 'email', 'dob', 'gender',
                  'phone', 'trn', 'password', 'confirmPassword'];

    // FOR LOOP: Clear error for each field
    for (var i = 0; i < fields.length; i++) {
        hideError(fields[i]);
    }
}


/* ================================================================
   REGISTER USER FUNCTION
   ================================================================
   Question 1a (vi): Store registration information as a JavaScript
   object. Each record is appended to localStorage key
   'RegistrationData' as an array of objects.

   Stored fields: firstName, lastName, dob, gender, phone, email,
   trn, password, dateOfRegistration, cart{}, invoices[]
   ================================================================ */
function registerUser() {
    // Question 1a (vi): Build user object with all required fields
    var newUser = {
        id:                 'USR' + Date.now(),
        firstName:          firstName.value.trim(),
        lastName:           lastName.value.trim(),
        dob:                dob.value,
        gender:             gender.value,
        phone:              phone.value.trim(),
        email:              email.value.trim(),
        trn:                trn.value.trim(),
        password:           password.value,
        dateOfRegistration: new Date().toISOString(),
        cart:               {},      // Empty cart object (populated later)
        invoices:           []       // Empty invoices array (populated later)
    };

    // Retrieve existing users from RegistrationData (or start empty array)
    var users = JSON.parse(localStorage.getItem('RegistrationData')) || [];

    // Append new user to the array
    users.push(newUser);

    // Save updated array back to localStorage under key 'RegistrationData'
    localStorage.setItem('RegistrationData', JSON.stringify(users));

    // Show success message
    showToast('Registration successful! Please login.', 'success');

    // Redirect to login page after 1.5 seconds
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1500);
}


console.log('Register.js loaded successfully');
