async function loadSvg(svgUrl) {return fetch(svgUrl).then(res => {return res.text()});}

async function setSvg(svgElement){
    if (svgElement.getAttribute('src')) {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = await loadSvg(svgElement.getAttribute('src'))

        const tempSvgElement = tempElement.querySelector('svg');

        if (tempSvgElement) {
            if (tempSvgElement.getAttribute('viewBox')) {
                svgElement.setAttribute("viewBox", tempSvgElement.getAttribute('viewBox'));
            }
            if (tempSvgElement.getAttribute('xmlns')) {
                svgElement.setAttribute("xmlns", tempSvgElement.getAttribute('xmlns'));
            }

            svgElement.innerHTML = ""
            tempSvgElement.querySelectorAll('path').forEach(function(pathElement) {
                svgElement.appendChild(pathElement);
            });
        }
    }
}

async function observeAttributes(svgElement) {
    const attributeObserver = new MutationObserver(mutationsList => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                setSvg(mutation.target);
            }
        });
    });
    attributeObserver.observe(svgElement, { attributes: true });
}

async function observeSVGs() {
    document.querySelectorAll('svg').forEach(function(svgElement) {
        setSvg(svgElement);
        observeAttributes(svgElement);
    });

    const observer = new MutationObserver(mutationsList => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'svg' || node.tagName === 'SVG') {
                        setSvg(node);
                        observeAttributes(node);
                    } else {node.querySelectorAll && node.querySelectorAll('svg').forEach(svgElement => {
                            setSvg(svgElement);
                            observeAttributes(svgElement);
                        });
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

observeSVGs();
