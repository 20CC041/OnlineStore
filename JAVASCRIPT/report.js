document.addEventListener('DOMContentLoaded', function() {
   
 
    const getTopCustomersBtn = document.getElementById('getTopCustomersBtn');
    getTopCustomersBtn.addEventListener('click', getTopCustomers);
});
 
function fetchCustomerReports() {
    fetch('https://firestore.googleapis.com/v1/projects/onlineshop-a90a1/databases/(default)/documents/Customer')
    .then(response => response.json())
    .then(data => {
        console.log('Customer Reports:', data);
    })
    .catch(error => {
        console.error('Error fetching customer reports:', error);
    });
}
 
function getTopCustomers() {
    fetch('https://firestore.googleapis.com/v1/projects/onlineshop-a90a1/databases/(default)/documents/Purchase', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        const orderCounts = {};
        if (data.documents) {
            data.documents.forEach(doc => {
                const customerId = doc.fields && doc.fields['Customer ID'] && doc.fields['Customer ID'].stringValue;
                if (customerId) {
                    orderCounts[customerId] = orderCounts[customerId] ? orderCounts[customerId] + 1 : 1;
                }
            });
 
            const topCustomers = Object.keys(orderCounts).sort((a, b) => orderCounts[b] - orderCounts[a]).slice(0, 10);
            displayTopCustomers(topCustomers, orderCounts);
        } else {
            console.error('No sales data found');
        }
    })
    .catch(error => {
        console.error('Error fetching sales data:', error);
    });
}
 
 
function displayTopCustomers(topCustomers, orderCounts) {
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Number of Orders</th>
            </tr>
        </thead>
        <tbody>
            ${topCustomers.map(customerId => `
                <tr id="customer_${customerId}">
                    <td>${customerId}</td>
                    <td id="fullname_${customerId}"></td>
                    <td id="email_${customerId}"></td>
                    <td>${orderCounts[customerId]}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
 
    const existingTable = document.getElementById('topCustomersTable');
    if (existingTable) {
        existingTable.parentNode.replaceChild(table, existingTable);
    } else {
        document.body.appendChild(table);
    }
 
    // Fetch customer details for each top customer
    topCustomers.forEach(customerId => {
        fetch(`https://firestore.googleapis.com/v1/projects/onlineshop-a90a1/databases/(default)/documents/Customer/${customerId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            const customer = data.fields;
            const nameElement = document.getElementById(`fullname_${customerId}`);
            const emailElement = document.getElementById(`email_${customerId}`);
            if (nameElement && emailElement) {
                nameElement.textContent = customer.fullName.stringValue || 'N/A'; // Handling undefined fullname
                emailElement.textContent = customer.email.stringValue || 'N/A'; // Handling undefined email
            }
        })
        .catch(error => {
            console.error(`Error fetching customer details for customer ID ${customerId}:`, error);
            // Remove the row if an error occurs while fetching customer details
            const row = document.getElementById(`customer_${customerId}`);
            if (row) {
                row.parentNode.removeChild(row);
            }
        });
    });
}