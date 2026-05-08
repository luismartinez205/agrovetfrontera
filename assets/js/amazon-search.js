// Amazon-style search bar functionality
document.addEventListener('DOMContentLoaded', function() {
  // Search button and input handlers for navbar search
  const searchInputNavbar = document.getElementById('searchInputNavbar');
  const searchButtonNavbar = document.getElementById('searchButtonNavbar');
  const resetButtonNavbar = document.getElementById('resetButtonNavbar');
  const searchCategoryDropdown = document.getElementById('searchCategory');
  const inputMobileSearch = document.getElementById('inputMobileSearch');
  
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

  if (resetButtonNavbar) {
    resetButtonNavbar.addEventListener('click', function(e) {
      e.preventDefault();
      if (searchInputNavbar) searchInputNavbar.value = '';
      if (inputMobileSearch) inputMobileSearch.value = '';
      if (searchCategoryDropdown) searchCategoryDropdown.selectedIndex = 0;
      if (window.location.pathname.endsWith('shop.html')) {
        window.location.href = 'shop.html';
      }
    });
  }
  
  function performSearch() {
    const query = searchInputNavbar?.value.trim();
    const category = searchCategoryDropdown?.value.trim();
    if (query) {
      let url = 'shop.html?q=' + encodeURIComponent(query);
      if (category) {
        url += '&category=' + encodeURIComponent(category);
      }
      window.location.href = url;
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
