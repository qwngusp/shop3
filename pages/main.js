// ===== MAIN PAGE =====
// 일반 모드 + 쿠폰 경유 모드(쿠폰함만 클릭 가능) 지원

const MainPage = (() => {

  const init = (params) => {
    // coupon_via=1 이면 쿠폰 경유 모드
    const couponVia = params && params.via === 'coupon';
    render(couponVia);
  };

  const render = (couponVia) => {
    const page = document.getElementById('page-main');

    page.innerHTML = `
      <!-- 헤더 -->
      <div class="main-header">
        <span class="main-header__logo">ShopLab</span>
        <div style="width:36px;margin-left:auto;"></div>
      </div>

      <!-- 검색바 (쿠폰 경유 시 비활성화) -->
      <div class="main-search ${couponVia ? 'main-disabled' : ''}" ${!couponVia ? 'onclick="Router.navigate(\'list\')"' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="#999" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="main-search__placeholder">검색</span>
      </div>

      <!-- 탭 네비 (쿠폰 경유 시 비활성화) -->
      <div class="main-tabs ${couponVia ? 'main-disabled' : ''}">
        <button class="main-tab" ${!couponVia ? 'onclick="Router.navigate(\'list\')"' : 'disabled'}>
          <span class="main-tab__icon">♡</span><span>즐겨찾기</span>
        </button>
        <button class="main-tab" ${!couponVia ? 'onclick="Router.navigate(\'list\')"' : 'disabled'}>
          <span class="main-tab__icon">🕐</span><span>기록</span>
        </button>
        <button class="main-tab" ${!couponVia ? 'onclick="Router.navigate(\'list\')"' : 'disabled'}>
          <span class="main-tab__icon">👤</span><span>팔로잉</span>
        </button>
        <button class="main-tab" ${!couponVia ? 'onclick="Router.navigate(\'list\')"' : 'disabled'}>
          <span class="main-tab__icon">📋</span><span>주문</span>
        </button>
      </div>

      <!-- 메인 섹션들 (쿠폰 경유 시 흐리게 + 클릭 차단) -->
      <div class="main-sections-wrap ${couponVia ? 'main-sections-dimmed' : ''}">

        <!-- 쿠폰함 배너 (항상 활성화) -->
        <div class="coupon-banner ${couponVia ? 'coupon-banner--highlight' : ''}" id="coupon-banner-btn">
          <div class="coupon-banner__inner">
            <div class="coupon-banner__gift">🎁</div>
            <div class="coupon-banner__text">
              <p class="coupon-banner__title">쿠폰함</p>
              <p class="coupon-banner__amount" style="font-size:15px;font-weight:700;">받을 수 있는 쿠폰이 있어요!</p>
            </div>
            <div class="coupon-banner__cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              쿠폰받기
            </div>
          </div>
        </div>

        <!-- 오늘의 인기 상품 -->
        <div class="main-section">
          <div class="main-section__header">
            <span class="main-section__title">🔥 오늘의 인기 상품</span>
            <span class="main-section__more">›</span>
          </div>
          <div class="main-hot-scroll">
            ${[
              { emoji: '🧴', name: '프리미엄 샴푸', price: '12,900원', discount: '23%' },
              { emoji: '🧼', name: '천연 바디워시', price: '8,500원',  discount: '15%' },
              { emoji: '🪥', name: '칫솔 4입 세트', price: '5,900원',  discount: '30%' },
              { emoji: '🧻', name: '화장지 30롤',   price: '18,000원', discount: '10%' },
              { emoji: '🫧', name: '주방세제 대용량', price: '6,800원', discount: '18%' },
              { emoji: '🧽', name: '수세미 10입',   price: '3,900원',  discount: '20%' },
            ].map(item => `
              <div class="main-hot-card">
                <div class="main-hot-card__img" style="display:flex;align-items:center;justify-content:center;font-size:36px;background:var(--bg-gray);">
                  ${item.emoji}
                </div>
                <p class="main-hot-card__discount">${item.discount} 할인</p>
                <p class="main-hot-card__price">${item.price}</p>
                <p class="main-hot-card__name">${item.name}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 기획전 배너 그리드 -->
        <div class="main-section">
          <div class="main-section__header">
            <span class="main-section__title">📢 진행 중인 기획전</span>
            <span class="main-section__more">›</span>
          </div>
          <div class="main-banner-grid">
            <div class="main-banner-card" style="background:linear-gradient(135deg,#fff4e0,#ffe0b2);">
              <div class="main-banner-card__bg"></div>
              <span style="font-size:32px;margin-bottom:auto;padding-top:12px;">🧺</span>
              <p class="main-banner-card__sub">최대 30% 할인</p>
              <p class="main-banner-card__title">세탁/청소<br>용품 특가</p>
            </div>
            <div class="main-banner-card" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);">
              <div class="main-banner-card__bg"></div>
              <span style="font-size:32px;margin-bottom:auto;padding-top:12px;">🌿</span>
              <p class="main-banner-card__sub">친환경 브랜드</p>
              <p class="main-banner-card__title">그린라이프<br>기획전</p>
            </div>
            <div class="main-banner-card" style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);">
              <div class="main-banner-card__bg"></div>
              <span style="font-size:32px;margin-bottom:auto;padding-top:12px;">🛁</span>
              <p class="main-banner-card__sub">봄맞이 특별전</p>
              <p class="main-banner-card__title">욕실용품<br>리뉴얼</p>
            </div>
            <div class="main-banner-card" style="background:linear-gradient(135deg,#fce4ec,#f8bbd0);">
              <div class="main-banner-card__bg"></div>
              <span style="font-size:32px;margin-bottom:auto;padding-top:12px;">🍋</span>
              <p class="main-banner-card__sub">신상품 출시</p>
              <p class="main-banner-card__title">주방세제<br>신제품전</p>
            </div>
          </div>
        </div>

        <!-- 최근 본 상품 -->
        <div class="main-section" style="padding-bottom:24px;">
          <div class="main-section__header">
            <span class="main-section__title">🕐 최근 본 상품</span>
            <span class="main-section__more">›</span>
          </div>
          <div class="main-hot-scroll">
            ${[
              { emoji: '🧴', name: '세제 대용량', price: '11,500원', discount: '10%' },
              { emoji: '🪣', name: '다용도 클리너', price: '7,200원', discount: '5%'  },
              { emoji: '🧹', name: '밀대 청소포', price: '9,800원',  discount: '12%' },
              { emoji: '🫙', name: '방향제 3입', price: '14,000원',  discount: '8%'  },
            ].map(item => `
              <div class="main-hot-card">
                <div class="main-hot-card__img" style="display:flex;align-items:center;justify-content:center;font-size:36px;background:var(--bg-gray);">
                  ${item.emoji}
                </div>
                <p class="main-hot-card__discount">${item.discount} 할인</p>
                <p class="main-hot-card__price">${item.price}</p>
                <p class="main-hot-card__name">${item.name}</p>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // 쿠폰함 배너 클릭 → 쿠폰존 이동
    document.getElementById('coupon-banner-btn').addEventListener('click', () => {
      Router.navigate('coupon-zone');
    });
  };

  return { init };
})();