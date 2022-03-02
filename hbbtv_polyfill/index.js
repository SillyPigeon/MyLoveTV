import { keyEventInit } from "./keyevent-init.js";
import { hbbtvFn } from "./hbbtv.js";
import { VideoHandler } from "./hbb-video-handler.js";

function initMessageHandler() {
    window.addEventListener("message", (event) => {
        if (event.origin !== "chrome-extension://nphifnbphmgiiakaohchdbbgbcljkdfh")
          return;

        if(event.data.topic == "app_url"){
            console.log("app_url change to ", event.data.data);
            window.location.href = event.data.data;
        }
        // ...
    }, false);
}

function init() {
    console.log("hbbtv-polyfill: load");
    // global helper namespace to simplify testing
    window.HBBTV_POLYFILL_NS = window.HBBTV_POLYFILL_NS || {
    };
    window.HBBTV_POLYFILL_NS = {
        ...window.HBBTV_POLYFILL_NS, ...{
            keysetSetValueCount: 0,
            streamEventListeners: [],
        }
    };
    window.HBBTV_POLYFILL_NS.currentChannel = window.HBBTV_POLYFILL_NS.currentChannel || {
        'TYPE_TV': 12,
        'channelType': 12,
        'sid': 1,
        'onid': 1,
        'tsid': 1,
        'name': 'test',
        'ccid': 'ccid:dvbt.0',
        'dsd': ''
    };

    // init func
    keyEventInit();
    hbbtvFn();
    new VideoHandler().initialize();

    initMessageHandler();

    console.log("hbbtv-polyfill: loaded finished");
}


if (!document.body) {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
