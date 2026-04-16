/**
 * admin.js
 * 管理画面のフォームロジック
 */
(function() {
  'use strict';

  // --- 色相のラベルマッピング ---
  var HUE_LABELS = {
    yellow: 'イエロー系', golden: 'ゴールデン系', khaki: 'カーキ系',
    green: 'グリーン系', ash: 'アッシュ系', blue: 'ブルー系',
    purple: 'パープル系', pink: 'ピンク系', red: 'レッド系',
    orange: 'オレンジ系', beige: 'ベージュ系', brown: 'ブラウン系',
    white: 'ホワイト系', silver: 'シルバー系', grege: 'グレージュ系',
    black: 'ブラック系'
  };

  // --- 白髪率のラベルマッピング ---
  var GRAY_LABELS = {
    none: '--', under10: '10%未満', '10to20': '10〜20%',
    '30to50': '30〜50%', '50to70': '50〜70%', over70: '70%以上'
  };

  // --- 次のIDを自動提案 ---
  fetch('data/cases.json')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var maxId = 0;
      (data.cases || []).forEach(function(c) {
        if (c.id > maxId) maxId = c.id;
      });
      document.getElementById('caseId').value = maxId + 1;
    })
    .catch(function() {});

  // --- 色相選択時にラベルを自動更新 ---
  document.getElementById('hue').addEventListener('change', function() {
    document.getElementById('hueLabel').value = HUE_LABELS[this.value] || '';
  });

  // --- 白髪率選択時にラベルを自動更新 ---
  document.getElementById('grayRatio').addEventListener('change', function() {
    document.getElementById('grayRatioLabel').value = GRAY_LABELS[this.value] || '--';
  });

  // --- レシピ行のテンプレート ---
  function createRecipeRow() {
    var div = document.createElement('div');
    div.className = 'admin-recipe-row';
    div.innerHTML =
      '<select class="admin-select admin-recipe-color">' +
        '<option value="purple">PURPLE</option>' +
        '<option value="lavender">LAVENDER</option>' +
        '<option value="pink">PINK</option>' +
        '<option value="ash">ASH</option>' +
        '<option value="brown">BROWN</option>' +
      '</select>' +
      '<input type="number" class="admin-input admin-input--tiny admin-recipe-ratio" min="1" value="1" placeholder="配合比">' +
      '<input type="text" class="admin-input admin-recipe-note" placeholder="備考（任意）">' +
      '<button type="button" class="admin-btn-remove" title="削除">&times;</button>';
    return div;
  }

  // --- カラー追加ボタン ---
  document.getElementById('addShampoo').addEventListener('click', function() {
    document.getElementById('shampooList').appendChild(createRecipeRow());
  });

  document.getElementById('addTreatment').addEventListener('click', function() {
    document.getElementById('treatmentList').appendChild(createRecipeRow());
  });

  // --- 削除ボタン（イベント委譲） ---
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('admin-btn-remove')) {
      var row = e.target.closest('.admin-recipe-row');
      var list = row.parentElement;
      if (list.children.length > 1) {
        row.remove();
      }
    }
  });

  // --- シャンプー未使用チェック ---
  document.getElementById('shampooNotUsed').addEventListener('change', function() {
    var list = document.getElementById('shampooList');
    var addBtn = document.getElementById('addShampoo');
    if (this.checked) {
      list.style.opacity = '0.3';
      list.style.pointerEvents = 'none';
      addBtn.style.display = 'none';
    } else {
      list.style.opacity = '1';
      list.style.pointerEvents = '';
      addBtn.style.display = '';
    }
  });

  // --- レシピリストからデータ取得 ---
  function getRecipeData(listId) {
    var rows = document.getElementById(listId).querySelectorAll('.admin-recipe-row');
    var result = [];
    rows.forEach(function(row) {
      var color = row.querySelector('.admin-recipe-color').value;
      var ratio = parseInt(row.querySelector('.admin-recipe-ratio').value, 10) || 1;
      var note = row.querySelector('.admin-recipe-note').value.trim();
      var item = {
        color: color,
        label: color.toUpperCase(),
        ratio: ratio
      };
      if (note) item.note = note;
      result.push(item);
    });
    return result;
  }

  // --- 施術履歴の取得 ---
  function getHistoryValues() {
    var checked = [];
    document.querySelectorAll('#historyGroup input[type="checkbox"]:checked').forEach(function(cb) {
      checked.push(cb.value);
    });
    return checked.length > 0 ? checked : ['none'];
  }

  // --- 写真パスの補完 ---
  function normalizePhotoPath(val) {
    if (!val) return '';
    // 既に完全なパスなら何もしない
    if (val.indexOf('/') !== -1) return val;
    // 拡張子がなければ .JPG を付ける
    if (!/\.\w+$/.test(val)) val = val + '.JPG';
    // images/ プレフィックスを付ける
    return 'images/' + val;
  }

  // --- フォームからケースオブジェクトを生成 ---
  function buildCaseFromForm() {
    var beforePhoto = normalizePhotoPath(document.getElementById('beforePhoto').value.trim());
    var beforeAlt = document.getElementById('beforePhotoAlt').value.trim();
    var shampooNotUsed = document.getElementById('shampooNotUsed').checked;

    var caseData = {
      id: parseInt(document.getElementById('caseId').value, 10) || 1,
      status: document.getElementById('caseStatus').value,
      brightness_min: parseInt(document.getElementById('brightnessMin').value, 10) || 1,
      brightness_max: parseInt(document.getElementById('brightnessMax').value, 10) || 1,
      hue: document.getElementById('hue').value,
      hue_label: document.getElementById('hueLabel').value.trim(),
      hue_note: document.getElementById('hueNote').value.trim() || null,
      gray_ratio: document.getElementById('grayRatio').value,
      gray_ratio_label: document.getElementById('grayRatioLabel').value.trim(),
      treatment_history: getHistoryValues(),
      history_label: document.getElementById('historyLabel').value.trim(),
      before_photo: beforePhoto || null,
      before_photo_alt: beforePhoto ? beforeAlt : null,
      after_photo: normalizePhotoPath(document.getElementById('afterPhoto').value.trim()),
      after_photo_alt: document.getElementById('afterPhotoAlt').value.trim(),
      shampoo: shampooNotUsed ? [] : getRecipeData('shampooList'),
      treatment: getRecipeData('treatmentList'),
      contact_time: document.getElementById('contactTime').value.trim() || '--',
      contact_time_note: document.getElementById('contactTimeNote').value.trim() || null
    };

    return caseData;
  }

  // --- JSON生成 ---
  document.getElementById('generateJson').addEventListener('click', function() {
    var caseData = buildCaseFromForm();

    // バリデーション
    var errors = [];
    if (!caseData.after_photo) errors.push('After写真パスは必須です');
    if (caseData.treatment.length === 0) errors.push('トリートメントは最低1色必要です');
    if (!caseData.hue_label) errors.push('色相ラベルを入力してください');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    // JSON出力
    var json = JSON.stringify(caseData, null, 2);
    document.getElementById('jsonOutput').value = json;

    // プレビュー更新
    var cardContainer = document.getElementById('previewCard');
    cardContainer.innerHTML = '<div class="card-grid">' + CaseTemplates.renderCaseCard(caseData) + '</div>';

    var detailContainer = document.getElementById('previewDetail');
    detailContainer.innerHTML = CaseTemplates.renderCaseDetail(caseData);
  });

  // --- クリップボードコピー ---
  document.getElementById('copyJson').addEventListener('click', function() {
    var output = document.getElementById('jsonOutput');
    var status = document.getElementById('copyStatus');

    if (!output.value) {
      status.textContent = '先にJSONを生成してください';
      status.className = 'admin-copy-status admin-copy-status--error';
      return;
    }

    navigator.clipboard.writeText(output.value).then(function() {
      status.textContent = 'コピーしました';
      status.className = 'admin-copy-status admin-copy-status--success';
      setTimeout(function() { status.textContent = ''; }, 2000);
    }).catch(function() {
      output.select();
      document.execCommand('copy');
      status.textContent = 'コピーしました';
      status.className = 'admin-copy-status admin-copy-status--success';
      setTimeout(function() { status.textContent = ''; }, 2000);
    });
  });

})();
