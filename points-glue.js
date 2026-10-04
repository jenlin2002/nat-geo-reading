/* 國家地理閱讀 × 學習點數存摺／成績試算表：
 *   三項測驗（克漏字、聽力、閱讀理解）底下的按鈕原本是「Check Answers」，現在都改成「送出成績」：
 *   按下去 → 全部作答才能送 → 畫面顯示每題對錯與正確答案 → 自動帶「登入者」的名字，
 *   ① 記學習點數（Points.earn）、② 把成績和每題明細送到和英文測驗系統同一份 Google 試算表 → 這一項答案鎖住。
 *   按之前答案都可以改。登入一次各網站通用（同一個網域，登入資料存在 localStorage 的 quizStudentName）。需要先載入 points.js。 */
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

  function gradeMC(qs, pre) {
    var score = 0, answered = 0, rows = [];
    qs.forEach(function (it, i) {
      var r = document.querySelector('input[name=' + pre + i + ']:checked');
      var ok = !!r && parseInt(r.value, 10) === it.correct;
      if (r) answered++;
      if (ok) score++;
      rows.push({ q: it.q, picked: r ? it.opts[parseInt(r.value, 10)] : '（未作答）', correct: it.opts[it.correct], isCorrect: ok });
    });
    return { score: score, total: qs.length, answered: answered, details: rows };
  }
  function gradeCloze() {
    var inputs = document.querySelectorAll('#cloze-text input'), score = 0, answered = 0, rows = [];
    inputs.forEach(function (inp) {
      var idx = parseInt(inp.dataset.a, 10), ans = clozeAnswers[idx], val = inp.value.trim();
      var ok = val.toLowerCase() === String(ans).toLowerCase();
      if (val) answered++;
      if (ok) score++;
      rows.push({ q: '空格 ' + (idx + 1), picked: val || '（未作答）', correct: ans, isCorrect: ok });
    });
    return { score: score, total: inputs.length, answered: answered, details: rows };
  }

  var QUIZZES = [
    { btn: 'check-cloze', box: '#cloze-text', type: '克漏字 Cloze', name: '克漏字', grade: gradeCloze },
    { btn: 'check-listening', box: '#listening-qs', type: '聽力 Listening', name: '聽力', grade: function () { return gradeMC(listeningQs, 'listen'); } },
    { btn: 'check-comp', box: '#comp-qs', type: '閱讀理解 Comprehension', name: '閱讀理解', grade: function () { return gradeMC(compQs, 'comp'); } }
  ];

  function post(name, quiz, g) {
    if (name === 'PARENT') return Promise.resolve();   // 家長測試不寫進孩子的成績單
    return fetch(get('quizSyncUrl') || DEFAULT_SYNC_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name: name, week: label, mode: quiz.type, score: g.score, total: g.total, percent: g.total ? Math.round(g.score / g.total * 100) : 0, details: g.details })
    }).catch(function () {});
  }

  // 題目說明裡的「click "Check Answers."」也一起改
  document.querySelectorAll('#cloze p').forEach(function (p) {
    p.innerHTML = p.innerHTML.replace(/Then click\s*(&quot;|")Check Answers\.?(&quot;|")\.?/i, '作答完畢後，按下面的「送出成績」，會顯示每題對錯與正確答案。');
  });

  QUIZZES.forEach(function (q) {
    var btn = document.getElementById(q.btn);
    if (!btn) return;
    var showResult = btn.onclick;   // 頁面原本的「對答案、標出對錯與正解」
    var sent = false;
    btn.textContent = '送出成績';
    btn.onclick = function () {
      if (sent) return;
      var name = student();
      if (!name) { alert('請先登入（在「你是誰？」選名字並輸入 PIN），成績才會記在你的名下'); return; }
      var g = q.grade();
      if (g.answered < g.total) { alert('「' + q.name + '」還有 ' + (g.total - g.answered) + ' 題沒作答，請先完成再送出成績'); return; }
      sent = true;
      btn.disabled = true; btn.style.opacity = '.6'; btn.style.cursor = 'not-allowed'; btn.textContent = '送出中...';
      document.querySelectorAll(q.box + ' input').forEach(function (i) { i.disabled = true; });   // 送出後答案鎖住
      if (typeof showResult === 'function') showResult.call(btn);                                  // 畫面顯示每題對錯與正確答案
      if (window.Points) { try { Points.earn({ name: name, label: label, mode: q.type, correct: g.score, total: g.total }); } catch (e) {} }
      post(name, q, g).then(function () {
        btn.textContent = '已送出成績（' + g.score + ' / ' + g.total + '）';
        doneNames.push(q.name);
        refreshStatus();
      });
    };
  });
})();
