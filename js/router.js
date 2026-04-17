// ===== ROUTER =====
// hash 기반 SPA 라우터

const Router = (() => {
  const routes = {};
  let currentPage = null;

  const register = (name, initFn) => {
    routes[name] = initFn;
  };

  const navigate = (name, params = {}) => {
    // 쿼리 파라미터를 hash에 포함
    const query = new URLSearchParams(params).toString();
    window.location.hash = query ? `${name}?${query}` : name;
  };

  const parseHash = () => {
    const raw = window.location.hash.slice(1); // '#' 제거
    const [page, queryStr] = raw.split('?');
    const params = {};
    if (queryStr) {
      new URLSearchParams(queryStr).forEach((v, k) => {
        params[k] = v;
      });
    }
    return { page: page || 'identify', params };
  };

  const render = () => {
    const { page, params } = parseHash();

    // 세션 없으면 항상 identify로
    if (page !== 'identify' && !State.getSessionId()) {
      navigate('identify');
      return;
    }

    // 이전 페이지 비활성화
    document.querySelectorAll('.page').forEach((el) => {
      el.classList.remove('active');
    });

    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) {
      pageEl.classList.add('active');
    }

    currentPage = page;

    // 라우트 초기화 함수 실행
    if (routes[page]) {
      routes[page](params);
    }

    // 장바구니 뱃지 업데이트
    updateCartBadge();

    // 스크롤 맨 위로
    window.scrollTo(0, 0);
  };

  const updateCartBadge = () => {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = State.getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  };

  const init = () => {
    window.addEventListener('hashchange', render);
    render(); // 최초 렌더
  };

  return { register, navigate, init, updateCartBadge, parseHash };
})();
