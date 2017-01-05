/*global $, Whisper, Backbone, textsecure, extension*/
/*
 * vim: ts=4:sw=4:expandtab
 */
(function () {
    'use strict';

    function logError(error) {
        console.log('index.html: ', error);
    }

    window.onerror = function(message, script, line, col, error) {
        logError(error);
    };

    var view;

    function render() {
        ConversationController.updateInbox().then(function() {
            try {
                if (view) { view.remove(); }
                var $body = $('body',document).empty();
                if (Whisper.Registration.everDone()) {
                    view = new Whisper.InboxView({window: window});
                    view.$el.prependTo($body);
                    window.openConversation = function(conversation) {
                        if (conversation) {
                            view.openConversation(null, conversation);
                        }
                    };
                    openConversation(getOpenConversation());
                }else {
                    view = new Whisper.PhoneInputView({window:window});
                    view.$el.prependTo($body);
                }
            } catch (e) {
                logError(e);
            }
        });
    }


    window.addEventListener('onreload', render);
    textsecure.startWorker('js/libsignal-protocol-worker.js');

    console.log('extension launched');
    render();

}());
