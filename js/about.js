/* 
   ================================================================
   ABOUT.JS - About Page JavaScript
   ================================================================
   This file handles:
   - Cart count display
   - Login/Logout link
   - Mobile menu toggle
   
   Developer: Dominic Appleton
   Student ID: 2102508
   ================================================================
*/


/* ================================================================
   PAGE LOAD EVENT
   ================================================================
   EVENT HANDLING: DOMContentLoaded fires when page is ready.
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    // Update cart count in navigation
    updateCartCountDisplay();
    
    // Update login/logout link
    updateAuthLink();
});


/* ================================================================
   MOBILE MENU TOGGLE
   ================================================================
   EVENT HANDLING: Toggle navigation menu visibility on mobile.
   ================================================================ */

// DOM MANIPULATION: Get menu elements
var menuToggle = document.getElementById('menu-toggle');
var navMenu = document.getElementById('nav-menu');

// EVENT HANDLING: Click event on menu button
menuToggle.addEventListener('click', function() {
    // DOM MANIPULATION: Toggle 'show' class
    navMenu.classList.toggle('show');
});


console.log('About.js loaded successfully');
