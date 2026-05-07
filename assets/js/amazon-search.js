// Amazon-style search bar functionality
document.addEventListener('DOMContentLoaded', function() {
  // Search button and input handlers for navbar search
  const searchInputNavbar = document.getElementById('searchInputNavbar');
  const searchButtonNavbar = document.getElementById('searchButtonNavbar');
  const searchCategoryDropdown = document.getElementById('searchCategory');
  
  // Handle navbar search form submission
  if (searchButtonNavbar) {
    searchButtonNavbar.addEventListener('click', function(e) {
      e.preventDefault();
      performSearch();
    });
  }
  
  if (searchInputNavbar) {
    searchInputNavbar.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }
  
  function performSearch() {
    const query = searchInputNavbar?.value.trim();
    if (query) {
      window.location.href = 'shop.html?q=' + encodeURIComponent(query);
    }
  }
  
  // Update navbar suggestions
  function updateNavbarSuggestions(allProducts) {
    const navbarSuggestions = document.getElementById('navbarSearchSuggestions');
    if (!navbarSuggestions) return;
    
    const suggestions = new Set();
    allProducts.forEach(p => {
      if (p.name) suggestions.add(p.name);
      if (p.detail) suggestions.add(p.detail);
    });
    
    navbarSuggestions.innerHTML = '';
    suggestions.forEach(s => {
      const option = document.createElement('option');
      option.value = s;
      navbarSuggestions.appendChild(option);
    });
  }
  
  // Load products and update suggestions
  fetch('./product.json')
    .then(res => res.json())
    .then(data => {
      if (data.products) {
        updateNavbarSuggestions(data.products);
      }
    })
    .catch(err => console.log('Could not load product suggestions'));
});
