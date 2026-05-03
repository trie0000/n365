// The big static HTML string that fills #shapion-overlay.

import { ICONS } from '../icons';

export function buildHtml(): string {
  return (
    '<aside id="shapion-sb">' +
      '<div id="shapion-sb-hd">' +
        '<button id="shapion-ws-btn" title="ワークスペース">' +
          '<span class="shapion-ws-badge">N</span>' +
          '<span id="shapion-ws-name">Shapion</span>' +
          '<span class="shapion-ws-caret">▾</span>' +
        '</button>' +
        '<button id="shapion-sb-collapse" class="shapion-pane-x" title="サイドバーを閉じる (Ctrl+\\)">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="shapion-snav" id="shapion-search-nav">' + ICONS.search + '<span>検索</span><span class="shapion-snav-hint">Ctrl K</span></div>' +
      '<div class="shapion-quick-wrap"><button class="shapion-quick-add" id="shapion-quick-add">' + ICONS.plus + '<span>新規</span></button></div>' +
      '<div class="shapion-sb-fixed">' +
        '<div class="shapion-sb-fx" id="shapion-drafts-btn" style="display:none" title="編集中の下書き / 保存衝突で退避された編集"><span class="shapion-sb-fx-ic">📝</span><span class="shapion-sb-fx-lb">下書き</span><span class="shapion-drafts-badge-count">0</span></div>' +
        '<div class="shapion-sb-fx" id="shapion-trash-btn" title="削除されたページ"><span class="shapion-sb-fx-ic">🗑</span><span class="shapion-sb-fx-lb">ゴミ箱</span></div>' +
      '</div>' +
      '<div class="shapion-sl-label">プライベート</div>' +
      '<div id="shapion-tree-wrap"><div id="shapion-tree"></div></div>' +
      '<div id="shapion-sb-ft">' +
        '<button class="shapion-nb" id="shapion-settings-btn" title="設定">⚙<span>設定</span></button>' +
        '<button class="shapion-nb" id="shapion-x" title="アプリを閉じる (Esc)">' + ICONS.exit + '<span>閉じる</span></button>' +
      '</div>' +
      '<div id="shapion-create-menu">' +
        '<div class="shapion-cm-section">作成</div>' +
        '<div class="shapion-cm-item" data-cm="daily-today"><span class="shapion-cm-ic">📅</span><div class="shapion-cm-body"><span class="shapion-cm-name">今日のノート</span><span class="shapion-cm-sub">デイリーノートを開く / 作成</span></div></div>' +
        '<div class="shapion-cm-item" data-cm="new-page"><span class="shapion-cm-ic">📄</span><div class="shapion-cm-body"><span class="shapion-cm-name">空のページ</span><span class="shapion-cm-sub">L1〜L3に追加</span></div></div>' +
        '<div class="shapion-cm-item" data-cm="new-db"><span class="shapion-cm-ic">🗂</span><div class="shapion-cm-body"><span class="shapion-cm-name">空のDB</span><span class="shapion-cm-sub">リスト＋mdフォルダを作成</span></div></div>' +
        '<div class="shapion-cm-sep"></div>' +
        '<div class="shapion-cm-section">テンプレートから</div>' +
        '<div class="shapion-cm-item" data-cm="tpl-weekly"><span class="shapion-cm-ic">📅</span><span class="shapion-cm-name">週次ノート</span></div>' +
        '<div class="shapion-cm-item" data-cm="tpl-minutes"><span class="shapion-cm-ic">📓</span><span class="shapion-cm-name">議事録</span></div>' +
        '<div class="shapion-cm-item" data-cm="tpl-tasks"><span class="shapion-cm-ic">✓</span><span class="shapion-cm-name">タスクDB</span></div>' +
      '</div>' +
    '</aside>' +
    '<main id="shapion-main">' +
      '<div id="shapion-top">' +
        '<button id="shapion-sb-toggle" title="サイドバー (Ctrl+\\)">' + ICONS.sidebar + '</button>' +
        '<button id="shapion-nav-back" class="shapion-nav-btn disabled" title="戻る (Ctrl+[)" disabled>' + ICONS.chevronLeft + '</button>' +
        '<button id="shapion-nav-fwd" class="shapion-nav-btn disabled" title="進む (Ctrl+])" disabled>' + ICONS.chevronRight + '</button>' +
        '<div id="shapion-bc"></div>' +
        '<div id="shapion-presence" class="shapion-presence" style="display:none"></div>' +
        '<button id="shapion-pub-tag" class="shapion-pub-tag" style="display:none" title="公開状態">' +
          '<span class="shapion-pub-tag-dot"></span><span class="shapion-pub-tag-label">公開中</span>' +
        '</button>' +
        '<div id="shapion-pub-pop" class="shapion-pub-pop" style="display:none">' +
          '<div class="shapion-pub-pop-msg"></div>' +
          '<div class="shapion-pub-pop-row">' +
            '<button class="shapion-pub-pop-btn primary" data-pub-act="sync">公開ページに同期</button>' +
            '<button class="shapion-pub-pop-btn" data-pub-act="open">公開ページを開く</button>' +
            '<button class="shapion-pub-pop-btn" data-pub-act="copy">URL をコピー</button>' +
            '<button class="shapion-pub-pop-btn danger" data-pub-act="unpublish">公開を解除</button>' +
            '<button class="shapion-pub-pop-btn ghost" data-pub-act="close">閉じる</button>' +
          '</div>' +
        '</div>' +
        '<div id="shapion-ss"></div>' +
        '<button id="shapion-outline-btn" class="shapion-tog-btn" title="目次">' + ICONS.sort + '<span>目次</span></button>' +
        '<button id="shapion-props-btn" class="shapion-tog-btn" title="プロパティ">' + ICONS.info + '<span>プロパティ</span></button>' +
        '<button id="shapion-ai-btn" class="shapion-tog-btn" title="AIチャット">' + ICONS.sparkle + '<span>AI</span></button>' +
        '<button id="shapion-pgm-btn" title="ページメニュー">' + ICONS.more + '</button>' +
      '</div>' +
      '<div id="shapion-tb">' +
        '<button class="shapion-b" data-cmd="h1" title="見出し1"><b>H1</b></button>' +
        '<button class="shapion-b" data-cmd="h2" title="見出し2"><b>H2</b></button>' +
        '<button class="shapion-b" data-cmd="h3" title="見出し3"><b>H3</b></button>' +
        '<span class="shapion-bs"></span>' +
        '<button class="shapion-b" data-cmd="bold" title="太字"><b>B</b></button>' +
        '<button class="shapion-b" data-cmd="italic" title="斜体"><i>I</i></button>' +
        '<button class="shapion-b" data-cmd="strike" title="取り消し線"><s>S</s></button>' +
        '<button class="shapion-b" data-cmd="code" title="インラインコード">' + ICONS.code + '</button>' +
        '<span class="shapion-bs"></span>' +
        '<button class="shapion-b" data-cmd="ul" title="箇条書き">' + ICONS.ul + '</button>' +
        '<button class="shapion-b" data-cmd="ol" title="番号付きリスト">' + ICONS.ol + '</button>' +
        '<button class="shapion-b" data-cmd="todo" title="ToDoリスト">' + ICONS.todo + '</button>' +
        '<button class="shapion-b" data-cmd="quote" title="引用">' + ICONS.quote + '</button>' +
        '<button class="shapion-b" data-cmd="callout" title="コールアウト"><span style="font-size:14px">💡</span></button>' +
        '<button class="shapion-b" data-cmd="pre" title="コードブロック">' + ICONS.codeBlock + '</button>' +
        '<span class="shapion-bs"></span>' +
        '<button class="shapion-b" data-cmd="hr" title="区切り線">' + ICONS.hr + '</button>' +
      '</div>' +
      '<div id="shapion-content-row">' +
      '<aside id="shapion-outline">' +
        '<div id="shapion-outline-hd"><span>目次</span><button class="shapion-pane-x" id="shapion-outline-x" title="閉じる">' + ICONS.close + '</button></div>' +
        '<div id="shapion-outline-list"></div>' +
      '</aside>' +
      '<div id="shapion-ea"><div id="shapion-ei">' +
        '<div id="shapion-em">' +
          '<div class="shapion-em-icon">📄</div>' +
          '<h2 class="shapion-em-title">はじめてみよう</h2>' +
          '<p class="shapion-em-sub">ページを作るか、テンプレートから始められます。</p>' +
          '<div class="shapion-em-btns">' +
            '<button class="shapion-btn p" id="shapion-ne">＋ 空のページ</button>' +
            '<button class="shapion-btn s" id="shapion-ne-db">▤ DBを作る</button>' +
            '<button class="shapion-btn ghost" id="shapion-ne-tpl">⎘ テンプレ</button>' +
          '</div>' +
          '<div class="shapion-em-chips">' +
            '<button class="shapion-chip shapion-em-chip" data-tpl="weekly">📅 週次ノート</button>' +
            '<button class="shapion-chip shapion-em-chip" data-tpl="tasks">✓ タスクDB</button>' +
            '<button class="shapion-chip shapion-em-chip" data-tpl="minutes">📓 議事録</button>' +
          '</div>' +
        '</div>' +
        '<div id="shapion-ct">' +
          '<div id="shapion-draft-banner" style="display:none"></div>' +
          '<div id="shapion-pg-hd">' +
            '<div id="shapion-icon-wrap">' +
              '<span id="shapion-pg-icon"></span>' +
              '<button class="shapion-pg-icon-empty" id="shapion-add-icon">アイコンを追加</button>' +
            '</div>' +
            '<textarea id="shapion-ttl" rows="1" placeholder="タイトルなし"></textarea>' +
          '</div>' +
          '<div id="shapion-row-props" class="shapion-row-props"></div>' +
          '<div id="shapion-ed" contenteditable="true" spellcheck="false"></div>' +
          '<div id="shapion-backlinks" class="shapion-backlinks" style="display:none"></div>' +
        '</div>' +
      '</div></div>' +
      '<div id="shapion-dv">' +
        '<div id="shapion-dv-inner">' +
          '<div id="shapion-dv-hd">' +
            '<div id="shapion-dv-icon-wrap">' +
              '<span id="shapion-dv-pg-icon"></span>' +
              '<button class="shapion-pg-icon-empty" id="shapion-dv-add-icon">😊 アイコンを追加</button>' +
            '</div>' +
            '<div id="shapion-dv-ttl" contenteditable="true" spellcheck="false"></div>' +
          '</div>' +
          '<div id="shapion-db-views">' +
            '<button class="shapion-db-vbtn on" id="shapion-dbv-table">' + ICONS.table + '<span>テーブル</span></button>' +
            '<button class="shapion-db-vbtn" id="shapion-dbv-board">' + ICONS.board + '<span>ボード</span></button>' +
            '<button class="shapion-db-vbtn" id="shapion-dbv-list">' + ICONS.ul + '<span>リスト</span></button>' +
            '<button class="shapion-db-vbtn" id="shapion-dbv-gallery">' + ICONS.codeBlock + '<span>ギャラリー</span></button>' +
            '<button class="shapion-db-vbtn" id="shapion-dbv-calendar">' + ICONS.info + '<span>カレンダー</span></button>' +
            '<button class="shapion-db-vbtn" id="shapion-dbv-gantt">' + ICONS.sort + '<span>ガント</span></button>' +
          '</div>' +
          '<div id="shapion-db-tb">' +
            '<button class="shapion-db-chip" id="shapion-db-filter-btn"><span>＋ フィルター</span></button>' +
            '<button class="shapion-db-chip" id="shapion-db-sort-btn">' + ICONS.sort + '<span>ソート</span></button>' +
            '<button class="shapion-db-chip" id="shapion-db-group-btn"><span>⊟</span><span>グループ</span></button>' +
            '<button class="shapion-db-new-btn" id="shapion-db-new-row">＋ 新規</button>' +
            '<div class="shapion-db-tb-spacer"></div>' +
            '<button class="shapion-db-chip subtle" id="shapion-db-csv-export">' + ICONS.download + '<span>CSV</span></button>' +
            '<button class="shapion-db-chip subtle" id="shapion-db-csv-import">' + ICONS.copy + '<span>取込</span></button>' +
          '</div>' +
          '<div id="shapion-filter-chips"></div>' +
          '<div id="shapion-filter-popover"></div>' +
          '<div id="shapion-dt-wrap">' +
            '<table id="shapion-dt">' +
              '<thead><tr id="shapion-dth-row"></tr></thead>' +
              '<tbody id="shapion-dtb"></tbody>' +
            '</table>' +
            '<button id="shapion-dadd">＋ 新しい行</button>' +
          '</div>' +
          '<div id="shapion-kb"></div>' +
          '<div id="shapion-list-view" class="shapion-altview"></div>' +
          '<div id="shapion-gallery-view" class="shapion-altview"></div>' +
          '<div id="shapion-calendar-view" class="shapion-altview"></div>' +
          '<div id="shapion-gantt-view" class="shapion-altview"></div>' +
        '</div>' +
      '</div>' +
      '<aside id="shapion-props">' +
        '<div id="shapion-props-hd"><span>プロパティ</span><button class="shapion-pane-x" id="shapion-props-x" title="閉じる">' + ICONS.close + '</button></div>' +
        '<div id="shapion-props-list"></div>' +
      '</aside>' +
      '<aside id="shapion-ai-panel">' +
        '<div id="shapion-ai-hd">' +
          '<span class="shapion-ai-title">' + ICONS.sparkle + '<span>AIチャット</span></span>' +
          '<button id="shapion-ai-new" title="新しい会話">' + ICONS.plus + '</button>' +
          '<button id="shapion-ai-clear" title="現在の会話を削除">' + ICONS.trash + '</button>' +
          '<button id="shapion-ai-close" class="shapion-pane-x" title="閉じる">' + ICONS.close + '</button>' +
        '</div>' +
        '<div id="shapion-ai-hist-row">' +
          '<select id="shapion-ai-hist" title="会話履歴"></select>' +
        '</div>' +
        '<div id="shapion-ai-messages"></div>' +
        '<div id="shapion-ai-chips"></div>' +
        '<div id="shapion-ai-inputarea">' +
          '<select id="shapion-ai-model-pick" title="プロバイダ・モデル選択"></select>' +
          '<textarea id="shapion-ai-input" placeholder="このページについて聞く…" rows="2"></textarea>' +
          '<button id="shapion-ai-send" title="送信 (⌘↵)">' + ICONS.send + '</button>' +
        '</div>' +
      '</aside>' +
      '</div>' + // /content-row
      '<div id="shapion-ld"><span>⏳</span><span id="shapion-lm"> 読み込み中...</span></div>' +
    '</main>' +
    '<div id="shapion-md"><div class="shapion-mb">' +
      '<h2>🚀 初期セットアップ</h2>' +
      '<p>ドキュメントライブラリに <code>shapion-pages</code> フォルダを作成してよいですか？<br>ページは .md ファイルとしてここに保存されます。</p>' +
      '<div class="shapion-ma">' +
        '<button class="shapion-btn s" id="shapion-mc">キャンセル</button>' +
        '<button class="shapion-btn p" id="shapion-mk">フォルダを作成</button>' +
      '</div>' +
    '</div></div>' +
    '<div id="shapion-col-md"><div class="shapion-mb" style="max-width:380px">' +
      '<h2>列を追加</h2>' +
      '<div class="shapion-col-row"><label>列名</label><input id="shapion-col-name" class="shapion-col-inp" type="text" placeholder="例: 担当者"></div>' +
      '<div class="shapion-col-row"><label>タイプ</label>' +
        '<div id="shapion-col-type-grid">' +
          '<div class="shapion-col-type" data-tk="2"  data-ic="Aa"><span class="shapion-col-type-ic">Aa</span><span>テキスト</span></div>' +
          '<div class="shapion-col-type" data-tk="3"  data-ic="¶"><span class="shapion-col-type-ic">¶</span><span>複数行</span></div>' +
          '<div class="shapion-col-type" data-tk="9"  data-ic="#"><span class="shapion-col-type-ic">#</span><span>数値</span></div>' +
          '<div class="shapion-col-type" data-tk="4"  data-ic="📅"><span class="shapion-col-type-ic">📅</span><span>日付</span></div>' +
          '<div class="shapion-col-type" data-tk="6"  data-ic="◉"><span class="shapion-col-type-ic">◉</span><span>セレクト</span></div>' +
          '<div class="shapion-col-type" data-tk="15" data-ic="◎"><span class="shapion-col-type-ic">◎</span><span>マルチ</span></div>' +
          '<div class="shapion-col-type" data-tk="8"  data-ic="☐"><span class="shapion-col-type-ic">☐</span><span>チェック</span></div>' +
          '<div class="shapion-col-type" data-tk="11" data-ic="🔗"><span class="shapion-col-type-ic">🔗</span><span>URL</span></div>' +
          '<div class="shapion-col-type" data-tk="20" data-ic="👤"><span class="shapion-col-type-ic">👤</span><span>担当者</span></div>' +
          '<div class="shapion-col-type" data-tk="7"  data-ic="↔"><span class="shapion-col-type-ic">↔</span><span>関係</span></div>' +
          '<div class="shapion-col-type" data-tk="17" data-ic="Σ"><span class="shapion-col-type-ic">Σ</span><span>ロールアップ</span></div>' +
          '<div class="shapion-col-type" data-tk="17" data-ic="ƒ"><span class="shapion-col-type-ic">ƒ</span><span>数式</span></div>' +
          '<div class="shapion-col-type" data-tk="18" data-ic="📎"><span class="shapion-col-type-ic">📎</span><span>ファイル</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="shapion-col-row" id="shapion-col-choices-row"><label>選択肢（1行1つ）</label><textarea id="shapion-col-choices" class="shapion-col-choices" placeholder="例:\n進行中\n完了\n未着手"></textarea></div>' +
      '<div class="shapion-col-row"><label>SharePointリストの列にマップ</label><input id="shapion-col-spmap" class="shapion-col-inp" type="text" placeholder="自動推定"></div>' +
      '<div class="shapion-ma">' +
        '<button class="shapion-btn s" id="shapion-col-cancel">キャンセル</button>' +
        '<button class="shapion-btn p" id="shapion-col-ok">追加</button>' +
      '</div>' +
    '</div></div>' +
    '<div id="shapion-ftb">' +
      '<button class="shapion-fb" data-cmd="bold" title="太字"><b>B</b></button>' +
      '<button class="shapion-fb" data-cmd="italic" title="斜体"><i>I</i></button>' +
      '<button class="shapion-fb" data-cmd="strike" title="取り消し線"><s>S</s></button>' +
      '<button class="shapion-fb" data-cmd="code" title="インラインコード">' + ICONS.code + '</button>' +
      '<span class="shapion-fb-sep"></span>' +
      '<button class="shapion-fb" data-cmd="h1" title="見出し1"><b>H1</b></button>' +
      '<button class="shapion-fb" data-cmd="h2" title="見出し2"><b>H2</b></button>' +
      '<button class="shapion-fb" data-cmd="h3" title="見出し3"><b>H3</b></button>' +
      '<span class="shapion-fb-sep"></span>' +
      '<button class="shapion-fb" data-cmd="ul" title="箇条書き">' + ICONS.ul + '</button>' +
      '<button class="shapion-fb" data-cmd="ol" title="番号付きリスト">' + ICONS.ol + '</button>' +
      '<button class="shapion-fb" data-cmd="quote" title="引用">' + ICONS.quote + '</button>' +
    '</div>' +
    '<div id="shapion-slash"></div>' +
    '<div id="shapion-qs"><div id="shapion-qs-box">' +
      '<input id="shapion-qs-inp" type="text" placeholder="ページを検索...">' +
      '<div id="shapion-qs-res"></div>' +
    '</div></div>' +
    '<div id="shapion-emoji"><div id="shapion-emoji-grid"></div><button id="shapion-emoji-rm">アイコンを削除</button></div>' +
    '<div id="shapion-trash-md"><div class="shapion-mb" style="max-width:540px">' +
      '<h2>ゴミ箱</h2>' +
      '<div id="shapion-trash-list"></div>' +
      '<div class="shapion-ma">' +
        '<button class="shapion-btn ghost" id="shapion-trash-empty" style="color:#b13a3a">🗑 すべて完全削除</button>' +
        '<button class="shapion-btn s" id="shapion-trash-close">閉じる</button>' +
      '</div>' +
    '</div></div>' +
    '<div id="shapion-settings-md"><div class="shapion-mb" style="max-width:520px">' +
      '<h2>⚙ 設定</h2>' +
      '<div class="shapion-set-section">AI プロバイダ</div>' +
      '<div class="shapion-set-row"><label>使用するサービス</label>' +
        '<select id="shapion-set-provider">' +
          '<option value="claude">Anthropic Claude</option>' +
          '<option value="corp">Azure OpenAI 互換 API</option>' +
          '<option value="local">ローカル AI (Ollama / LM Studio 等)</option>' +
        '</select>' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="claude"><label>Claude モデル</label>' +
        '<select id="shapion-set-claude-model"></select>' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="claude"><label>Claude API キー</label>' +
        '<input id="shapion-set-aikey" type="password" placeholder="sk-ant-...">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="corp"><label>Azure OpenAI 互換 モデル</label>' +
        '<select id="shapion-set-corpai-model"></select>' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="corp"><label>API キー</label>' +
        '<input id="shapion-set-corpai-key" type="password" placeholder="api-key (Azure OpenAI のキー / ゲートウェイのサブスクリプションキー)">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="corp"><label>ベース URL</label>' +
        '<input id="shapion-set-corpai-baseurl" type="text" placeholder="https://&lt;resource&gt;.openai.azure.com">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="corp"><label>デプロイ ID プレフィックス</label>' +
        '<input id="shapion-set-corpai-prefix" type="text" placeholder="(任意 — モデル名と同じデプロイ名なら空欄でOK)">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="corp"><label>モデル別オーバーライド (任意 / JSON)</label>' +
        '<textarea id="shapion-set-corpai-overrides" rows="6" placeholder=\'{"gpt-5":{"baseUrl":"https://...","apiVersion":"2025-01-01-preview","deploymentId":"..."}}\' style="font-family:var(--font-mono);font-size:11px"></textarea>' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="corp"><label></label>' +
        '<div class="shapion-set-hint">' +
        '<b>対応サービス</b>: Azure OpenAI Service、Azure API Management 経由のラッパー、社内 API ゲートウェイ等。' +
        '<br><b>URL の組み立て方</b>: <code>{ベース URL}/openai/deployments/{デプロイ ID}/chat/completions?api-version={api-version}</code>' +
        '<br>※ ベース URL の例 — Azure 本家: <code>https://&lt;resource&gt;.openai.azure.com</code>、ゲートウェイ: <code>https://gateway.example.com/myapi/2024-10-21</code>' +
        '<br>※ デプロイ ID は <code>{プレフィックス}{モデル名(.は削除)}</code> で組み立て (Azure 本家でデプロイ名 = モデル名にしている場合はプレフィックス空欄でOK)' +
        '<br>※ api-version デフォルト — 推論系 (GPT-5/o3/o4-mini): <code>2024-12-01-preview</code>、それ以外: <code>2024-06-01</code>' +
        '<br>—' +
        '<br>モデル別に違う設定 (別エンドポイントなど) が必要な場合はオーバーライドに <code>{"モデル名":{"baseUrl":"...","apiVersion":"...","deploymentId":"..."}}</code> を記入。各フィールドは任意・未指定で全体設定にフォールバック。' +
        '<br>ページ/DB 操作のツール機能 (Function Calling) も利用可能。' +
        '</div>' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="local"><label>ベース URL</label>' +
        '<input id="shapion-set-localai-baseurl" type="text" placeholder="http://localhost:11434/v1 (Ollama) / http://localhost:1234/v1 (LM Studio)">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="local"><label>API キー (任意)</label>' +
        '<input id="shapion-set-localai-key" type="password" placeholder="ローカルサーバ側で要求する場合のみ">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="local"><label>使用するモデル</label>' +
        '<input id="shapion-set-localai-model" type="text" placeholder="例: llama3.1, qwen2.5-coder, mistral-small">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="local"><label>モデル候補 (任意 / 1行1モデル)</label>' +
        '<textarea id="shapion-set-localai-models" rows="4" placeholder="llama3.1\nqwen2.5-coder\ngemma3:4b\nmistral-small" style="font-family:var(--font-mono);font-size:11px"></textarea>' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="local"><label>推論モデル (任意)</label>' +
        '<input id="shapion-set-localai-reasoning" type="text" placeholder="名前の一部を空白区切り (例: o1 deepseek-r1 qwq) ─ 一致するモデルは max_completion_tokens を使う">' +
      '</div>' +
      '<div class="shapion-set-row" data-prov="local"><label></label>' +
        '<div class="shapion-set-hint">' +
        '<b>対応サーバ</b>: Ollama、LM Studio、llama.cpp server、vLLM、その他 OpenAI Chat Completions 互換のもの。' +
        '<br><b>セットアップ例 (Ollama)</b>: <code>ollama serve</code> 起動後、ベース URL に <code>http://localhost:11434/v1</code>、モデルに <code>llama3.1</code> 等を指定。' +
        '<br><b>セットアップ例 (LM Studio)</b>: 「Local Server」タブで Start。ベース URL <code>http://localhost:1234/v1</code>、モデルに UI のモデル名をコピー。' +
        '<br><b>URL 形式</b>: <code>{ベース URL}/chat/completions</code>。<code>/v1</code> まで含めるのが一般的。' +
        '<br>※ ブックマークレットを開いている SP サイト (https) からローカル (http) の <code>localhost</code> を叩けるかはブラウザのセキュリティ設定次第。叩けない場合は中継スクリプト (scripts/corp-ai-relay.py 改) 経由で同オリジンに見せかけるか、ローカル AI サーバを HTTPS 化してください。' +
        '<br>※ Function Calling (ツール経由のページ/DB 操作) は OpenAI 互換 tools パラメータを実装したサーバ (Ollama 0.3+ 等) のみ動作。' +
        '</div>' +
      '</div>' +
      '<div class="shapion-set-section">表示</div>' +
      '<div class="shapion-set-row"><label>表示密度</label><select id="shapion-set-density"><option value="compact">コンパクト</option><option value="regular" selected>標準</option><option value="comfy">ゆったり</option></select></div>' +
      '<div class="shapion-set-row"><label>テーマ</label><select id="shapion-set-theme"><option value="light" selected>ライト</option><option value="dark">ダーク</option></select></div>' +
      '<div class="shapion-ma">' +
        '<button class="shapion-btn s" id="shapion-set-cancel">キャンセル</button>' +
        '<button class="shapion-btn p" id="shapion-set-save">保存</button>' +
      '</div>' +
    '</div></div>' +
    '<div id="shapion-pgm">' +
      '<div class="shapion-pgm-item" data-action="export-md">' + ICONS.download + '<span>Markdownでエクスポート</span></div>' +
      '<div class="shapion-pgm-item" data-action="export-html">' + ICONS.download + '<span>HTMLでエクスポート</span></div>' +
      '<div class="shapion-pgm-sep"></div>' +
      '<div class="shapion-pgm-item" data-action="duplicate">' + ICONS.copy + '<span>複製</span></div>' +
      '<div class="shapion-pgm-item" data-action="duplicate-as-draft">✏️<span>下書きとして複製</span></div>' +
      '<div class="shapion-pgm-item" data-action="version-history">📜<span>バージョン履歴</span></div>' +
      '<div class="shapion-pgm-item" data-action="copy-link">' + ICONS.link + '<span>リンクをコピー</span></div>' +
      '<div class="shapion-pgm-item" data-action="publish">' + ICONS.link + '<span class="shapion-pgm-publish-label">Web 公開</span></div>' +
      '<div class="shapion-pgm-item" data-action="copy-pub-url" style="display:none">' + ICONS.copy + '<span>公開 URL をコピー</span></div>' +
      '<div class="shapion-pgm-item" data-action="restore-daily" style="display:none">📅<span>デイリーノートに戻す</span></div>' +
      '<div class="shapion-pgm-sep"></div>' +
      '<div class="shapion-pgm-item" data-action="print">' + ICONS.print + '<span>印刷</span></div>' +
      '<div class="shapion-pgm-item" data-action="info">' + ICONS.info + '<span>ページ情報</span></div>' +
      '<div class="shapion-pgm-item" data-action="focus">' + ICONS.sidebar + '<span>集中モード切替</span></div>' +
      '<div class="shapion-pgm-sep"></div>' +
      '<div class="shapion-pgm-item danger" data-action="delete">' + ICONS.trash + '<span>削除</span></div>' +
    '</div>' +
    '<div id="shapion-tk"></div>'
  );
}
