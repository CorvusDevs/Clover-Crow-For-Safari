// Language picker + i18n runtime for the Clover Crow docs site.
// Loaded by index.html and privacy.html AFTER translations.js (which
// defines the global `T` object). Persists the user's choice in
// localStorage, detects their default from the ?lang= query string,
// stored preference, or navigator.language (in priority order), and
// swaps every [data-i18n] element's text on selection.
(function () {
    if (typeof T !== 'object' || !T.en) return; // translations.js missing → degrade to English
    var LS_KEY = 'clovercrow_docs_lang';
    // Resolve assets (flag SVGs) relative to THIS script's own URL, not the
    // page, so they also load on the per-locale SEO pages under /i18n/<locale>/.
    var CC_BASE = (function(){
        var sc = document.currentScript || (function(){ var s = document.querySelectorAll('script[src*="i18n-runtime"]'); return s[s.length - 1]; })();
        return (sc && sc.src) ? sc.src.replace(/[^/]*$/, '') : '';
    })();

    // [code, endonym (native name), iso2 country for the flag asset].
    // `auto` is first; it resolves via navigator.language.
    var LANGS = [
        { code: 'auto', native: 'Default', flag: null },
        { code: 'en', native: 'English', flag: 'us' },
        { code: 'ar', native: 'العربية', flag: 'sa' },
        { code: 'cs', native: 'Čeština', flag: 'cz' },
        { code: 'da', native: 'Dansk', flag: 'dk' },
        { code: 'de', native: 'Deutsch', flag: 'de' },
        { code: 'el', native: 'Ελληνικά', flag: 'gr' },
        { code: 'es', native: 'Español', flag: 'es' },
        { code: 'es-MX', native: 'Español (México)', flag: 'mx' },
        { code: 'fi', native: 'Suomi', flag: 'fi' },
        { code: 'fr', native: 'Français', flag: 'fr' },
        { code: 'he', native: 'עברית', flag: 'il' },
        { code: 'hi', native: 'हिन्दी', flag: 'in' },
        { code: 'hu', native: 'Magyar', flag: 'hu' },
        { code: 'id', native: 'Bahasa Indonesia', flag: 'id' },
        { code: 'it', native: 'Italiano', flag: 'it' },
        { code: 'ja', native: '日本語', flag: 'jp' },
        { code: 'ko', native: '한국어', flag: 'kr' },
        { code: 'ms', native: 'Bahasa Melayu', flag: 'my' },
        { code: 'nb', native: 'Norsk bokmål', flag: 'no' },
        { code: 'nl', native: 'Nederlands', flag: 'nl' },
        { code: 'pl', native: 'Polski', flag: 'pl' },
        { code: 'pt-BR', native: 'Português (Brasil)', flag: 'br' },
        { code: 'pt-PT', native: 'Português (Portugal)', flag: 'pt' },
        { code: 'ro', native: 'Română', flag: 'ro' },
        { code: 'ru', native: 'Русский', flag: 'ru' },
        { code: 'sk', native: 'Slovenčina', flag: 'sk' },
        { code: 'sv', native: 'Svenska', flag: 'se' },
        { code: 'th', native: 'ไทย', flag: 'th' },
        { code: 'tr', native: 'Türkçe', flag: 'tr' },
        { code: 'uk', native: 'Українська', flag: 'ua' },
        { code: 'vi', native: 'Tiếng Việt', flag: 'vn' },
        { code: 'zh-Hans', native: '简体中文', flag: 'cn' },
        { code: 'zh-Hant', native: '繁體中文', flag: 'tw' },
    ];

    function detectNavLang() {
        var navLang = (navigator.language || 'en');
        var codes = LANGS.map(function (l) { return l.code; }).filter(function (c) { return c !== 'auto'; });
        if (codes.indexOf(navLang) !== -1) return navLang;
        var base = navLang.split('-')[0];
        if (codes.indexOf(base) !== -1) return base;
        return 'en';
    }

    function effectiveLang(selection) {
        if (!selection || selection === 'auto') return detectNavLang();
        return T[toStorageLang(selection)] ? selection : 'en';
    }

    function pickInitialSelection() {
        var url = new URL(location.href);
        var fromQuery = url.searchParams.get('lang');
        if (fromQuery && (fromQuery === 'auto' || T[toStorageLang(fromQuery)])) return fromQuery;
        var stored = localStorage.getItem(LS_KEY);
        if (stored && (stored === 'auto' || T[toStorageLang(stored)])) return stored;
        return 'auto';
    }

    // BCP-47 picker codes → translations.js keys (web-ext folder form).
    function toStorageLang(lang) {
        var map = { 'es-MX': 'es_MX', 'pt-BR': 'pt_BR', 'pt-PT': 'pt_PT',
                    'zh-Hans': 'zh_CN', 'zh-Hant': 'zh_TW' };
        return map[lang] || lang;
    }

    function renderChip(container, lang) {
        container.innerHTML = '';
        if (lang.code === 'auto') {
            var g = document.createElement('span');
            g.className = 'lang-auto-glyph';
            g.setAttribute('aria-hidden', 'true');
            g.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
            container.appendChild(g);
        } else {
            var img = document.createElement('img');
            img.className = 'lang-flag';
            img.src = CC_BASE + 'flags/' + lang.flag + '.svg';
            img.width = 18; img.height = 13; img.alt = '';
            container.appendChild(img);
        }
        var span = document.createElement('span');
        span.className = 'lang-name';
        span.textContent = lang.native;
        container.appendChild(span);
    }

    function applyLang(selection) {
        var lang = effectiveLang(selection);
        var dict = T[toStorageLang(lang)] || T.en;
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var key = els[i].getAttribute('data-i18n');
            if (dict[key]) els[i].textContent = dict[key];
        }
        var baseLang = lang.split('_')[0].split('-')[0];
        document.documentElement.lang = baseLang;
        var RTL = { ar: 1, he: 1, fa: 1, ur: 1, yi: 1 };
        document.documentElement.dir = RTL[baseLang] ? 'rtl' : 'ltr';

        var btn = document.getElementById('langBtn');
        var menu = document.getElementById('langMenu');
        var selEntry = LANGS.filter(function (l) { return l.code === selection; })[0] || LANGS[0];
        if (btn) renderChip(btn, selEntry);
        if (menu) {
            var bs = menu.querySelectorAll('button[data-lang]');
            for (var j = 0; j < bs.length; j++) {
                bs[j].classList.toggle('active', bs[j].getAttribute('data-lang') === selection);
            }
        }
    }

    function buildMenu() {
        var menu = document.getElementById('langMenu');
        if (!menu) return;
        menu.innerHTML = '';
        for (var i = 0; i < LANGS.length; i++) {
            var b = document.createElement('button');
            b.setAttribute('data-lang', LANGS[i].code);
            renderChip(b, LANGS[i]);
            menu.appendChild(b);
        }
    }

    buildMenu();
    applyLang(pickInitialSelection());

    var wrap = document.getElementById('langWrap');
    var btn = document.getElementById('langBtn');
    var menu = document.getElementById('langMenu');
    if (btn && menu && wrap) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) menu.classList.remove('open');
        });
        menu.addEventListener('click', function (e) {
            var b = e.target.closest('button[data-lang]');
            if (!b) return;
            var selection = b.getAttribute('data-lang');
            if (selection === 'auto') localStorage.removeItem(LS_KEY);
            else localStorage.setItem(LS_KEY, selection);
            applyLang(selection);
            menu.classList.remove('open');
        });
    }
})();
