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
    storage.onready(function() {
        render();
        console.log('extension launched');
    });
    storage.fetch();


    var SERVER_URL = 'https://textsecure-service-staging.whispersystems.org';
    var SERVER_PORTS = [80, 4433, 8443];
    var ATTACHMENT_SERVER_URL = 'https://whispersystems-textsecure-attachments-staging.s3.amazonaws.com';
    var messageReceiver;
    window.getSocketStatus = function() {
        if (messageReceiver) {
            return messageReceiver.getStatus();
        } else {
            return -1;
        }
    };
    window.getAccountManager = function() {
        var USERNAME = storage.get('number_id');
        var PASSWORD = storage.get('password');
        var accountManager = new textsecure.AccountManager(
            SERVER_URL, SERVER_PORTS, USERNAME, PASSWORD
        );
        accountManager.addEventListener('registration', function() {
            if (!Whisper.Registration.everDone()) {
                storage.put('safety-numbers-approval', false);
            }
            Whisper.Registration.markDone();
        });
        return accountManager;
    };



}());
