// ===== P2: 상품 상세 페이지 =====

const DetailPage = (() => {
  const FIXED_PRICE = 10000;
  const COUPON_RATE = 0.1;

  let currentProduct = null;
  let selectedOption = null;
  let quantity = 1;

  // ── 상품별 쿠폰 적용 상태 ──────────────────────────
  const getAppliedMap = () => {
    try { return JSON.parse(sessionStorage.getItem('coupon_applied_products') || '{}'); } catch { return {}; }
  };
  const setApplied = (productId, val) => {
    const map = getAppliedMap();
    map[productId] = val;
    sessionStorage.setItem('coupon_applied_products', JSON.stringify(map));
  };
  const isCouponApplied = (productId) => !!getAppliedMap()[productId];

  // 다운로드된 쿠폰 목록 (전역 공유 - 상품 무관)
  const getDownloaded = () => {
    try { return JSON.parse(sessionStorage.getItem('couponzone_downloaded') || '[]'); } catch { return []; }
  };

  const getCurrentPrice = () =>
    isCouponApplied(currentProduct.id)
      ? Math.floor(FIXED_PRICE * (1 - COUPON_RATE))
      : FIXED_PRICE;

  // ── 초기화 ──────────────────────────────────────────
  const init = async (params) => {
    const productId = params.id;
    const products = ListPage.getProducts();
    currentProduct = products.find((p) => p.id === productId);
    if (!currentProduct) { Router.navigate('list'); return; }
    selectedOption = currentProduct.options[0];
    quantity = 1;
    render();
    bindEvents();
    Router.updateCartBadge();
  };

  // ── 렌더 ────────────────────────────────────────────
  const render = () => {
    const p = currentProduct;
    const applied = isCouponApplied(p.id);
    const page = document.getElementById('page-detail');

    page.innerHTML = `
      <div class="header">
        <button class="header__back" id="detail-back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#111" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <span class="header__title"></span>
        <button class="header__action" onclick="Router.navigate('cart')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="#111" stroke-width="1.8"/>
            <path d="M16 10a4 4 0 01-8 0" stroke="#111" stroke-width="1.8"/>
          </svg>
          <span class="badge" id="cart-badge" style="display:none;">0</span>
        </button>
      </div>

      <div class="detail-img-wrap">
        <img src="${p.image}" alt="${p.name}"
          onerror="this.src='';this.parentNode.style.background='#f0f0f0';"
          style="width:100%;aspect-ratio:1;object-fit:cover;" />
      </div>

      <div class="detail-info">
        <p class="detail-brand">브랜드 ${p.brand}</p>
        <h1 class="detail-name">${p.name} ${p.capacity}</h1>
        <div class="detail-rating-row">
          <span style="color:var(--star);font-size:13px;">★★★★★</span>
          <strong>${p.rating}</strong>
          <span class="detail-review-count">(리뷰 ${p.reviewCount.toLocaleString()}개)</span>
        </div>
        <div class="detail-price-wrap" id="detail-price-wrap">
          ${priceHTML(applied)}
        </div>
        <!--
        <div class="detail-meta-row">
          ${Utils.shippingBadge(p.shipping)}
        </div>
        -->
      </div>

      <div class="divider"></div>

      <!-- 배송 토글 -->
      <div class="detail-delivery-toggle" id="delivery-toggle" onclick="DetailPage.toggleDelivery()">
        <span class="detail-delivery-label">배송 정보</span>
        <svg class="delivery-toggle-icon" id="delivery-toggle-icon" width="20" height="20" viewBox="0 0 12 12" fill="#999">
          <polygon points="2,2 10,2 6,10"/>
        </svg>
        <div class="detail-delivery-summary">
          <span class="detail-delivery-type-text">배송비 및 배송일자 관련 정보</span>
        </div>
        
      </div>
      <div class="detail-delivery-detail" id="delivery-detail" style="display:none;">
        <p class="detail-delivery-addr">- 배송 받을 주소 › <strong>우리집</strong></p>
        <p class="detail-delivery-note"></br>- ${p.shipping} </p>
      </div>

      <div class="divider"></div>

      <!-- 쿠폰 영역 -->
      <div class="detail-coupon-row" id="detail-coupon-row">
        ${couponRowHTML(applied)}
      </div>

      <div class="divider"></div>

      <!-- 수량 -->
      <div class="detail-section">
        <div class="quantity-row">
          <button class="qty-btn" id="qty-minus">−</button>
          <span class="qty-value" id="qty-value">1</span>
          <button class="qty-btn" id="qty-plus">+</button>
          <span class="qty-total" id="qty-total" style="margin-left:auto;font-size:16px;font-weight:800;color:var(--primary);"></span>
        </div>
      </div>

      <div style="height:100px;"></div>

      <div class="bottom-bar">
        <button class="btn btn-secondary" id="btn-cart" style="flex:1;">장바구니</button>
        <button class="btn btn-primary" id="btn-buy" style="flex:1.5;">구매하기</button>
      </div>

      <!-- 오버레이 -->
      <div class="overlay" id="overlay" onclick="DetailPage.closeCouponSheet()"></div>

      <!-- 쿠폰 바텀시트 -->
      <div class="bottom-sheet" id="coupon-sheet">
        <div class="bottom-sheet__handle"></div>
        <div id="coupon-sheet-content"></div>
      </div>
    `;
  };

  // ── 가격 HTML ────────────────────────────────────────
  const priceHTML = (applied) => {
    if (applied) {
      const discounted = Math.floor(FIXED_PRICE * (1 - COUPON_RATE));
      return `
        <div class="detail-price-row">
          <span class="detail-discount-rate">${COUPON_RATE * 100}%</span>
          <span class="detail-price">${discounted.toLocaleString()}원</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
          <span class="detail-original-price">${FIXED_PRICE.toLocaleString()}원</span>
          <span class="coupon-applied-tag">쿠폰 적용 ✓</span>
        </div>
      `;
    }
    return `
      <div class="detail-price-row">
        <span class="detail-price">${FIXED_PRICE.toLocaleString()}원</span>
      </div>
    `;
  };

  // ── 쿠폰 버튼 HTML ────────────────────────────────────
  const couponRowHTML = (applied) => {
    if (applied) {
      return `
        <span class="detail-coupon-label">쿠폰</span>
        <span class="detail-coupon-applied">10% 할인 쿠폰 적용 ✓</span>
      `;
    }
    return `
      <span class="detail-coupon-label">쿠폰</span>
      <button class="detail-coupon-btn" id="btn-open-coupon">쿠폰 적용 <span>›</span></button>
    `;
  };

  // ── 이벤트 바인딩 ────────────────────────────────────
  const bindEvents = () => {
    const p = currentProduct;

    document.getElementById('detail-back').addEventListener('click', () => Router.navigate('list'));

    document.getElementById('qty-minus').addEventListener('click', () => {
      if (quantity > 1) { quantity--; updateQtyDisplay(); }
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
      if (quantity < 99) { quantity++; updateQtyDisplay(); }
    });

    // 초기 금액 표시
    updateQtyDisplay();

    document.getElementById('btn-cart').addEventListener('click', () => {
      State.addToCart(p, selectedOption, quantity, getCurrentPrice());
      Router.updateCartBadge();
      Utils.showToast('장바구니에 담겼습니다 🛒');
      setTimeout(() => Router.navigate('list'), 900);
    });

    document.getElementById('btn-buy').addEventListener('click', () => {
      State.addToCart(p, selectedOption, quantity, getCurrentPrice());
      Router.navigate('checkout', { productId: p.id, qty: quantity });
    });

    const couponBtn = document.getElementById('btn-open-coupon');
    if (couponBtn) {
      couponBtn.addEventListener('click', () => {
        openCouponSheet();
      });
    }
  };

  // ── 쿠폰 바텀시트 열기 ───────────────────────────────
  const openCouponSheet = () => {
    renderCouponSheet();
    document.getElementById('overlay').classList.add('show');
    document.getElementById('coupon-sheet').classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  const closeCouponSheet = () => {
    const overlay = document.getElementById('overlay');
    const sheet   = document.getElementById('coupon-sheet');
    if (overlay) overlay.classList.remove('show');
    if (sheet)   sheet.classList.remove('show');
    document.body.style.overflow = '';
  };

  // ── 쿠폰 바텀시트 렌더 ──────────────────────────────
  const renderCouponSheet = () => {
    const downloaded = getDownloaded();
    const hasCoupon  = downloaded.includes('COUPON_10PCT');
    const hasAny     = downloaded.length > 0;
    const content    = document.getElementById('coupon-sheet-content');

    if (!hasAny) {
      // 다운받은 쿠폰이 아예 없는 경우
      content.innerHTML = `
        <div class="coupon-sheet-header">
          <div>
            <h3>쿠폰 적용</h3>
          </div>
          <button onclick="DetailPage.closeCouponSheet()"
            style="font-size:22px;color:#999;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div class="coupon-empty-state">
          <p class="coupon-empty-text">적용 가능한 쿠폰이 없습니다</p>
          <button class="btn btn-primary coupon-goto-btn"
            onclick="DetailPage.goToCouponZone()">
            쿠폰 다운받으러 가기
          </button>
        </div>
      `;
    } else {
      // 다운받은 쿠폰이 하나라도 있는 경우
      const allCoupons = CouponZonePage.getCoupons();
      const applied = isCouponApplied(currentProduct.id);

      content.innerHTML = `
        <div class="coupon-sheet-header">
          <div>
            <h3>쿠폰 적용</h3>
            <p style="font-size:13px;color:#999;margin-top:2px;">보유 쿠폰 ${downloaded.length}개</p>
          </div>
          <button onclick="DetailPage.closeCouponSheet()"
            style="font-size:22px;color:#999;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div class="coupon-apply-list">
          ${allCoupons.filter(c => downloaded.includes(c.id)).map(c => {
            const canApply = c.id === 'COUPON_10PCT';
            const isApplied = applied && canApply;
            return `
              <div class="coupon-apply-item ${!canApply ? 'disabled' : ''}">
                <div class="coupon-apply-item__left">
                  <span class="coupon-apply-item__amount ${!canApply ? 'muted' : ''}">${c.label}</span>
                  <span class="coupon-apply-item__name">${c.name}</span>
                  <span class="coupon-apply-item__desc">${c.desc}</span>
                  <span class="coupon-apply-item__expire">~ ${c.expire}</span>
                </div>
                <div class="coupon-apply-item__right">
                  ${canApply
                    ? (isApplied
                        ? `<span class="coupon-status applied">적용됨</span>`
                        : `<button class="coupon-apply-action-btn" onclick="DetailPage.applyCoupon('${c.id}')">적용</button>`)
                    : `<span class="coupon-status disabled">적용불가</span>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="padding:12px 16px 16px;display:flex;gap:8px;">
          <button class="btn btn-secondary" style="flex:1;" onclick="DetailPage.closeCouponSheet()">닫기</button>
          ${!hasCoupon ? `
            <button class="btn btn-primary" style="flex:1;" onclick="DetailPage.goToCouponZone()">쿠폰 받으러 가기</button>
          ` : ''}
        </div>
      `;
    }
  };

  // 쿠폰 적용
  const applyCoupon = (couponId) => {
    if (couponId !== 'COUPON_10PCT') return;
    setApplied(currentProduct.id, true);
    document.getElementById('detail-price-wrap').innerHTML = priceHTML(true);
    document.getElementById('detail-coupon-row').innerHTML = couponRowHTML(true);
    closeCouponSheet();
    updateQtyDisplay();
    Utils.showToast('10% 할인 쿠폰이 적용되었습니다 🎉');
  };

  // 쿠폰존으로 이동 (상품 ID 저장)
  const goToCouponZone = () => {
    sessionStorage.setItem('coupon_from_product', currentProduct.id);
    closeCouponSheet();
    Router.navigate('main', { via: 'coupon' });
  };

  // ── 배송 토글 ────────────────────────────────────────
  const toggleDelivery = () => {
    const detail = document.getElementById('delivery-detail');
    const icon   = document.getElementById('delivery-toggle-icon');
    const isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
    icon.style.transform  = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  };

  // ── 수량/금액 표시 업데이트 ─────────────────────────
  const updateQtyDisplay = () => {
    document.getElementById('qty-value').textContent = quantity;
    const totalEl = document.getElementById('qty-total');
    if (totalEl) {
      totalEl.textContent = (getCurrentPrice() * quantity).toLocaleString() + '원';
    }
  };

  return { init, closeCouponSheet, applyCoupon, goToCouponZone, toggleDelivery };
})();