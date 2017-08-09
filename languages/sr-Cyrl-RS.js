/*!
 * numbro.js language configuration
 * language : Serbian (sr)
 * country : Serbia (Cyrillic)
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    langLocaleCode: "sr-Cyrl-RS",
    cultureCode: "sr-Cyrl-RS",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "тыс.",
        million: "млн",
        billion: "b",
        trillion: "t"
    },
    ordinal: () => ".",
    currency: {
        symbol: "RSD",
        code: "RSD"
    }
};
