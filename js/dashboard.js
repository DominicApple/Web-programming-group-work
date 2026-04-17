/*
   ================================================================
   DASHBOARD.JS - Dashboard Page JavaScript
   ================================================================
   Q6: Additional Functionality

   Q6(a): ShowUserFrequency()
     - Show user frequency based on Gender and Age Group
     - Gender categories: Male, Female, Other
     - Age groups: 18-25, 26-35, 36-50, 50+
     - Display bar charts using DOM manipulation

   Q6(b): ShowInvoices()
     - Display all invoices from AllInvoices localStorage key
     - Allow search by TRN using console.log()

   Q6(c): GetUserInvoices()
     - Display all invoices for logged-in user
     - Uses TRN stored in RegistrationData
   ================================================================
*/


/* ================================================================
   PAGE LOAD
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    updateAuthLink();
    updateCartCountDisplay();

    // Load the default tab (User Frequency) on page load
    ShowUserFrequency();
});


/* ================================================================
   TAB SWITCHING
   ================================================================
   DOM MANIPULATION: Shows/hides tab sections and updates active tab.
   ================================================================ */
function switchTab(tabName) {
    // Hide all tab sections
    var sections = document.querySelectorAll('.tab-section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.add('hidden');
        sections[i].classList.remove('active');
    }

    // Remove active state from all tab buttons
    var buttons = document.querySelectorAll('.tab-btn');
    for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('active');
    }

    // Show selected section and mark button as active
    document.getElementById('section-' + tabName).classList.remove('hidden');
    document.getElementById('section-' + tabName).classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');

    // Load the relevant data for the selected tab
    if (tabName === 'frequency') {
        ShowUserFrequency();
    } else if (tabName === 'invoices') {
        ShowInvoices();
    } else if (tabName === 'my-invoices') {
        GetUserInvoices();
    }
}


/* ================================================================
   Q6(a): ShowUserFrequency()
   ================================================================
   Shows user frequency based on Gender and Age Group.

   Chart technique: Each bar is a <div> with a coloured inner bar
   whose width is set proportionally using inline style (similar to
   the img-stretching technique described in the assignment spec).
   The bar width is calculated as: (count / maxCount) * 100%
   ================================================================ */
function ShowUserFrequency() {
    // Q6(a): Read all registered users from RegistrationData
    var users = JSON.parse(localStorage.getItem('RegistrationData')) || [];

    // --- Gender Counts ---
    // Q6(a)(i): Count users per gender category
    var genderCounts = { Male: 0, Female: 0, Other: 0 };

    // FOR LOOP: Tally each user's gender
    for (var i = 0; i < users.length; i++) {
        var g = users[i].gender;
        if (g === 'Male') {
            genderCounts.Male++;
        } else if (g === 'Female') {
            genderCounts.Female++;
        } else {
            genderCounts.Other++;
        }
    }

    // --- Age Group Counts ---
    // Q6(a)(ii): Count users per age group
    var ageCounts = { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 };

    // FOR LOOP: Calculate each user's age and assign to group
    for (var k = 0; k < users.length; k++) {
        var age = calculateAge(users[k].dob);
        if (age >= 18 && age <= 25) {
            ageCounts['18-25']++;
        } else if (age >= 26 && age <= 35) {
            ageCounts['26-35']++;
        } else if (age >= 36 && age <= 50) {
            ageCounts['36-50']++;
        } else if (age > 50) {
            ageCounts['50+']++;
        }
    }

    console.log('ShowUserFrequency() - Gender counts:', genderCounts);
    console.log('ShowUserFrequency() - Age group counts:', ageCounts);

    // Render gender chart
    if (users.length === 0) {
        document.getElementById('gender-no-data').classList.remove('hidden');
        document.getElementById('age-no-data').classList.remove('hidden');
        document.getElementById('gender-chart').innerHTML = '';
        document.getElementById('age-chart').innerHTML = '';
        return;
    }

    document.getElementById('gender-no-data').classList.add('hidden');
    document.getElementById('age-no-data').classList.add('hidden');

    renderBarChart('gender-chart', genderCounts, ['#800020', '#c0392b', '#7f8c8d']);
    renderBarChart('age-chart', ageCounts, ['#1a5276', '#2980b9', '#3498db', '#85c1e9']);
}


/* ================================================================
   RENDER BAR CHART
   ================================================================
   Builds horizontal bar chart rows using DOM innerHTML.
   Bar width is a percentage of the maximum count (like the
   img-width stretching technique from the assignment spec).

   Parameters:
   - containerId: ID of the chart container div
   - data: object with { label: count } entries
   - colors: array of bar colors
   ================================================================ */
function renderBarChart(containerId, data, colors) {
    var container = document.getElementById(containerId);

    // Find maximum count for proportional scaling
    var maxCount = 0;
    var labels = Object.keys(data);
    for (var i = 0; i < labels.length; i++) {
        if (data[labels[i]] > maxCount) {
            maxCount = data[labels[i]];
        }
    }
    if (maxCount === 0) maxCount = 1; // Avoid division by zero

    var html = '';

    // FOR LOOP: Build one bar row per label
    for (var j = 0; j < labels.length; j++) {
        var label = labels[j];
        var count = data[label];
        // ARITHMETIC: width percentage = (count / maxCount) * 100
        var widthPercent = (count / maxCount) * 100;
        var color = colors[j % colors.length];

        html += '<div class="bar-row">' +
            '<span class="bar-label">' + label + '</span>' +
            '<div class="bar-track">' +
                // The bar div width is set proportionally (the img-stretch technique using width)
                '<div class="bar-fill" style="width:' + widthPercent + '%; background-color:' + color + ';"></div>' +
            '</div>' +
            '<span class="bar-count">' + count + '</span>' +
        '</div>';
    }

    // DOM MANIPULATION: Set the chart HTML
    container.innerHTML = html;
}


/* ================================================================
   CALCULATE AGE
   ================================================================
   ARITHMETIC: Calculates age in years from a date-of-birth string.
   ================================================================ */
function calculateAge(dobString) {
    if (!dobString) return 0;
    var birthDate = new Date(dobString);
    var today = new Date();
    // ARITHMETIC: Subtraction to find base age
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age = age - 1;
    }
    return age;
}


/* ================================================================
   Q6(b): ShowInvoices()
   ================================================================
   Displays all invoices stored in AllInvoices from localStorage.
   Also logs each invoice to console.log().
   Allows visitor to search by TRN.
   ================================================================ */
function ShowInvoices(filterTRN) {
    // Q6(b): Retrieve all invoices from AllInvoices key
    var allInvoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];

    console.log('ShowInvoices() - All invoices in AllInvoices:', allInvoices);

    var list = document.getElementById('invoices-list');
    var noData = document.getElementById('invoices-no-data');

    // Apply TRN filter if provided
    var filtered = allInvoices;
    if (filterTRN && filterTRN.trim() !== '') {
        filtered = [];
        // FOR LOOP: Filter invoices matching TRN
        for (var i = 0; i < allInvoices.length; i++) {
            if (allInvoices[i].trn === filterTRN.trim()) {
                filtered.push(allInvoices[i]);
            }
        }
        console.log('ShowInvoices() - Invoices for TRN "' + filterTRN + '":', filtered);
    }

    if (filtered.length === 0) {
        list.innerHTML = '';
        noData.classList.remove('hidden');
        return;
    }

    noData.classList.add('hidden');
    list.innerHTML = buildInvoiceTable(filtered);
}


/* ================================================================
   SEARCH BY TRN
   ================================================================
   Q6(b): Calls ShowInvoices() with TRN entered in search box.
   ================================================================ */
function searchByTRN() {
    var trnValue = document.getElementById('trn-search').value.trim();
    ShowInvoices(trnValue);
}


/* ================================================================
   CLEAR SEARCH
   ================================================================ */
function clearSearch() {
    document.getElementById('trn-search').value = '';
    ShowInvoices();
}


/* ================================================================
   Q6(c): GetUserInvoices()
   ================================================================
   Displays all invoices for the logged-in user.
   Retrieves TRN from the user record in RegistrationData.
   ================================================================ */
function GetUserInvoices() {
    var loginMsg = document.getElementById('my-invoices-login-msg');
    var noData = document.getElementById('my-invoices-no-data');
    var list = document.getElementById('my-invoices-list');

    // Check if user is logged in
    var session = JSON.parse(localStorage.getItem('seoulBiteSession'));
    if (!session) {
        loginMsg.classList.remove('hidden');
        noData.classList.add('hidden');
        list.innerHTML = '';
        return;
    }

    loginMsg.classList.add('hidden');

    // Q6(c): TRN is stored directly in the session (from login.js loginSuccess)
    var userTRN = session.trn || null;

    // Fallback: match by email in RegistrationData if TRN not in session
    if (!userTRN) {
        var registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
        for (var i = 0; i < registrationData.length; i++) {
            if (registrationData[i].email === session.email) {
                userTRN = registrationData[i].trn;
                break;
            }
        }
    }

    if (!userTRN) {
        noData.classList.remove('hidden');
        list.innerHTML = '';
        console.log('GetUserInvoices() - No TRN found for current user.');
        return;
    }

    // Q6(c): Get all invoices for this TRN from AllInvoices
    var allInvoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
    var userInvoices = [];

    // FOR LOOP: Filter by matching TRN
    for (var j = 0; j < allInvoices.length; j++) {
        if (allInvoices[j].trn === userTRN) {
            userInvoices.push(allInvoices[j]);
        }
    }

    console.log('GetUserInvoices() - TRN: ' + userTRN + ' | Invoices found:', userInvoices);

    if (userInvoices.length === 0) {
        noData.classList.remove('hidden');
        list.innerHTML = '';
        return;
    }

    noData.classList.add('hidden');
    list.innerHTML = buildInvoiceTable(userInvoices);
}


/* ================================================================
   BUILD INVOICE TABLE
   ================================================================
   Builds an HTML table from an array of invoice objects.
   Used by both ShowInvoices() and GetUserInvoices().
   ================================================================ */
function buildInvoiceTable(invoices) {
    var html = '<table class="inv-table">' +
        '<thead><tr>' +
            '<th>Invoice #</th>' +
            '<th>Date</th>' +
            '<th>Customer</th>' +
            '<th>TRN</th>' +
            '<th class="text-right">Total</th>' +
            '<th></th>' +
        '</tr></thead>' +
        '<tbody>';

    // FOR LOOP: Build one table row per invoice
    for (var i = 0; i < invoices.length; i++) {
        var inv = invoices[i];
        var date = new Date(inv.dateOfInvoice);
        var dateStr = date.toLocaleDateString('en-JM', { year: 'numeric', month: 'short', day: 'numeric' });

        html += '<tr>' +
            '<td><code>' + inv.invoiceNumber + '</code></td>' +
            '<td>' + dateStr + '</td>' +
            '<td>' + (inv.customerName || 'N/A') + '</td>' +
            '<td>' + (inv.trn || 'N/A') + '</td>' +
            '<td class="text-right"><strong>' + formatCurrency(inv.total) + '</strong></td>' +
            '<td><a href="invoice.html?inv=' + encodeURIComponent(inv.invoiceNumber) + '" class="btn btn-sm btn-gold">View</a></td>' +
        '</tr>';
    }

    html += '</tbody></table>';
    return html;
}


console.log('Dashboard.js loaded successfully');
