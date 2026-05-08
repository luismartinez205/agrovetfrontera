
const imageBox = document.getElementById("imageBox");
const lens = document.getElementById("lens");
const zoomResult = document.getElementById("zoomResult");
const img = document.getElementById("mainImage") || document.getElementById("product-detail");
const filterButton = document.querySelector(".filter");
const categorySidebar = document.querySelector(".col-lg-3");
const productList = document.getElementById("product-list");

let allProducts = [];

fetch("./product.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data.products;
    populateSuggestions();
  })
  .catch(() => {
    // Si no existe, no hacer nada
  });

function populateSuggestions() {
  const datalist = document.getElementById('navbarSearchSuggestions');
  if (!datalist) return;
  const suggestions = new Set();
  allProducts.forEach(p => {
    suggestions.add(p.name);
    suggestions.add(p.detail);
  });
  datalist.innerHTML = '';
  suggestions.forEach(s => {
    const option = document.createElement('option');
    option.value = s;
    datalist.appendChild(option);
  });
}

filterButton?.addEventListener("click", () => {
  if (categorySidebar) {
    const isVisible = categorySidebar.style.display === "block";
    categorySidebar.style.display = isVisible ? "none" : "block";    
  }
});
if (imageBox && lens && zoomResult && img) {
  const thumbnailImages = document.querySelectorAll("#multi-item-example img, .product-links-wap img, .col-4 img");
  const zoomFactor = 1.5; // Ajusta el factor de zoom según tus necesidades

  function getZoomSrc(sourceImage) {
    return sourceImage.dataset.zoom || sourceImage.src;
  }

  function updateZoom(src) {
    zoomResult.style.backgroundImage = `url(${src})`;
    zoomResult.style.backgroundSize = `${zoomFactor * 91}%`;
  }

  updateZoom(getZoomSrc(img));

  thumbnailImages.forEach((thumbnail) => {
    thumbnail.addEventListener("click", (event) => {
      event.preventDefault();
      const newSrc = getZoomSrc(thumbnail);
      img.src = newSrc;
      updateZoom(newSrc);
    });
  });

  imageBox.addEventListener("mouseenter", () => {
    lens.style.display = "block";
    zoomResult.style.display = "block";
  });

  imageBox.addEventListener("mouseleave", () => {
    lens.style.display = "none";
    zoomResult.style.display = "none";
  });

  imageBox.addEventListener("mousemove", moveLens);
}

function buildShopSingleUrl(imgEl) {
  const productCard = imgEl.closest('.product-wap');
  if (!productCard) return null;

  const imageSrc = imgEl.src;
  const productName = productCard.querySelector('.card-body a.h3')?.textContent.trim();
  const productPrice = productCard.querySelector('.card-body p.text-center')?.textContent.trim();
  const productCode = imgEl.dataset.code;

  const url = new URL('shop-single.html', window.location.href);
  url.searchParams.set('img', imageSrc);
  if (productName) url.searchParams.set('name', productName);
  if (productPrice) url.searchParams.set('price', productPrice);
  if (productCode) url.searchParams.set('code', productCode);

  return url.toString();
}

function applyShopImageLinks() {
  if (!window.location.pathname.endsWith('shop.html')) return;

  document.querySelectorAll('.product-wap .card-img').forEach((imgEl) => {
    const productUrl = buildShopSingleUrl(imgEl);
    if (!productUrl) return;

    imgEl.style.cursor = 'pointer';
    imgEl.addEventListener('click', () => {
      window.location.href = productUrl;
    });

    const links = imgEl.closest('.product-wap')?.querySelectorAll('a[href="shop-single.html"]');
    links?.forEach((link) => {
      link.href = productUrl;
    });
  });
}

function loadProductFromQuery() {
  if (!window.location.pathname.endsWith('shop-single.html')) return;

  const query = new URLSearchParams(window.location.search);
  const imageParam = query.get('img');
  const nameParam = query.get('name');
  const priceParam = query.get('price');

  const productDetail = document.getElementById('product-detail');
  const titleEl = document.querySelector('.card-body .h2');
  const priceEl = document.querySelector('.card-body .h3.py-2');
  const codeEl = document.getElementById('code');
  const brandDisplay = document.getElementById('brand-display');

  if (imageParam && productDetail) {
    productDetail.src = imageParam;
    if (nameParam) productDetail.alt = nameParam;
    if (zoomResult) updateZoom(imageParam);
  }

  if (codeEl) {
    const code = query.get('code') ;
    codeEl.textContent = code;
  }

  if (nameParam && titleEl) {
    titleEl.textContent = nameParam;
    
    // Extraer marca dinámicamente de la última palabra del nombre del producto
    const resultado = nameParam.match(/\w+$/);
    if (resultado && brandDisplay) {
      brandDisplay.textContent = resultado[0];
      console.log('Marca extraída:', resultado[0]);
    }
  }

  if (priceParam && priceEl) {
    priceEl.textContent = priceParam;
  }
}

applyShopImageLinks();
loadProductFromQuery();

function moveLens(e) {
  const rect = imageBox.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const lensSize = 90;

  let lensX = x - lensSize / 2;
  let lensY = y - lensSize / 2;

  // límites
  lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
  lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

  lens.style.left = lensX + "px";
  lens.style.top = lensY + "px";

  // cálculo del zoom
  const percentX = (lensX / rect.width) * 100;
  const percentY = (lensY / rect.height) * 100;

  zoomResult.style.backgroundPosition = `${percentX}% ${percentY}%`;
}

const categoria = "" + document.title.split(" - ")[0].trim();
const breadcrumbElement = document.getElementById("breadcrumb");
if (breadcrumbElement) {
  breadcrumbElement.innerHTML = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">Inicio</a></li>
        <li class="breadcrumb-item"><a href="/productos">Departamentos</a></li>
        <li class="breadcrumb-item active">${categoria}</li>
      </ol>
    </nav>
  `;
}

if (window.location.pathname.endsWith('shop.html') && productList) {
  fetch("./product.json")
    .then(res => res.json())
    .then(data => {
      let products = data.products;
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      const categoryParam = urlParams.get('category');
      if (query) {
        products = products.filter(p => {
          const name = (p.name || '').toLowerCase();
          const detail = (p.detail || '').toLowerCase();
          const queryLower = query.toLowerCase();
          return name.includes(queryLower) || detail.includes(queryLower);
        });
      }

      if (searchInputNavbar) {
        searchInputNavbar.value = query || '';
      }
      if (inputMobileSearch) {
        inputMobileSearch.value = query || '';
      }
      if (searchCategory && categoryParam) {
        searchCategory.value = categoryParam;
      }

      shopProducts = products.slice();
      mostrarProductos(products);
      initPriceFilter(products);
    })
    .catch(error => {
      console.error('Error cargando product.json:', error);
    });
}

function mostrarProductos(products) {
  if (!productList) return;

  productList.innerHTML = '';

  products.forEach(product => {
    productList.innerHTML += `
      <div class="col-md-3">
        <div class="card mb-4 product-wap rounded-0">
          <div class="card rounded-0">
            <img class="card-img rounded-0 img-fluid" src="${product.image}" alt="${product.name}" data-code="${product.code}">
            <div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
              <ul class="list-unstyled">
                <li><a class="btn btn-success text-white" href="shop-single.html"><i class="far fa-heart"></i></a></li>
                <li><a class="btn btn-success text-white mt-2" href="shop-single.html"><i class="far fa-eye"></i></a></li>
                <li><a class="btn btn-success text-white mt-2" href="shop-single.html"><i class="fas fa-cart-plus"></i></a></li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <a href="shop-single.html" class="h3 text-decoration-none">${product.name}</a>
            <ul class="w-100 list-unstyled d-flex justify-content-between mb-0">
              <li class="text-muted">${product.detail}</li>
              <li class="pt-2">
                <span class="product-color-dot color-dot-red float-left rounded-circle ml-1"></span>
                <span class="product-color-dot color-dot-blue float-left rounded-circle ml-1"></span>
                <span class="product-color-dot color-dot-black float-left rounded-circle ml-1"></span>
              </li>
            </ul>
            <ul class="list-unstyled d-flex justify-content-center mb-1">
              <li>
                <i class="text-warning fa fa-star"></i>
                <i class="text-warning fa fa-star"></i>
                <i class="text-warning fa fa-star"></i>
                <i class="text-muted fa fa-star"></i>
                <i class="text-muted fa fa-star"></i>
              </li>
            </ul>
            <p class="text-center mb-0">$${product.price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    `;
  });

  applyShopImageLinks();

  const itemsLabel = document.getElementById('items');
  if (itemsLabel) {
    itemsLabel.textContent = `Herramientas (${products.length})`;
  }
}

const searchButtonNavbar = document.getElementById('searchButtonNavbar');
const searchInputNavbar = document.getElementById('searchInputNavbar');
const inputMobileSearch = document.getElementById('inputMobileSearch');
const searchCategory = document.getElementById('searchCategory');

function performSearch(query, category = '') {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    console.warn('Búsqueda vacía');
    return;
  }
  const url = 'shop.html?q=' + encodeURIComponent(trimmedQuery) + (category ? '&category=' + encodeURIComponent(category) : '');
  console.log('Navegando a:', url);
  window.location.href = url;
}

// Buscar con botón navbar
if (searchButtonNavbar && searchInputNavbar) {
  searchButtonNavbar.addEventListener('click', function(e) {
    e.preventDefault();
    const query = searchInputNavbar.value;
    const category = searchCategory ? searchCategory.value : '';
    performSearch(query, category);
  });
}

// Buscar con Enter en navbar
if (searchInputNavbar) {
  searchInputNavbar.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const category = searchCategory ? searchCategory.value : '';
      performSearch(this.value, category);
    }
  });
}

// Buscar con Enter en mobile
if (inputMobileSearch) {
  inputMobileSearch.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(this.value);
    }
  });
}

const filtro = document.querySelector('.filter');

if (filtro) {
  filtro.innerHTML = 'Mostrar Filtros <i class="fa-solid fa-sliders"></i>';
  let isHidden = true;
  filtro.addEventListener('click', () => {
    const sidebar = document.querySelector('.col-lg-3');
    const mainContent = document.querySelector('.col-lg-9, .col-lg-12');

    if (sidebar) {
      isHidden = !isHidden;
      sidebar.style.display = isHidden ? 'none' : 'block';
      
      if (mainContent) {
        if (isHidden) {
          mainContent.classList.remove('col-lg-9');
          mainContent.classList.add('col-lg-12');
        } else {
          mainContent.classList.remove('col-lg-12');
          mainContent.classList.add('col-lg-9');
        }
      }
      
      filtro.innerHTML = '<i class="fa-solid fa-sliders" style="color: rgb(6, 6, 6);"></i> ' + (isHidden ? 'Mostrar Filtros' : 'Ocultar Filtros');
    }
  });
}


const formatPrice = (value) => {
  return Number(value).toLocaleString("es-PA");
}

let shopProducts = [];

function initPriceFilter(items) {
  const rangeInput = document.querySelectorAll(".range-input input");
  const progress = document.querySelector(".progress");
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  if (!rangeInput.length || !progress || !minPrice || !maxPrice) return;

  shopProducts = Array.isArray(items) ? items.slice() : [];
  if (!shopProducts.length) return;

  const prices = shopProducts.map(product => Number(product.price) || 0);
  const minValue = Math.min(...prices);
  const maxValue = Math.max(...prices);

  rangeInput[0].min = minValue;
  rangeInput[0].max = maxValue;
  rangeInput[0].step = 0.01;
  rangeInput[0].value = minValue;

  rangeInput[1].min = minValue;
  rangeInput[1].max = maxValue;
  rangeInput[1].step = 0.01;
  rangeInput[1].value = maxValue;

  minPrice.textContent = formatPrice(minValue);
  maxPrice.textContent = formatPrice(maxValue);
  progress.style.left = (minValue / rangeInput[0].max) * 100 + "%";
  progress.style.right = 100 - (maxValue / rangeInput[1].max) * 100 + "%";

  const minGap = Number(rangeInput[0].step) || 1;

  rangeInput.forEach(input => {
    input.addEventListener("input", () => {
      let minVal = parseFloat(rangeInput[0].value);
      let maxVal = parseFloat(rangeInput[1].value);
      const minBound = Number(rangeInput[0].min) || 0;
      const maxBound = Number(rangeInput[1].max) || maxVal;

      if (maxVal - minVal < minGap) {
        if (input.classList.contains("range-min")) {
          minVal = Math.max(maxVal - minGap, minBound);
          rangeInput[0].value = minVal;
        } else {
          maxVal = Math.min(minVal + minGap, maxBound);
          rangeInput[1].value = maxVal;
        }
      }

      minVal = Math.max(minVal, minBound);
      maxVal = Math.min(maxVal, maxBound);

      progress.style.left = (minVal / rangeInput[0].max) * 100 + "%";
      progress.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
      minPrice.innerText = formatPrice(minVal);
      maxPrice.innerText = formatPrice(maxVal);
      filterProducts(minVal, maxVal, getSelectedBrand());
    });
  });

  initBrandFilter(shopProducts);
  filterProducts(minValue, maxValue, "");
}

function filterProductsByPrice(minVal, maxVal) {
  const filtered = shopProducts.filter(product => {
    const price = Number(product.price);
    return price >= minVal && price <= maxVal;
  });
  mostrarProductos(filtered);
}

function filterProducts(minVal, maxVal, brand) {
  const filtered = shopProducts.filter(product => {
    const price = Number(product.price);
    const priceMatch = price >= minVal && price <= maxVal;
    const brandMatch = !brand || extractBrand(product.name) === brand;
    return priceMatch && brandMatch;
  });
  mostrarProductos(filtered);
}

function extractBrand(name) {
  const match = name.match(/\w+$/);
  return match ? match[0] : '';
}

function initBrandFilter(products) {
  const brandSelect = document.getElementById('brand-select');
  if (!brandSelect) return;

  const brands = new Set();
  products.forEach(product => {
    const brand = extractBrand(product.name);
    if (brand) brands.add(brand);
  });

  brandSelect.innerHTML = '<option value="">Todas las marcas</option>';
  Array.from(brands).sort().forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });

  brandSelect.addEventListener('change', () => {
    const rangeInput = document.querySelectorAll(".range-input input");
    const minVal = parseFloat(rangeInput[0].value);
    const maxVal = parseFloat(rangeInput[1].value);
    filterProducts(minVal, maxVal, brandSelect.value);
  });
}

function getSelectedBrand() {
  const brandSelect = document.getElementById('brand-select');
  return brandSelect ? brandSelect.value : '';
}



const feacturedSection = document.getElementById('featured');
if (feacturedSection) {
  fetch("./product.json")
    .then(res => res.json())
    .then(data => {
      const featuredProducts = data.products.filter(product => product.featured).slice(0, 3);
      featuredProducts.forEach((product, index) => {
        const card = feacturedSection.querySelectorAll('.col-12.col-md-3.mb-4')[index];
        if (!card) return;

        const imgEl = card.querySelector('img');
        const titleEl = card.querySelector('.card-body a.h2');
        const descEl = card.querySelector('.card-text');
        const priceEl = card.querySelector('.text-muted.text-right');

        if (imgEl) {
          imgEl.src = product.image;
          imgEl.alt = product.name;
          imgEl.dataset.zoom = product.image;
          imgEl.dataset.code = product.code;
        }

        if (titleEl) {
          titleEl.textContent = product.name;
        }

        if (descEl) {
          descEl.textContent = product.description;
        }

        if (priceEl) {
          priceEl.textContent = `$${Number(product.price).toFixed(2)}`;
        }
      });
    })
    .catch(error => {
      console.error('Error cargando productos destacados:', error);
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showLoginMessage(message) {
    let alert = document.getElementById('loginErrorMessage');
    if (!alert) {
      alert = document.createElement('div');
      alert.id = 'loginErrorMessage';
      alert.className = 'alert alert-danger mt-2';
      loginForm.prepend(alert);
    }
    alert.textContent = message;
    alert.classList.remove('d-none');
  }

  function hideLoginMessage() {
    const alert = document.getElementById('loginErrorMessage');
    if (alert) {
      alert.classList.add('d-none');
    }
  }

  function validateLoginFields() {
    let valid = true;

    if (emailInput) {
      const email = emailInput.value.trim();
      if (!emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        valid = false;
      } else {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
      }
    }

    if (passwordInput) {
      const password = passwordInput.value;
      if (password.length < 6) {
        passwordInput.classList.add('is-invalid');
        passwordInput.classList.remove('is-valid');
        valid = false;
      } else {
        passwordInput.classList.remove('is-invalid');
        passwordInput.classList.add('is-valid');
      }
    }

    if (!valid) {
      let message = '';
      if (emailInput && !emailRegex.test(emailInput.value.trim())) {
        message = 'Ingresa un correo válido.';
      } else if (passwordInput && passwordInput.value.length < 6) {
        message = 'La contraseña debe tener al menos 6 caracteres.';
      }
      showLoginMessage(message);
    } else {
      hideLoginMessage();
    }

    return valid;
  }

  loginForm.addEventListener('submit', function(e) {
    if (!validateLoginFields()) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  if (emailInput) {
    emailInput.addEventListener('input', validateLoginFields);
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', validateLoginFields);
  }
}



