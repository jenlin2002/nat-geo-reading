# nat-geo-reading（國家地理風閱讀課程）

靜態網站（GitHub Pages：jenlin2002.github.io/nat-geo-reading/），國家地理風格的閱讀教材，每週有一般版與簡化版／進階版兩種難度；`points.js`＋`points-glue.js` 接學習點數存摺。

## 使用者與工作方式（學習網站各 repo 共用同一段，2026-10-13）

- 使用者在三個地方用 Claude Code：**家裡電腦、公司電腦**（兩台都有 GitHub Desktop，用它 Pull／Push）、**外出用手機 App（雲端版）**。學習成長網站已經做很久了，不用從頭介紹。
- **不用教 git／GitHub Desktop／PowerShell 的操作。** 改完直接開 PR 合併到 `main`（使用者另一台電腦用 GitHub Desktop Pull 就好），只要回報「改了什麼、合併到哪裡」。
- 一律用**繁體中文**回覆。
- **每次結束前**：把這次做的事、待辦更新到這個 CLAUDE.md，合併到 `main`，下一個地方 Pull 後就接得上。
- 學習網站的 repo（都在 jenlin2002 底下，GitHub Pages 從 `main` 發布）：
  `jenlin2002.github.io`（網站首頁＝成長學習館總入口、點數存摺、B&M 學習 App）、`english-quiz`（英文測驗系統）、
  `daily_life_listening`（美式生活館）、`vocab-king`（圖解單字）、`nat-geo-reading`（國家地理風閱讀）、`exam-bank`（段考題庫）。
  雲端版只讀得到這次有載入的 repo；要改的 repo 沒載入時，直接用 add_repo 加進來。
- 股票（`stock`、`stock-dashboard`）和學習網站分開，學習網站裡不要放股票相關的東西。

## 測驗規則統一以段考題庫為準（2026-10-18 使用者要求）

- **全站（成長學習館各單元）有測驗的地方，作答、送出、計分、訂正方式一律以國中英語段考題庫（exam-bank `sync.js`）為準**，新做的測驗也要照做：
  送出成績（全部作答才送，送出前可改）→ 馬上對答案（綠對紅錯＋正解）→ 有錯題時上方「✏️ 訂正錯誤」（答對的鎖住、錯題清空重答）→「送出訂正」直到全對 → 補送 1 點；
  沒訂正完不能離開這一頁（TEST、家長有「🚪 立即離開」）；試算表每次訂正註明「【第 N 次訂正】」、完成記「【全部訂正完成】補送 1 點」；點數只算第一次；「💾 暫存」＋自動暫存接續作答。
- 各站的做法：段考題庫 `sync.js`；圖解單字 `topic.html`；國家地理閱讀 `fixkit.js`（`points-glue.js` 載入）；英文測驗系統 `eqfix.js`；美式生活館 `lifefix.js`（engine.js、index.html 用）。英文測驗系統、美式生活館是「一題一題做、答完看解說」的形式，使用者選擇保留，只把結果頁改成訂正規則（只重做錯題、直到全對）。
- 這個 repo：克漏字、聽力、閱讀理解三項都改用共用程式 `fixkit.js`（`points-glue.js` 動態載入它，每頁不用改）。（英文測驗系統用 `eqfix.js`、美式生活館用 `lifefix.js`，因為它們是一題一題的形式，規則相同、程式不同。）克漏字答錯的空格後面會標「→ 正解」。
- **快取**：各頁用 `points-glue.js?v=…` 載入、glue 再用 `fixkit.js?v=…` 載入；改了這兩支要把 v 一起改（32 頁用 sed 換），不然瀏覽器會用舊版（使用者 10-18 看到沒有「訂正錯誤」就是舊版快取）。

- **Android 安裝的 App 裡點測驗分頁沒反應（2026-10-24 修）**：那個 App 的瀏覽器沒有語音引擎（`window.speechSynthesis` 不存在），各頁的分頁按鈕先呼叫 `window.speechSynthesis.cancel()` 就出錯、分頁切不過去。31 頁的 `cancel()` 都改成 `window.speechSynthesis && window.speechSynthesis.cancel()`。**新頁面用到語音一律先判斷有沒有 speechSynthesis。**（英文測驗系統、美式生活館、圖解單字原本就有判斷，用沒有語音的瀏覽器模擬測過分頁都能切。）同時修了電腦版克漏字上方多出一條空的黃色框（`.fk-bar[hidden]` 沒藏起來）。版本號改 `?v=20261024a`。

## 連續學習紅利＋稱讚畫面（2026-10-18）

- 送出測驗後跳出稱讚卡（得幾點、連續第幾天、還差幾點到 100 點）；每跨過 100 點跳出大的恭喜兌換畫面。
- 連續學習紅利：第 2 天 +2、第 3、4 天 +3、第 5 天起每天 +4（2026-10-18 使用者改），中斷就重算；不算在每天 50 點上限內；存摺分頁記成類型「紅利」。
- **答對率計分（2026-10-18）**：答對 1 題得幾點看答對率（第三版，2026-10-18 使用者定）：低於 30% 0.25、30～50% 0.5、50～60% 0.8、60～70% 1、70～90% 1.2、90% 以上 1.5、全對 2，四捨五入成整數（80～90% 使用者沒另外寫，同 7～8 成）；後端 `Code.gs` 的 `CONFIG.RATE_TIERS`，要重新部署 Apps Script 才生效。
- **段考訂正完成補送 1 點（2026-10-18）**：段考題庫錯題全部訂正完成後 `Points.earn({kind:'fix-bonus'})`，後端 `fixBonus_()` 記一筆類型「訂正獎勵」+`CONFIG.FIX_BONUS`（1）點，同一份考卷每天一次、不算每天上限與連續天數；要重新部署 Apps Script 才生效（舊版後端會當成一般賺點、全對每題 2 點＝給 2 點）。
- 程式在 `points.js`（7 份副本內容一致，主檔在 english-quiz-plan `points/points.js`）與後端 `Code.gs`（`CONFIG.STREAK_BONUS`）。
- **要先更新 Apps Script 後端（貼新版 Code.gs → 部署新版本）紅利才會開始算**，步驟在 english-quiz-plan `points/README-點數存摺.md` 最後一節。
