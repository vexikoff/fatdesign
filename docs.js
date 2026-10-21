let docsData = {};

async function loadDocs() {
    try {
        const res = await fetch('https://cdn.vexikoff.xyz/fat/info.json');
        docsData = await res.json();
    } catch (e) {
        docsData = {};
    }
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inlineFormat(text) {
    let t = escapeHtml(text);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    t = t.replace(/`([^`]+)`/g, '<code class="incode">$1</code>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return t;
}

function lineHtml(tag, line) {
    const inner = inlineFormat(line);
    return '<' + tag + '><span>' + inner + '</span></' + tag + '>';
}

function pageKeys(doc) {
    return Object.keys(doc).filter(function (k) {
        return /^\d+$/.test(k);
    }).sort(function (a, b) {
        return Number(a) - Number(b);
    });
}

function pageUrl(docId, subKey) {
    return '/docs?page=' + encodeURIComponent(docId) + '&doc=' + encodeURIComponent(subKey);
}

function parseMarkdown(text) {
    const lines = text.split('\n');
    let html = '';
    let inCode = false;
    let codeLabel = '';
    let codeBuffer = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('```')) {
            if (inCode) {
                html += '<div class="code">' + (codeLabel ? '<div class="bidde">' + escapeHtml(codeLabel) + '</div>' : '') + codeBuffer.join('\n') + '</div>';
                codeBuffer = [];
                codeLabel = '';
                inCode = false;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                inCode = true;
                codeLabel = line.slice(3).trim();
            }
            continue;
        }

        if (inCode) {
            codeBuffer.push(escapeHtml(line));
            continue;
        }

        if (line.startsWith('- ')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += lineHtml('li', line.slice(2));
            continue;
        } else if (inList) {
            html += '</ul>';
            inList = false;
        }

        if (line.startsWith('### ')) {
            html += lineHtml('h3', line.slice(4));
            continue;
        }
        if (line.startsWith('## ')) {
            html += lineHtml('h2', line.slice(3));
            continue;
        }
        if (line.startsWith('# ')) {
            html += lineHtml('h1', line.slice(2));
            continue;
        }

        if (line.trim() === '') {
            continue;
        }

        html += lineHtml('p', line);
    }

    if (inList) {
        html += '</ul>';
    }
    if (inCode) {
        html += '<div class="code">' + (codeLabel ? '<div class="bidde">' + escapeHtml(codeLabel) + '</div>' : '') + codeBuffer.join('\n') + '</div>';
    }

    return html;
}

function makeResult(title, desc, url) {
    const el = document.createElement('div');
    el.className = 'content';

    const h = document.createElement('h1');
    h.textContent = title;

    const p = document.createElement('p');
    p.textContent = desc;

    el.appendChild(h);
    el.appendChild(p);

    el.addEventListener('click', function () {
        window.location.href = url;
    });

    return el;
}

function initSearch() {
    const input = document.getElementById('srcc');
    const results = document.getElementById('srch2');
    if (!input || !results) {
        return;
    }

    input.addEventListener('input', function () {
        const q = input.value.toLowerCase().trim();
        results.innerHTML = '';

        if (q === '') {
            return;
        }

        const docKeys = Object.keys(docsData);
        for (let i = 0; i < docKeys.length; i++) {
            const docId = docKeys[i];
            const doc = docsData[docId];
            const keys = pageKeys(doc);
            const first = keys.length > 0 ? keys[0] : null;

            const title = (doc.title || '').toLowerCase();
            const desc = (doc.description || '').toLowerCase();

            if (first !== null && (title.indexOf(q) !== -1 || desc.indexOf(q) !== -1)) {
                results.appendChild(makeResult(doc.title, doc.description, pageUrl(docId, first)));
            }

            for (let j = 0; j < keys.length; j++) {
                const sub = doc[keys[j]];
                const subTitle = (sub.title || '').toLowerCase();
                if (subTitle.indexOf(q) !== -1) {
                    results.appendChild(makeResult(sub.title, doc.title, pageUrl(docId, keys[j])));
                }
            }
        }
    });
}

function renderPreviews() {
    const container = document.querySelector('.prevww');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    const keys = Object.keys(docsData);

    for (let i = 0; i < keys.length; i++) {
        const docId = keys[i];
        const item = docsData[docId];
        const pages = pageKeys(item);
        if (pages.length === 0) {
            continue;
        }

        const card = document.createElement('div');
        card.className = 'prewpan';

        const img = document.createElement('img');
        img.src = item.preview;
        img.alt = '';
        img.className = 'prew';

        const abs = document.createElement('div');
        abs.className = 'abs';

        const h1 = document.createElement('h1');
        h1.className = 'title';
        h1.textContent = item.title;

        const p = document.createElement('p');
        p.className = 'desc';
        p.textContent = item.description;

        abs.appendChild(h1);
        abs.appendChild(p);
        card.appendChild(img);
        card.appendChild(abs);

        card.addEventListener('click', function () {
            window.location.href = pageUrl(docId, pages[0]);
        });

        container.appendChild(card);
    }
}

function renderPagesList(docId, currentKey) {
    const container = document.querySelector('.left11');
    if (!container) {
        return;
    }

    let pages = container.querySelector('.pages');
    if (!pages) {
        pages = document.createElement('div');
        pages.className = 'pages';
        container.appendChild(pages);
    }

    pages.innerHTML = '';

    const doc = docsData[docId];
    const keys = pageKeys(doc);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const el = document.createElement('div');
        el.className = key === currentKey ? 'pageitem active' : 'pageitem';
        el.textContent = doc[key].title;

        el.addEventListener('click', function () {
            window.location.href = pageUrl(docId, key);
        });

        pages.appendChild(el);

        if (i < keys.length - 1) {
            const spacer = document.createElement('div');
            spacer.className = 'spacer1';
            pages.appendChild(spacer);
        }
    }
}

async function renderPage(docId, subKey) {
    const ifhome = document.querySelector('.ifhome');
    const ifpage = document.querySelector('.ifpage');
    const doc = docId ? docsData[docId] : null;
    const keys = doc ? pageKeys(doc) : [];

    if (!doc || keys.length === 0) {
        if (ifhome) {
            ifhome.classList.remove('hidden');
        }
        if (ifpage) {
            ifpage.classList.add('hidden');
        }
        if (docId) {
            history.replaceState(null, '', window.location.pathname);
        }
        return;
    }

    let current = subKey;
    if (!current || keys.indexOf(current) === -1) {
        current = keys[0];
    }

    if (ifhome) {
        ifhome.classList.add('hidden');
    }
    if (ifpage) {
        ifpage.classList.remove('hidden');
    }

    document.title = doc.title + ' - Fat Design';

    renderPagesList(docId, current);

    const reader = document.querySelector('.docsread');
    if (!reader) {
        return;
    }

    try {
        const res = await fetch(doc[current].md);
        const md = await res.text();
        reader.innerHTML = parseMarkdown(md);
    } catch (e) {
        reader.innerHTML = '';
    }
}

async function init() {
    await loadDocs();
    initSearch();

    if (document.querySelector('.prevww')) {
        renderPreviews();
    }

    if (document.querySelector('.ifpage')) {
        const params = new URLSearchParams(window.location.search);
        renderPage(params.get('page'), params.get('doc'));
    }
}

document.addEventListener('DOMContentLoaded', init);