/*!
 * numbro.js language configuration
 * language : Chinese (Taiwan)
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
 */

module.exports = {
    langLocaleCode: "zh-TW",
    cultureCode: "zh-TW",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "千",
        million: "百萬",
        billion: "十億",
        trillion: "兆"
    },
    ordinal: function() {
        return "第";
    },
    currency: {
        symbol: "NT$",
        code: "TWD"
    }
};
