/* 國家地理閱讀 × 學習點數存摺：把各頁原本送成績的 sendResult() 包一層，每次檢查答案就順便記點數。
 * 點數規則（每題 1 點、同一測驗每天第一次才算、每天上限）在後端，這裡只負責回報。
 * 需要先載入 points.js（和英文測驗系統共用同一份；同一個網站，登入一次各專案通用）。 */
(function () {
  if (!window.Points) return;
  var label = 'NatGeo｜' + String(document.title || location.pathname).replace(/\s*[·｜|]\s*/, ' ').trim();
  var orig = window.sendResult;
  window.sendResult = function (quizType, score, total) {
    try { Points.earn({ label: label, mode: quizType, correct: score, total: total }); } catch (e) {}
    if (typeof orig === 'function') return orig.apply(this, arguments);
  };
})();