/*******************************************************************************

    HybridTvViewer - a browser extension to open HbbTV,CE-HTML,BML,OHTV webpages
    instead of downloading them. A mere simulator is also provided.

    Copyright (C) 2015 Karl Rousseau

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

    See the MIT License for more details: http://opensource.org/licenses/MIT

    HomePage: https://github.com/karl-rousseau/HybridTvViewer
*/
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