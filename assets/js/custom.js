
const imageBox = document.getElementById("imageBox");
const lens = document.getElementById("lens");
const zoomResult = document.getElementById("zoomResult");
const img = document.getElementById("mainImage") || document.getElementById("product-detail");
const filterButton = document.querySelector(".filter");
const categorySidebar = document.querySelector(".col-lg-3");

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

  const url = new URL('shop-single.html', window.location.href);
  url.searchParams.set('img', imageSrc);
  if (productName) url.searchParams.set('name', productName);
  if (productPrice) url.searchParams.set('price', productPrice);

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
  const titleEl = document.querySelector('.card-body h1.h2');
  const priceEl = document.querySelector('.card-body p.h3.py-2');
  const brandDisplay = document.getElementById('brand-display');

  if (imageParam && productDetail) {
    productDetail.src = imageParam;
    if (nameParam) productDetail.alt = nameParam;
    if (zoomResult) updateZoom(imageParam);
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

const categoria = "Zapatos";

document.getElementById("breadcrumb").innerHTML = `
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="/">Inicio</a></li>
      <li class="breadcrumb-item"><a href="/productos">Productos</a></li>
      <li class="breadcrumb-item active">${categoria}</li>
    </ol>
  </nav>
`;