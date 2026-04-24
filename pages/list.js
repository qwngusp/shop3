// ===== P1: 상품 리스트 페이지 =====

const ListPage = (() => {
  let products = [];

  const CATEGORIES = ['전체'];
  let activeCategory = '전체';

  // ── 리스트 쿠폰 바텀시트 ──────────────────────────
  const COUPON_RATE = 0.1;

  const getAppliedMap = () => {
    try { return JSON.parse(sessionStorage.getItem('coupon_applied_products') || '{}'); } catch { return {}; }
  };
  const isCouponApplied = (productId) => !!getAppliedMap()[productId];
  const setApplied = (productId) => {
    const map = getAppliedMap();
    map[productId] = true;
    sessionStorage.setItem('coupon_applied_products', JSON.stringify(map));
  };

  // 다운로드된 쿠폰 목록 (해당 상품 기준)
  const getDownloaded = (productId) => {
    try {
      const map = JSON.parse(sessionStorage.getItem('couponzone_downloaded') || '{}');
      return map[productId] || [];
    } catch { return []; }
  };

  const openCouponSheet = (productId, basePrice) => {
    // 이미 존재하는 시트가 있으면 제거
    const existing = document.getElementById('list-coupon-overlay');
    if (existing) existing.remove();

    const downloaded = getDownloaded(productId);
    const hasAny     = downloaded.length > 0;
    const discounted = Math.floor(basePrice * (1 - COUPON_RATE));

    const wrap = document.createElement('div');
    wrap.id = 'list-coupon-overlay';

    if (!hasAny) {
      // ── 쿠폰 없음: 쿠폰존 이동 유도 (detail과 동일)
      wrap.innerHTML = `
        <div class="overlay show" id="list-overlay" onclick="ListPage.closeCouponSheet()"></div>
        <div class="bottom-sheet show" id="list-coupon-sheet">
          <div class="bottom-sheet__handle"></div>
          <div class="coupon-sheet-header">
            <div><h3>쿠폰 적용</h3></div>
            <button onclick="ListPage.closeCouponSheet()"
              style="font-size:22px;color:#999;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">✕</button>
          </div>
          <div class="coupon-empty-state">
            <p class="coupon-empty-text">적용 가능한 쿠폰이 없습니다</p>
            <button class="btn btn-primary coupon-goto-btn"
              onclick="ListPage.goToCouponZone('${productId}')">
              쿠폰 다운받으러 가기
            </button>
          </div>
        </div>
      `;
    } else {
      // ── 쿠폰 보유: 보유 목록 + 적용 버튼 (detail과 동일)
      const allCoupons = CouponZonePage.getCoupons();
      const myCoupons  = allCoupons.filter(c => downloaded.includes(c.id));

      wrap.innerHTML = `
        <div class="overlay show" id="list-overlay" onclick="ListPage.closeCouponSheet()"></div>
        <div class="bottom-sheet show" id="list-coupon-sheet">
          <div class="bottom-sheet__handle"></div>
          <div class="coupon-sheet-header">
            <div>
              <h3>쿠폰 적용</h3>
              <p style="font-size:13px;color:#999;margin-top:2px;">보유 쿠폰 ${myCoupons.length}개</p>
            </div>
            <button onclick="ListPage.closeCouponSheet()"
              style="font-size:22px;color:#999;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">✕</button>
          </div>
          <div class="coupon-apply-list">
            ${myCoupons.map(c => {
              const canApply = c.id === 'COUPON_10PCT';
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
                      ? `<button class="coupon-apply-action-btn"
                           onclick="ListPage.applyAndClose('${productId}', ${basePrice})">적용</button>`
                      : `<span class="coupon-status disabled">적용불가</span>`
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="padding:12px 16px 16px;display:flex;gap:8px;">
            <button class="btn btn-secondary" style="flex:1;" onclick="ListPage.closeCouponSheet()">닫기</button>
            <button class="btn btn-primary" style="flex:1;"
              onclick="ListPage.goToCouponZone('${productId}')">쿠폰 받으러 가기</button>
          </div>
        </div>
      `;
    }

    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
  };

  const closeCouponSheet = () => {
    const wrap = document.getElementById('list-coupon-overlay');
    if (wrap) wrap.remove();
    document.body.style.overflow = '';
  };

  // ── 쿠폰존으로 이동 (강도별 경로 분기, detail과 동일 구조) ──
  // 강도1(p001): 리스트 → 쿠폰존 → 리스트 복귀 + 바텀시트 자동 오픈
  // 강도2(기본): 리스트 → 메인 → 쿠폰존 → 리스트 복귀 + 바텀시트 자동 오픈
  // 강도3(p004): 리스트 → 메인 → 쿠폰존 → 리스트 복귀 (바텀시트 없음)
  const LIST_COUPON_LEVEL = {
    'p001': 1,
    'p004': 3,
  };

  const goToCouponZone = (productId) => {
    const level   = LIST_COUPON_LEVEL[productId] || 2;
    const product = products.find(p => p.id === productId);
    sessionStorage.setItem('coupon_from_product', productId);

    if (level === 3) {
      // 강도3: 복귀만, 바텀시트 오픈 없음
      sessionStorage.setItem('list_coupon_return_no_sheet', productId);
      sessionStorage.removeItem('list_coupon_return');
      sessionStorage.removeItem('list_coupon_return_price');
    } else {
      // 강도1/2: 복귀 + 바텀시트 자동 오픈
      sessionStorage.setItem('list_coupon_return', productId);
      if (product) sessionStorage.setItem('list_coupon_return_price', String(product.originalPrice));
      sessionStorage.removeItem('list_coupon_return_no_sheet');
    }

    closeCouponSheet();

    if (level === 1) {
      Router.navigate('coupon-zone');
    } else {
      Router.navigate('main', { via: 'coupon' });
    }
  };

  const applyAndClose = (productId, basePrice) => {
    setApplied(productId);
    closeCouponSheet();

    const row = document.querySelector(`.product-row[data-id="${productId}"]`);
    if (row) {
      const discounted = Math.floor(basePrice * (1 - COUPON_RATE));

      // 기존 단위가격 엘리먼트 먼저 제거 (priceEl 밖에 있는 것)
      const perUnitEl = row.querySelector('.product-row__per-unit');
      if (perUnitEl) perUnitEl.remove();

      // 가격 업데이트
      const priceEl = row.querySelector('.product-row__price');
      if (priceEl) {
        const product = products.find(p => p.id === productId);
        const perUnitStr = product ? formatPerUnit(product, true) : null;
        priceEl.innerHTML = `
          <span class="product-row__price-original">${basePrice.toLocaleString()}원</span>
          <div class="product-row__price-discounted">
            <span class="product-row__price-rate">10%</span>
            <span class="product-row__price-amount">${discounted.toLocaleString()}원</span>
            ${perUnitStr ? `<span class="product-row__per-unit">(${perUnitStr})</span>` : ''}
          </div>
        `;
      }

      // 배송비 아래 쿠폰 뱃지 업데이트
      const badgeRow = row.querySelector('.product-row__coupon-badge-row');
      if (badgeRow) {
        badgeRow.innerHTML = `<span class="list-coupon-applied-tag">✓ 쿠폰 적용됨</span>`;
      }

      // 3열 쿠폰 버튼 → 제거
      const couponCol = row.querySelector('.product-row__coupon-col');
      if (couponCol) couponCol.remove();

      // 세로 구분선도 제거
      const divider = row.querySelector('.product-row__col-divider');
      if (divider) divider.remove();
    }

    Utils.showToast('10% 할인 쿠폰이 적용되었습니다 🎉');
  };

  const init = async () => {
    const page = document.getElementById('page-list');

    page.innerHTML = `
      <!-- 헤더 -->
      <div class="header">
        <span class="header__logo" style="font-size:18px;font-weight:900;color:var(--primary);">ShopLab</span>
        <div class="list-search-bar" onclick="">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="#999" stroke-width="2" stroke-linecap="round"/></svg>
          <span style="color:#999;font-size:14px;">검색</span>
        </div>
        <button class="header__action" onclick="Router.navigate('cart')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="#111" stroke-width="1.8"/><path d="M16 10a4 4 0 01-8 0" stroke="#111" stroke-width="1.8"/></svg>
          <span class="badge" id="cart-badge" style="display:none;">0</span>
        </button>
      </div>

      <!-- 카테고리 탭 -->
      <div class="list-cat-tabs" id="list-cat-tabs">
        ${CATEGORIES.map(c => `
          <button class="list-cat-tab ${c === activeCategory ? 'active' : ''}" data-cat="${c}">${c}</button>
        `).join('')}
      </div>

      <!-- 검색결과 -->
      <div class="list-label-row">
        <span class="list-label">검색 결과</span>
        <span class="list-total">총 <strong>${products.length || 6}개</strong></span>
      </div>

      <!-- 상품 리스트 -->
      <div class="product-list" id="product-list">
        <div class="spinner"></div>
      </div>
    `;

    if (products.length === 0) {
      products = await loadProducts();
    }

    renderList();
    bindCategoryTabs();
    Router.updateCartBadge();

    // 강도1/2 복귀: 바텀시트 자동 오픈
    const returnProductId = sessionStorage.getItem('list_coupon_return');
    const returnPrice     = parseInt(sessionStorage.getItem('list_coupon_return_price') || '0');
    if (returnProductId && returnPrice) {
      sessionStorage.removeItem('list_coupon_return');
      sessionStorage.removeItem('list_coupon_return_price');
      setTimeout(() => openCouponSheet(returnProductId, returnPrice), 400);
    }

    // 강도3 복귀: 그냥 리스트로만 돌아옴 (바텀시트 없음)
    const noSheetReturn = sessionStorage.getItem('list_coupon_return_no_sheet');
    if (noSheetReturn) {
      sessionStorage.removeItem('list_coupon_return_no_sheet');
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('data/products.json');
      return await res.json();
    } catch (e) {
      console.error('상품 데이터 로드 실패:', e);
      return [];
    }
  };

  const renderList = () => {
    const list = document.getElementById('product-list');
    if (!list) return;

    list.innerHTML = products.map((p) => productRow(p)).join('');

    list.querySelectorAll('.product-row').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.id;
        Logger.logClick(id);
        Router.navigate('detail', { id });
      });
    });
  };

  const bindCategoryTabs = () => {
    document.querySelectorAll('.list-cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.list-cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        // 실험 환경이라 전체 상품만 보여줌
        renderList();
      });
    });
  };

  // 단위가격 문자열 생성 (쿠폰 적용 여부에 따라 계산)
  const formatPerUnit = (p, applied) => {
    if (!p.pricePer100ml) return p.pricePerUnit || null;
    const perUnit = applied
      ? Math.floor(p.pricePer100ml * (1 - COUPON_RATE))
      : p.pricePer100ml;
    return `100ml당 ${perUnit.toLocaleString()}원`;
  };

  const productRow = (p) => {
    const applied = isCouponApplied(p.id);
    const discounted = Math.floor(p.originalPrice * (1 - 0.1));
    const perUnit = formatPerUnit(p, applied);

    const priceHTML = applied
      ? `<span class="product-row__price-original">${p.originalPrice.toLocaleString()}원</span>
         <div class="product-row__price-discounted">
           <span class="product-row__price-rate">10%</span>
           <span class="product-row__price-amount">${discounted.toLocaleString()}원</span>
           ${perUnit ? `<span class="product-row__per-unit">(${perUnit})</span>` : ''}
         </div>`
      : `${p.originalPrice.toLocaleString()}원`;

    const couponBadgeHTML = applied
      ? `<span class="list-coupon-applied-tag">✓ 쿠폰 적용됨</span>`
      : `<span class="list-coupon-badge">🏷️ 쿠폰 적용가능</span>`;

    const rightColHTML = applied ? `` : `
      <div class="product-row__col-divider"></div>
      <div class="product-row__coupon-col">
        <button class="list-coupon-btn" onclick="event.stopPropagation(); ListPage.openCouponSheet('${p.id}', ${p.originalPrice})">
          <span class="list-coupon-btn__label">쿠폰<br>다운</span>
          <span class="list-coupon-btn__icon">↓</span>
        </button>
      </div>
    `;

    return `
    <div class="product-row" data-id="${p.id}">
      <div class="product-row__img">
        <img src="${p.image}" alt="${p.name}"
          onerror="this.parentNode.style.background='#f0f0f0';this.style.display='none';" />
      </div>
      <div class="product-row__info">
        <p class="product-row__name">[브랜드${p.brand}] ${p.name}</p>
        <p class="product-row__capacity"> ${p.capacity}</p>
        <div class="product-row__price-row">
          <span class="product-row__price">${priceHTML}</span>
          ${!applied && perUnit ? `<span class="product-row__per-unit">(${perUnit})</span>` : ''}
        </div>
        <div class="product-row__footer">
          <div class="product-row__coupon-badge-row">${couponBadgeHTML}</div>
          <span class="product-row__shipping"><span class="shipping-box-icon">📦</span>${p.shipping}</span>
        </div>
      </div>
      ${rightColHTML}
    </div>
  `;
  };

  return { init, getProducts: () => products, openCouponSheet, closeCouponSheet, applyAndClose, goToCouponZone };
})();