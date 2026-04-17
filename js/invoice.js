/*
   ================================================================
   INVOICE.JS - Invoice Display Page JavaScript
   ================================================================
   Q5: After checkout, generate an invoice with:
   - Name of company
   - Date of invoice
   - Shipping information (from checkout)
   - Invoice number (unique)
   - TRN
   - Purchased items (name, quantity, price, discount)
   - Taxes, Subtotal, Total cost

   This file reads the invoice from AllInvoices in localStorage
   using the invoice number passed in the URL query string.
   ================================================================
*/


/* ================================================================
   PAGE LOAD: Render invoice from URL parameter
   ================================================================ */
window.addEventListener('DOMContentLoaded', function() {
    updateAuthLink();
    updateCartCountDisplay();

    // Read invoice number from URL query string (?inv=INV-xxx)
    var params = new URLSearchParams(window.location.search);
    var invoiceNumber = params.get('inv');

    // If no param, try last invoice from localStorage
    if (!invoiceNumber) {
        invoiceNumber = localStorage.getItem('lastInvoiceNumber');
    }

    if (!invoiceNumber) {
        showNotFound();
        return;
    }

    // Q5(b): Retrieve invoice from AllInvoices in localStorage
    var allInvoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
    var invoice = null;

    // FOR LOOP: Search for matching invoice number
    for (var i = 0; i < allInvoices.length; i++) {
        if (allInvoices[i].invoiceNumber === invoiceNumber) {
            invoice = allInvoices[i];
            break;
        }
    }

    if (!invoice) {
        showNotFound();
        return;
    }

    renderInvoice(invoice);
});


/* ================================================================
   RENDER INVOICE FUNCTION
   ================================================================
   Q5(a): Populates the invoice template with all required fields.
   Uses DOM manipulation (innerHTML, textContent) to build the page.
   ================================================================ */
function renderInvoice(invoice) {
    // Show invoice container, hide not-found message
    document.getElementById('invoice-container').classList.remove('hidden');
    document.getElementById('invoice-not-found').classList.add('hidden');

    // Q5(a): Invoice number, date, order number
    document.getElementById('inv-number').textContent = invoice.invoiceNumber;
    document.getElementById('inv-date').textContent = formatInvoiceDate(invoice.dateOfInvoice);
    document.getElementById('inv-order').textContent = invoice.orderNumber || 'N/A';

    // Q5(a): Customer / shipping information
    document.getElementById('inv-customer').textContent = invoice.customerName || invoice.shipping.fullName;
    document.getElementById('inv-address').textContent = invoice.shipping.address;
    document.getElementById('inv-parish').textContent = invoice.shipping.parish + ', Jamaica';
    document.getElementById('inv-phone').textContent = invoice.shipping.phone;

    // Q5(a): TRN
    document.getElementById('inv-trn').textContent = invoice.trn || 'N/A';

    // Q5(a): Purchased items - build table rows
    var itemsHtml = '';
    var DISCOUNT_RATE = 0.10;

    // FOR LOOP: Build a row for each purchased item
    for (var i = 0; i < invoice.items.length; i++) {
        var item = invoice.items[i];
        // ARITHMETIC: Calculate item discount and line subtotal
        var lineSubtotal = item.price * item.quantity;
        var lineDiscount = lineSubtotal * DISCOUNT_RATE;
        var lineAfterDiscount = lineSubtotal - lineDiscount;

        itemsHtml += '<tr>' +
            '<td>' + item.name + '</td>' +
            '<td class="text-right">' + formatCurrency(item.price) + '</td>' +
            '<td class="text-right">' + item.quantity + '</td>' +
            '<td class="text-right text-green">-' + formatCurrency(lineDiscount) + '</td>' +
            '<td class="text-right">' + formatCurrency(lineAfterDiscount) + '</td>' +
        '</tr>';
    }

    // DOM MANIPULATION: Set table body HTML
    document.getElementById('inv-items').innerHTML = itemsHtml;

    // Q5(a): Taxes, subtotal, total
    document.getElementById('inv-subtotal').textContent = formatCurrency(invoice.subtotal);
    document.getElementById('inv-discount').textContent = '-' + formatCurrency(invoice.discount);
    document.getElementById('inv-tax').textContent = formatCurrency(invoice.taxes);
    document.getElementById('inv-delivery').textContent = invoice.deliveryFee === 0 ? 'FREE' : formatCurrency(invoice.deliveryFee);
    document.getElementById('inv-total').textContent = formatCurrency(invoice.total);
    document.getElementById('inv-payment').textContent = invoice.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card';
}


/* ================================================================
   SHOW NOT FOUND
   ================================================================ */
function showNotFound() {
    document.getElementById('invoice-not-found').classList.remove('hidden');
    document.getElementById('invoice-container').classList.add('hidden');
}


/* ================================================================
   FORMAT INVOICE DATE
   ================================================================
   Converts ISO timestamp to readable date string.
   ================================================================ */
function formatInvoiceDate(isoString) {
    var date = new Date(isoString);
    var months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}


console.log('Invoice.js loaded successfully');
