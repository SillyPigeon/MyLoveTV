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

var knownMimeTypes = {
    'hbbtv': 'application/vnd.hbbtv.xhtml+xml',
    'cehtml': 'application/ce-html+xml',
    'ohtv': 'application/vnd.ohtv',
    'bml': 'text/X-arib-bml',
    'atsc': 'atsc-http-attributes'
    //'mheg': 'application/x-mheg-5',
    //'aitx': 'application/vnd.dvb.ait'
};

function addHeadListener() {
    // replace user agent in requests
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
            for (var i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name === 'User-Agent') {
                    details.requestHeaders[i].value = navigator.userAgent;
                }
                break;
            }
            return { requestHeaders: details.requestHeaders };
        },
        { urls: ['<all_urls>'] },
        ['blocking', 'requestHeaders']
    );
    /**
     * Filter headers for hbbtv content-types.
     */
    chrome.webRequest.onHeadersReceived.addListener((details) => {
        var url = (details.url || ''), headers = details.responseHeaders;
        if (url.indexOf('http') !== 0) { // if URL is not starting by http(s) then exit ...
            return {
                responseHeaders: headers
            };
        }
        headers.forEach(function (header) {
            var headerWithHbbtv = header.value.substring(0, knownMimeTypes.hbbtv.length) === knownMimeTypes.hbbtv ||
                header.name.toLowerCase().substring(0, knownMimeTypes.atsc.length) === knownMimeTypes.atsc;
            var headerWithCeHtml = header.value.substring(0, knownMimeTypes.cehtml.length) === knownMimeTypes.cehtml;
            var headerWithOhtv = header.value.substring(0, knownMimeTypes.ohtv.length) === knownMimeTypes.ohtv;
            var headerWithBml = header.value.substring(0, knownMimeTypes.bml.length) === knownMimeTypes.bml;
            switch (header.name.toLowerCase()) {
                case knownMimeTypes.atsc:
                case 'content-type':
                    if (headerWithHbbtv || headerWithCeHtml || headerWithOhtv || headerWithBml) {
                        console.log("onHeadersReceived", details);
                        header.value = 'application/xhtml+xml'; // override current content-type to avoid browser automatic download
                    }
                    break;
            }
        });
        return {
            responseHeaders: headers
        };
    },
        { urls: ['<all_urls>'] },
        ['blocking', 'responseHeaders'].concat(navigator.userAgent.includes('Chrom') ? chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS : [])
    );
}

function addinjectJsListener() {
    chrome.webNavigation.onCommitted.addListener((details) => {
        // inject content_script_iframe into iframe
        if (details.parentFrameId === 0) { // inject into first level child frames
            console.log("exec content script in iframe", details);
            chrome.tabs.executeScript(details.tabId, {
                file: 'inject_scripts.js',
                runAt: 'document_end',
                frameId: details.frameId,
            });
        }
    });
}


window.onload = function () {
    //add html head handler change Hbbtv MIME to XHTML
    addHeadListener();
    //inject HBBTV js(key manger/vedio handler) in suitable time
    addinjectJsListener();

    var iframe = document.createElement('iframe');
        //test suit
        // iframe.src = "http://itv.mit-xperts.com/hbbtvtest/";

        //broadcast Live
        iframe.src = "http://hbbtv.zdf.de/3satm/redbutton.php";
        // iframe.src = "http://orfhbbtv.orf.at/orf/newsportal/index.html";
        // iframe.src = "http://ma.anixa.tv/smarttv/startaristo.php";
        // iframe.src = "http://bibeltv.c.nmdn.net/sathd/index.php"

        iframe.style.width = "1280px";
        iframe.style.height  = "720px";
        iframe.allow = "autoplay";
        iframe.id = "tvView"
        
        document.body.appendChild(iframe);

        document.getElementById("app_go").addEventListener('click', function(){
            var url = document.getElementById("app_url").value;
            if(url != "Please enter app url"){
                iframe.contentWindow.postMessage({topic: "app_url", data: url},"*")
            }
        }, false);
}


