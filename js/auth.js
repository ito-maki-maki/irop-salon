/**
 * auth.js
 * クライアントサイドのパスワードゲート
 * 正しいパスワードを入力するとコンテンツが表示される
 */
(function() {
  'use strict';

  var HASH = 'b6f9af916ae83d7a660f01b3904d8916639a3386b8f9cde6e0eb4e881833a0d9';
  var SESSION_KEY = 'irop_auth';

  function hexEncode(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
      hex += ('0' + bytes[i].toString(16)).slice(-2);
    }
    return hex;
  }

  function sha256(str) {
    var encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(str)).then(hexEncode);
  }

  function unlock() {
    var gate = document.getElementById('authGate');
    var content = document.getElementById('authContent');
    if (gate) gate.style.display = 'none';
    if (content) content.style.display = '';
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  function showError() {
    var msg = document.getElementById('authError');
    if (msg) {
      msg.textContent = 'パスワードが正しくありません';
      msg.hidden = false;
    }
    var input = document.getElementById('authInput');
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    var input = document.getElementById('authInput');
    var val = input ? input.value : '';
    if (!val) return;

    sha256(val).then(function(hash) {
      if (hash === HASH) {
        unlock();
      } else {
        showError();
      }
    });
  }

  // 既に認証済みならすぐ解除
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    document.addEventListener('DOMContentLoaded', unlock);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      var form = document.getElementById('authForm');
      if (form) form.addEventListener('submit', handleSubmit);
      var input = document.getElementById('authInput');
      if (input) input.focus();
    });
  }

})();
