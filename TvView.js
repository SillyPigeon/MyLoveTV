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

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     console.log("exec content script in iframe");
//     chrome.tabs.executeScript(tabId, {
//         file: 'hbbtv.js',
//         runAt: 'document_end',
//     });
// });

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

window.onload = function () {
    var iframe = document.createElement('iframe');
        iframe.src = "http://hbbtv.zdf.de/3satm/redbutton.php";
        //iframe.src = "http://orfhbbtv.orf.at/orf/newsportal/index.html";
        // iframe.src = "http://ma.anixa.tv/smarttv/startaristo.php";
        //iframe.src = "http://hbbtv.zdf.de/3satm/index.php";
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


