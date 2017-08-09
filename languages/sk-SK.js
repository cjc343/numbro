/*!
 * numbro.js language configuration
 * language : Slovak
 * locale : Slovakia
 * author : Jan Pesa : https://github.com/smajl (based on work from Ahmed Al Hafoudh : http://www.freevision.sk)
 */

module.exports = {
    langLocaleCode: "sk-SK",
    cultureCode: "sk-SK",
    delimiters: {
        thousands: "\u00a0",
        decimal: ","
    },
    abbreviations: {
        thousand: "tis.",
        million: "mil.",
        billion: "mld.",
        trillion: "bil."
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "€",
        position: "postfix",
        spaceSeparated: true,
        code: "EUR"
    },
    defaults: {
        currencyFormat: ",4 a"
    },
    formats: {
        fourDigits: "4 a",
        fullWithTwoDecimals: ",0.00 $",
        fullWithTwoDecimalsNoCurrency: ",0.00",
        fullWithNoDecimals: ",0 $"
    }
};
