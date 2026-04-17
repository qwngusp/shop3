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
        <div class="coupon-banner ${couponVia ? 'coupon-banner--highlight' : ''}"
          id="coupon-banner-btn">
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

        <!-- 오늘의 인기 상품 (쿠폰 경유 시 클릭 차단) -->
        <div class="main-section">
          <div class="main-section__header">
            <span class="main-section__title">오늘의 인기 상품</span>
          </div>
          <div class="main-placeholder-block">
            <div class="main-placeholder-inner"></div>
          </div>
        </div>

        <!-- 기획전 (쿠폰 경유 시 클릭 차단) -->
        <div class="main-section" style="padding-bottom:24px;">
          <div class="main-section__header">
            <span class="main-section__title">기획전</span>
          </div>
          <div class="main-placeholder-block">
            <div class="main-placeholder-inner" style="height:100px;"></div>
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
