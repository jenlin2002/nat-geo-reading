/* 國家地理閱讀 × 學習點數存摺／成績試算表（2026-10-18 起訂正規則統一以段考題庫為準，見 fixkit.js）：
 *   三項測驗（克漏字、聽力、閱讀理解）底下的按鈕原本是「Check Answers」，現在都改成「送出成績」：
 *   按下去 → 全部作答才能送 → 畫面顯示每題對錯與正確答案 → 自動帶「登入者」的名字，
 *   ① 記學習點數（Points.earn）、② 把成績和每題明細送到和英文測驗系統同一份 Google 試算表 → 這一項答案鎖住。
 *   按之前答案都可以改。登入一次各網站通用（同一個網域，登入資料存在 localStorage 的 quizStudentName）。需要先載入 points.js。 */
(function () {
  // ---- 診斷（2026-10-24）：使用者的大陸平板 App 裡點分頁沒反應；頁面出錯時在畫面上方顯示紅框（錯誤訊息＋瀏覽器版本），方便截圖回報 ----
  var diagBox = null, diagMsgs = [];
  function showDiag(msg) {
    if (diagMsgs.indexOf(msg) >= 0 || diagMsgs.length > 5) return;
    diagMsgs.push(msg);
    if (!diagBox) {
      diagBox = document.createElement('div');
      diagBox.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#fff0f0;border:2px solid #c0392b;border-radius:10px;padding:10px 12px;font:13px/1.5 sans-serif;color:#7a1f14;max-height:60vh;overflow:auto;box-shadow:0 4px 16px rgba(0,0,0,.25)';
      diagBox.onclick = function (e) { if (e.target.getAttribute('data-x')) diagBox.style.display = 'none'; };
      (document.body || document.documentElement).appendChild(diagBox);
    }
    diagBox.innerHTML = '<b>⚠️ 這個瀏覽器執行網頁時出錯（請截圖給 Claude）</b> <button data-x="1" style="float:right">關閉</button><br>' +
      diagMsgs.map(function (m) { return '• ' + String(m).replace(/</g, '&lt;'); }).join('<br>') +
      '<br><small>' + String(navigator.userAgent).replace(/</g, '&lt;') + '｜語音：' + ('speechSynthesis' in window ? '有' : '沒有') + '</small>';
  }
  window.addEventListener('error', function (e) { showDiag((e.message || '錯誤') + (e.lineno ? '（第 ' + e.lineno + ' 行）' : '')); });
  window.addEventListener('unhandledrejection', function (e) { var r = e.reason; if (r && /fetch|network|Load failed/i.test(String(r.message || r))) return; showDiag('Promise：' + (r && r.message || r)); });
  // HarmonyOS 等沒有 Google 語音的系統：speechSynthesis 可能不存在或呼叫就出錯，包一層讓分頁、按鈕照常運作（只是沒聲音）
  try {
    var ss = window.speechSynthesis;
    if (ss) ['cancel', 'speak', 'pause', 'resume', 'getVoices'].forEach(function (k) {
      var f = ss[k]; if (typeof f !== 'function') return;
      try { ss[k] = function () { try { return f.apply(ss, arguments); } catch (e) { return k === 'getVoices' ? [] : undefined; } }; } catch (e) {}
    });
  } catch (e) {}
  setTimeout(function () {   // 頁面主程式有沒有跑起來：分頁按鈕應該已經綁好 onclick
    var t = document.querySelector('.tab-btn');
    if (t && !t.onclick) showDiag('頁面主程式沒有執行（分頁按鈕沒有綁定），多半是瀏覽器太舊、不支援網頁用到的語法');
  }, 1500);
})();

(function () {
  var DEFAULT_SYNC_URL = 'https://script.google.com/macros/s/AKfycbwqd9cr_3MfXK8hzs8Y-YPQQUqOH5vKtW_vMav1nMAAt9VkBCP_5WP6Q1TDngIlr51U/exec';
  var mem = {};
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return (k in mem) ? mem[k] : null; } }
  var label = 'NatGeo｜' + String(document.title || location.pathname).replace(/\s*[·｜|]\s*/, ' ').trim();

  function student() {
    var n = String(get('quizStudentName') || '').trim();
    return (!n || /^訪客/.test(n)) ? '' : n;
  }

  // 舊的「同步設定」按鈕不用了：換成一行說明（登入者與送出狀態）
  var syncBtn = document.getElementById('sync-settings-btn');
  if (syncBtn && syncBtn.parentNode) {
    syncBtn.parentNode.innerHTML = '<span id="sync-status" style="font-family:Verdana, sans-serif;font-size:.78rem;color:#7a7259;"></span>';
  }
  var statusEl = document.getElementById('sync-status');
  var doneNames = [];
  function refreshStatus() {
    if (!statusEl) return;
    var n = student();
    statusEl.textContent = !n ? '☁️ 尚未登入，成績不會記錄'
      : ('☁️ 登入者：' + n + (doneNames.length ? '｜已送出：' + doneNames.join('、') : '（做完每一項測驗，按該項底下的「送出成績」）'));
  }
  refreshStatus();
  setInterval(refreshStatus, 1500);

  // 原本各頁的 sendResult 會在按 Check 時送成績；現在由「送出成績」按鈕統一處理
  window.sendResult = function () {};

  // 測驗規則統一以段考題庫為準（2026-10-18）：送出 → 對答案 → 訂正錯誤到全對補送 1 點、暫存（fixkit.js，和英文測驗系統、美式生活館共用）
  function clozeItems() {
    return Array.prototype.map.call(document.querySelectorAll('#cloze-text input'), function (inp) {
      var idx = parseInt(inp.dataset.a, 10), ans = String(clozeAnswers[idx]);
      function tip() { return inp.nextElementSibling && inp.nextElementSibling.classList.contains('fk-ans') ? inp.nextElementSibling : null; }
      return {
        el: inp, q: '空格 ' + (idx + 1), correct: ans,
        value: function () { return inp.value.trim(); },
        right: function () { return inp.value.trim().toLowerCase() === ans.toLowerCase(); },
        clear: function () { inp.value = ''; }, set: function (v) { inp.value = v; },
        lock: function (on) { inp.disabled = on; },
        mark: function () {
          var ok = this.right(); inp.classList.toggle('correct', ok); inp.classList.toggle('wrong', !ok);
          if (!ok && !tip()) { var t = document.createElement('span'); t.className = 'fk-ans'; t.textContent = '→ ' + ans; inp.insertAdjacentElement('afterend', t); }
        },
        unmark: function () { inp.classList.remove('correct', 'wrong'); var t = tip(); if (t) t.remove(); }
      };
    });
  }
  function mcItems(list, pre) {
    return list.map(function (it, i) {
      var radios = function () { return Array.prototype.slice.call(document.getElementsByName(pre + i)); };
      var picked = function () { var r = radios().filter(function (x) { return x.checked; })[0]; return r ? parseInt(r.value, 10) : -1; };
      var first = radios()[0];
      return {
        el: first ? (first.closest('.qcard') || first.parentElement) : document.body, q: it.q, correct: it.opts[it.correct],
        value: function () { var p = picked(); return p < 0 ? '' : it.opts[p]; },
        right: function () { return picked() === it.correct; },
        clear: function () { radios().forEach(function (r) { r.checked = false; }); },
        set: function (v) { var j = it.opts.indexOf(v); radios().forEach(function (r) { r.checked = parseInt(r.value, 10) === j; }); },
        lock: function (on) { radios().forEach(function (r) { r.disabled = on; }); },
        mark: function () {
          var p = picked();
          radios().forEach(function (r) { var v = parseInt(r.value, 10), lb = r.parentElement; lb.classList.remove('correct', 'wrong'); if (v === it.correct) lb.classList.add('correct'); else if (v === p) lb.classList.add('wrong'); });
        },
        unmark: function () { radios().forEach(function (r) { r.parentElement.classList.remove('correct', 'wrong'); }); }
      };
    });
  }

  var QUIZZES = [
    { btn: 'check-cloze', box: '#cloze-text', type: '克漏字 Cloze', name: '克漏字', items: clozeItems,
      after: function (sc, tot) { var r = document.getElementById('cloze-result'); if (r) r.textContent = sc + ' / ' + tot + ' correct'; } },
    { btn: 'check-listening', box: '#listening-qs', type: '聽力 Listening', name: '聽力', items: function () { return mcItems(listeningQs, 'listen'); } },
    { btn: 'check-comp', box: '#comp-qs', type: '閱讀理解 Comprehension', name: '閱讀理解', items: function () { return mcItems(compQs, 'comp'); },
      after: function (sc, tot) { var b = document.getElementById('score-box'); if (b) { b.style.display = 'block'; b.textContent = 'Reading Comprehension Score: ' + sc + ' / ' + tot; } } }
  ];

  function post(name, quiz, suffix, rows, score, total) {
    return fetch(get('quizSyncUrl') || DEFAULT_SYNC_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name: name, week: label, mode: quiz.type + suffix, score: score, total: total, percent: total ? Math.round(score / total * 100) : 0, details: rows })
    }).catch(function () {});
  }

  // 題目說明裡的「click "Check Answers."」也一起改
  document.querySelectorAll('#cloze p').forEach(function (p) {
    p.innerHTML = p.innerHTML.replace(/Then click\s*(&quot;|")Check Answers\.?(&quot;|")\.?/i, '作答完畢後，按下面的「送出成績」，會顯示每題對錯與正確答案；答錯的題目要按上方「✏️ 訂正錯誤」訂正到全對。');
  });

  function init() {
    QUIZZES.forEach(function (q) {
      var btn = document.getElementById(q.btn), box = document.querySelector(q.box);
      if (!btn || !box) return;
      btn.textContent = '送出成績';
      var panel = box.closest('section') || box;
      var host = panel.querySelector('h2') ? panel.querySelector('h2').nextElementSibling || box : box;
      q.kit = FixKit.make({
        id: q.btn, name: q.name, host: host, box: box, btn: btn, items: q.items,
        earn: { label: label, mode: q.type }, back: 'index.html',
        post: function (name, suffix, rows, score, total) { return post(name, q, suffix, rows, score, total); },
        onGraded: function (score, total, pending) {
          if (q.after) q.after(score, total);
          q.sent = true; doneNames.push(q.name); refreshStatus();
          var todo = [];
          QUIZZES.forEach(function (o) {
            if (o.sent || !o.kit) return;
            var its = o.items(), miss = its.filter(function (it) { return !it.value(); }).length;
            todo.push(miss ? (o.name + '還有 ' + miss + ' 題沒作答') : (o.name + '已作答完，還沒按「送出成績」'));
          });
          var msg = '「' + q.name + '」已送出成績：' + score + ' / ' + total + ' 題答對（畫面已標出每題對錯與正確答案）。';
          if (pending) msg += '\n\n有 ' + (total - score) + ' 題錯了，按上方「✏️ 訂正錯誤」訂正，全部訂正完再補送 1 點！';
          msg += todo.length ? '\n\n還有單元沒完成：\n' + todo.join('\n') : '\n\n三個單元都送出了，太棒了！';
          setTimeout(function () { alert(msg); }, 50);
        }
      });
    });
  }
  if (window.FixKit) init();
  else {
    var me = document.currentScript && document.currentScript.src, fk = document.createElement('script');
    fk.src = (me ? me.replace(/[^\/]*$/, '') : '') + 'fixkit.js?v=20261024b';
    fk.onload = init;
    document.head.appendChild(fk);
  }
})();
