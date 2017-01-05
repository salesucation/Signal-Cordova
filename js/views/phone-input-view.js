/*
 * vim: ts=4:sw=4:expandtab
 */
(function () {
    'use strict';
    window.Whisper = window.Whisper || {};

    Whisper.PhoneInputView = Whisper.View.extend({
        className: 'phone-input-form',
        templateName: 'phone-number',
        initialize: function(options){
            this.render();
        },

        events: {
            'change': 'validateNumber',
            'keyup': 'validateNumber',
            'click .register': 'register'
        },
        
        register: function() {
            alert("register clicked: " + this.validateNumber());
        },

        validateNumber: function() {
            var input = this.$('input.number');
            //var regionCode = this.$('li.active').attr('data-country-code').toUpperCase();
           var number = input.val();

            var regionCode = libphonenumber.util.getRegionCodeForNumber(number);
            
            if(regionCode != null & regionCode != "ZZ"){
                this.$("div.country-code").html("Region code: " + regionCode);
            }else if(regionCode != "ZZ"){
                this.$("div.country-code").html("&nbsp;");
            }

            var parsedNumber = libphonenumber.util.parseNumber(number, regionCode);
            if (parsedNumber.isValidNumber) {
                this.$('.number-container').removeClass('invalid');
                this.$('.number-container').addClass('valid');
            } else {
                this.$('.number-container').removeClass('valid');
            }
            input.trigger('validation');

            return parsedNumber.e164;
        }
    });
})();
