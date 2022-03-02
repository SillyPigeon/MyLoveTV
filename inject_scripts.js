//akin code
function injectJs(tabId, fileName, succeededMessage, addedToHead, addedAsFirstChild, withOption) {
    var pluginPath = fileName.indexOf('cdn.') !== -1 ? fileName : chrome.extension.getURL(fileName);
    var checkAlreadyInjected = 'if (d.head.getElementsByTagName("script").length>0 && [].slice.call(d.head.getElementsByTagName("script")).' +
    'map(function(l) { return l.src.indexOf("' + fileName + '")!==-1; }).reduce(function(a,b) { return a || b })==true) return;';
    var injectedScript = '(function(d){' + checkAlreadyInjected + 'var e=d.createElement("script");' +
    (withOption ? 'e.setAttribute("' + withOption + '", "' + withOption + '");' : '') +
    'e.setAttribute("type","text/javascript");e.setAttribute("src","' + pluginPath + '");' +
    (addedToHead ? 'd.head' : 'd.body') +
    (addedAsFirstChild ? '.insertBefore(e,d.head.firstChild)' : '.appendChild(e)') +
    '}(document));';
    //add script to DOM
    var newScript = document.createElement("script");
    var inlineScript = document.createTextNode(injectedScript);
    newScript.appendChild(inlineScript);
    document.getElementsByTagName("head")[0].appendChild(newScript);
}


function setupAndLoad() {

    // inject hbbtv polyfill
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('hbbtv_polyfill/index.js');
    s.type = "module";
    (document.head || document.documentElement).appendChild(s);

    // inject dashJS
    injectJs(document.location.tabId, 'https://cdn.dashjs.org/latest/dash.all.min.js', 'DASH.js injection done.', true, false, 'async');
}
setupAndLoad()