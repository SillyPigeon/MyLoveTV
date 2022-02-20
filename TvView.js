//akin code

var knownMimeTypes = {
    'hbbtv': 'application/vnd.hbbtv.xhtml+xml',
    'cehtml': 'application/ce-html+xml',
    'ohtv': 'application/vnd.ohtv',
    'bml': 'text/X-arib-bml',
    'atsc': 'atsc-http-attributes'
    //'mheg': 'application/x-mheg-5',
    //'aitx': 'application/vnd.dvb.ait'
};

// inject a css or js file into dom via tags
function loadJsCssFile(filename, filetype) {
}

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
    console.log("onHeadersReceived", details);
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
                    header.value = 'application/xhtml+xml'; // override current content-type to avoid browser automatic download
                    // store current url
                    // storeTabAndUrl(details.tabId, url);
                    // reload the tab with the plugin.html
                    // if (details.parentFrameId === -1) {
                    //     chrome.tabs.get(details.tabId, (tab) => {
                    //         chrome.tabs.update(tab.id, { url: "plugin.html" });
                    //     });
                    // }
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

window.onload = function () {
    var iframe = document.createElement('iframe');
        // iframe.src = "http://hbbtv.zdf.de/3satm/redbutton.php";
        iframe.src = "http://hbbtv.zdf.de/3satm/index.php";
        iframe.style.width = "1280px";
        iframe.style.height  = "720px";
        iframe.allow = "autoplay";

        document.body.appendChild(iframe);
}
