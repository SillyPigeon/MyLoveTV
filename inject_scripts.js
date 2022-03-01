function setupAndLoad() {

    // inject hbbtv polyfill
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('hbbtv_polyfill/hbbtv_polyfill.js');
    s.type = "module";
    // after polyfill has been loaded, load the rest of the hbbtv plugin.
    (document.head || document.documentElement).appendChild(s);
}
setupAndLoad()