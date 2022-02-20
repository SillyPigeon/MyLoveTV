//akin code

window.onload = function() {
    /**
     * If url and tab indicate an hbbtv app inject hbbtv_polyfill into page.
     * Add this on completed DOM as we need to access to e.g. OIPF video objects.
     */
    // chrome.webNavigation.onCommitted.addListener((details) => {
    //     // inject cur frame into tv view
    // });

    new Promise((res, rej) => {
        // get currentTab to set message tabId --> sender in background message listener doesn't contain tab.id from popup scripts
        chrome.tabs.query({ active: true, currentWindow: true }, res);
    }).then((tabs) => {
        chrome.tabs.update(tabs[0].id, { url: "TvView.html" });
    });

}