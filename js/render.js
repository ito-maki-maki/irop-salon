/**
 * render.js
 * cases.json を読み込み、一覧画面・詳細画面を動的に描画する
 */
(function() {
  'use strict';

  var DATA_URL = 'data/cases.json';

  function fetchCases(callback) {
    fetch(DATA_URL)
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to load cases: ' + res.status);
        return res.json();
      })
      .then(function(data) {
        callback(data.cases || []);
      })
      .catch(function(err) {
        console.error(err);
        var el = document.getElementById('loadingText') || document.getElementById('caseDetailContainer');
        if (el) {
          el.textContent = 'データの読み込みに失敗しました。ページを再読み込みしてください。';
        }
      });
  }

  function renderIndex(cases) {
    var grid = document.querySelector('.card-grid');
    if (!grid) return;

    var published = cases.filter(function(c) { return c.status === 'published'; });

    var html = '';
    published.forEach(function(c) {
      html += CaseTemplates.renderCaseCard(c);
    });

    grid.innerHTML = html;

    // フィルターの件数初期値を更新
    var countEl = document.getElementById('filterCount');
    if (countEl) {
      countEl.textContent = published.length + '件の事例';
    }

    // filter.js に描画完了を通知
    document.dispatchEvent(new CustomEvent('cases-rendered'));
  }

  function renderDetail(cases) {
    var container = document.getElementById('caseDetailContainer');
    if (!container) return;

    var id = new URLSearchParams(window.location.search).get('id') || '1';
    var caseData = null;
    cases.forEach(function(c) {
      if (String(c.id) === id) caseData = c;
    });

    if (!caseData) {
      container.innerHTML = '<p class="loading-text">事例が見つかりませんでした。</p>';
      return;
    }

    container.innerHTML = CaseTemplates.renderCaseDetail(caseData);
  }

  // ページ判定して描画実行
  fetchCases(function(cases) {
    if (document.querySelector('.card-grid')) {
      renderIndex(cases);
    } else if (document.getElementById('caseDetailContainer')) {
      renderDetail(cases);
    }
  });

})();
