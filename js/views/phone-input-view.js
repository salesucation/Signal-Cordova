/*
 * vim: ts=4:sw=4:expandtab
 */
(function () {
    'use strict';
    window.Whisper = window.Whisper || {};

    Whisper.PhoneInputView = Whisper.View.extend({
        className: 'phone-input-form',
        templateName: 'phone-number',
        initialize: function(options) {
            this.render();
            this.accountManager = new getAccountManager();
        },

        events: {
            'change .number': 'validateNumber',
            'keyup .number': 'validateNumber',
            'change .verification': 'validateCode',
            'keyup .verification': 'validateCode',
            'click .register_sms': 'registerSms',
            'click .register_voice': 'registerVoice',
            'click .complete': 'completeRegistration'
        },

        displayError: function(error) {
            console.log(error);
            $('#error').hide().text(error).addClass('in').fadeIn();
        },

        registerSms: function() {
            this.accountManager.requestSMSVerification(this.validateNumber()).catch(this.displayError);
        },

        registerVoice: function() {
            this.accountManager.requestVoiceVerification(this.validateNumber()).catch(this.displayError);
        },

        completeRegistration: function() {
            var self = this;
            this.accountManager.registerSingleDevice(this.validateNumber(), this.validateCode()).then(function() {
                ConversationController.updateInbox().then(function() {
                    try {
                        self.remove();
                        var $body = $('body',document).empty();
                        var view = new Whisper.InboxView({window: window});
                        view.$el.prependTo($body);
                        window.openConversation = function(conversation) {
                            if (conversation) {
                                view.openConversation(null, conversation);
                            }
                        };
                        openConversation(getOpenConversation());
                    } catch (e) {
                        self.displayError(e);
                    }
                });
            }).catch(this.displayError);
        },

        validateNumber: function() {
            var input = this.$('input.number');
            //var regionCode = this.$('li.active').attr('data-country-code').toUpperCase();
            var number = input.val();

            var regionCode = libphonenumber.util.getRegionCodeForNumber(number);

            if (regionCode !== null & regionCode != "ZZ") {
                this.$("div.country-code").html("Region code: " + regionCode);
            }else if (regionCode != "ZZ") {
                this.$("div.country-code").html("&nbsp;");
            }

            var parsedNumber = libphonenumber.util.parseNumber(number, regionCode);
            if (parsedNumber.isValidNumber) {
                this.$('.number-container').removeClass('invalid');
                this.$('.number-container').addClass('valid');
                this.$('.register_sms').removeAttr("disabled");
                this.$('.register_voice').removeAttr("disabled");
                this.$('.verification').removeAttr("disabled");
            } else {
                this.$('.number-container').removeClass('valid');
                this.$('.register_sms').attr("disabled", true);
                this.$('.register_voice').attr("disabled", true);
                this.$('.verification').attr("disabled", true);
            }
            input.trigger('validation');

            return parsedNumber.e164;
        },
        validateCode: function() {
            var verificationCode = $('.verification').val().replace(/\D/g, '');
            if (verificationCode.length == 6) {
                this.$('.complete').removeAttr("disabled");
            }else {
                this.$('.complete').attr("disabled", true);
            }
            return verificationCode;
        }
    });
})();
