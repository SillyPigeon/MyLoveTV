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
import { OipfVideoBroadcastMapper } from "./video-broadcast-embedded-object.js";
import { OipfAVControlMapper } from "./a-v-control-embedded-object.js";

// append play method to <object> tag
HTMLObjectElement.prototype.play = () => { };

export class VideoHandler {
    constructor() {
        this.videoObj = undefined;
        this.mutationObserver = undefined;
        this.videoBroadcastEmbeddedObject = undefined;
    }

    initialize() {
        // go through all existing nodes and check if we need to inject the video player emulation
        document.querySelectorAll('*').forEach((node) => {
            this.checkNodeTypeAndInjectVideoMethods(node);
        });
        this.watchAndHandleVideoObjectMutations();
    }

    checkNodeTypeAndInjectVideoMethods(node) {
        let mimeType = node.type;
        if (!node.type){
            return;  
        } 
        mimeType = mimeType.toLowerCase(); // ensure lower case string comparison

        if (mimeType.lastIndexOf('video/broadcast', 0) === 0) {
            console.log('hbbtv-polyfill: BROADCAST VIDEO PLAYER ...');
            this.videoBroadcastEmbeddedObject = new OipfVideoBroadcastMapper(node);
        }
        if (mimeType.lastIndexOf('video/mpeg4', 0) === 0 ||
            mimeType.lastIndexOf('video/mp4', 0) === 0 ||  // h.264 video
            mimeType.lastIndexOf('audio/mp4', 0) === 0 ||  // aac audio
            mimeType.lastIndexOf('audio/mpeg', 0) === 0) { // mp3 audio
            console.log('hbbtv-polyfill: BROADBAND VIDEO PLAYER ...');
            new OipfAVControlMapper(node);
        }
        // setup mpeg dash player
        if(mimeType.lastIndexOf('application/dash+xml', 0) === 0){
            console.log('hbbtv-polyfill: DASH VIDEO PLAYER ...');
            new OipfAVControlMapper(node, true);
        }
    }

    watchAndHandleVideoObjectMutations() {

        /**
         * Detect if a new video/broadcast element or other video has been added
         * @param {*} mutation 
         */
        const handleChildAddedRemoved = (mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    this.checkNodeTypeAndInjectVideoMethods(node);
                });
            } else if (mutation.removedNodes.length > 0) {
                // TODO: handle object removal
            }
        };

        const handleMutation = (mutationList) => {
            mutationList.forEach((mutation) => {
                switch (mutation.type) {
                    case 'childList':
                        handleChildAddedRemoved(mutation);
                        break;
                    case 'attributes':
                        /* An attribute value changed on the element in
                           mutation.target; the attribute name is in
                           mutation.attributeName and its previous value is in
                           mutation.oldValue */
                        break;
                }
            });
        };

        this.mutationObserver = new MutationObserver(handleMutation);
        this.mutationObserver.observe(document.body, {
            'subtree': true,
            'childList': true,
            'attributes': true,
            'characterData': true,
            'attributeFilter': ["type"]
        });
    }
}
