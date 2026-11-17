# nat-geo-reading（國家地理風閱讀課程）

靜態網站（GitHub Pages：jenlin2002.github.io/nat-geo-reading/），國家地理風格的閱讀教材，每週有一般版與簡化版／進階版兩種難度；`points.js`＋`points-glue.js` 接學習點數存摺。

## 登入改成 Cloudflare Access＋Google 帳號（2026-11-04 規劃，程式已做好、等使用者設定後台）

- 使用者選定：學習網站跟股票網站一樣用 Cloudflare 保護（但兩邊完全分開），BRANDEN、MELISSA 用自己的 Google 帳號、家長用自己的 Gmail 登入，不再「選名字＋4 位數 PIN」。
- 6 個 repo 由首頁 repo（jenlin2002.github.io）的 GitHub Actions「部署到 Cloudflare Pages」合成一個網站（Pages 專案 `bmlearn`，網址 **https://bmlearn.pages.dev**，路徑和 GitHub Pages 一樣；2026-11-05 從 learn-6td.pages.dev 改名，舊網址和 jenlin2002.github.io 都轉到這裡，後台步驟在首頁 repo `CLOUDFLARE-SETUP.md` 第七節），`functions/api/me.js` 用 Access 憑證＋`USER_MAP`（Cloudflare 變數，email 不放 repo）回傳登入者名字。
- `points.js`（各站副本內容相同）：在 Cloudflare 網址打開時問 `/api/me`，自動設定 `quizStudentName`、不出現「你是誰？」關卡；第一階段每台裝置第一次只問一次自己的 PIN；第二階段（Code.gs 加 `cfUser_`、Cloudflare 設 `POINTS_SECRET`）點數改走 `/api/points`，不用 PIN。登出會連 Google 登入一起登出。在 jenlin2002.github.io 舊網址一切照舊。
- 後台設定步驟、測試方法、第二階段 Code.gs 改法都在首頁 repo 的 `CLOUDFLARE-SETUP.md`。密碼、金鑰一律使用者自己在 Cloudflare／GitHub／Google 後台輸入。
- 之後新做的頁面照舊用相對路徑；子站寫死的 `https://jenlin2002.github.io/` 部署時會自動改成 `/`。Cloudflare Pages 單檔上限 25 MB、整站 20000 個檔（2026-11-04 約 15300 個），大檔（>24 MB）部署時自動改由 `/api/big` 轉給登入的人（2026-11-05 起；要有 `REPOS_TOKEN`，repo 改 Private 也能讀；金鑰到期要重做，見首頁 repo `CLOUDFLARE-SETUP.md` 第八節）。寫頁面照舊連原本的相對路徑，不用改。
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

- **使用者的平板是 HarmonyOS（華為，沒有 Google 語音，2026-10-24）**：`points-glue.js` 開頭加了 ① 把 `speechSynthesis` 的 cancel／speak／pause／resume／getVoices 包一層 try（呼叫出錯就當作沒聲音），② 頁面出錯時畫面上方跳紅框（錯誤訊息＋瀏覽器版本 userAgent＋有沒有語音），請使用者截圖回報；分頁按鈕 1.5 秒後還沒綁好也會跳紅框。版本號 `?v=20261024b`。

## 我的字卡（2026-11-17 使用者要求，手機雲端版）

- 登入者可以把單字／句子存成字卡、自己分類；字卡存在點數存摺同一份 Google 試算表的「字卡」「字卡分類」分頁（每人一份，手機、平板、電腦同步）。後端是 english-quiz-plan `points/Code.gs` 的 `cardlist／cardsave／carddel／cardmove／cardstatus／deckadd／deckrename／deckdel`（用存摺的登入憑證；同一人同一個英文只存一張；答錯再加入時「錯次」+1）。**要重新部署 Apps Script 才能用**，沒部署前按 ☆ 會提示「後端還沒更新」。
- 全站共用前端 `/cards/cards.js`（首頁 repo）：`Cards.btn(card)` 產生「☆」按鈕（點了選分類／新分類存起來，已存的變 ★，可改分類或移除）；`Cards.addWrong([card…])` 把測驗答錯的字自動放進「錯題」。card 欄位：en、zh、pos、ex、exzh、img、audio（網站根目錄開頭的絕對路徑）、src（來源名稱）、url。需要 `points.js`（它開放了 `Points.call／Points.auth／Points.who` 給字卡用，7 份副本一致）。
- 「我的字卡」頁 `/cards/`（首頁 repo；首頁右上角「📇 我的字卡」、App 入口頁都有連結）：分類（新增、改名、刪除→卡片移到未分類）、字卡列表（多選後移動、刪除、標會了／還不會）、🔄 翻卡複習（可只看還不會的）、✏️ 小測驗（看中文選英文＋拼字，照段考題庫規則用 `/cards/fixkit.js`：送出、對答案、訂正、補送 1 點、暫存；答錯的字再加進錯題；點數 label `Cards｜分類名`）、🖨️ 印出（左正面右背面，對摺剪下）。
- 各站接法：圖解單字 `topic.html`（單字卡 ☆、三種測驗答錯自動加入）；英文測驗系統 `vocab/vocab.js`（國中2000字單字卡頁 ☆，會自動載入 points.js）、`grammar2/gquiz.js`（單字區測驗答錯自動加入）、`eqfix.js`（每週測驗的單字題 ☆、答錯自動加入）；國家地理閱讀 `points-glue.js`（Vocabulary 卡 ☆、克漏字答錯自動加入）；美式生活館 `engine.js`、`units.html`（場景單字、你要說的、你會聽到的句子 ☆）。段考題庫沒有接（題型不是單字卡）。
- 這個 repo：`points-glue.js` 的 `vocabCard()`／`addStars()`，版本號 `?v=20261117a`。

## 連續學習紅利＋稱讚畫面（2026-10-18）

- 送出測驗後跳出稱讚卡（得幾點、連續第幾天、還差幾點到 100 點）；每跨過 100 點跳出大的恭喜兌換畫面。
- 連續學習紅利：第 2 天 +2、第 3、4 天 +3、第 5 天起每天 +4（2026-10-18 使用者改），中斷就重算；不算在每天 50 點上限內；存摺分頁記成類型「紅利」。
- **答對率計分（2026-10-18）**：答對 1 題得幾點看答對率（第三版，2026-10-18 使用者定）：低於 30% 0.25、30～50% 0.5、50～60% 0.8、60～70% 1、70～90% 1.2、90% 以上 1.5、全對 2，四捨五入成整數（80～90% 使用者沒另外寫，同 7～8 成）；後端 `Code.gs` 的 `CONFIG.RATE_TIERS`，要重新部署 Apps Script 才生效。
- **段考訂正完成補送 1 點（2026-10-18）**：段考題庫錯題全部訂正完成後 `Points.earn({kind:'fix-bonus'})`，後端 `fixBonus_()` 記一筆類型「訂正獎勵」+`CONFIG.FIX_BONUS`（1）點，同一份考卷每天一次、不算每天上限與連續天數；要重新部署 Apps Script 才生效（舊版後端會當成一般賺點、全對每題 2 點＝給 2 點）。
- 程式在 `points.js`（7 份副本內容一致，主檔在 english-quiz-plan `points/points.js`）與後端 `Code.gs`（`CONFIG.STREAK_BONUS`）。
- **要先更新 Apps Script 後端（貼新版 Code.gs → 部署新版本）紅利才會開始算**，步驟在 english-quiz-plan `points/README-點數存摺.md` 最後一節。
