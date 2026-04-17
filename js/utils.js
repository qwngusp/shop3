// ===== UTILS =====

const Utils = (() => {
  // 숫자 → 천단위 콤마
  const formatPrice = (num) =>
    num.toLocaleString('ko-KR') + '원';

  // 별점 → 별 문자
  const formatStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  };

  // 리뷰 수 → 포맷 (12,453 → 12.4천)
  const formatReviews = (count) => {
    if (count >= 10000) return (count / 10000).toFixed(1) + '만';
    if (count >= 1000) return (count / 1000).toFixed(1) + '천';
    return count.toString();
  };

  // 배송 뱃지 HTML
  const shippingBadge = (type) => {
    if (type === '로켓배송') {
      return `<span class="shipping-badge rocket">🚀 로켓배송</span>`;
    }
    return `<span class="shipping-badge normal">📦 ${type}</span>`;
  };

  // 토스트 메시지
  const showToast = (msg, duration = 2000) => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  };

  // 오버레이 + 바텀시트 열기/닫기
  const openSheet = (sheetId) => {
    document.getElementById('overlay').classList.add('show');
    document.getElementById(sheetId).classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  const closeSheet = (sheetId) => {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById(sheetId).classList.remove('show');
    document.body.style.overflow = '';
  };

  // 상품 placeholder 이미지 SVG (실제 이미지 교체 전 사용)
  const placeholderImg = (id, name) =>
    `<div class="img-placeholder" style="background:hsl(${parseInt(id.slice(1)) * 37 % 360},40%,88%);display:flex;align-items:center;justify-content:center;font-size:12px;color:#666;text-align:center;padding:8px;">${name.slice(0,8)}</div>`;

  return {
    formatPrice,
    formatStars,
    formatReviews,
    shippingBadge,
    showToast,
    openSheet,
    closeSheet,
    placeholderImg,
  };
})();
