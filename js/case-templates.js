/**
 * case-templates.js
 * カード・詳細画面のHTML生成テンプレート関数
 * render.js と admin.js の両方から使用
 */
var CaseTemplates = (function() {
  'use strict';

  /**
   * 使用カラーの一覧を取得（shampoo + treatment の重複排除）
   */
  function getUniqueColors(c) {
    var seen = {};
    var result = [];
    var all = (c.shampoo || []).concat(c.treatment || []);
    all.forEach(function(item) {
      if (!seen[item.color]) {
        seen[item.color] = true;
        result.push(item.color);
      }
    });
    return result;
  }

  /**
   * 明度表示テキスト
   */
  function brightnessText(c) {
    if (c.brightness_min === c.brightness_max) {
      return 'Lv.' + c.brightness_min;
    }
    return 'Lv.' + c.brightness_min + '-' + c.brightness_max;
  }

  /**
   * カラーチップHTML
   */
  function colorChipHtml(color, label) {
    return '<span class="color-chip">' +
      '<span class="color-chip__swatch" style="background-color: var(--color-' + color + ');"></span>' +
      label +
    '</span>';
  }

  /**
   * カラーレシピHTML（詳細画面用）
   */
  function renderColorRecipe(colors) {
    if (!colors || colors.length === 0) {
      return '<span class="not-used">未使用</span>';
    }

    var html = '<div class="color-recipe">';

    if (colors.length === 1) {
      html += colorChipHtml(colors[0].color, colors[0].label);
      var typeText = '単品';
      if (colors[0].note) {
        typeText += '（' + colors[0].note + '）';
      }
      html += '<span class="color-recipe__type">' + typeText + '</span>';
    } else {
      colors.forEach(function(item, i) {
        if (i > 0) {
          html += '<span class="color-recipe__ratio">:</span>';
        }
        html += colorChipHtml(item.color, item.label);
      });
      var ratios = colors.map(function(item) { return item.ratio; });
      html += '<span class="color-recipe__type">= ' + ratios.join(' : ') + '</span>';
    }

    html += '</div>';
    return html;
  }

  /**
   * 事例カードHTML生成
   */
  function renderCaseCard(c) {
    var colors = getUniqueColors(c);
    var historyStr = c.treatment_history.join(',');

    var html = '<a href="case-detail.html?id=' + c.id + '" class="case-card"' +
      ' data-brightness-min="' + c.brightness_min + '"' +
      ' data-brightness-max="' + c.brightness_max + '"' +
      ' data-hue="' + c.hue + '"' +
      ' data-gray="' + c.gray_ratio + '"' +
      ' data-history="' + historyStr + '"' +
      ' data-colors="' + colors.join(',') + '">';

    // Images
    html += '<div class="case-card__images">';

    // Before
    html += '<div class="case-card__img-wrap">';
    if (c.before_photo) {
      html += '<img src="' + c.before_photo + '" alt="' + (c.before_photo_alt || '') + '" class="case-card__img" loading="lazy" width="400" height="533">';
    } else {
      html += '<div class="case-card__placeholder">no photo</div>';
    }
    html += '<span class="case-card__label">before</span>';
    html += '</div>';

    // After
    html += '<div class="case-card__img-wrap">';
    html += '<img src="' + c.after_photo + '" alt="' + (c.after_photo_alt || '') + '" class="case-card__img" loading="lazy" width="400" height="533">';
    html += '<span class="case-card__label">after</span>';
    html += '</div>';

    html += '</div>';

    // Body
    html += '<div class="case-card__body">';
    html += '<div class="case-card__brightness">';
    html += '<span class="case-card__brightness-value">' + brightnessText(c) + '</span>';
    html += '</div>';
    html += '<div class="case-card__colors">';
    colors.forEach(function(color) {
      html += colorChipHtml(color, color.toUpperCase());
    });
    html += '</div>';
    html += '</div>';

    html += '</a>';
    return html;
  }

  /**
   * 事例詳細HTML生成
   */
  function renderCaseDetail(c) {
    var html = '<article class="case-detail">';

    // Photo compare
    html += '<section class="photo-compare">';
    html += '<div class="photo-compare__item">';
    if (c.before_photo) {
      html += '<img src="' + c.before_photo + '" alt="' + (c.before_photo_alt || '') + '" class="photo-compare__img" loading="lazy" width="1200" height="1600">';
    } else {
      html += '<div class="photo-compare__placeholder">no photo</div>';
    }
    html += '<span class="photo-compare__label">before</span>';
    html += '</div>';
    html += '<div class="photo-compare__item">';
    html += '<img src="' + c.after_photo + '" alt="' + (c.after_photo_alt || '') + '" class="photo-compare__img" loading="lazy" width="1200" height="1600">';
    html += '<span class="photo-compare__label">after</span>';
    html += '</div>';
    html += '</section>';

    // Detail info grid
    html += '<div class="detail-info-grid">';

    // Before info section
    html += '<section class="info-section">';
    html += '<h2 class="info-section__title">施術前情報 <span class="info-section__title-en">before</span></h2>';
    html += '<dl class="info-list">';

    // Brightness
    html += '<div class="info-list__row">';
    html += '<dt class="info-list__label">明度レベル</dt>';
    html += '<dd class="info-list__value"><span class="lightness-badge">' + brightnessText(c) + '</span></dd>';
    html += '</div>';

    // Hue
    html += '<div class="info-list__row">';
    html += '<dt class="info-list__label">色相</dt>';
    html += '<dd class="info-list__value">';
    html += '<span class="hue-chip hue-chip--' + c.hue + '">' + c.hue_label + '</span>';
    if (c.hue_note) {
      html += '<span class="info-list__note">' + c.hue_note + '</span>';
    }
    html += '</dd>';
    html += '</div>';

    // Gray ratio
    html += '<div class="info-list__row">';
    html += '<dt class="info-list__label">白髪率</dt>';
    html += '<dd class="info-list__value">' + c.gray_ratio_label + '</dd>';
    html += '</div>';

    // Treatment history
    html += '<div class="info-list__row">';
    html += '<dt class="info-list__label">施術履歴</dt>';
    html += '<dd class="info-list__value">' + c.history_label + '</dd>';
    html += '</div>';

    html += '</dl>';
    html += '</section>';

    // Treatment info section
    html += '<section class="info-section">';
    html += '<h2 class="info-section__title">施術情報 <span class="info-section__title-en">treatment</span></h2>';
    html += '<dl class="info-list">';

    // Shampoo
    html += '<div class="info-list__row">';
    html += '<dt class="info-list__label">シャンプー</dt>';
    html += '<dd class="info-list__value">' + renderColorRecipe(c.shampoo) + '</dd>';
    html += '</div>';

    // Treatment
    html += '<div class="info-list__row">';
    html += '<dt class="info-list__label">トリートメント</dt>';
    html += '<dd class="info-list__value">' + renderColorRecipe(c.treatment) + '</dd>';
    html += '</div>';

    // Contact time
    html += '<div class="info-list__row">';
    html += '<dt class="info-list__label">放置時間</dt>';
    html += '<dd class="info-list__value"><span class="time-badge">' + c.contact_time + '</span></dd>';
    html += '</div>';

    html += '</dl>';
    html += '</section>';

    html += '</div>';
    html += '</article>';

    return html;
  }

  return {
    renderCaseCard: renderCaseCard,
    renderCaseDetail: renderCaseDetail,
    renderColorRecipe: renderColorRecipe,
    getUniqueColors: getUniqueColors,
    brightnessText: brightnessText
  };

})();
