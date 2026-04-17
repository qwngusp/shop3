// ===== P0: 식별 정보 입력 페이지 =====

const IdentifyPage = (() => {
  const init = () => {
    renderForm();
    bindEvents();
  };

  const renderForm = () => {
    const page = document.getElementById('page-identify');
    page.innerHTML = `
      <div class="identify-wrap">
        <div class="identify-hero">
          <div class="identify-logo">🛒 ShopLab</div>
          <p class="identify-subtitle">쇼핑 실험 환경에 오신 것을 환영합니다</p>
        </div>

        <div class="identify-card">
          <h2 class="identify-card__title">참여자 정보 입력</h2>
          <p class="identify-card__desc">
            설문 데이터와 연결하기 위한 식별 정보를 입력해주세요.<br>
            개인정보는 저장되지 않습니다.
          </p>

          <div class="form-group">
            <label class="form-label">생년월일 <span class="required">*</span></label>
            <input
              type="text"
              id="input-birth"
              class="form-input"
              placeholder="예: 19980315"
              maxlength="8"
              inputmode="numeric"
              pattern="[0-9]*"
            />
            <span class="form-hint">8자리 숫자 (예: 19980315)</span>
          </div>

          <div class="form-group">
            <label class="form-label">성별 <span class="required">*</span></label>
            <div class="gender-btns">
              <button class="gender-btn" data-value="0" id="btn-male">남성</button>
              <button class="gender-btn" data-value="1" id="btn-female">여성</button>
            </div>
          </div>

          <div id="identify-error" class="form-error" style="display:none;"></div>

          <button class="btn btn-primary" id="btn-start" style="margin-top:24px;">
            쇼핑 시작하기
          </button>
        </div>

        <p class="identify-footer">본 환경은 연구 목적으로 제작되었습니다</p>
      </div>
    `;
  };

  const bindEvents = () => {
    let selectedGender = null;

    // 성별 선택
    document.querySelectorAll('.gender-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gender-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGender = btn.dataset.value;
      });
    });

    // 생년월일 숫자만 입력
    const birthInput = document.getElementById('input-birth');
    birthInput.addEventListener('input', () => {
      birthInput.value = birthInput.value.replace(/[^0-9]/g, '');
    });

    // 시작 버튼
    document.getElementById('btn-start').addEventListener('click', () => {
      const birth = birthInput.value.trim();
      const errorEl = document.getElementById('identify-error');

      // 유효성 검사
      if (birth.length !== 8 || !/^\d{8}$/.test(birth)) {
        showError(errorEl, '생년월일 8자리를 올바르게 입력해주세요.');
        return;
      }
      if (selectedGender === null) {
        showError(errorEl, '성별을 선택해주세요.');
        return;
      }

      errorEl.style.display = 'none';

      // 세션 ID 생성 + 타이머 시작
      const sessionId = State.createSessionId(birth, selectedGender);
      State.startTimer();

      console.log('[Session] ID 생성:', sessionId);

      // 상품 리스트로 이동
      Router.navigate('list');
    });
  };

  const showError = (el, msg) => {
    el.textContent = msg;
    el.style.display = 'block';
  };

  return { init };
})();
