// ===== P2: 상품 상세 페이지 =====

const DetailPage = (() => { 
  const COUPON_RATE = 0.1;

  // 상품별 쿠폰 경로 강도
  // 강도1(p006): 상세 → 쿠폰존 → 상세
  // 강도2(그 외): 상세 → 메인 → 쿠폰존 → 상세
  // 강도3(p004): 상세 → 메인 → 쿠폰존 → 리스트 → 상세
  const COUPON_LEVEL = {
    'p006': 1,
    'p004': 3,
  };

  let currentProduct = null;
  let selectedOption = null;
  let quantity = 1;

  // 쿠폰 적용 여부 (상품별, list.js의 coupon_applied_products와 공유)
  const getCouponApplied = () => {
    try {
      const map = JSON.parse(sessionStorage.getItem('coupon_applied_products') || '{}');
      return !!map[currentProduct?.id];
    } catch { return false; }
  };
  const setCouponApplied = () => {
    try {
      const map = JSON.parse(sessionStorage.getItem('coupon_applied_products') || '{}');
      map[currentProduct.id] = true;
      sessionStorage.setItem('coupon_applied_products', JSON.stringify(map));
    } catch (e) { console.warn('setCouponApplied 실패:', e); }
  };

  // ── 다운로드된 쿠폰 목록 (현재 상품 기준) ──
  const getDownloaded = () => {
    try {
      const map = JSON.parse(sessionStorage.getItem('couponzone_downloaded') || '{}');
      return map[currentProduct?.id] || [];
    } catch { return []; }
  };

  // 상품의 기준 가격 (originalPrice 사용)
  const getBasePrice = () => currentProduct.originalPrice;

  const getCurrentPrice = () => {
    if (getCouponApplied()) return Math.floor(getBasePrice() * (1 - COUPON_RATE));
    return getBasePrice();
  };

  // ── 초기화 ──────────────────────────────────────────
  const init = async (params) => {
    const productId = params.id;
    const products = ListPage.getProducts();
    currentProduct = products.find((p) => p.id === productId);
    if (!currentProduct) { Router.navigate('list'); return; }
    selectedOption = currentProduct.options[0];
    quantity = 1;

    // 쿠폰존이 현재 상품 기준으로 저장/조회하도록 컨텍스트 세팅
    sessionStorage.setItem('coupon_from_product', currentProduct.id);

    render();
    bindEvents();
    Router.updateCartBadge();

    // 쿠폰존 복귀 시 바텀시트 자동 오픈
    const returnFlag = sessionStorage.getItem('coupon_return_open');
    if (returnFlag === currentProduct.id) {
      sessionStorage.removeItem('coupon_return_open');
      setTimeout(() => openCouponSheet(), 300);
    }
  };

  // ── 렌더 ────────────────────────────────────────────
  const render = () => {
    const p = currentProduct;
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
        <div class="detail-name-row">
          <h1 class="detail-name">${p.name} ${p.capacity}</h1>
          <span class="detail-per-unit">(${p.pricePerUnit})</span>
        </div>
        <div class="detail-price-wrap" id="detail-price-wrap">
          ${getCouponApplied() ? `
          <div class="detail-price-row">
            <span class="detail-discount-rate">${COUPON_RATE * 100}%</span>
            <span class="detail-price">${Math.floor(p.originalPrice * (1 - COUPON_RATE)).toLocaleString()}원</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
            <span class="detail-original-price">${p.originalPrice.toLocaleString()}원</span>
            <span class="coupon-applied-tag">쿠폰 적용 ✓</span>
          </div>
          ` : `
          <div class="detail-price-row">
            <span class="detail-price">${p.originalPrice.toLocaleString()}원</span>
          </div>
          `}
        </div>
      </div>

      <div class="divider"></div>

      <!-- 쿠폰 영역 -->
      <div class="detail-coupon-row" id="detail-coupon-row">
        <span class="detail-coupon-label">쿠폰</span>
        <button class="detail-coupon-btn" id="btn-open-coupon"><span>✅</span> 쿠폰 적용하기</button>
      </div>

      <div class="divider"></div>

      <div class="detail-delivery-row">
        <span class="detail-delivery-label">배송 정보</span>
        <div class="detail-delivery-info">
          <p class="detail-delivery-addr">- 배송 받을 주소 › <strong>우리집</strong></p>
          <p class="detail-delivery-note">- ${p.shipping}</p>
        </div>
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
      couponBtn.addEventListener('click', () => openCouponSheet());
    }
  };

  // ── 쿠폰 바텀시트 열기/닫기 ─────────────────────────
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
    const hasAny     = downloaded.length > 0;
    const content    = document.getElementById('coupon-sheet-content');

    if (!hasAny) {
      // 적용 가능 쿠폰 없음
      content.innerHTML = `
        <div class="coupon-sheet-header">
          <div><h3>쿠폰 적용</h3></div>
          <button onclick="DetailPage.closeCouponSheet()"
            style="font-size:22px;color:#999;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div class="coupon-empty-state">
          <p class="coupon-empty-text">적용 가능한 쿠폰이 없습니다</p>
          <button class="btn btn-primary coupon-goto-btn" onclick="DetailPage.goToCouponZone()">
            쿠폰 다운받으러 가기
          </button>
        </div>
      `;
    } else {
      // 쿠폰 보유 - 리스트 표시 + 항상 "쿠폰 받으러 가기" 버튼
      const allCoupons = CouponZonePage.getCoupons();
      const myCoupons  = allCoupons.filter(c => downloaded.includes(c.id));

      content.innerHTML = `
        <div class="coupon-sheet-header">
          <div>
            <h3>쿠폰 적용</h3>
            <p style="font-size:13px;color:#999;margin-top:2px;">보유 쿠폰 ${myCoupons.length}개</p>
          </div>
          <button onclick="DetailPage.closeCouponSheet()"
            style="font-size:22px;color:#999;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div class="coupon-apply-list">
          ${myCoupons.map(c => {
            const canApply = c.id === 'COUPON_10PCT';
            return `
              <div class="coupon-apply-item ${!canApply ? 'disabled' : ''}" id="coupon-item-${c.id}">
                <div class="coupon-apply-item__left">
                  <span class="coupon-apply-item__amount ${!canApply ? 'muted' : ''}">${c.label}</span>
                  <span class="coupon-apply-item__name">${c.name}</span>
                  <span class="coupon-apply-item__desc">${c.desc}</span>
                  <span class="coupon-apply-item__expire">~ ${c.expire}</span>
                </div>
                <div class="coupon-apply-item__right" id="coupon-action-${c.id}">
                  ${canApply
                    ? (getCouponApplied()
                        ? `<span class="coupon-status applied">적용됨 ✓</span>`
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
          <button class="btn btn-primary" style="flex:1;" onclick="DetailPage.goToCouponZone()">쿠폰 받으러 가기</button>
        </div>
      `;
    }
  };

  // ── 쿠폰 적용 ───────────────────────────────────────
  const applyCoupon = (couponId) => {
    if (couponId !== 'COUPON_10PCT') return;
    const basePrice  = getBasePrice();
    const discounted = Math.floor(basePrice * (1 - COUPON_RATE));

    document.getElementById('detail-price-wrap').innerHTML = `
      <div class="detail-price-row">
        <span class="detail-discount-rate">${COUPON_RATE * 100}%</span>
        <span class="detail-price">${discounted.toLocaleString()}원</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
        <span class="detail-original-price">${basePrice.toLocaleString()}원</span>
        <span class="coupon-applied-tag">쿠폰 적용 ✓</span>
      </div>
    `;

    document.getElementById('qty-total').textContent =
      (discounted * quantity).toLocaleString() + '원';

    setCouponApplied();

    // 버튼 → 적용됨 상태로 변경
    const actionEl = document.getElementById(`coupon-action-${couponId}`);
    if (actionEl) {
      actionEl.innerHTML = `<span class="coupon-status applied">적용됨 ✓</span>`;
    }

    Utils.showToast('10% 할인 쿠폰이 적용되었습니다 🎉');
  };

  // ── 쿠폰존으로 이동 (강도별 경로 분기) ──────────────
  const goToCouponZone = () => {
    const level = COUPON_LEVEL[currentProduct.id] || 2;
    sessionStorage.setItem('coupon_from_product', currentProduct.id);
    sessionStorage.setItem('coupon_level', String(level));
    sessionStorage.setItem('coupon_return_open', currentProduct.id);
    closeCouponSheet();

    if (level === 1) {
      Router.navigate('coupon-zone');
    } else {
      Router.navigate('main', { via: 'coupon' });
    }
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