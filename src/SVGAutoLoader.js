const svgCache = new Map();
const loadingSvgs = new Map();

async function loadSvg(url) {
    if (loadingSvgs.has(url)) return loadingSvgs.get(url);

    const promise = fetch(url).then(res => {
            if (!res.ok) throw new Error(`Erro ao carregar SVG: ${url}`);
            return res.text();
        }).then(text => {
            svgCache.set(url, text);
            loadingSvgs.delete(url);
            return text;
        }).catch(err => {
            console.error(err);
            loadingSvgs.delete(url);
            return null;
        });

    loadingSvgs.set(url, promise);
    return promise;
}

async function setSvg(svgElement) {
    const src = svgElement.getAttribute('src');
    if (!src) return;

    const rawSvg = svgCache.get(src) || await loadSvg(src);
    if (!rawSvg) return;

    const temp = document.createElement('div');
    temp.innerHTML = rawSvg;
    const svg = temp.querySelector('svg');
    if (!svg) return;

    if (svg.getAttribute('viewBox')) svgElement.setAttribute('viewBox', svg.getAttribute('viewBox'));
    if (svg.getAttribute('xmlns')) svgElement.setAttribute('xmlns', svg.getAttribute('xmlns'));

    svgElement.innerHTML = '';
    if (svgElement.hasAttribute('title')) {
        const title = document.createElement('title');
        title.textContent = svgElement.getAttribute('title');
        svgElement.appendChild(title);
    }

    Array.from(svg.children).forEach(child => svgElement.appendChild(child.cloneNode(true)));
}

function observeAttributes(svgElement) {
    const obs = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'src') {
                setSvg(svgElement);
            }
        }
    });
    obs.observe(svgElement, { attributes: true });
}

function observeSVGs() {
    const processSvg = svg => {
        setSvg(svg);
        observeAttributes(svg);
    };

    document.querySelectorAll('svg[src]').forEach(processSvg);

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (node.matches?.('svg[src]')) {
                    processSvg(node);
                } else {
                    node.querySelectorAll?.('svg[src]').forEach(processSvg);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

observeSVGs();
