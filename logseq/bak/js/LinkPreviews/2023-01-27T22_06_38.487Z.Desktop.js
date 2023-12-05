var opacityTimeout;
var contentTimeout;
var transitionDurationMs = 100;

var iframe = document.getElementById('link-preview-iframe')
var tooltipWrapper = document.getElementById('tooltip-wrapper')
var tooltipContent = document.getElementById('tooltip-content')

var linkHistories = {};

function hideTooltip() {
opacityTimeout = setTimeout(function() {
    tooltipWrapper.style.opacity = 0;
    contentTimeout = setTimeout(function() {
    tooltipContent.innerHTML = '';
    tooltipWrapper.style.display = 'none';
    }, transitionDurationMs + 1);
}, transitionDurationMs)
}

function showTooltip(event) {
var elem = event.target;
var elem_props = elem.getClientRects()[elem.getClientRects().length - 1];
var top = window.pageYOffset || document.documentElement.scrollTop

if (event.target.host === window.location.host) {
    if (!linkHistories[event.target.href]) {
    iframe.src = event.target.href
    iframe.onload = function() {
        tooltipContentHtml = ''
        tooltipContentHtml += '<div style="font-weight: bold;">' + iframe.contentWindow.document.querySelector('h1').innerHTML + '</div>'
        tooltipContentHtml += iframe.contentWindow.document.querySelector('content').innerHTML

        tooltipContent.innerHTML = tooltipContentHtml
        linkHistories[event.target.href] = tooltipContentHtml

        tooltipWrapper.style.display = 'block';
        setTimeout(function() {
        tooltipWrapper.style.opacity = 1;
        }, 1)
    } 
    } else {
    tooltipContent.innerHTML = linkHistories[event.target.href]
    tooltipWrapper.style.display = 'block';
    setTimeout(function() {
        tooltipWrapper.style.opacity = 1;
    }, 1)
    }

    tooltipWrapper.style.left = elem_props.left - (tooltipWrapper.offsetWidth / 2) + (elem_props.width / 2) + "px";
    if ((window.innerHeight - elem_props.top) < (tooltipWrapper.offsetHeight)) {
        tooltipWrapper.style.top = elem_props.top + top - tooltipWrapper.offsetHeight - 10 + "px";
    } else if ((window.innerHeight - elem_props.top) > (tooltipWrapper.offsetHeight)) {
        tooltipWrapper.style.top = elem_props.top + top + 35 + "px";
    }

    if ((elem_props.left + (elem_props.width / 2)) < (tooltipWrapper.offsetWidth / 2)) {
        tooltipWrapper.style.left = "10px";
    } else if ((document.body.clientWidth - elem_props.left - (elem_props.width / 2)) < (tooltipWrapper.offsetWidth / 2)) {
        tooltipWrapper.style.left = document.body.clientWidth - tooltipWrapper.offsetWidth - 20 + "px";
    }
}
}

function setupListeners(linkElement) {
linkElement.addEventListener('mouseleave', function(_event) {
    hideTooltip();
});

tooltipWrapper.addEventListener('mouseleave', function(_event) {
    hideTooltip();
});

linkElement.addEventListener('touchend', function(_event) {
    hideTooltip();
});

tooltipWrapper.addEventListener('touchend', function(_event) {
    hideTooltip();
});

linkElement.addEventListener('mouseenter', function(event) {
    clearTimeout(opacityTimeout);
    clearTimeout(contentTimeout);
    showTooltip(event);
});

tooltipWrapper.addEventListener('mouseenter', function(event) {
    clearTimeout(opacityTimeout);
    clearTimeout(contentTimeout);
});
}


[
    "/",
    "/c%C3%A9rebro-global",
    "/sistema",
    "/entropia",
    "/informa%C3%A7%C3%A3o",
    "/rede",
    "/emerg%C3%AAncia",
    "/sobre",
    "/modelo",
    "/caos-vs-complexidade",
    "/dado",
    "/pensamento-sist%C3%AAmico",
    "/complexidade",
    "/lidando-com-complexidade",
    "/metacogni%C3%A7%C3%A3o",
    "/protocolo",
    "/caos",
    "/redes-neurais",
    "/feedback",
    "/computador",
    "/din%C3%A2mica-n%C3%A3o-linear",
    "/variedade",
    "/equil%C3%ADbrio-de-nash",
    "/auto-organiza%C3%A7%C3%A3o",
    "/intelig%C3%AAncia-artificial",
    "/aprendizado-de-m%C3%A1quina",
    "/teoria-dos-jogos",
    "/atratores",
    "/sistemas-complexos",
    "/lei-da-variedade-requerida",
    "/algoritmo",
    "/cibern%C3%A9tica",
    "/limita%C3%A7%C3%A3o-da-racionalidade",
    "/autopoiese"
  ]