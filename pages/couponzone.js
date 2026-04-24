// ===== 쿠폰존 페이지 =====

const CouponZonePage = (() => {

  const COUPONS = [
    { id: 'C_L1',        label: '20,000원', name: 'VIP 감사권',         desc: '20만원 이상 구매 시',             expire: '2026.12.31' },
    { id: 'C_L2',        label: '5%',       name: '가전 디지털 할인',    desc: '냉장고/세탁기 구매 시',           expire: '2026.06.30' },
    { id: 'C_L3',        label: '무료배송', name: '해외직구 쿠폰',       desc: '해외 배송 5만원 이상',            expire: '2026.05.15' },
    { id: 'C_L4',        label: '2,000원',  name: '첫 결제 쿠폰',        desc: '특정 카드 10만원 이상',           expire: '2026.12.31' },
    { id: 'C_L5',        label: '15,000원', name: '인테리어 할인',        desc: '가구 30만원 이상 구매 시',       expire: '2026.12.31' },
    { id: 'COUPON_10PCT',label: '10%',      name: '리빙/세제 기획전 쿠폰', desc: '세제 카테고리 1만원 이상 구매 시', expire: '2026.12.31' },
    { id: 'C_L6',        label: '1,000원',  name: '도서 교육 할인',       desc: '도서 15만원 이상 구매 시',       expire: '2026.04.30' },
    { id: 'C_L7',        label: '3%',       name: '반려동물 쿠폰',        desc: '사료 8만원 이상 구매 시',        expire: '2026.08.20' },
    { id: 'C_L8',        label: '5,000원',  name: '스포츠 지원금',        desc: '골프 25만원 이상 구매 시',       expire: '2026.12.31' },
    { id: 'C_L9',        label: '10,000원', name: '백화점 전용권',         desc: '입점 브랜드 15만원 이상',       expire: '2026.10.10' },
  ];

  // 전체 맵: { productId: [couponId, ...] }
  const getDownloadedMap = () => {
    try { return JSON.parse(sessionStorage.getItem('couponzone_downloaded') || '{}'); } catch { return {}; }
  };

  // 현재 상품 컨텍스트 기준 다운로드 목록
  const getDownloaded = () => {
    const productId = sessionStorage.getItem('coupon_from_product') || '__global__';
    return getDownloadedMap()[productId] || [];
  };

  const saveDownload = (id) => {
    const productId = sessionStorage.getItem('coupon_from_product') || '__global__';
    const map = getDownloadedMap();
    if (!map[productId]) map[productId] = [];
    if (!map[productId].includes(id)) {
      map[productId].push(id);
      sessionStorage.setItem('couponzone_downloaded', JSON.stringify(map));
    }
  };

  const init = () => render();

  const render = () => {
    const page = document.getElementById('page-coupon-zone');
    const downloaded = getDownloaded();

    page.innerHTML = `
      <div class="header">
        <div style="width:36px;"></div>
        <span class="header__title">이달의 쿠폰</span>
        <div style="width:36px;"></div>
      </div>

      <div class="cz-banner">
        <p class="cz-banner__label">COUPON ZONE</p>
        <p class="cz-banner__sub">참여자분을 위한 혜택 모음입니다.</p>
      </div>

      <div class="cz-grid" id="cz-grid">
        ${COUPONS.map(c => couponCard(c, downloaded.includes(c.id))).join('')}
      </div>

      <!-- 하단 고정 버튼 -->
      <div style="height:80px;"></div>
      <div class="bottom-bar">
        <button class="btn btn-primary" onclick="CouponZonePage.confirm()">
          확인
        </button>
      </div>
    `;

    page.querySelectorAll('.cz-download-btn:not(.downloaded)').forEach(btn => {
      btn.addEventListener('click', () => download(btn.dataset.id));
    });
  };

  const couponCard = (c, isDl) => `
    <div class="cz-card">
      <div class="cz-card__amount">${c.label}</div>
      <div class="cz-card__info">
        <p class="cz-card__name">${c.name}</p>
        <p class="cz-card__desc">${c.desc}</p>
        <p class="cz-card__expire">~ ${c.expire}</p>
      </div>
      <button class="cz-download-btn ${isDl ? 'downloaded' : ''}" data-id="${c.id}">
        ${isDl ? '다운완료' : '쿠폰받기'}
      </button>
    </div>
  `;

  const download = (couponId) => {
    saveDownload(couponId);
    Utils.showToast('쿠폰을 받았습니다! 🎉');

    const btn = document.querySelector(`.cz-download-btn[data-id="${couponId}"]`);
    if (btn) {
      btn.textContent = '다운완료';
      btn.classList.add('downloaded');
      btn.disabled = true;
    }
  };

  // 확인 버튼 - 진입 경로 플래그 기반으로 목적지 분기
  const confirm = () => {
    // 상세 강도1/2: 상세 복귀 + 바텀시트 자동 오픈
    const detailReturn = sessionStorage.getItem('coupon_return_open');
    if (detailReturn) {
      Router.navigate('detail', { id: detailReturn });
      return;
    }

    // 상세 강도3: 리스트로 이동 (직접 상품 찾아 상세 진입 유도)
    const detailLevel3 = sessionStorage.getItem('detail_coupon_level3');
    if (detailLevel3) {
      sessionStorage.removeItem('detail_coupon_level3');
      // coupon_from_product는 유지 — 상세 진입 시 바텀시트 자동 오픈에 사용
      sessionStorage.setItem('coupon_return_open', detailLevel3);
      Router.navigate('list');
      return;
    }

    // 리스트 강도1/2: 리스트 복귀 + 바텀시트 자동 오픈 (init에서 처리)
    // 리스트 강도3: 리스트 복귀만 (init에서 처리)
    Router.navigate('list');
  };

  return { init, getCoupons: () => COUPONS, confirm };
})();