// File: app.js
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productList = document.getElementById('productList');

const API_BASE_URL = 'http://localhost:3000/api/products'; // Backend API URL

const searchForm = document.getElementById('searchForm');
const searchQueryInput = document.getElementById('searchQuery');
const searchResult = document.getElementById('searchResult');

// Search for a specific product
searchForm.addEventListener('submit', event => {
  event.preventDefault();

  // Extract the query from input
  const query = searchQuery.value.trim();
  if (!query) {
    alert('Please enter a valid search query.');
    return;
  }

  // Construct the query string
  const params = new URLSearchParams({ name: query });

  // Fetch product details
  fetch(`${API_BASE_URL}/search?name=${query}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('No products found');
      }
      return response.json();
    })
    .then(products => {
      searchResult.innerHTML = products.map(product => `
      <p><strong>Name:</strong> ${product.name}</p>
      <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
    `).join('');
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      searchResult.innerHTML = `<p style="color: red;">${error.message}</p>`;
    });
});


// Fetch all products from the backend
function fetchProducts() {
  fetch(API_BASE_URL)
    .then(response => response.json())
    .then(products => {
      productList.innerHTML = '';
      products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td class="actions">
            <button onclick="editProduct('${product._id}')">Edit</button>
            <button onclick="deleteProduct('${product._id}')">Delete</button>
          </td>
        `;
        productList.appendChild(row);
      });
    })
    .catch(error => console.error('Error fetching products:', error));
}

// Add or update a product
productForm.addEventListener('submit', event => {
  event.preventDefault();

  const productId = productIdInput.value;
  const name = productNameInput.value;
  const price = parseFloat(productPriceInput.value);

  const method = productId ? 'PUT' : 'POST';
  const url = productId ? `${API_BASE_URL}/${productId}` : API_BASE_URL;

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price })
  })
    .then(() => {
      alert(`Product ${productId ? 'updated' : 'added'} successfully!`);
      productForm.reset();
      fetchProducts();
    })
    .catch(error => console.error('Error saving product:', error));
});

// Edit a product
function editProduct(productId) {
  fetch(`${API_BASE_URL}/${productId}`)
    .then(response => response.json())
    .then(product => {
      productIdInput.value = product._id;
      productNameInput.value = product.name;
      productPriceInput.value = product.price;
    })
    .catch(error => console.error('Error fetching product:', error));
}

// Delete a product
function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  fetch(`${API_BASE_URL}/${productId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      alert('Product deleted successfully!');
      fetchProducts();
    })
    .catch(error => console.error('Error deleting product:', error));
}

// Initial fetch of products
fetchProducts();
