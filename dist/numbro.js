(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.numbro = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = {
    languageTag: "en-US",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "k",
        million: "m",
        billion: "b",
        trillion: "t"
    },
    spaceSeparated: false,
    ordinal: function ordinal(number) {
        var b = number % 10;
        return ~~(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
    },
    currency: {
        symbol: "$",
        position: "prefix",
        code: "USD"
    },
    currencyDefaults: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true
    },
    formats: {
        fourDigits: {
            totalLength: 4,
            spaceSeparated: true
        },
        fullWithTwoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithTwoDecimalsNoCurrency: {
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithNoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 0
        }
    }
};

},{}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var globalState = require("./globalState");
var validating = require("./validating");
var parsing = require("./parsing");

var binarySuffixes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
var decimalSuffixes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
var bytes = {
    general: { scale: 1024, suffixes: decimalSuffixes, marker: "bd" },
    binary: { scale: 1024, suffixes: binarySuffixes, marker: "b" },
    decimal: { scale: 1000, suffixes: decimalSuffixes, marker: "d" }
};

var defaultOptions = {
    totalLength: 0,
    characteristic: 0,
    forceAverage: false,
    average: false,
    mantissa: -1,
    optionalMantissa: true,
    thousandSeparated: false,
    spaceSeparated: false,
    negative: "sign",
    forceSign: false
};

/**
 * Entry point. Format the provided INSTANCE according to the PROVIDEDFORMAT.
 * This method ensure the prefix and postfix are added as the last step.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} [providedFormat] - specification for formatting
 * @param numbro - the numbro singleton
 * @return {string}
 */
function _format(instance) {
    var providedFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var numbro = arguments[2];

    if (typeof providedFormat === "string") {
        providedFormat = parsing.parseFormat(providedFormat);
    }

    var valid = validating.validateFormat(providedFormat);

    if (!valid) {
        return "ERROR: invalid format";
    }

    var prefix = providedFormat.prefix || "";
    var postfix = providedFormat.postfix || "";

    var output = formatNumbro(instance, providedFormat, numbro);
    output = insertPrefix(output, prefix);
    output = insertPostfix(output, postfix);
    return output;
}

/**
 * Format the provided INSTANCE according to the PROVIDEDFORMAT.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param numbro - the numbro singleton
 * @return {string}
 */
function formatNumbro(instance, providedFormat, numbro) {
    switch (providedFormat.output) {
        case "currency":
            return formatCurrency(instance, providedFormat, globalState, numbro);
        case "percent":
            return formatPercentage(instance, providedFormat, globalState, numbro);
        case "byte":
            return formatByte(instance, providedFormat, globalState, numbro);
        case "time":
            return formatTime(instance, providedFormat, globalState, numbro);
        case "ordinal":
            return formatOrdinal(instance, providedFormat, globalState, numbro);
        case "number":
        default:
            return formatNumber({
                instance: instance,
                providedFormat: providedFormat,
                numbro: numbro
            });
    }
}

/**
 * Get the decimal byte unit (MB) for the provided numbro INSTANCE.
 * We go from one unit to another using the decimal system (1000).
 *
 * @param {Numbro} instance - numbro instance to compute
 * @return {String}
 */
function _getDecimalByteUnit(instance) {
    var data = bytes.decimal;
    return getFormatByteUnits(instance._value, data.suffixes, data.scale).suffix;
}

/**
 * Get the binary byte unit (MiB) for the provided numbro INSTANCE.
 * We go from one unit to another using the decimal system (1024).
 *
 * @param {Numbro} instance - numbro instance to compute
 * @return {String}
 */
function _getBinaryByteUnit(instance) {
    var data = bytes.binary;
    return getFormatByteUnits(instance._value, data.suffixes, data.scale).suffix;
}

/**
 * Get the decimal byte unit (MB) for the provided numbro INSTANCE.
 * We go from one unit to another using the decimal system (1024).
 *
 * @param {Numbro} instance - numbro instance to compute
 * @return {String}
 */
function _getByteUnit(instance) {
    var data = bytes.general;
    return getFormatByteUnits(instance._value, data.suffixes, data.scale).suffix;
}

/**
 * Return the value and the suffix computed in byte.
 * It uses the SUFFIXES and the SCALE provided.
 *
 * @param {number} value - Number to format
 * @param {[String]} suffixes - List of suffixes
 * @param {number} scale - Number in-between two units
 * @return {{value: Number, suffix: String}}
 */
function getFormatByteUnits(value, suffixes, scale) {
    var suffix = suffixes[0];
    var abs = Math.abs(value);

    if (abs >= scale) {
        for (var power = 1; power < suffixes.length; ++power) {
            var min = Math.pow(scale, power);
            var max = Math.pow(scale, power + 1);

            if (abs >= min && abs < max) {
                suffix = suffixes[power];
                value = value / min;
                break;
            }
        }

        // values greater than or equal to [scale] YB never set the suffix
        if (suffix === suffixes[0]) {
            value = value / Math.pow(scale, suffixes.length - 1);
            suffix = suffixes[suffixes.length - 1];
        }
    }

    return { value: value, suffix: suffix };
}

/**
 * Format the provided INSTANCE as bytes using the PROVIDEDFORMAT, and STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @param numbro - the numbro singleton
 * @return {string}
 */
function formatByte(instance, providedFormat, state, numbro) {
    var base = providedFormat.base || "binary";
    var baseInfo = bytes[base];

    var _getFormatByteUnits = getFormatByteUnits(instance._value, baseInfo.suffixes, baseInfo.scale),
        value = _getFormatByteUnits.value,
        suffix = _getFormatByteUnits.suffix;

    var output = formatNumber({
        instance: numbro(value),
        providedFormat: providedFormat,
        state: state,
        defaults: state.currentByteDefaults()
    });
    var abbreviations = state.currentAbbreviations();
    return "" + output + (abbreviations.spaced ? " " : "") + suffix;
}

/**
 * Format the provided INSTANCE as an ordinal using the PROVIDEDFORMAT,
 * and the STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @return {string}
 */
function formatOrdinal(instance, providedFormat, state) {
    var ordinalFn = state.currentOrdinal();
    var options = Object.assign({}, defaultOptions, state.currentOrdinalDefaults(), providedFormat);

    var output = formatNumber({
        instance: instance,
        providedFormat: providedFormat,
        state: state,
        defaults: state.currentOrdinalDefaults()
    });
    var ordinal = ordinalFn(instance._value);

    return "" + output + (options.spaceSeparated ? " " : "") + ordinal;
}

/**
 * Format the provided INSTANCE as a time HH:MM:SS.
 *
 * @param {Numbro} instance - numbro instance to format
 * @return {string}
 */
function formatTime(instance) {
    var hours = Math.floor(instance._value / 60 / 60);
    var minutes = Math.floor((instance._value - hours * 60 * 60) / 60);
    var seconds = Math.round(instance._value - hours * 60 * 60 - minutes * 60);
    return hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

/**
 * Format the provided INSTANCE as a percentage using the PROVIDEDFORMAT,
 * and the STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @param numbro - the numbro singleton
 * @return {string}
 */
function formatPercentage(instance, providedFormat, state, numbro) {
    var prefixSymbol = providedFormat.prefixSymbol;

    var output = formatNumber({
        instance: numbro(instance._value * 100),
        providedFormat: providedFormat,
        state: state,
        defaults: state.currentPercentageDefaults()
    });
    var options = Object.assign({}, defaultOptions, state.currentPercentageDefaults(), providedFormat);

    if (prefixSymbol) {
        return "%" + (options.spaceSeparated ? " " : "") + output;
    }

    return "" + output + (options.spaceSeparated ? " " : "") + "%";
}

/**
 * Format the provided INSTANCE as a percentage using the PROVIDEDFORMAT,
 * and the STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @return {string}
 */
function formatCurrency(instance, providedFormat, state) {
    var currentCurrency = state.currentCurrency();
    var options = Object.assign({}, defaultOptions, state.currentCurrencyDefaults(), providedFormat);
    var decimalSeparator = undefined;
    var space = "";

    if (options.spaceSeparated) {
        space = " ";
    }

    if (currentCurrency.position === "infix") {
        decimalSeparator = space + currentCurrency.symbol + space;
    }

    var output = formatNumber({
        instance: instance,
        providedFormat: providedFormat,
        state: state,
        decimalSeparator: decimalSeparator,
        defaults: state.currentCurrencyDefaults()
    });

    if (currentCurrency.position === "prefix") {
        output = currentCurrency.symbol + space + output;
    }

    if (currentCurrency.position === "postfix") {
        output = output + space + currentCurrency.symbol;
    }

    return output;
}

/**
 * Compute the average value out of VALUE.
 * The other parameters are computation options.
 *
 * @param {number} value - value to compute
 * @param {string} [forceAverage] - forced unit used to compute
 * @param {{}} abbreviations - part of the language specification
 * @param {boolean} spaceSeparated - `true` if a space must be inserted between the value and the abbreviation
 * @param {number} [totalLength] - total length of the output including the characteristic and the mantissa
 * @return {{value: number, abbreviation: string, mantissaPrecision: number}}
 */
function computeAverage(_ref) {
    var value = _ref.value,
        forceAverage = _ref.forceAverage,
        abbreviations = _ref.abbreviations,
        _ref$spaceSeparated = _ref.spaceSeparated,
        spaceSeparated = _ref$spaceSeparated === undefined ? false : _ref$spaceSeparated,
        _ref$totalLength = _ref.totalLength,
        totalLength = _ref$totalLength === undefined ? 0 : _ref$totalLength;

    var abbreviation = "";
    var abs = Math.abs(value);
    var mantissaPrecision = -1;

    if (abs >= Math.pow(10, 12) && !forceAverage || forceAverage === "trillion") {
        // trillion
        abbreviation = abbreviations.trillion;
        value = value / Math.pow(10, 12);
    } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !forceAverage || forceAverage === "billion") {
        // billion
        abbreviation = abbreviations.billion;
        value = value / Math.pow(10, 9);
    } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !forceAverage || forceAverage === "million") {
        // million
        abbreviation = abbreviations.million;
        value = value / Math.pow(10, 6);
    } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !forceAverage || forceAverage === "thousand") {
        // thousand
        abbreviation = abbreviations.thousand;
        value = value / Math.pow(10, 3);
    }

    var optionalSpace = spaceSeparated ? " " : "";

    if (abbreviation) {
        abbreviation = optionalSpace + abbreviation;
    }

    if (totalLength) {
        var characteristic = value.toString().split(".")[0];
        mantissaPrecision = Math.max(totalLength - characteristic.length, 0);
    }

    return { value: value, abbreviation: abbreviation, mantissaPrecision: mantissaPrecision };
}

/**
 * Compute an exponential form for VALUE, taking into account CHARACTERISTIC
 * if provided.
 * @param {number} value - value to compute
 * @param {number} [characteristicPrecision] - optional characteristic length
 * @return {{value: number, abbreviation: string}}
 */
function computeExponential(_ref2) {
    var value = _ref2.value,
        _ref2$characteristicP = _ref2.characteristicPrecision,
        characteristicPrecision = _ref2$characteristicP === undefined ? 0 : _ref2$characteristicP;

    var _value$toExponential$ = value.toExponential().split("e"),
        _value$toExponential$2 = _slicedToArray(_value$toExponential$, 2),
        numberString = _value$toExponential$2[0],
        exponential = _value$toExponential$2[1];

    var number = +numberString;

    if (!characteristicPrecision) {
        return {
            value: number,
            abbreviation: "e" + exponential
        };
    }

    var characteristicLength = 1; // see `toExponential`

    if (characteristicLength < characteristicPrecision) {
        number = number * Math.pow(10, characteristicPrecision - characteristicLength);
        exponential = +exponential - (characteristicPrecision - characteristicLength);
        exponential = exponential >= 0 ? "+" + exponential : exponential;
    }

    return {
        value: number,
        abbreviation: "e" + exponential
    };
}

/**
 * Return a string of NUMBER zero.
 *
 * @param {number} number - Length of the output
 * @return {string}
 */
function zeroes(number) {
    var result = "";
    for (var i = 0; i < number; i++) {
        result += "0";
    }

    return result;
}

/**
 * Return a string representing VALUE with a PRECISION-long mantissa.
 * This method is for large/small numbers only (a.k.a. including a "e").
 *
 * @param {number} value - number to precise
 * @param {number} precision - desired length for the mantissa
 * @return {string}
 */
function toFixedLarge(value, precision) {
    var result = value.toString();

    var _result$split = result.split("e"),
        _result$split2 = _slicedToArray(_result$split, 2),
        base = _result$split2[0],
        exp = _result$split2[1];

    var _base$split = base.split("."),
        _base$split2 = _slicedToArray(_base$split, 2),
        characteristic = _base$split2[0],
        _base$split2$ = _base$split2[1],
        mantissa = _base$split2$ === undefined ? "" : _base$split2$;

    if (+exp > 0) {
        result = characteristic + mantissa + zeroes(exp - mantissa.length);
    } else {
        var prefix = ".";

        if (+characteristic < 0) {
            prefix = "-0" + prefix;
        } else {
            prefix = "0" + prefix;
        }

        var suffix = (zeroes(-exp - 1) + Math.abs(characteristic) + mantissa).substr(0, precision);
        if (suffix.length < precision) {
            suffix += zeroes(precision - suffix.length);
        }
        result = prefix + suffix;
    }

    if (+exp > 0 && precision > 0) {
        result += "." + zeroes(precision);
    }

    return result;
}

/**
 * Return a string representing VALUE with a PRECISION-long mantissa.
 *
 * @param {number} value - number to precise
 * @param {number} precision - desired length for the mantissa
 * @return {string}
 */
function toFixed(value, precision) {
    if (value.toString().indexOf("e") !== -1) {
        return toFixedLarge(value, precision);
    }

    return (Math.round(+(value + "e+" + precision)) / Math.pow(10, precision)).toFixed(precision);
}

/**
 * Return the current OUTPUT with a mantissa precions of PRECISION.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {boolean} optionalMantissa - `true` if the mantissa is omitted when it's only zeroes
 * @param {number} precision - desired precision of the mantissa
 * @return {string}
 */
function setMantissaPrecision(output, value, optionalMantissa, precision) {
    if (precision === -1) {
        return output;
    }

    var result = toFixed(value, precision);

    var _result$toString$spli = result.toString().split("."),
        _result$toString$spli2 = _slicedToArray(_result$toString$spli, 2),
        currentCharacteristic = _result$toString$spli2[0],
        _result$toString$spli3 = _result$toString$spli2[1],
        currentMantissa = _result$toString$spli3 === undefined ? "" : _result$toString$spli3;

    if (currentMantissa.match(/^0+$/) && optionalMantissa) {
        return currentCharacteristic;
    }

    return result.toString();
}

/**
 * Return the current OUTPUT with a characteristic precions of PRECISION.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {boolean} optionalCharacteristic - `true` if the characteristic is omitted when it's only zeroes
 * @param {number} precision - desired precision of the characteristic
 * @return {string}
 */
function setCharacteristicPrecision(output, value, optionalCharacteristic, precision) {
    var result = output;

    var _result$toString$spli4 = result.toString().split("."),
        _result$toString$spli5 = _slicedToArray(_result$toString$spli4, 2),
        currentCharacteristic = _result$toString$spli5[0],
        currentMantissa = _result$toString$spli5[1];

    if (currentCharacteristic.match(/^-?0$/) && optionalCharacteristic) {
        if (!currentMantissa) {
            return currentCharacteristic.replace("0", "");
        }

        return currentCharacteristic.replace("0", "") + "." + currentMantissa;
    }

    if (currentCharacteristic.length < precision) {
        var missingZeros = precision - currentCharacteristic.length;
        for (var i = 0; i < missingZeros; i++) {
            result = "0" + result;
        }
    }

    return result.toString();
}

/**
 * Return the indexes where are the group separations after splitting
 * `totalLength` in group of `groupSize` size.
 * Important: we start grouping from the right hand side.
 *
 * @param {number} totalLength - total length of the characteristic to split
 * @param {number} groupSize - length of each group
 * @return {[number]}
 */
function indexesOfGroupSpaces(totalLength, groupSize) {
    var result = [];
    var counter = 0;
    for (var i = totalLength; i > 0; i--) {
        if (counter === groupSize) {
            result.unshift(i);
            counter = 0;
        }
        counter++;
    }

    return result;
}

/**
 * Replace the decimal separator with DECIMALSEPARATOR and insert thousand
 * separators.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {boolean} thousandSeparated - `true` if the characteristic must be separated
 * @param {globalState} state - shared state of the library
 * @param {string} decimalSeparator - string to use as decimal separator
 * @return {string}
 */
function replaceDelimiters(output, value, thousandSeparated, state, decimalSeparator) {
    var delimiters = state.currentDelimiters();
    var thousandSeparator = delimiters.thousands;
    decimalSeparator = decimalSeparator || delimiters.decimal;
    var thousandsSize = delimiters.thousandsSize || 3;

    var result = output.toString();
    var characteristic = result.split(".")[0];
    var mantissa = result.split(".")[1];

    if (thousandSeparated) {
        if (value < 0) {
            // Remove the minus sign
            characteristic = characteristic.slice(1);
        }

        var indexesToInsertThousandDelimiters = indexesOfGroupSpaces(characteristic.length, thousandsSize);
        indexesToInsertThousandDelimiters.forEach(function (position, index) {
            characteristic = characteristic.slice(0, position + index) + thousandSeparator + characteristic.slice(position + index);
        });

        if (value < 0) {
            // Add back the minus sign
            characteristic = "-" + characteristic;
        }
    }

    if (!mantissa) {
        result = characteristic;
    } else {
        result = characteristic + decimalSeparator + mantissa;
    }
    return result;
}

/**
 * Insert the provided ABBREVIATION at the end of OUTPUT.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {string} abbreviation - abbreviation to append
 * @return {*}
 */
function insertAbbreviation(output, abbreviation) {
    return output + abbreviation;
}

/**
 * Insert the positive/negative sign according to the NEGATIVE flag.
 * If the value is negative but still output as 0, the negative sign is removed.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {string} negative - flag for the negative form ("sign" or "parenthesis")
 * @return {*}
 */
function insertSign(output, value, negative) {
    if (value === 0) {
        return output;
    }

    if (+output === 0) {
        return output.replace("-", "");
    }

    if (value > 0) {
        return "+" + output;
    }

    if (negative === "sign") {
        return output;
    }

    return "(" + output.replace("-", "") + ")";
}

/**
 * Insert the provided PREFIX at the start of OUTPUT.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {string} prefix - abbreviation to prepend
 * @return {*}
 */
function insertPrefix(output, prefix) {
    return prefix + output;
}

/**
 * Insert the provided POSTFIX at the end of OUTPUT.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {string} postfix - abbreviation to append
 * @return {*}
 */
function insertPostfix(output, postfix) {
    return output + postfix;
}

/**
 * Format the provided INSTANCE as a number using the PROVIDEDFORMAT,
 * and the STATE.
 * This is the key method of the framework!
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} [providedFormat] - specification for formatting
 * @param {globalState} state - shared state of the library
 * @param {string} decimalSeparator - string to use as decimal separator
 * @param {{}} defaults - Set of default values used for formatting
 * @return {string}
 */
function formatNumber(_ref3) {
    var instance = _ref3.instance,
        providedFormat = _ref3.providedFormat,
        _ref3$state = _ref3.state,
        state = _ref3$state === undefined ? globalState : _ref3$state,
        decimalSeparator = _ref3.decimalSeparator,
        _ref3$defaults = _ref3.defaults,
        defaults = _ref3$defaults === undefined ? state.currentDefaults() : _ref3$defaults;

    var value = instance._value;

    if (value === 0 && state.hasZeroFormat()) {
        return state.getZeroFormat();
    }

    if (!isFinite(value)) {
        return value.toString();
    }

    var options = Object.assign({}, defaultOptions, defaults, providedFormat);

    var totalLength = options.totalLength;
    var characteristicPrecision = totalLength ? 0 : options.characteristic;
    var optionalCharacteristic = options.optionalCharacteristic;
    var forceAverage = options.forceAverage;
    var average = !!totalLength || !!forceAverage || options.average;

    // default when averaging is to chop off decimals
    var mantissaPrecision = totalLength ? -1 : average && providedFormat.mantissa === undefined ? 0 : options.mantissa;
    var optionalMantissa = totalLength ? false : options.optionalMantissa;
    var thousandSeparated = options.thousandSeparated;
    var spaceSeparated = options.spaceSeparated;
    var negative = options.negative;
    var forceSign = options.forceSign;
    var exponential = options.exponential;

    var abbreviation = "";

    if (average) {
        var data = computeAverage({
            value: value,
            forceAverage: forceAverage,
            abbreviations: state.currentAbbreviations(),
            spaceSeparated: spaceSeparated,
            totalLength: totalLength
        });

        value = data.value;
        abbreviation += data.abbreviation;

        if (totalLength) {
            mantissaPrecision = data.mantissaPrecision;
        }
    }

    if (exponential) {
        var _data = computeExponential({
            value: value,
            characteristicPrecision: characteristicPrecision
        });

        value = _data.value;
        abbreviation = _data.abbreviation + abbreviation;
    }

    var output = setMantissaPrecision(value.toString(), value, optionalMantissa, mantissaPrecision);
    output = setCharacteristicPrecision(output, value, optionalCharacteristic, characteristicPrecision);
    output = replaceDelimiters(output, value, thousandSeparated, state, decimalSeparator);

    if (average || exponential) {
        output = insertAbbreviation(output, abbreviation);
    }

    if (forceSign || value < 0) {
        output = insertSign(output, value, negative);
    }

    return output;
}

module.exports = function (numbro) {
    return {
        format: function format() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _format.apply(undefined, args.concat([numbro]));
        },
        getByteUnit: function getByteUnit() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return _getByteUnit.apply(undefined, args.concat([numbro]));
        },
        getBinaryByteUnit: function getBinaryByteUnit() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return _getBinaryByteUnit.apply(undefined, args.concat([numbro]));
        },
        getDecimalByteUnit: function getDecimalByteUnit() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            return _getDecimalByteUnit.apply(undefined, args.concat([numbro]));
        }
    };
};

},{"./globalState":3,"./parsing":7,"./validating":9}],3:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var enUS = require("./en-US");
var validating = require("./validating");
var parsing = require("./parsing");

var state = {};

var currentLanguageTag = undefined;
var languages = {};

var zeroFormat = null;

var globalDefaults = {};

function chooseLanguage(tag) {
  currentLanguageTag = tag;
}

function currentLanguageData() {
  return languages[currentLanguageTag];
}

/**
 * Return all the register languages
 *
 * @return {{}}
 */
state.languages = function () {
  return Object.assign({}, languages);
};

//
// Current language accessors
//

/**
 * Return the current language tag
 *
 * @return {string}
 */
state.currentLanguage = function () {
  return currentLanguageTag;
};

/**
 * Return the current language currency data
 *
 * @return {{}}
 */
state.currentCurrency = function () {
  return currentLanguageData().currency;
};

/**
 * Return the current language abbreviations data
 *
 * @return {{}}
 */
state.currentAbbreviations = function () {
  return currentLanguageData().abbreviations;
};

/**
 * Return the current language delimiters data
 *
 * @return {{}}
 */
state.currentDelimiters = function () {
  return currentLanguageData().delimiters;
};

/**
 * Return the current language ordinal function
 *
 * @return {function}
 */
state.currentOrdinal = function () {
  return currentLanguageData().ordinal;
};

//
// Defaults
//

/**
 * Return the current formatting defaults.
 * Use first uses the current language default, then fallbacks to the globally defined defaults.
 *
 * @return {{}}
 */
state.currentDefaults = function () {
  return Object.assign({}, currentLanguageData().defaults, globalDefaults);
};

/**
 * Return the current ordinal specific formatting defaults.
 * Use first uses the current language ordinal default, then fallbacks to the regular defaults.
 *
 * @return {{}}
 */
state.currentOrdinalDefaults = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().ordinalDefaults);
};

/**
 * Return the current byte specific formatting defaults.
 * Use first uses the current language byte default, then fallbacks to the regular defaults.
 *
 * @return {{}}
 */
state.currentByteDefaults = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().byteDefaults);
};

/**
 * Return the current percentage specific formatting defaults.
 * Use first uses the current language percentage default, then fallbacks to the regular defaults.
 *
 * @return {{}}
 */
state.currentPercentageDefaults = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().percentageDefaults);
};

/**
 * Return the current currency specific formatting defaults.
 * Use first uses the current language currency default, then fallbacks to the regular defaults.
 *
 * @return {{}}
 */
state.currentCurrencyDefaults = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().currencyDefaults);
};

/**
 * Set the global formatting defaults.
 *
 * @param {{}|string} format - formatting options to use as defaults
 */
state.setDefaults = function (format) {
  format = parsing.parseFormat(format);
  if (validating.validateFormat(format)) {
    globalDefaults = format;
  }
};

//
// Zero format
//

/**
 * Return the format string for 0.
 *
 * @return {string}
 */
state.getZeroFormat = function () {
  return zeroFormat;
};

/**
 * Set a STRING to output when the value is 0.
 *
 * @param {{}|string} string - string to set
 */
state.setZeroFormat = function (string) {
  return zeroFormat = typeof string === "string" ? string : null;
};

/**
 * Return true if a format for 0 has been set already.
 *
 * @return {boolean}
 */
state.hasZeroFormat = function () {
  return zeroFormat !== null;
};

//
// Getters/Setters
//

/**
 * Return the language data for the provided TAG.
 * Return the current language data if no tag is provided.
 *
 * Throw an error if the tag doesn't match any registered language.
 *
 * @param {string} [tag] - language tag of a registered language
 * @return {{}}
 */
state.languageData = function (tag) {
  if (tag) {
    if (languages[tag]) {
      return languages[tag];
    }
    throw new Error("Unknown tag \"" + tag + "\"");
  }

  return currentLanguageData();
};

/**
 * Register the provided DATA as a language if and only if the data is valid.
 * If the data is not valid, an error is thrown.
 *
 * When USELANGUAGE is true, the registered language is then used.
 *
 * @param {{}} data - language data to register
 * @param {boolean} [useLanguage] - `true` if the provided data should become the current language
 */
state.registerLanguage = function (data) {
  var useLanguage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (!validating.validateLanguage(data)) {
    throw new Error("Invalid language data");
  }

  languages[data.languageTag] = data;

  if (useLanguage) {
    chooseLanguage(data.languageTag);
  }
};

/**
 * Set the current language according to TAG.
 * If TAG doesn't match a registered language, another language matching
 * the "language" part of the tag (according to BCP47: https://tools.ietf.org/rfc/bcp/bcp47.txt).
 * If none, the FALLBACKTAG is used. If the FALLBACKTAG doesn't match a register language,
 * `en-US` is finally used.
 *
 * @param tag
 * @param fallbackTag
 */
state.setLanguage = function (tag) {
  var fallbackTag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : enUS.languageTag;

  if (!languages[tag]) {
    var suffix = tag.split("-")[0];

    var matchingLanguageTag = Object.keys(languages).find(function (each) {
      return each.split("-")[0] === suffix;
    });

    if (!languages[matchingLanguageTag]) {
      chooseLanguage(fallbackTag);
      return;
    }

    chooseLanguage(matchingLanguageTag);
  }

  chooseLanguage(tag);
};

state.registerLanguage(enUS);
currentLanguageTag = enUS.languageTag;

module.exports = state;

},{"./en-US":1,"./parsing":7,"./validating":9}],4:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Load languages matching TAGS. Silently pass over the failing load.
 *
 * We assume here that we are in a node environment, so we don't check for it.
 * @param {[String]} tags - list of tags to load
 * @param {Numbro} numbro - the numbro singleton
 */
function _loadLanguagesInNode(tags, numbro) {
    tags.forEach(function (tag) {
        var data = undefined;
        try {
            data = require("../languages/" + tag);
        } catch (e) {
            console.error("Unable to load \"" + tag + "\". No matching language file found."); // eslint-disable-line no-console
        }

        if (data) {
            numbro.registerLanguage(data);
        }
    });
}

module.exports = function (numbro) {
    return {
        loadLanguagesInNode: function loadLanguagesInNode(tags) {
            return _loadLanguagesInNode(tags, numbro);
        }
    };
};

},{}],5:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Todo: add BigNumber support (https://github.com/MikeMcl/bignumber.js/)

function multiplier(x) {
    var parts = x.toString().split(".");
    var mantissa = parts[1];

    if (!mantissa) {
        return 1;
    }

    return Math.pow(10, mantissa.length);
}

function correctionFactor() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var smaller = args.reduce(function (prev, next) {
        var mp = multiplier(prev);
        var mn = multiplier(next);
        return mp > mn ? prev : next;
    }, -Infinity);

    return multiplier(smaller);
}

function _add(n, other, numbro) {
    var value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    var factor = correctionFactor(n._value, value);

    function callback(acc, number) {
        return acc + factor * number;
    }

    n._value = [n._value, value].reduce(callback, 0) / factor;
    return n;
}

function _subtract(n, other, numbro) {
    var value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    var factor = correctionFactor(n._value, value);

    function callback(acc, number) {
        return acc - factor * number;
    }

    n._value = [value].reduce(callback, n._value * factor) / factor;
    return n;
}

function _multiply(n, other, numbro) {
    var value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    function callback(accum, curr) {
        var factor = correctionFactor(accum, curr);
        var result = accum * factor;
        result *= curr * factor;
        result /= factor * factor;

        return result;
    }

    n._value = [n._value, value].reduce(callback, 1);
    return n;
}

function _divide(n, other, numbro) {
    var value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    function callback(accum, curr) {
        var factor = correctionFactor(accum, curr);
        return accum * factor / (curr * factor);
    }

    n._value = [n._value, value].reduce(callback);
    return n;
}

function _set(n, other, numbro) {
    var value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    n._value = value;
    return n;
}

function _difference(n, other, numbro) {
    var clone = numbro(n._value);
    _subtract(clone, other, numbro);

    return Math.abs(clone._value);
}

module.exports = function (numbro) {
    return {
        add: function add(n, other) {
            return _add(n, other, numbro);
        },
        subtract: function subtract(n, other) {
            return _subtract(n, other, numbro);
        },
        multiply: function multiply(n, other) {
            return _multiply(n, other, numbro);
        },
        divide: function divide(n, other) {
            return _divide(n, other, numbro);
        },
        set: function set(n, other) {
            return _set(n, other, numbro);
        },
        difference: function difference(n, other) {
            return _difference(n, other, numbro);
        }
    };
};

},{}],6:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var VERSION = "2.0.0";

//
// Constructor
//

function Numbro(number) {
    this._value = number;
}

function normalizeInput(input) {
    var result = input;
    if (numbro.isNumbro(input)) {
        result = input._value;
    } else if (typeof input === "string") {
        result = numbro.unformat(input);
    } else if (isNaN(input)) {
        result = NaN;
    }

    return result;
}

function numbro(input) {
    return new Numbro(normalizeInput(input));
}

numbro.version = VERSION;

numbro.isNumbro = function (object) {
    return object instanceof Numbro;
};

var globalState = require("./globalState");
var validator = require("./validating");
var loader = require("./loading")(numbro);
var unformatter = require("./unformatting");
var formatter = require("./formatting")(numbro);
var manipulate = require("./manipulating")(numbro);

Numbro.prototype = {
    clone: function clone() {
        return numbro(this._value);
    },
    format: function format() {
        var _format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return formatter.format(this, _format);
    },
    formatCurrency: function formatCurrency() {
        var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        format.output = "currency";
        return formatter.format(this, format);
    },
    formatTime: function formatTime() {
        var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        format.output = "time";
        return formatter.format(this, format);
    },
    binaryByteUnits: function binaryByteUnits() {
        return formatter.getBinaryByteUnit(this);
    },
    decimalByteUnits: function decimalByteUnits() {
        return formatter.getDecimalByteUnit(this);
    },
    byteUnits: function byteUnits() {
        return formatter.getByteUnit(this);
    },
    difference: function difference(other) {
        return manipulate.difference(this, other);
    },
    add: function add(other) {
        return manipulate.add(this, other);
    },
    subtract: function subtract(other) {
        return manipulate.subtract(this, other);
    },
    multiply: function multiply(other) {
        return manipulate.multiply(this, other);
    },
    divide: function divide(other) {
        return manipulate.divide(this, other);
    },
    set: function set(input) {
        return manipulate.set(this, normalizeInput(input));
    },
    value: function value() {
        return this._value;
    },
    valueOf: function valueOf() {
        return this._value;
    }
};

//
// `numbro` static methods
//

numbro.language = globalState.currentLanguage;
numbro.registerLanguage = globalState.registerLanguage;
numbro.setLanguage = globalState.setLanguage;
numbro.languages = globalState.languages;
numbro.languageData = globalState.languageData;
numbro.zeroFormat = globalState.setZeroFormat;
numbro.defaultFormat = globalState.currentDefaults;
numbro.setDefaults = globalState.setDefaults;
numbro.defaultCurrencyFormat = globalState.currentCurrencyDefaults;
numbro.validate = validator.validate;
numbro.loadLanguagesInNode = loader.loadLanguagesInNode;
numbro.unformat = unformatter.unformat;

module.exports = numbro;

},{"./formatting":2,"./globalState":3,"./loading":4,"./manipulating":5,"./unformatting":8,"./validating":9}],7:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function parsePrefix(string, result) {
    var match = string.match(/^{([^}]*)}/);
    if (match) {
        result.prefix = match[1];
        return string.slice(match[0].length);
    }

    return string;
}

function parsePostfix(string, result) {
    var match = string.match(/{([^}]*)}$/);
    if (match) {
        result.postfix = match[1];

        return string.slice(0, -match[0].length);
    }

    return string;
}

function parseOutput(string, result) {
    if (string.indexOf("$") !== -1) {
        result.output = "currency";
        return;
    }

    if (string.indexOf("%") !== -1) {
        result.output = "percent";
        return;
    }

    if (string.indexOf("bd") !== -1) {
        result.output = "byte";
        result.base = "general";
        return;
    }

    if (string.indexOf("b") !== -1) {
        result.output = "byte";
        result.base = "binary";
        return;
    }

    if (string.indexOf("d") !== -1) {
        result.output = "byte";
        result.base = "decimal";
        return;
    }

    if (string.indexOf(":") !== -1) {
        result.output = "time";
        return;
    }

    if (string.indexOf("o") !== -1) {
        result.output = "ordinal";
    }
}

function parseThousandSeparated(string, result) {
    if (string.indexOf(",") !== -1) {
        result.thousandSeparated = true;
    }
}

function parseSpaceSeparated(string, result) {
    if (string.indexOf(" ") !== -1) {
        result.spaceSeparated = true;
    }
}

function parseTotalLength(string, result) {
    var match = string.match(/[1-9]+[0-9]*/);

    if (match) {
        result.totalLength = +match[0];
    }
}

function parseCharacteristic(string, result) {
    var characteristic = string.split(".")[0];
    var match = characteristic.match(/0+/);
    if (match) {
        result.characteristic = match[0].length;
    }
}

function parseMantissa(string, result) {
    var mantissa = string.split(".")[1];
    if (mantissa) {
        var match = mantissa.match(/0+/);
        if (match) {
            result.mantissa = match[0].length;
        }
    }
}

function parseAverage(string, result) {
    if (string.indexOf("a") !== -1) {
        result.average = true;
    }
}

function parseForceAverage(string, result) {
    if (string.indexOf("K") !== -1) {
        result.forceAverage = "thousand";
    } else if (string.indexOf("M") !== -1) {
        result.forceAverage = "million";
    } else if (string.indexOf("B") !== -1) {
        result.forceAverage = "billion";
    } else if (string.indexOf("T") !== -1) {
        result.forceAverage = "trillion";
    }
}

function parseOptionalMantissa(string, result) {
    if (string.match(/\[\.]/)) {
        result.optionalMantissa = true;
    } else if (string.match(/\./)) {
        result.optionalMantissa = false;
    }
}

function parseOptionalCharacteristic(string, result) {
    if (string.indexOf(".") !== -1) {
        var characteristic = string.split(".")[0];
        result.optionalCharacteristic = characteristic.indexOf("0") === -1;
    }
}

function parseNegative(string, result) {
    if (string.match(/^\+?\([^)]*\)$/)) {
        result.negative = "parenthesis";
    }
    if (string.match(/^\+?-/)) {
        result.negative = "sign";
    }
}

function parseForceSign(string, result) {
    if (string.match(/^\+/)) {
        result.forceSign = true;
    }
}

function parseFormat(string) {
    var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (typeof string !== "string") {
        return string;
    }

    string = parsePrefix(string, result);
    string = parsePostfix(string, result);
    parseOutput(string, result);
    parseTotalLength(string, result);
    parseCharacteristic(string, result);
    parseOptionalCharacteristic(string, result);
    parseAverage(string, result);
    parseForceAverage(string, result);
    parseMantissa(string, result);
    parseOptionalMantissa(string, result);
    parseThousandSeparated(string, result);
    parseSpaceSeparated(string, result);
    parseNegative(string, result);
    parseForceSign(string, result);

    return result;
}

module.exports = {
    parseFormat: parseFormat
};

},{}],8:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var allSuffixes = [{ key: "ZiB", factor: Math.pow(1024, 7) }, { key: "ZB", factor: Math.pow(1000, 7) }, { key: "YiB", factor: Math.pow(1024, 8) }, { key: "YB", factor: Math.pow(1000, 8) }, { key: "TiB", factor: Math.pow(1024, 4) }, { key: "TB", factor: Math.pow(1000, 4) }, { key: "PiB", factor: Math.pow(1024, 5) }, { key: "PB", factor: Math.pow(1000, 5) }, { key: "MiB", factor: Math.pow(1024, 2) }, { key: "MB", factor: Math.pow(1000, 2) }, { key: "KiB", factor: Math.pow(1024, 1) }, { key: "KB", factor: Math.pow(1000, 1) }, { key: "GiB", factor: Math.pow(1024, 3) }, { key: "GB", factor: Math.pow(1000, 3) }, { key: "EiB", factor: Math.pow(1024, 6) }, { key: "EB", factor: Math.pow(1000, 6) }, { key: "B", factor: 1 }];

function escapeRegExp(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function unformatValue(inputString, delimiters) {
    var currencySymbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var ordinal = arguments[3];
    var zeroFormat = arguments[4];
    var abbreviations = arguments[5];
    var format = arguments[6];

    if (inputString === "") {
        return undefined;
    }

    if (!isNaN(+inputString)) {
        return +inputString;
    }

    // Zero Format

    if (inputString === zeroFormat) {
        return 0;
    }

    // Negative

    var match = inputString.match(/\(([^)]*)\)/);

    if (match) {
        return -1 * unformatValue(match[1], delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
    }

    // Currency

    var stripped = inputString.replace(currencySymbol, "");

    if (stripped !== inputString) {
        return unformatValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
    }

    // Thousand separators

    stripped = inputString.replace(new RegExp(escapeRegExp(delimiters.thousands), "g"), "");

    if (stripped !== inputString) {
        return unformatValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
    }

    // Decimal

    stripped = inputString.replace(delimiters.decimal, ".");

    if (stripped !== inputString) {
        return unformatValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
    }

    // Byte

    for (var i = 0; i < allSuffixes.length; i++) {
        var suffix = allSuffixes[i];
        stripped = inputString.replace(suffix.key, "");

        if (stripped !== inputString) {
            return unformatValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) * suffix.factor;
        }
    }

    // Percent

    stripped = inputString.replace("%", "");

    if (stripped !== inputString) {
        return unformatValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) / 100;
    }

    // Ordinal

    var possibleOrdinalValue = parseInt(inputString, 10);

    if (isNaN(possibleOrdinalValue)) {
        return undefined;
    }

    var ordinalString = ordinal(possibleOrdinalValue);
    stripped = inputString.replace(ordinalString, "");

    if (stripped !== inputString) {
        return unformatValue(stripped, delimiters, currencySymbol, format);
    }

    // Average
    var abbreviationKeys = Object.keys(abbreviations);
    var numberOfAbbreviations = abbreviationKeys.length;

    for (var _i = 0; _i < numberOfAbbreviations; _i++) {
        var key = abbreviationKeys[_i];

        stripped = inputString.replace(abbreviations[key], "");

        if (stripped !== inputString) {
            var factor = undefined;
            switch (key) {// eslint-disable-line default-case
                case "thousand":
                    factor = Math.pow(1000, 1);
                    break;
                case "million":
                    factor = Math.pow(1000, 2);
                    break;
                case "billion":
                    factor = Math.pow(1000, 3);
                    break;
                case "trillion":
                    factor = Math.pow(1000, 4);
                    break;
            }
            return unformatValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) * factor;
        }
    }

    return undefined;
}

function matchesTime(inputString, delimiters) {
    var separators = inputString.indexOf(":") && delimiters.thousands !== ":";

    if (!separators) {
        return false;
    }

    var segments = inputString.split(":");
    if (segments.length !== 3) {
        return false;
    }

    var hours = +segments[0];
    var minutes = +segments[1];
    var seconds = +segments[2];

    return !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds);
}

function unformatTime(inputString) {
    var segments = inputString.split(":");

    var hours = +segments[0];
    var minutes = +segments[1];
    var seconds = +segments[2];

    return seconds + 60 * minutes + 3600 * hours;
}

function unformat(inputString, format) {
    // Avoid circular references
    var globalState = require("./globalState");

    var delimiters = globalState.currentDelimiters();
    var currencySymbol = globalState.currentCurrency().symbol;
    var ordinal = globalState.currentOrdinal();
    var zeroFormat = globalState.getZeroFormat();
    var abbreviations = globalState.currentAbbreviations();

    var value = undefined;

    if (typeof inputString === "string") {
        if (matchesTime(inputString, delimiters)) {
            value = unformatTime(inputString);
        } else {
            value = unformatValue(inputString, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
        }
    } else if (typeof inputString === "number") {
        value = inputString;
    } else {
        return undefined;
    }

    if (value === undefined) {
        return undefined;
    }

    return value;
}

module.exports = {
    unformat: unformat
};

},{"./globalState":3}],9:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var unformatter = require("./unformatting");

var validOutputValues = ["currency", "percent", "byte", "time", "ordinal", "number"];

var validForceAverageValues = ["trillion", "billion", "million", "thousand"];

var validNegativeValues = ["sign", "parenthesis"];

var validMandatoryAbbreviations = {
    type: "object",
    children: {
        thousand: {
            type: "string",
            mandatory: true
        },
        million: {
            type: "string",
            mandatory: true
        },
        billion: {
            type: "string",
            mandatory: true
        },
        trillion: {
            type: "string",
            mandatory: true
        }
    },
    mandatory: true
};
var validAbbreviations = {
    type: "object",
    children: {
        thousand: "string",
        million: "string",
        billion: "string",
        trillion: "string"
    }
};

var validBaseValues = ["decimal", "binary", "general"];

var validFormat = {
    output: {
        type: "string",
        validValues: validOutputValues
    },
    base: {
        type: "string",
        validValues: validBaseValues,
        restriction: function restriction(number, format) {
            return format.output === "byte";
        },
        message: "`base` must be provided only when the output is `byte`",
        mandatory: function mandatory(format) {
            return format.output === "byte";
        }
    },
    characteristic: {
        type: "number",
        restriction: function restriction(number) {
            return number >= 0;
        },
        message: "value must be positive"
    },
    prefix: "string",
    postfix: "string",
    forceAverage: {
        type: "string",
        validValues: validForceAverageValues
    },
    average: "boolean",
    totalLength: {
        type: "number",
        restrictions: [{
            restriction: function restriction(number) {
                return number >= 0;
            },
            message: "value must be positive"
        }, {
            restriction: function restriction(number, format) {
                return !format.exponential;
            },
            message: "`totalLength` is incompatible with `exponential`"
        }]
    },
    mantissa: {
        type: "number",
        restriction: function restriction(number) {
            return number >= 0;
        },
        message: "value must be positive"
    },
    optionalMantissa: "boolean",
    optionalCharacteristic: "boolean",
    thousandSeparated: "boolean",
    spaceSeparated: "boolean",
    abbreviations: validAbbreviations,
    negative: {
        type: "string",
        validValues: validNegativeValues
    },
    forceSign: "boolean",
    exponential: {
        type: "boolean"
    },
    prefixSymbol: {
        type: "boolean",
        restriction: function restriction(number, format) {
            return format.output === "percent";
        },
        message: "`prefixSymbol` can be provided only when the output is `percent`"
    }
};

var validLanguage = {
    languageTag: {
        type: "string",
        mandatory: true
    },
    delimiters: {
        type: "object",
        children: {
            thousands: "string",
            decimal: "string"
        },
        mandatory: true
    },
    abbreviations: validMandatoryAbbreviations,
    spaceSeparated: "boolean",
    ordinal: {
        type: "function",
        mandatory: true
    },
    currency: {
        type: "object",
        children: {
            symbol: "string",
            position: "string",
            code: "string"
        },
        mandatory: true
    },
    defaults: "format",
    ordinalDefaults: "format",
    byteDefaults: "format",
    percentageDefaults: "format",
    currencyDefaults: "format",
    formats: {
        type: "object",
        children: {
            fourDigits: {
                type: "format",
                mandatory: true
            },
            fullWithTwoDecimals: {
                type: "format",
                mandatory: true
            },
            fullWithTwoDecimalsNoCurrency: {
                type: "format",
                mandatory: true
            },
            fullWithNoDecimals: {
                type: "format",
                mandatory: true
            }
        }
    }
};

/**
 * Check the validity of the provided input and format.
 * The check is NOT lazy.
 *
 * @param input
 * @param format
 * @return {boolean} True when everything is correct
 */
function validate(input, format) {
    var validInput = validateInput(input);
    var isFormatValid = validateFormat(format);

    return validInput && isFormatValid;
}

function validateInput(input) {
    var value = unformatter.unformat(input);

    return !!value;
}

function validateSpec(toValidate, spec, prefix, skipMandatoryCheck) {
    var results = Object.keys(toValidate).map(function (key) {
        if (!spec[key]) {
            console.error(prefix + " Invalid key: " + key); // eslint-disable-line no-console
            return false;
        }

        var value = toValidate[key];
        var data = spec[key];

        if (typeof data === "string") {
            data = { type: data };
        }

        if (data.type === "format") {
            // all formats are partial (a.k.a will be merged with some default values) thus no need to check mandatory values
            var valid = validateSpec(value, validFormat, "[Validate " + key + "]", true);

            if (!valid) {
                return false;
            }
        } else if ((typeof value === "undefined" ? "undefined" : _typeof(value)) !== data.type) {
            console.error(prefix + " " + key + " type mismatched: \"" + data.type + "\" expected, \"" + (typeof value === "undefined" ? "undefined" : _typeof(value)) + "\" provided"); // eslint-disable-line no-console
            return false;
        }

        if (data.restrictions && data.restrictions.length) {
            var length = data.restrictions.length;
            for (var i = 0; i < length; i++) {
                var _data$restrictions$i = data.restrictions[i],
                    restriction = _data$restrictions$i.restriction,
                    message = _data$restrictions$i.message;

                if (!restriction(value, toValidate)) {
                    console.error(prefix + " " + key + " invalid value: " + message); // eslint-disable-line no-console
                    return false;
                }
            }
        }

        if (data.restriction && !data.restriction(value, toValidate)) {
            console.error(prefix + " " + key + " invalid value: " + data.message); // eslint-disable-line no-console
            return false;
        }

        if (data.validValues && data.validValues.indexOf(value) === -1) {
            console.error(prefix + " " + key + " invalid value: must be among " + JSON.stringify(data.validValues) + ", \"" + value + "\" provided"); // eslint-disable-line no-console
            return false;
        }

        if (data.children) {
            var _valid = validateSpec(value, data.children, "[Validate " + key + "]");

            if (!_valid) {
                return false;
            }
        }

        return true;
    });

    if (!skipMandatoryCheck) {
        results.push.apply(results, _toConsumableArray(Object.keys(spec).map(function (key) {
            var data = spec[key];
            if (typeof data === "string") {
                data = { type: data };
            }

            if (data.mandatory) {
                var mandatory = data.mandatory;
                if (typeof mandatory === "function") {
                    mandatory = mandatory(toValidate);
                }

                if (mandatory && toValidate[key] === undefined) {
                    console.error(prefix + " Missing mandatory key \"" + key + "\""); // eslint-disable-line no-console
                    return false;
                }
            }

            return true;
        })));
    }

    return results.reduce(function (acc, current) {
        return acc && current;
    }, true);
}

function validateFormat(format) {
    return validateSpec(format, validFormat, "[Validate format]");
}

function validateLanguage(data) {
    return validateSpec(data, validLanguage, "[Validate language]");
}

module.exports = {
    validate: validate,
    validateFormat: validateFormat,
    validateInput: validateInput,
    validateLanguage: validateLanguage
};

},{"./unformatting":8}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW4tVVMuanMiLCJzcmMvZm9ybWF0dGluZy5qcyIsInNyYy9nbG9iYWxTdGF0ZS5qcyIsInNyYy9sb2FkaW5nLmpzIiwic3JjL21hbmlwdWxhdGluZy5qcyIsInNyYy9udW1icm8uanMiLCJzcmMvcGFyc2luZy5qcyIsInNyYy91bmZvcm1hdHRpbmcuanMiLCJzcmMvdmFsaWRhdGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsaUJBQWEsT0FEQTtBQUViLGdCQUFZO0FBQ1IsbUJBQVcsR0FESDtBQUVSLGlCQUFTO0FBRkQsS0FGQztBQU1iLG1CQUFlO0FBQ1gsa0JBQVUsR0FEQztBQUVYLGlCQUFTLEdBRkU7QUFHWCxpQkFBUyxHQUhFO0FBSVgsa0JBQVU7QUFKQyxLQU5GO0FBWWIsb0JBQWdCLEtBWkg7QUFhYixhQUFTLGlCQUFTLE1BQVQsRUFBaUI7QUFDdEIsWUFBSSxJQUFJLFNBQVMsRUFBakI7QUFDQSxlQUFRLENBQUMsRUFBRSxTQUFTLEdBQVQsR0FBZSxFQUFqQixDQUFELEtBQTBCLENBQTNCLEdBQWdDLElBQWhDLEdBQXdDLE1BQU0sQ0FBUCxHQUFZLElBQVosR0FBb0IsTUFBTSxDQUFQLEdBQVksSUFBWixHQUFvQixNQUFNLENBQVAsR0FBWSxJQUFaLEdBQW1CLElBQXZHO0FBQ0gsS0FoQlk7QUFpQmIsY0FBVTtBQUNOLGdCQUFRLEdBREY7QUFFTixrQkFBVSxRQUZKO0FBR04sY0FBTTtBQUhBLEtBakJHO0FBc0JiLHNCQUFrQjtBQUNkLDJCQUFtQixJQURMO0FBRWQscUJBQWEsQ0FGQztBQUdkLHdCQUFnQjtBQUhGLEtBdEJMO0FBMkJiLGFBQVM7QUFDTCxvQkFBWTtBQUNSLHlCQUFhLENBREw7QUFFUiw0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Iiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNyBCZW5qYW1pbiBWYW4gUnlzZWdoZW08YmVuamFtaW5AdmFucnlzZWdoZW0uY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbGFuZ3VhZ2VUYWc6IFwiZW4tVVNcIixcbiAgICBkZWxpbWl0ZXJzOiB7XG4gICAgICAgIHRob3VzYW5kczogXCIsXCIsXG4gICAgICAgIGRlY2ltYWw6IFwiLlwiXG4gICAgfSxcbiAgICBhYmJyZXZpYXRpb25zOiB7XG4gICAgICAgIHRob3VzYW5kOiBcImtcIixcbiAgICAgICAgbWlsbGlvbjogXCJtXCIsXG4gICAgICAgIGJpbGxpb246IFwiYlwiLFxuICAgICAgICB0cmlsbGlvbjogXCJ0XCJcbiAgICB9LFxuICAgIHNwYWNlU2VwYXJhdGVkOiBmYWxzZSxcbiAgICBvcmRpbmFsOiBmdW5jdGlvbihudW1iZXIpIHtcbiAgICAgICAgbGV0IGIgPSBudW1iZXIgJSAxMDtcbiAgICAgICAgcmV0dXJuICh+fihudW1iZXIgJSAxMDAgLyAxMCkgPT09IDEpID8gXCJ0aFwiIDogKGIgPT09IDEpID8gXCJzdFwiIDogKGIgPT09IDIpID8gXCJuZFwiIDogKGIgPT09IDMpID8gXCJyZFwiIDogXCJ0aFwiO1xuICAgIH0sXG4gICAgY3VycmVuY3k6IHtcbiAgICAgICAgc3ltYm9sOiBcIiRcIixcbiAgICAgICAgcG9zaXRpb246IFwicHJlZml4XCIsXG4gICAgICAgIGNvZGU6IFwiVVNEXCJcbiAgICB9LFxuICAgIGN1cnJlbmN5RGVmYXVsdHM6IHtcbiAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgIHRvdGFsTGVuZ3RoOiA0LFxuICAgICAgICBzcGFjZVNlcGFyYXRlZDogdHJ1ZVxuICAgIH0sXG4gICAgZm9ybWF0czoge1xuICAgICAgICBmb3VyRGlnaXRzOiB7XG4gICAgICAgICAgICB0b3RhbExlbmd0aDogNCxcbiAgICAgICAgICAgIHNwYWNlU2VwYXJhdGVkOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bGxXaXRoVHdvRGVjaW1hbHM6IHtcbiAgICAgICAgICAgIG91dHB1dDogXCJjdXJyZW5jeVwiLFxuICAgICAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICBtYW50aXNzYTogMlxuICAgICAgICB9LFxuICAgICAgICBmdWxsV2l0aFR3b0RlY2ltYWxzTm9DdXJyZW5jeToge1xuICAgICAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICBtYW50aXNzYTogMlxuICAgICAgICB9LFxuICAgICAgICBmdWxsV2l0aE5vRGVjaW1hbHM6IHtcbiAgICAgICAgICAgIG91dHB1dDogXCJjdXJyZW5jeVwiLFxuICAgICAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICBtYW50aXNzYTogMFxuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBnbG9iYWxTdGF0ZSA9IHJlcXVpcmUoXCIuL2dsb2JhbFN0YXRlXCIpO1xuY29uc3QgdmFsaWRhdGluZyA9IHJlcXVpcmUoXCIuL3ZhbGlkYXRpbmdcIik7XG5jb25zdCBwYXJzaW5nID0gcmVxdWlyZShcIi4vcGFyc2luZ1wiKTtcblxuY29uc3QgYmluYXJ5U3VmZml4ZXMgPSBbXCJCXCIsIFwiS2lCXCIsIFwiTWlCXCIsIFwiR2lCXCIsIFwiVGlCXCIsIFwiUGlCXCIsIFwiRWlCXCIsIFwiWmlCXCIsIFwiWWlCXCJdO1xuY29uc3QgZGVjaW1hbFN1ZmZpeGVzID0gW1wiQlwiLCBcIktCXCIsIFwiTUJcIiwgXCJHQlwiLCBcIlRCXCIsIFwiUEJcIiwgXCJFQlwiLCBcIlpCXCIsIFwiWUJcIl07XG5jb25zdCBieXRlcyA9IHtcbiAgICBnZW5lcmFsOiB7c2NhbGU6IDEwMjQsIHN1ZmZpeGVzOiBkZWNpbWFsU3VmZml4ZXMsIG1hcmtlcjogXCJiZFwifSxcbiAgICBiaW5hcnk6IHtzY2FsZTogMTAyNCwgc3VmZml4ZXM6IGJpbmFyeVN1ZmZpeGVzLCBtYXJrZXI6IFwiYlwifSxcbiAgICBkZWNpbWFsOiB7c2NhbGU6IDEwMDAsIHN1ZmZpeGVzOiBkZWNpbWFsU3VmZml4ZXMsIG1hcmtlcjogXCJkXCJ9XG59O1xuXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0b3RhbExlbmd0aDogMCxcbiAgICBjaGFyYWN0ZXJpc3RpYzogMCxcbiAgICBmb3JjZUF2ZXJhZ2U6IGZhbHNlLFxuICAgIGF2ZXJhZ2U6IGZhbHNlLFxuICAgIG1hbnRpc3NhOiAtMSxcbiAgICBvcHRpb25hbE1hbnRpc3NhOiB0cnVlLFxuICAgIHRob3VzYW5kU2VwYXJhdGVkOiBmYWxzZSxcbiAgICBzcGFjZVNlcGFyYXRlZDogZmFsc2UsXG4gICAgbmVnYXRpdmU6IFwic2lnblwiLFxuICAgIGZvcmNlU2lnbjogZmFsc2Vcbn07XG5cbi8qKlxuICogRW50cnkgcG9pbnQuIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYWNjb3JkaW5nIHRvIHRoZSBQUk9WSURFREZPUk1BVC5cbiAqIFRoaXMgbWV0aG9kIGVuc3VyZSB0aGUgcHJlZml4IGFuZCBwb3N0Zml4IGFyZSBhZGRlZCBhcyB0aGUgbGFzdCBzdGVwLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IFtwcm92aWRlZEZvcm1hdF0gLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0gbnVtYnJvIC0gdGhlIG51bWJybyBzaW5nbGV0b25cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0KGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCA9IHt9LCBudW1icm8pIHtcbiAgICBpZiAodHlwZW9mIHByb3ZpZGVkRm9ybWF0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHByb3ZpZGVkRm9ybWF0ID0gcGFyc2luZy5wYXJzZUZvcm1hdChwcm92aWRlZEZvcm1hdCk7XG4gICAgfVxuXG4gICAgbGV0IHZhbGlkID0gdmFsaWRhdGluZy52YWxpZGF0ZUZvcm1hdChwcm92aWRlZEZvcm1hdCk7XG5cbiAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgIHJldHVybiBcIkVSUk9SOiBpbnZhbGlkIGZvcm1hdFwiO1xuICAgIH1cblxuICAgIGxldCBwcmVmaXggPSBwcm92aWRlZEZvcm1hdC5wcmVmaXggfHwgXCJcIjtcbiAgICBsZXQgcG9zdGZpeCA9IHByb3ZpZGVkRm9ybWF0LnBvc3RmaXggfHwgXCJcIjtcblxuICAgIGxldCBvdXRwdXQgPSBmb3JtYXROdW1icm8oaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBudW1icm8pO1xuICAgIG91dHB1dCA9IGluc2VydFByZWZpeChvdXRwdXQsIHByZWZpeCk7XG4gICAgb3V0cHV0ID0gaW5zZXJ0UG9zdGZpeChvdXRwdXQsIHBvc3RmaXgpO1xuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBwcm92aWRlZCBJTlNUQU5DRSBhY2NvcmRpbmcgdG8gdGhlIFBST1ZJREVERk9STUFULlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIG51bWJybyAtIHRoZSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdE51bWJybyhpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIG51bWJybykge1xuICAgIHN3aXRjaCAocHJvdmlkZWRGb3JtYXQub3V0cHV0KSB7XG4gICAgICAgIGNhc2UgXCJjdXJyZW5jeVwiOlxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEN1cnJlbmN5KGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUsIG51bWJybyk7XG4gICAgICAgIGNhc2UgXCJwZXJjZW50XCI6XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0UGVyY2VudGFnZShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLCBudW1icm8pO1xuICAgICAgICBjYXNlIFwiYnl0ZVwiOlxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEJ5dGUoaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBnbG9iYWxTdGF0ZSwgbnVtYnJvKTtcbiAgICAgICAgY2FzZSBcInRpbWVcIjpcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRUaW1lKGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUsIG51bWJybyk7XG4gICAgICAgIGNhc2UgXCJvcmRpbmFsXCI6XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3JkaW5hbChpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLCBudW1icm8pO1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0TnVtYmVyKHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICAgICAgICBwcm92aWRlZEZvcm1hdCxcbiAgICAgICAgICAgICAgICBudW1icm9cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIGRlY2ltYWwgYnl0ZSB1bml0IChNQikgZm9yIHRoZSBwcm92aWRlZCBudW1icm8gSU5TVEFOQ0UuXG4gKiBXZSBnbyBmcm9tIG9uZSB1bml0IHRvIGFub3RoZXIgdXNpbmcgdGhlIGRlY2ltYWwgc3lzdGVtICgxMDAwKS5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gaW5zdGFuY2UgLSBudW1icm8gaW5zdGFuY2UgdG8gY29tcHV0ZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXREZWNpbWFsQnl0ZVVuaXQoaW5zdGFuY2UpIHtcbiAgICBsZXQgZGF0YSA9IGJ5dGVzLmRlY2ltYWw7XG4gICAgcmV0dXJuIGdldEZvcm1hdEJ5dGVVbml0cyhpbnN0YW5jZS5fdmFsdWUsIGRhdGEuc3VmZml4ZXMsIGRhdGEuc2NhbGUpLnN1ZmZpeDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGJpbmFyeSBieXRlIHVuaXQgKE1pQikgZm9yIHRoZSBwcm92aWRlZCBudW1icm8gSU5TVEFOQ0UuXG4gKiBXZSBnbyBmcm9tIG9uZSB1bml0IHRvIGFub3RoZXIgdXNpbmcgdGhlIGRlY2ltYWwgc3lzdGVtICgxMDI0KS5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gaW5zdGFuY2UgLSBudW1icm8gaW5zdGFuY2UgdG8gY29tcHV0ZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRCaW5hcnlCeXRlVW5pdChpbnN0YW5jZSkge1xuICAgIGxldCBkYXRhID0gYnl0ZXMuYmluYXJ5O1xuICAgIHJldHVybiBnZXRGb3JtYXRCeXRlVW5pdHMoaW5zdGFuY2UuX3ZhbHVlLCBkYXRhLnN1ZmZpeGVzLCBkYXRhLnNjYWxlKS5zdWZmaXg7XG59XG5cbi8qKlxuICogR2V0IHRoZSBkZWNpbWFsIGJ5dGUgdW5pdCAoTUIpIGZvciB0aGUgcHJvdmlkZWQgbnVtYnJvIElOU1RBTkNFLlxuICogV2UgZ28gZnJvbSBvbmUgdW5pdCB0byBhbm90aGVyIHVzaW5nIHRoZSBkZWNpbWFsIHN5c3RlbSAoMTAyNCkuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGNvbXB1dGVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0Qnl0ZVVuaXQoaW5zdGFuY2UpIHtcbiAgICBsZXQgZGF0YSA9IGJ5dGVzLmdlbmVyYWw7XG4gICAgcmV0dXJuIGdldEZvcm1hdEJ5dGVVbml0cyhpbnN0YW5jZS5fdmFsdWUsIGRhdGEuc3VmZml4ZXMsIGRhdGEuc2NhbGUpLnN1ZmZpeDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIHZhbHVlIGFuZCB0aGUgc3VmZml4IGNvbXB1dGVkIGluIGJ5dGUuXG4gKiBJdCB1c2VzIHRoZSBTVUZGSVhFUyBhbmQgdGhlIFNDQUxFIHByb3ZpZGVkLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIE51bWJlciB0byBmb3JtYXRcbiAqIEBwYXJhbSB7W1N0cmluZ119IHN1ZmZpeGVzIC0gTGlzdCBvZiBzdWZmaXhlc1xuICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlIC0gTnVtYmVyIGluLWJldHdlZW4gdHdvIHVuaXRzXG4gKiBAcmV0dXJuIHt7dmFsdWU6IE51bWJlciwgc3VmZml4OiBTdHJpbmd9fVxuICovXG5mdW5jdGlvbiBnZXRGb3JtYXRCeXRlVW5pdHModmFsdWUsIHN1ZmZpeGVzLCBzY2FsZSkge1xuICAgIGxldCBzdWZmaXggPSBzdWZmaXhlc1swXTtcbiAgICBsZXQgYWJzID0gTWF0aC5hYnModmFsdWUpO1xuXG4gICAgaWYgKGFicyA+PSBzY2FsZSkge1xuICAgICAgICBmb3IgKGxldCBwb3dlciA9IDE7IHBvd2VyIDwgc3VmZml4ZXMubGVuZ3RoOyArK3Bvd2VyKSB7XG4gICAgICAgICAgICBsZXQgbWluID0gTWF0aC5wb3coc2NhbGUsIHBvd2VyKTtcbiAgICAgICAgICAgIGxldCBtYXggPSBNYXRoLnBvdyhzY2FsZSwgcG93ZXIgKyAxKTtcblxuICAgICAgICAgICAgaWYgKGFicyA+PSBtaW4gJiYgYWJzIDwgbWF4KSB7XG4gICAgICAgICAgICAgICAgc3VmZml4ID0gc3VmZml4ZXNbcG93ZXJdO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgLyBtaW47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWx1ZXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIFtzY2FsZV0gWUIgbmV2ZXIgc2V0IHRoZSBzdWZmaXhcbiAgICAgICAgaWYgKHN1ZmZpeCA9PT0gc3VmZml4ZXNbMF0pIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgLyBNYXRoLnBvdyhzY2FsZSwgc3VmZml4ZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICBzdWZmaXggPSBzdWZmaXhlc1tzdWZmaXhlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7dmFsdWUsIHN1ZmZpeH07XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBwcm92aWRlZCBJTlNUQU5DRSBhcyBieXRlcyB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsIGFuZCBTVEFURS5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gaW5zdGFuY2UgLSBudW1icm8gaW5zdGFuY2UgdG8gZm9ybWF0XG4gKiBAcGFyYW0ge3t9fSBwcm92aWRlZEZvcm1hdCAtIHNwZWNpZmljYXRpb24gZm9yIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7Z2xvYmFsU3RhdGV9IHN0YXRlIC0gc2hhcmVkIHN0YXRlIG9mIHRoZSBsaWJyYXJ5XG4gKiBAcGFyYW0gbnVtYnJvIC0gdGhlIG51bWJybyBzaW5nbGV0b25cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0Qnl0ZShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIHN0YXRlLCBudW1icm8pIHtcbiAgICBsZXQgYmFzZSA9IHByb3ZpZGVkRm9ybWF0LmJhc2UgfHwgXCJiaW5hcnlcIjtcbiAgICBsZXQgYmFzZUluZm8gPSBieXRlc1tiYXNlXTtcblxuICAgIGxldCB7dmFsdWUsIHN1ZmZpeH0gPSBnZXRGb3JtYXRCeXRlVW5pdHMoaW5zdGFuY2UuX3ZhbHVlLCBiYXNlSW5mby5zdWZmaXhlcywgYmFzZUluZm8uc2NhbGUpO1xuICAgIGxldCBvdXRwdXQgPSBmb3JtYXROdW1iZXIoe1xuICAgICAgICBpbnN0YW5jZTogbnVtYnJvKHZhbHVlKSxcbiAgICAgICAgcHJvdmlkZWRGb3JtYXQsXG4gICAgICAgIHN0YXRlLFxuICAgICAgICBkZWZhdWx0czogc3RhdGUuY3VycmVudEJ5dGVEZWZhdWx0cygpXG4gICAgfSk7XG4gICAgbGV0IGFiYnJldmlhdGlvbnMgPSBzdGF0ZS5jdXJyZW50QWJicmV2aWF0aW9ucygpO1xuICAgIHJldHVybiBgJHtvdXRwdXR9JHthYmJyZXZpYXRpb25zLnNwYWNlZCA/IFwiIFwiIDogXCJcIn0ke3N1ZmZpeH1gO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYW4gb3JkaW5hbCB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0T3JkaW5hbChpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIHN0YXRlKSB7XG4gICAgbGV0IG9yZGluYWxGbiA9IHN0YXRlLmN1cnJlbnRPcmRpbmFsKCk7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgc3RhdGUuY3VycmVudE9yZGluYWxEZWZhdWx0cygpLCBwcm92aWRlZEZvcm1hdCk7XG5cbiAgICBsZXQgb3V0cHV0ID0gZm9ybWF0TnVtYmVyKHtcbiAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgIHByb3ZpZGVkRm9ybWF0LFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgZGVmYXVsdHM6IHN0YXRlLmN1cnJlbnRPcmRpbmFsRGVmYXVsdHMoKVxuICAgIH0pO1xuICAgIGxldCBvcmRpbmFsID0gb3JkaW5hbEZuKGluc3RhbmNlLl92YWx1ZSk7XG5cbiAgICByZXR1cm4gYCR7b3V0cHV0fSR7b3B0aW9ucy5zcGFjZVNlcGFyYXRlZCA/IFwiIFwiIDogXCJcIn0ke29yZGluYWx9YDtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHByb3ZpZGVkIElOU1RBTkNFIGFzIGEgdGltZSBISDpNTTpTUy5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gaW5zdGFuY2UgLSBudW1icm8gaW5zdGFuY2UgdG8gZm9ybWF0XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdFRpbWUoaW5zdGFuY2UpIHtcbiAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKGluc3RhbmNlLl92YWx1ZSAvIDYwIC8gNjApO1xuICAgIGxldCBtaW51dGVzID0gTWF0aC5mbG9vcigoaW5zdGFuY2UuX3ZhbHVlIC0gKGhvdXJzICogNjAgKiA2MCkpIC8gNjApO1xuICAgIGxldCBzZWNvbmRzID0gTWF0aC5yb3VuZChpbnN0YW5jZS5fdmFsdWUgLSAoaG91cnMgKiA2MCAqIDYwKSAtIChtaW51dGVzICogNjApKTtcbiAgICByZXR1cm4gYCR7aG91cnN9OiR7KG1pbnV0ZXMgPCAxMCkgPyBcIjBcIiA6IFwiXCJ9JHttaW51dGVzfTokeyhzZWNvbmRzIDwgMTApID8gXCIwXCIgOiBcIlwifSR7c2Vjb25kc31gO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYSBwZXJjZW50YWdlIHVzaW5nIHRoZSBQUk9WSURFREZPUk1BVCxcbiAqIGFuZCB0aGUgU1RBVEUuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHBhcmFtIHt7fX0gcHJvdmlkZWRGb3JtYXQgLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHBhcmFtIG51bWJybyAtIHRoZSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdFBlcmNlbnRhZ2UoaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBzdGF0ZSwgbnVtYnJvKSB7XG4gICAgbGV0IHByZWZpeFN5bWJvbCA9IHByb3ZpZGVkRm9ybWF0LnByZWZpeFN5bWJvbDtcblxuICAgIGxldCBvdXRwdXQgPSBmb3JtYXROdW1iZXIoe1xuICAgICAgICBpbnN0YW5jZTogbnVtYnJvKGluc3RhbmNlLl92YWx1ZSAqIDEwMCksXG4gICAgICAgIHByb3ZpZGVkRm9ybWF0LFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgZGVmYXVsdHM6IHN0YXRlLmN1cnJlbnRQZXJjZW50YWdlRGVmYXVsdHMoKVxuICAgIH0pO1xuICAgIGxldCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIHN0YXRlLmN1cnJlbnRQZXJjZW50YWdlRGVmYXVsdHMoKSwgcHJvdmlkZWRGb3JtYXQpO1xuXG4gICAgaWYgKHByZWZpeFN5bWJvbCkge1xuICAgICAgICByZXR1cm4gYCUke29wdGlvbnMuc3BhY2VTZXBhcmF0ZWQgPyBcIiBcIiA6IFwiXCJ9JHtvdXRwdXR9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7b3V0cHV0fSR7b3B0aW9ucy5zcGFjZVNlcGFyYXRlZCA/IFwiIFwiIDogXCJcIn0lYDtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHByb3ZpZGVkIElOU1RBTkNFIGFzIGEgcGVyY2VudGFnZSB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0Q3VycmVuY3koaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBzdGF0ZSkge1xuICAgIGNvbnN0IGN1cnJlbnRDdXJyZW5jeSA9IHN0YXRlLmN1cnJlbnRDdXJyZW5jeSgpO1xuICAgIGxldCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIHN0YXRlLmN1cnJlbnRDdXJyZW5jeURlZmF1bHRzKCksIHByb3ZpZGVkRm9ybWF0KTtcbiAgICBsZXQgZGVjaW1hbFNlcGFyYXRvciA9IHVuZGVmaW5lZDtcbiAgICBsZXQgc3BhY2UgPSBcIlwiO1xuXG4gICAgaWYgKG9wdGlvbnMuc3BhY2VTZXBhcmF0ZWQpIHtcbiAgICAgICAgc3BhY2UgPSBcIiBcIjtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudEN1cnJlbmN5LnBvc2l0aW9uID09PSBcImluZml4XCIpIHtcbiAgICAgICAgZGVjaW1hbFNlcGFyYXRvciA9IHNwYWNlICsgY3VycmVudEN1cnJlbmN5LnN5bWJvbCArIHNwYWNlO1xuICAgIH1cblxuICAgIGxldCBvdXRwdXQgPSBmb3JtYXROdW1iZXIoe1xuICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgcHJvdmlkZWRGb3JtYXQsXG4gICAgICAgIHN0YXRlLFxuICAgICAgICBkZWNpbWFsU2VwYXJhdG9yLFxuICAgICAgICBkZWZhdWx0czogc3RhdGUuY3VycmVudEN1cnJlbmN5RGVmYXVsdHMoKVxuICAgIH0pO1xuXG4gICAgaWYgKGN1cnJlbnRDdXJyZW5jeS5wb3NpdGlvbiA9PT0gXCJwcmVmaXhcIikge1xuICAgICAgICBvdXRwdXQgPSBjdXJyZW50Q3VycmVuY3kuc3ltYm9sICsgc3BhY2UgKyBvdXRwdXQ7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRDdXJyZW5jeS5wb3NpdGlvbiA9PT0gXCJwb3N0Zml4XCIpIHtcbiAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgc3BhY2UgKyBjdXJyZW50Q3VycmVuY3kuc3ltYm9sO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgYXZlcmFnZSB2YWx1ZSBvdXQgb2YgVkFMVUUuXG4gKiBUaGUgb3RoZXIgcGFyYW1ldGVycyBhcmUgY29tcHV0YXRpb24gb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSB2YWx1ZSB0byBjb21wdXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZvcmNlQXZlcmFnZV0gLSBmb3JjZWQgdW5pdCB1c2VkIHRvIGNvbXB1dGVcbiAqIEBwYXJhbSB7e319IGFiYnJldmlhdGlvbnMgLSBwYXJ0IG9mIHRoZSBsYW5ndWFnZSBzcGVjaWZpY2F0aW9uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNwYWNlU2VwYXJhdGVkIC0gYHRydWVgIGlmIGEgc3BhY2UgbXVzdCBiZSBpbnNlcnRlZCBiZXR3ZWVuIHRoZSB2YWx1ZSBhbmQgdGhlIGFiYnJldmlhdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IFt0b3RhbExlbmd0aF0gLSB0b3RhbCBsZW5ndGggb2YgdGhlIG91dHB1dCBpbmNsdWRpbmcgdGhlIGNoYXJhY3RlcmlzdGljIGFuZCB0aGUgbWFudGlzc2FcbiAqIEByZXR1cm4ge3t2YWx1ZTogbnVtYmVyLCBhYmJyZXZpYXRpb246IHN0cmluZywgbWFudGlzc2FQcmVjaXNpb246IG51bWJlcn19XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVBdmVyYWdlKHt2YWx1ZSwgZm9yY2VBdmVyYWdlLCBhYmJyZXZpYXRpb25zLCBzcGFjZVNlcGFyYXRlZCA9IGZhbHNlLCB0b3RhbExlbmd0aCA9IDB9KSB7XG4gICAgbGV0IGFiYnJldmlhdGlvbiA9IFwiXCI7XG4gICAgbGV0IGFicyA9IE1hdGguYWJzKHZhbHVlKTtcbiAgICBsZXQgbWFudGlzc2FQcmVjaXNpb24gPSAtMTtcblxuICAgIGlmICgoYWJzID49IE1hdGgucG93KDEwLCAxMikgJiYgIWZvcmNlQXZlcmFnZSkgfHwgKGZvcmNlQXZlcmFnZSA9PT0gXCJ0cmlsbGlvblwiKSkge1xuICAgICAgICAvLyB0cmlsbGlvblxuICAgICAgICBhYmJyZXZpYXRpb24gPSBhYmJyZXZpYXRpb25zLnRyaWxsaW9uO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gTWF0aC5wb3coMTAsIDEyKTtcbiAgICB9IGVsc2UgaWYgKChhYnMgPCBNYXRoLnBvdygxMCwgMTIpICYmIGFicyA+PSBNYXRoLnBvdygxMCwgOSkgJiYgIWZvcmNlQXZlcmFnZSkgfHwgKGZvcmNlQXZlcmFnZSA9PT0gXCJiaWxsaW9uXCIpKSB7XG4gICAgICAgIC8vIGJpbGxpb25cbiAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9ucy5iaWxsaW9uO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gTWF0aC5wb3coMTAsIDkpO1xuICAgIH0gZWxzZSBpZiAoKGFicyA8IE1hdGgucG93KDEwLCA5KSAmJiBhYnMgPj0gTWF0aC5wb3coMTAsIDYpICYmICFmb3JjZUF2ZXJhZ2UpIHx8IChmb3JjZUF2ZXJhZ2UgPT09IFwibWlsbGlvblwiKSkge1xuICAgICAgICAvLyBtaWxsaW9uXG4gICAgICAgIGFiYnJldmlhdGlvbiA9IGFiYnJldmlhdGlvbnMubWlsbGlvbjtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAvIE1hdGgucG93KDEwLCA2KTtcbiAgICB9IGVsc2UgaWYgKChhYnMgPCBNYXRoLnBvdygxMCwgNikgJiYgYWJzID49IE1hdGgucG93KDEwLCAzKSAmJiAhZm9yY2VBdmVyYWdlKSB8fCAoZm9yY2VBdmVyYWdlID09PSBcInRob3VzYW5kXCIpKSB7XG4gICAgICAgIC8vIHRob3VzYW5kXG4gICAgICAgIGFiYnJldmlhdGlvbiA9IGFiYnJldmlhdGlvbnMudGhvdXNhbmQ7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgLyBNYXRoLnBvdygxMCwgMyk7XG4gICAgfVxuXG4gICAgbGV0IG9wdGlvbmFsU3BhY2UgPSBzcGFjZVNlcGFyYXRlZCA/IFwiIFwiIDogXCJcIjtcblxuICAgIGlmIChhYmJyZXZpYXRpb24pIHtcbiAgICAgICAgYWJicmV2aWF0aW9uID0gb3B0aW9uYWxTcGFjZSArIGFiYnJldmlhdGlvbjtcbiAgICB9XG5cbiAgICBpZiAodG90YWxMZW5ndGgpIHtcbiAgICAgICAgbGV0IGNoYXJhY3RlcmlzdGljID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMF07XG4gICAgICAgIG1hbnRpc3NhUHJlY2lzaW9uID0gTWF0aC5tYXgodG90YWxMZW5ndGggLSBjaGFyYWN0ZXJpc3RpYy5sZW5ndGgsIDApO1xuICAgIH1cblxuICAgIHJldHVybiB7dmFsdWUsIGFiYnJldmlhdGlvbiwgbWFudGlzc2FQcmVjaXNpb259O1xufVxuXG4vKipcbiAqIENvbXB1dGUgYW4gZXhwb25lbnRpYWwgZm9ybSBmb3IgVkFMVUUsIHRha2luZyBpbnRvIGFjY291bnQgQ0hBUkFDVEVSSVNUSUNcbiAqIGlmIHByb3ZpZGVkLlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gdmFsdWUgdG8gY29tcHV0ZVxuICogQHBhcmFtIHtudW1iZXJ9IFtjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvbl0gLSBvcHRpb25hbCBjaGFyYWN0ZXJpc3RpYyBsZW5ndGhcbiAqIEByZXR1cm4ge3t2YWx1ZTogbnVtYmVyLCBhYmJyZXZpYXRpb246IHN0cmluZ319XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVFeHBvbmVudGlhbCh7dmFsdWUsIGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uID0gMH0pIHtcbiAgICBsZXQgW251bWJlclN0cmluZywgZXhwb25lbnRpYWxdID0gdmFsdWUudG9FeHBvbmVudGlhbCgpLnNwbGl0KFwiZVwiKTtcbiAgICBsZXQgbnVtYmVyID0gK251bWJlclN0cmluZztcblxuICAgIGlmICghY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBudW1iZXIsXG4gICAgICAgICAgICBhYmJyZXZpYXRpb246IGBlJHtleHBvbmVudGlhbH1gXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbGV0IGNoYXJhY3RlcmlzdGljTGVuZ3RoID0gMTsgLy8gc2VlIGB0b0V4cG9uZW50aWFsYFxuXG4gICAgaWYgKGNoYXJhY3RlcmlzdGljTGVuZ3RoIDwgY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24pIHtcbiAgICAgICAgbnVtYmVyID0gbnVtYmVyICogTWF0aC5wb3coMTAsIGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uIC0gY2hhcmFjdGVyaXN0aWNMZW5ndGgpO1xuICAgICAgICBleHBvbmVudGlhbCA9ICtleHBvbmVudGlhbCAtIChjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvbiAtIGNoYXJhY3RlcmlzdGljTGVuZ3RoKTtcbiAgICAgICAgZXhwb25lbnRpYWwgPSBleHBvbmVudGlhbCA+PSAwID8gYCske2V4cG9uZW50aWFsfWAgOiBleHBvbmVudGlhbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogbnVtYmVyLFxuICAgICAgICBhYmJyZXZpYXRpb246IGBlJHtleHBvbmVudGlhbH1gXG4gICAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBzdHJpbmcgb2YgTlVNQkVSIHplcm8uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG51bWJlciAtIExlbmd0aCBvZiB0aGUgb3V0cHV0XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHplcm9lcyhudW1iZXIpIHtcbiAgICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcjsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCArPSBcIjBcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgVkFMVUUgd2l0aCBhIFBSRUNJU0lPTi1sb25nIG1hbnRpc3NhLlxuICogVGhpcyBtZXRob2QgaXMgZm9yIGxhcmdlL3NtYWxsIG51bWJlcnMgb25seSAoYS5rLmEuIGluY2x1ZGluZyBhIFwiZVwiKS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgdG8gcHJlY2lzZVxuICogQHBhcmFtIHtudW1iZXJ9IHByZWNpc2lvbiAtIGRlc2lyZWQgbGVuZ3RoIGZvciB0aGUgbWFudGlzc2FcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gdG9GaXhlZExhcmdlKHZhbHVlLCBwcmVjaXNpb24pIHtcbiAgICBsZXQgcmVzdWx0ID0gdmFsdWUudG9TdHJpbmcoKTtcblxuICAgIGxldCBbYmFzZSwgZXhwXSA9IHJlc3VsdC5zcGxpdChcImVcIik7XG5cbiAgICBsZXQgW2NoYXJhY3RlcmlzdGljLCBtYW50aXNzYSA9IFwiXCJdID0gYmFzZS5zcGxpdChcIi5cIik7XG5cbiAgICBpZiAoK2V4cCA+IDApIHtcbiAgICAgICAgcmVzdWx0ID0gY2hhcmFjdGVyaXN0aWMgKyBtYW50aXNzYSArIHplcm9lcyhleHAgLSBtYW50aXNzYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwcmVmaXggPSBcIi5cIjtcblxuICAgICAgICBpZiAoK2NoYXJhY3RlcmlzdGljIDwgMCkge1xuICAgICAgICAgICAgcHJlZml4ID0gYC0wJHtwcmVmaXh9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByZWZpeCA9IGAwJHtwcmVmaXh9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdWZmaXggPSAoemVyb2VzKC1leHAgLSAxKSArIE1hdGguYWJzKGNoYXJhY3RlcmlzdGljKSArIG1hbnRpc3NhKS5zdWJzdHIoMCwgcHJlY2lzaW9uKTtcbiAgICAgICAgaWYgKHN1ZmZpeC5sZW5ndGggPCBwcmVjaXNpb24pIHtcbiAgICAgICAgICAgIHN1ZmZpeCArPSB6ZXJvZXMocHJlY2lzaW9uIC0gc3VmZml4Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gcHJlZml4ICsgc3VmZml4O1xuICAgIH1cblxuICAgIGlmICgrZXhwID4gMCAmJiBwcmVjaXNpb24gPiAwKSB7XG4gICAgICAgIHJlc3VsdCArPSBgLiR7emVyb2VzKHByZWNpc2lvbil9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgVkFMVUUgd2l0aCBhIFBSRUNJU0lPTi1sb25nIG1hbnRpc3NhLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIG51bWJlciB0byBwcmVjaXNlXG4gKiBAcGFyYW0ge251bWJlcn0gcHJlY2lzaW9uIC0gZGVzaXJlZCBsZW5ndGggZm9yIHRoZSBtYW50aXNzYVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB0b0ZpeGVkKHZhbHVlLCBwcmVjaXNpb24pIHtcbiAgICBpZiAodmFsdWUudG9TdHJpbmcoKS5pbmRleE9mKFwiZVwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRvRml4ZWRMYXJnZSh2YWx1ZSwgcHJlY2lzaW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKE1hdGgucm91bmQoK2Ake3ZhbHVlfWUrJHtwcmVjaXNpb259YCkgLyAoTWF0aC5wb3coMTAsIHByZWNpc2lvbikpKS50b0ZpeGVkKHByZWNpc2lvbik7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IE9VVFBVVCB3aXRoIGEgbWFudGlzc2EgcHJlY2lvbnMgb2YgUFJFQ0lTSU9OLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgLSBvdXRwdXQgYmVpbmcgYnVpbGQgaW4gdGhlIHByb2Nlc3Mgb2YgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gbnVtYmVyIGJlaW5nIGN1cnJlbnRseSBmb3JtYXR0ZWRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9uYWxNYW50aXNzYSAtIGB0cnVlYCBpZiB0aGUgbWFudGlzc2EgaXMgb21pdHRlZCB3aGVuIGl0J3Mgb25seSB6ZXJvZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmVjaXNpb24gLSBkZXNpcmVkIHByZWNpc2lvbiBvZiB0aGUgbWFudGlzc2FcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gc2V0TWFudGlzc2FQcmVjaXNpb24ob3V0cHV0LCB2YWx1ZSwgb3B0aW9uYWxNYW50aXNzYSwgcHJlY2lzaW9uKSB7XG4gICAgaWYgKHByZWNpc2lvbiA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0ID0gdG9GaXhlZCh2YWx1ZSwgcHJlY2lzaW9uKTtcbiAgICBsZXQgW2N1cnJlbnRDaGFyYWN0ZXJpc3RpYywgY3VycmVudE1hbnRpc3NhID0gXCJcIl0gPSByZXN1bHQudG9TdHJpbmcoKS5zcGxpdChcIi5cIik7XG5cbiAgICBpZiAoY3VycmVudE1hbnRpc3NhLm1hdGNoKC9eMCskLykgJiYgb3B0aW9uYWxNYW50aXNzYSkge1xuICAgICAgICByZXR1cm4gY3VycmVudENoYXJhY3RlcmlzdGljO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgT1VUUFVUIHdpdGggYSBjaGFyYWN0ZXJpc3RpYyBwcmVjaW9ucyBvZiBQUkVDSVNJT04uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgYmVpbmcgY3VycmVudGx5IGZvcm1hdHRlZFxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25hbENoYXJhY3RlcmlzdGljIC0gYHRydWVgIGlmIHRoZSBjaGFyYWN0ZXJpc3RpYyBpcyBvbWl0dGVkIHdoZW4gaXQncyBvbmx5IHplcm9lc1xuICogQHBhcmFtIHtudW1iZXJ9IHByZWNpc2lvbiAtIGRlc2lyZWQgcHJlY2lzaW9uIG9mIHRoZSBjaGFyYWN0ZXJpc3RpY1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBzZXRDaGFyYWN0ZXJpc3RpY1ByZWNpc2lvbihvdXRwdXQsIHZhbHVlLCBvcHRpb25hbENoYXJhY3RlcmlzdGljLCBwcmVjaXNpb24pIHtcbiAgICBsZXQgcmVzdWx0ID0gb3V0cHV0O1xuICAgIGxldCBbY3VycmVudENoYXJhY3RlcmlzdGljLCBjdXJyZW50TWFudGlzc2FdID0gcmVzdWx0LnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpO1xuXG4gICAgaWYgKGN1cnJlbnRDaGFyYWN0ZXJpc3RpYy5tYXRjaCgvXi0/MCQvKSAmJiBvcHRpb25hbENoYXJhY3RlcmlzdGljKSB7XG4gICAgICAgIGlmICghY3VycmVudE1hbnRpc3NhKSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudENoYXJhY3RlcmlzdGljLnJlcGxhY2UoXCIwXCIsIFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGAke2N1cnJlbnRDaGFyYWN0ZXJpc3RpYy5yZXBsYWNlKFwiMFwiLCBcIlwiKX0uJHtjdXJyZW50TWFudGlzc2F9YDtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudENoYXJhY3RlcmlzdGljLmxlbmd0aCA8IHByZWNpc2lvbikge1xuICAgICAgICBsZXQgbWlzc2luZ1plcm9zID0gcHJlY2lzaW9uIC0gY3VycmVudENoYXJhY3RlcmlzdGljLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nWmVyb3M7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0ID0gYDAke3Jlc3VsdH1gO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC50b1N0cmluZygpO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgaW5kZXhlcyB3aGVyZSBhcmUgdGhlIGdyb3VwIHNlcGFyYXRpb25zIGFmdGVyIHNwbGl0dGluZ1xuICogYHRvdGFsTGVuZ3RoYCBpbiBncm91cCBvZiBgZ3JvdXBTaXplYCBzaXplLlxuICogSW1wb3J0YW50OiB3ZSBzdGFydCBncm91cGluZyBmcm9tIHRoZSByaWdodCBoYW5kIHNpZGUuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsTGVuZ3RoIC0gdG90YWwgbGVuZ3RoIG9mIHRoZSBjaGFyYWN0ZXJpc3RpYyB0byBzcGxpdFxuICogQHBhcmFtIHtudW1iZXJ9IGdyb3VwU2l6ZSAtIGxlbmd0aCBvZiBlYWNoIGdyb3VwXG4gKiBAcmV0dXJuIHtbbnVtYmVyXX1cbiAqL1xuZnVuY3Rpb24gaW5kZXhlc09mR3JvdXBTcGFjZXModG90YWxMZW5ndGgsIGdyb3VwU2l6ZSkge1xuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgZm9yIChsZXQgaSA9IHRvdGFsTGVuZ3RoOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGlmIChjb3VudGVyID09PSBncm91cFNpemUpIHtcbiAgICAgICAgICAgIHJlc3VsdC51bnNoaWZ0KGkpO1xuICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgY291bnRlcisrO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmVwbGFjZSB0aGUgZGVjaW1hbCBzZXBhcmF0b3Igd2l0aCBERUNJTUFMU0VQQVJBVE9SIGFuZCBpbnNlcnQgdGhvdXNhbmRcbiAqIHNlcGFyYXRvcnMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgYmVpbmcgY3VycmVudGx5IGZvcm1hdHRlZFxuICogQHBhcmFtIHtib29sZWFufSB0aG91c2FuZFNlcGFyYXRlZCAtIGB0cnVlYCBpZiB0aGUgY2hhcmFjdGVyaXN0aWMgbXVzdCBiZSBzZXBhcmF0ZWRcbiAqIEBwYXJhbSB7Z2xvYmFsU3RhdGV9IHN0YXRlIC0gc2hhcmVkIHN0YXRlIG9mIHRoZSBsaWJyYXJ5XG4gKiBAcGFyYW0ge3N0cmluZ30gZGVjaW1hbFNlcGFyYXRvciAtIHN0cmluZyB0byB1c2UgYXMgZGVjaW1hbCBzZXBhcmF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVwbGFjZURlbGltaXRlcnMob3V0cHV0LCB2YWx1ZSwgdGhvdXNhbmRTZXBhcmF0ZWQsIHN0YXRlLCBkZWNpbWFsU2VwYXJhdG9yKSB7XG4gICAgbGV0IGRlbGltaXRlcnMgPSBzdGF0ZS5jdXJyZW50RGVsaW1pdGVycygpO1xuICAgIGxldCB0aG91c2FuZFNlcGFyYXRvciA9IGRlbGltaXRlcnMudGhvdXNhbmRzO1xuICAgIGRlY2ltYWxTZXBhcmF0b3IgPSBkZWNpbWFsU2VwYXJhdG9yIHx8IGRlbGltaXRlcnMuZGVjaW1hbDtcbiAgICBsZXQgdGhvdXNhbmRzU2l6ZSA9IGRlbGltaXRlcnMudGhvdXNhbmRzU2l6ZSB8fCAzO1xuXG4gICAgbGV0IHJlc3VsdCA9IG91dHB1dC50b1N0cmluZygpO1xuICAgIGxldCBjaGFyYWN0ZXJpc3RpYyA9IHJlc3VsdC5zcGxpdChcIi5cIilbMF07XG4gICAgbGV0IG1hbnRpc3NhID0gcmVzdWx0LnNwbGl0KFwiLlwiKVsxXTtcblxuICAgIGlmICh0aG91c2FuZFNlcGFyYXRlZCkge1xuICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIG1pbnVzIHNpZ25cbiAgICAgICAgICAgIGNoYXJhY3RlcmlzdGljID0gY2hhcmFjdGVyaXN0aWMuc2xpY2UoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW5kZXhlc1RvSW5zZXJ0VGhvdXNhbmREZWxpbWl0ZXJzID0gaW5kZXhlc09mR3JvdXBTcGFjZXMoY2hhcmFjdGVyaXN0aWMubGVuZ3RoLCB0aG91c2FuZHNTaXplKTtcbiAgICAgICAgaW5kZXhlc1RvSW5zZXJ0VGhvdXNhbmREZWxpbWl0ZXJzLmZvckVhY2goKHBvc2l0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY2hhcmFjdGVyaXN0aWMgPSBjaGFyYWN0ZXJpc3RpYy5zbGljZSgwLCBwb3NpdGlvbiArIGluZGV4KSArIHRob3VzYW5kU2VwYXJhdG9yICsgY2hhcmFjdGVyaXN0aWMuc2xpY2UocG9zaXRpb24gKyBpbmRleCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIC8vIEFkZCBiYWNrIHRoZSBtaW51cyBzaWduXG4gICAgICAgICAgICBjaGFyYWN0ZXJpc3RpYyA9IGAtJHtjaGFyYWN0ZXJpc3RpY31gO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFtYW50aXNzYSkge1xuICAgICAgICByZXN1bHQgPSBjaGFyYWN0ZXJpc3RpYztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBjaGFyYWN0ZXJpc3RpYyArIGRlY2ltYWxTZXBhcmF0b3IgKyBtYW50aXNzYTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIHByb3ZpZGVkIEFCQlJFVklBVElPTiBhdCB0aGUgZW5kIG9mIE9VVFBVVC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gb3V0cHV0IC0gb3V0cHV0IGJlaW5nIGJ1aWxkIGluIHRoZSBwcm9jZXNzIG9mIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBhYmJyZXZpYXRpb24gLSBhYmJyZXZpYXRpb24gdG8gYXBwZW5kXG4gKiBAcmV0dXJuIHsqfVxuICovXG5mdW5jdGlvbiBpbnNlcnRBYmJyZXZpYXRpb24ob3V0cHV0LCBhYmJyZXZpYXRpb24pIHtcbiAgICByZXR1cm4gb3V0cHV0ICsgYWJicmV2aWF0aW9uO1xufVxuXG4vKipcbiAqIEluc2VydCB0aGUgcG9zaXRpdmUvbmVnYXRpdmUgc2lnbiBhY2NvcmRpbmcgdG8gdGhlIE5FR0FUSVZFIGZsYWcuXG4gKiBJZiB0aGUgdmFsdWUgaXMgbmVnYXRpdmUgYnV0IHN0aWxsIG91dHB1dCBhcyAwLCB0aGUgbmVnYXRpdmUgc2lnbiBpcyByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgLSBvdXRwdXQgYmVpbmcgYnVpbGQgaW4gdGhlIHByb2Nlc3Mgb2YgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gbnVtYmVyIGJlaW5nIGN1cnJlbnRseSBmb3JtYXR0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZWdhdGl2ZSAtIGZsYWcgZm9yIHRoZSBuZWdhdGl2ZSBmb3JtIChcInNpZ25cIiBvciBcInBhcmVudGhlc2lzXCIpXG4gKiBAcmV0dXJuIHsqfVxuICovXG5mdW5jdGlvbiBpbnNlcnRTaWduKG91dHB1dCwgdmFsdWUsIG5lZ2F0aXZlKSB7XG4gICAgaWYgKHZhbHVlID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgaWYgKCtvdXRwdXQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG91dHB1dC5yZXBsYWNlKFwiLVwiLCBcIlwiKTtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUgPiAwKSB7XG4gICAgICAgIHJldHVybiBgKyR7b3V0cHV0fWA7XG4gICAgfVxuXG4gICAgaWYgKG5lZ2F0aXZlID09PSBcInNpZ25cIikge1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIHJldHVybiBgKCR7b3V0cHV0LnJlcGxhY2UoXCItXCIsIFwiXCIpfSlgO1xufVxuXG4vKipcbiAqIEluc2VydCB0aGUgcHJvdmlkZWQgUFJFRklYIGF0IHRoZSBzdGFydCBvZiBPVVRQVVQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IC0gYWJicmV2aWF0aW9uIHRvIHByZXBlbmRcbiAqIEByZXR1cm4geyp9XG4gKi9cbmZ1bmN0aW9uIGluc2VydFByZWZpeChvdXRwdXQsIHByZWZpeCkge1xuICAgIHJldHVybiBwcmVmaXggKyBvdXRwdXQ7XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBwcm92aWRlZCBQT1NURklYIGF0IHRoZSBlbmQgb2YgT1VUUFVULlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgLSBvdXRwdXQgYmVpbmcgYnVpbGQgaW4gdGhlIHByb2Nlc3Mgb2YgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHBvc3RmaXggLSBhYmJyZXZpYXRpb24gdG8gYXBwZW5kXG4gKiBAcmV0dXJuIHsqfVxuICovXG5mdW5jdGlvbiBpbnNlcnRQb3N0Zml4KG91dHB1dCwgcG9zdGZpeCkge1xuICAgIHJldHVybiBvdXRwdXQgKyBwb3N0Zml4O1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYSBudW1iZXIgdXNpbmcgdGhlIFBST1ZJREVERk9STUFULFxuICogYW5kIHRoZSBTVEFURS5cbiAqIFRoaXMgaXMgdGhlIGtleSBtZXRob2Qgb2YgdGhlIGZyYW1ld29yayFcbiAqXG4gKiBAcGFyYW0ge051bWJyb30gaW5zdGFuY2UgLSBudW1icm8gaW5zdGFuY2UgdG8gZm9ybWF0XG4gKiBAcGFyYW0ge3t9fSBbcHJvdmlkZWRGb3JtYXRdIC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZWNpbWFsU2VwYXJhdG9yIC0gc3RyaW5nIHRvIHVzZSBhcyBkZWNpbWFsIHNlcGFyYXRvclxuICogQHBhcmFtIHt7fX0gZGVmYXVsdHMgLSBTZXQgb2YgZGVmYXVsdCB2YWx1ZXMgdXNlZCBmb3IgZm9ybWF0dGluZ1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXROdW1iZXIoe2luc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgc3RhdGUgPSBnbG9iYWxTdGF0ZSwgZGVjaW1hbFNlcGFyYXRvciwgZGVmYXVsdHMgPSBzdGF0ZS5jdXJyZW50RGVmYXVsdHMoKX0pIHtcbiAgICBsZXQgdmFsdWUgPSBpbnN0YW5jZS5fdmFsdWU7XG5cbiAgICBpZiAodmFsdWUgPT09IDAgJiYgc3RhdGUuaGFzWmVyb0Zvcm1hdCgpKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5nZXRaZXJvRm9ybWF0KCk7XG4gICAgfVxuXG4gICAgaWYgKCFpc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgZGVmYXVsdHMsIHByb3ZpZGVkRm9ybWF0KTtcblxuICAgIGxldCB0b3RhbExlbmd0aCA9IG9wdGlvbnMudG90YWxMZW5ndGg7XG4gICAgbGV0IGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uID0gdG90YWxMZW5ndGggPyAwIDogb3B0aW9ucy5jaGFyYWN0ZXJpc3RpYztcbiAgICBsZXQgb3B0aW9uYWxDaGFyYWN0ZXJpc3RpYyA9IG9wdGlvbnMub3B0aW9uYWxDaGFyYWN0ZXJpc3RpYztcbiAgICBsZXQgZm9yY2VBdmVyYWdlID0gb3B0aW9ucy5mb3JjZUF2ZXJhZ2U7XG4gICAgbGV0IGF2ZXJhZ2UgPSAhIXRvdGFsTGVuZ3RoIHx8ICEhZm9yY2VBdmVyYWdlIHx8IG9wdGlvbnMuYXZlcmFnZTtcblxuICAgIC8vIGRlZmF1bHQgd2hlbiBhdmVyYWdpbmcgaXMgdG8gY2hvcCBvZmYgZGVjaW1hbHNcbiAgICBsZXQgbWFudGlzc2FQcmVjaXNpb24gPSB0b3RhbExlbmd0aCA/IC0xIDogKGF2ZXJhZ2UgJiYgcHJvdmlkZWRGb3JtYXQubWFudGlzc2EgPT09IHVuZGVmaW5lZCA/IDAgOiBvcHRpb25zLm1hbnRpc3NhKTtcbiAgICBsZXQgb3B0aW9uYWxNYW50aXNzYSA9IHRvdGFsTGVuZ3RoID8gZmFsc2UgOiBvcHRpb25zLm9wdGlvbmFsTWFudGlzc2E7XG4gICAgbGV0IHRob3VzYW5kU2VwYXJhdGVkID0gb3B0aW9ucy50aG91c2FuZFNlcGFyYXRlZDtcbiAgICBsZXQgc3BhY2VTZXBhcmF0ZWQgPSBvcHRpb25zLnNwYWNlU2VwYXJhdGVkO1xuICAgIGxldCBuZWdhdGl2ZSA9IG9wdGlvbnMubmVnYXRpdmU7XG4gICAgbGV0IGZvcmNlU2lnbiA9IG9wdGlvbnMuZm9yY2VTaWduO1xuICAgIGxldCBleHBvbmVudGlhbCA9IG9wdGlvbnMuZXhwb25lbnRpYWw7XG5cbiAgICBsZXQgYWJicmV2aWF0aW9uID0gXCJcIjtcblxuICAgIGlmIChhdmVyYWdlKSB7XG4gICAgICAgIGxldCBkYXRhID0gY29tcHV0ZUF2ZXJhZ2Uoe1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBmb3JjZUF2ZXJhZ2UsXG4gICAgICAgICAgICBhYmJyZXZpYXRpb25zOiBzdGF0ZS5jdXJyZW50QWJicmV2aWF0aW9ucygpLFxuICAgICAgICAgICAgc3BhY2VTZXBhcmF0ZWQ6IHNwYWNlU2VwYXJhdGVkLFxuICAgICAgICAgICAgdG90YWxMZW5ndGhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFsdWUgPSBkYXRhLnZhbHVlO1xuICAgICAgICBhYmJyZXZpYXRpb24gKz0gZGF0YS5hYmJyZXZpYXRpb247XG5cbiAgICAgICAgaWYgKHRvdGFsTGVuZ3RoKSB7XG4gICAgICAgICAgICBtYW50aXNzYVByZWNpc2lvbiA9IGRhdGEubWFudGlzc2FQcmVjaXNpb247XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXhwb25lbnRpYWwpIHtcbiAgICAgICAgbGV0IGRhdGEgPSBjb21wdXRlRXhwb25lbnRpYWwoe1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvblxuICAgICAgICB9KTtcblxuICAgICAgICB2YWx1ZSA9IGRhdGEudmFsdWU7XG4gICAgICAgIGFiYnJldmlhdGlvbiA9IGRhdGEuYWJicmV2aWF0aW9uICsgYWJicmV2aWF0aW9uO1xuICAgIH1cblxuICAgIGxldCBvdXRwdXQgPSBzZXRNYW50aXNzYVByZWNpc2lvbih2YWx1ZS50b1N0cmluZygpLCB2YWx1ZSwgb3B0aW9uYWxNYW50aXNzYSwgbWFudGlzc2FQcmVjaXNpb24pO1xuICAgIG91dHB1dCA9IHNldENoYXJhY3RlcmlzdGljUHJlY2lzaW9uKG91dHB1dCwgdmFsdWUsIG9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMsIGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uKTtcbiAgICBvdXRwdXQgPSByZXBsYWNlRGVsaW1pdGVycyhvdXRwdXQsIHZhbHVlLCB0aG91c2FuZFNlcGFyYXRlZCwgc3RhdGUsIGRlY2ltYWxTZXBhcmF0b3IpO1xuXG4gICAgaWYgKGF2ZXJhZ2UgfHwgZXhwb25lbnRpYWwpIHtcbiAgICAgICAgb3V0cHV0ID0gaW5zZXJ0QWJicmV2aWF0aW9uKG91dHB1dCwgYWJicmV2aWF0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAoZm9yY2VTaWduIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICBvdXRwdXQgPSBpbnNlcnRTaWduKG91dHB1dCwgdmFsdWUsIG5lZ2F0aXZlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChudW1icm8pID0+ICh7XG4gICAgZm9ybWF0OiAoLi4uYXJncykgPT4gZm9ybWF0KC4uLmFyZ3MsIG51bWJybyksXG4gICAgZ2V0Qnl0ZVVuaXQ6ICguLi5hcmdzKSA9PiBnZXRCeXRlVW5pdCguLi5hcmdzLCBudW1icm8pLFxuICAgIGdldEJpbmFyeUJ5dGVVbml0OiAoLi4uYXJncykgPT4gZ2V0QmluYXJ5Qnl0ZVVuaXQoLi4uYXJncywgbnVtYnJvKSxcbiAgICBnZXREZWNpbWFsQnl0ZVVuaXQ6ICguLi5hcmdzKSA9PiBnZXREZWNpbWFsQnl0ZVVuaXQoLi4uYXJncywgbnVtYnJvKVxufSk7XG4iLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNyBCZW5qYW1pbiBWYW4gUnlzZWdoZW08YmVuamFtaW5AdmFucnlzZWdoZW0uY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKi9cblxuY29uc3QgZW5VUyA9IHJlcXVpcmUoXCIuL2VuLVVTXCIpO1xuY29uc3QgdmFsaWRhdGluZyA9IHJlcXVpcmUoXCIuL3ZhbGlkYXRpbmdcIik7XG5jb25zdCBwYXJzaW5nID0gcmVxdWlyZShcIi4vcGFyc2luZ1wiKTtcblxubGV0IHN0YXRlID0ge307XG5cbmxldCBjdXJyZW50TGFuZ3VhZ2VUYWcgPSB1bmRlZmluZWQ7XG5sZXQgbGFuZ3VhZ2VzID0ge307XG5cbmxldCB6ZXJvRm9ybWF0ID0gbnVsbDtcblxubGV0IGdsb2JhbERlZmF1bHRzID0ge307XG5cbmZ1bmN0aW9uIGNob29zZUxhbmd1YWdlKHRhZykgeyBjdXJyZW50TGFuZ3VhZ2VUYWcgPSB0YWc7IH1cblxuZnVuY3Rpb24gY3VycmVudExhbmd1YWdlRGF0YSgpIHsgcmV0dXJuIGxhbmd1YWdlc1tjdXJyZW50TGFuZ3VhZ2VUYWddOyB9XG5cbi8qKlxuICogUmV0dXJuIGFsbCB0aGUgcmVnaXN0ZXIgbGFuZ3VhZ2VzXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmxhbmd1YWdlcyA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIGxhbmd1YWdlcyk7XG5cbi8vXG4vLyBDdXJyZW50IGxhbmd1YWdlIGFjY2Vzc29yc1xuLy9cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgdGFnXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5zdGF0ZS5jdXJyZW50TGFuZ3VhZ2UgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VUYWc7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGxhbmd1YWdlIGN1cnJlbmN5IGRhdGFcbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudEN1cnJlbmN5ID0gKCkgPT4gY3VycmVudExhbmd1YWdlRGF0YSgpLmN1cnJlbmN5O1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBsYW5ndWFnZSBhYmJyZXZpYXRpb25zIGRhdGFcbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudEFiYnJldmlhdGlvbnMgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuYWJicmV2aWF0aW9ucztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgZGVsaW1pdGVycyBkYXRhXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnREZWxpbWl0ZXJzID0gKCkgPT4gY3VycmVudExhbmd1YWdlRGF0YSgpLmRlbGltaXRlcnM7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGxhbmd1YWdlIG9yZGluYWwgZnVuY3Rpb25cbiAqXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn1cbiAqL1xuc3RhdGUuY3VycmVudE9yZGluYWwgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkub3JkaW5hbDtcblxuLy9cbi8vIERlZmF1bHRzXG4vL1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBmb3JtYXR0aW5nIGRlZmF1bHRzLlxuICogVXNlIGZpcnN0IHVzZXMgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgZGVmYXVsdCwgdGhlbiBmYWxsYmFja3MgdG8gdGhlIGdsb2JhbGx5IGRlZmluZWQgZGVmYXVsdHMuXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnREZWZhdWx0cyA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5kZWZhdWx0cywgZ2xvYmFsRGVmYXVsdHMpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBvcmRpbmFsIHNwZWNpZmljIGZvcm1hdHRpbmcgZGVmYXVsdHMuXG4gKiBVc2UgZmlyc3QgdXNlcyB0aGUgY3VycmVudCBsYW5ndWFnZSBvcmRpbmFsIGRlZmF1bHQsIHRoZW4gZmFsbGJhY2tzIHRvIHRoZSByZWd1bGFyIGRlZmF1bHRzLlxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50T3JkaW5hbERlZmF1bHRzID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuY3VycmVudERlZmF1bHRzKCksIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5vcmRpbmFsRGVmYXVsdHMpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBieXRlIHNwZWNpZmljIGZvcm1hdHRpbmcgZGVmYXVsdHMuXG4gKiBVc2UgZmlyc3QgdXNlcyB0aGUgY3VycmVudCBsYW5ndWFnZSBieXRlIGRlZmF1bHQsIHRoZW4gZmFsbGJhY2tzIHRvIHRoZSByZWd1bGFyIGRlZmF1bHRzLlxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50Qnl0ZURlZmF1bHRzID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuY3VycmVudERlZmF1bHRzKCksIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5ieXRlRGVmYXVsdHMpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBwZXJjZW50YWdlIHNwZWNpZmljIGZvcm1hdHRpbmcgZGVmYXVsdHMuXG4gKiBVc2UgZmlyc3QgdXNlcyB0aGUgY3VycmVudCBsYW5ndWFnZSBwZXJjZW50YWdlIGRlZmF1bHQsIHRoZW4gZmFsbGJhY2tzIHRvIHRoZSByZWd1bGFyIGRlZmF1bHRzLlxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50UGVyY2VudGFnZURlZmF1bHRzID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuY3VycmVudERlZmF1bHRzKCksIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5wZXJjZW50YWdlRGVmYXVsdHMpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBjdXJyZW5jeSBzcGVjaWZpYyBmb3JtYXR0aW5nIGRlZmF1bHRzLlxuICogVXNlIGZpcnN0IHVzZXMgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgY3VycmVuY3kgZGVmYXVsdCwgdGhlbiBmYWxsYmFja3MgdG8gdGhlIHJlZ3VsYXIgZGVmYXVsdHMuXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnRDdXJyZW5jeURlZmF1bHRzID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuY3VycmVudERlZmF1bHRzKCksIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5jdXJyZW5jeURlZmF1bHRzKTtcblxuLyoqXG4gKiBTZXQgdGhlIGdsb2JhbCBmb3JtYXR0aW5nIGRlZmF1bHRzLlxuICpcbiAqIEBwYXJhbSB7e318c3RyaW5nfSBmb3JtYXQgLSBmb3JtYXR0aW5nIG9wdGlvbnMgdG8gdXNlIGFzIGRlZmF1bHRzXG4gKi9cbnN0YXRlLnNldERlZmF1bHRzID0gKGZvcm1hdCkgPT4ge1xuICAgIGZvcm1hdCA9IHBhcnNpbmcucGFyc2VGb3JtYXQoZm9ybWF0KTtcbiAgICBpZiAodmFsaWRhdGluZy52YWxpZGF0ZUZvcm1hdChmb3JtYXQpKSB7XG4gICAgICAgIGdsb2JhbERlZmF1bHRzID0gZm9ybWF0O1xuICAgIH1cbn07XG5cbi8vXG4vLyBaZXJvIGZvcm1hdFxuLy9cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGZvcm1hdCBzdHJpbmcgZm9yIDAuXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5zdGF0ZS5nZXRaZXJvRm9ybWF0ID0gKCkgPT4gemVyb0Zvcm1hdDtcblxuLyoqXG4gKiBTZXQgYSBTVFJJTkcgdG8gb3V0cHV0IHdoZW4gdGhlIHZhbHVlIGlzIDAuXG4gKlxuICogQHBhcmFtIHt7fXxzdHJpbmd9IHN0cmluZyAtIHN0cmluZyB0byBzZXRcbiAqL1xuc3RhdGUuc2V0WmVyb0Zvcm1hdCA9IChzdHJpbmcpID0+IHplcm9Gb3JtYXQgPSB0eXBlb2Yoc3RyaW5nKSA9PT0gXCJzdHJpbmdcIiA/IHN0cmluZyA6IG51bGw7XG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgYSBmb3JtYXQgZm9yIDAgaGFzIGJlZW4gc2V0IGFscmVhZHkuXG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuc3RhdGUuaGFzWmVyb0Zvcm1hdCA9ICgpID0+IHplcm9Gb3JtYXQgIT09IG51bGw7XG5cbi8vXG4vLyBHZXR0ZXJzL1NldHRlcnNcbi8vXG5cbi8qKlxuICogUmV0dXJuIHRoZSBsYW5ndWFnZSBkYXRhIGZvciB0aGUgcHJvdmlkZWQgVEFHLlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGxhbmd1YWdlIGRhdGEgaWYgbm8gdGFnIGlzIHByb3ZpZGVkLlxuICpcbiAqIFRocm93IGFuIGVycm9yIGlmIHRoZSB0YWcgZG9lc24ndCBtYXRjaCBhbnkgcmVnaXN0ZXJlZCBsYW5ndWFnZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW3RhZ10gLSBsYW5ndWFnZSB0YWcgb2YgYSByZWdpc3RlcmVkIGxhbmd1YWdlXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUubGFuZ3VhZ2VEYXRhID0gKHRhZykgPT4ge1xuICAgIGlmICh0YWcpIHtcbiAgICAgICAgaWYgKGxhbmd1YWdlc1t0YWddKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFuZ3VhZ2VzW3RhZ107XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHRhZyBcIiR7dGFnfVwiYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN1cnJlbnRMYW5ndWFnZURhdGEoKTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgdGhlIHByb3ZpZGVkIERBVEEgYXMgYSBsYW5ndWFnZSBpZiBhbmQgb25seSBpZiB0aGUgZGF0YSBpcyB2YWxpZC5cbiAqIElmIHRoZSBkYXRhIGlzIG5vdCB2YWxpZCwgYW4gZXJyb3IgaXMgdGhyb3duLlxuICpcbiAqIFdoZW4gVVNFTEFOR1VBR0UgaXMgdHJ1ZSwgdGhlIHJlZ2lzdGVyZWQgbGFuZ3VhZ2UgaXMgdGhlbiB1c2VkLlxuICpcbiAqIEBwYXJhbSB7e319IGRhdGEgLSBsYW5ndWFnZSBkYXRhIHRvIHJlZ2lzdGVyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFt1c2VMYW5ndWFnZV0gLSBgdHJ1ZWAgaWYgdGhlIHByb3ZpZGVkIGRhdGEgc2hvdWxkIGJlY29tZSB0aGUgY3VycmVudCBsYW5ndWFnZVxuICovXG5zdGF0ZS5yZWdpc3Rlckxhbmd1YWdlID0gKGRhdGEsIHVzZUxhbmd1YWdlID0gZmFsc2UpID0+IHtcbiAgICBpZiAoIXZhbGlkYXRpbmcudmFsaWRhdGVMYW5ndWFnZShkYXRhKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGxhbmd1YWdlIGRhdGFcIik7XG4gICAgfVxuXG4gICAgbGFuZ3VhZ2VzW2RhdGEubGFuZ3VhZ2VUYWddID0gZGF0YTtcblxuICAgIGlmICh1c2VMYW5ndWFnZSkge1xuICAgICAgICBjaG9vc2VMYW5ndWFnZShkYXRhLmxhbmd1YWdlVGFnKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY3VycmVudCBsYW5ndWFnZSBhY2NvcmRpbmcgdG8gVEFHLlxuICogSWYgVEFHIGRvZXNuJ3QgbWF0Y2ggYSByZWdpc3RlcmVkIGxhbmd1YWdlLCBhbm90aGVyIGxhbmd1YWdlIG1hdGNoaW5nXG4gKiB0aGUgXCJsYW5ndWFnZVwiIHBhcnQgb2YgdGhlIHRhZyAoYWNjb3JkaW5nIHRvIEJDUDQ3OiBodHRwczovL3Rvb2xzLmlldGYub3JnL3JmYy9iY3AvYmNwNDcudHh0KS5cbiAqIElmIG5vbmUsIHRoZSBGQUxMQkFDS1RBRyBpcyB1c2VkLiBJZiB0aGUgRkFMTEJBQ0tUQUcgZG9lc24ndCBtYXRjaCBhIHJlZ2lzdGVyIGxhbmd1YWdlLFxuICogYGVuLVVTYCBpcyBmaW5hbGx5IHVzZWQuXG4gKlxuICogQHBhcmFtIHRhZ1xuICogQHBhcmFtIGZhbGxiYWNrVGFnXG4gKi9cbnN0YXRlLnNldExhbmd1YWdlID0gKHRhZywgZmFsbGJhY2tUYWcgPSBlblVTLmxhbmd1YWdlVGFnKSA9PiB7XG4gICAgaWYgKCFsYW5ndWFnZXNbdGFnXSkge1xuICAgICAgICBsZXQgc3VmZml4ID0gdGFnLnNwbGl0KFwiLVwiKVswXTtcblxuICAgICAgICBsZXQgbWF0Y2hpbmdMYW5ndWFnZVRhZyA9IE9iamVjdC5rZXlzKGxhbmd1YWdlcykuZmluZChlYWNoID0+IHtcbiAgICAgICAgICAgIHJldHVybiBlYWNoLnNwbGl0KFwiLVwiKVswXSA9PT0gc3VmZml4O1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIWxhbmd1YWdlc1ttYXRjaGluZ0xhbmd1YWdlVGFnXSkge1xuICAgICAgICAgICAgY2hvb3NlTGFuZ3VhZ2UoZmFsbGJhY2tUYWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hvb3NlTGFuZ3VhZ2UobWF0Y2hpbmdMYW5ndWFnZVRhZyk7XG4gICAgfVxuXG4gICAgY2hvb3NlTGFuZ3VhZ2UodGFnKTtcbn07XG5cbnN0YXRlLnJlZ2lzdGVyTGFuZ3VhZ2UoZW5VUyk7XG5jdXJyZW50TGFuZ3VhZ2VUYWcgPSBlblVTLmxhbmd1YWdlVGFnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXRlO1xuIiwiLyohXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQmVuamFtaW4gVmFuIFJ5c2VnaGVtPGJlbmphbWluQHZhbnJ5c2VnaGVtLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG5cbi8qKlxuICogTG9hZCBsYW5ndWFnZXMgbWF0Y2hpbmcgVEFHUy4gU2lsZW50bHkgcGFzcyBvdmVyIHRoZSBmYWlsaW5nIGxvYWQuXG4gKlxuICogV2UgYXNzdW1lIGhlcmUgdGhhdCB3ZSBhcmUgaW4gYSBub2RlIGVudmlyb25tZW50LCBzbyB3ZSBkb24ndCBjaGVjayBmb3IgaXQuXG4gKiBAcGFyYW0ge1tTdHJpbmddfSB0YWdzIC0gbGlzdCBvZiB0YWdzIHRvIGxvYWRcbiAqIEBwYXJhbSB7TnVtYnJvfSBudW1icm8gLSB0aGUgbnVtYnJvIHNpbmdsZXRvblxuICovXG5mdW5jdGlvbiBsb2FkTGFuZ3VhZ2VzSW5Ob2RlKHRhZ3MsIG51bWJybykge1xuICAgIHRhZ3MuZm9yRWFjaCgodGFnKSA9PiB7XG4gICAgICAgIGxldCBkYXRhID0gdW5kZWZpbmVkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGF0YSA9IHJlcXVpcmUoYC4uL2xhbmd1YWdlcy8ke3RhZ31gKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVW5hYmxlIHRvIGxvYWQgXCIke3RhZ31cIi4gTm8gbWF0Y2hpbmcgbGFuZ3VhZ2UgZmlsZSBmb3VuZC5gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgbnVtYnJvLnJlZ2lzdGVyTGFuZ3VhZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAobnVtYnJvKSA9PiAoe1xuICAgIGxvYWRMYW5ndWFnZXNJbk5vZGU6ICh0YWdzKSA9PiBsb2FkTGFuZ3VhZ2VzSW5Ob2RlKHRhZ3MsIG51bWJybylcbn0pO1xuIiwiLyohXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQmVuamFtaW4gVmFuIFJ5c2VnaGVtPGJlbmphbWluQHZhbnJ5c2VnaGVtLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG5cbi8vIFRvZG86IGFkZCBCaWdOdW1iZXIgc3VwcG9ydCAoaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnbnVtYmVyLmpzLylcblxuZnVuY3Rpb24gbXVsdGlwbGllcih4KSB7XG4gICAgbGV0IHBhcnRzID0geC50b1N0cmluZygpLnNwbGl0KFwiLlwiKTtcbiAgICBsZXQgbWFudGlzc2EgPSBwYXJ0c1sxXTtcblxuICAgIGlmICghbWFudGlzc2EpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGgucG93KDEwLCBtYW50aXNzYS5sZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBjb3JyZWN0aW9uRmFjdG9yKC4uLmFyZ3MpIHtcbiAgICBsZXQgc21hbGxlciA9IGFyZ3MucmVkdWNlKChwcmV2LCBuZXh0KSA9PiB7XG4gICAgICAgIGxldCBtcCA9IG11bHRpcGxpZXIocHJldik7XG4gICAgICAgIGxldCBtbiA9IG11bHRpcGxpZXIobmV4dCk7XG4gICAgICAgIHJldHVybiBtcCA+IG1uID8gcHJldiA6IG5leHQ7XG4gICAgfSwgLUluZmluaXR5KTtcblxuICAgIHJldHVybiBtdWx0aXBsaWVyKHNtYWxsZXIpO1xufVxuXG5mdW5jdGlvbiBhZGQobiwgb3RoZXIsIG51bWJybykge1xuICAgIGxldCB2YWx1ZSA9IG90aGVyO1xuXG4gICAgaWYgKG51bWJyby5pc051bWJybyhvdGhlcikpIHtcbiAgICAgICAgdmFsdWUgPSBvdGhlci5fdmFsdWU7XG4gICAgfVxuXG4gICAgbGV0IGZhY3RvciA9IGNvcnJlY3Rpb25GYWN0b3Iobi5fdmFsdWUsIHZhbHVlKTtcblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGFjYywgbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBhY2MgKyBmYWN0b3IgKiBudW1iZXI7XG4gICAgfVxuXG4gICAgbi5fdmFsdWUgPSBbbi5fdmFsdWUsIHZhbHVlXS5yZWR1Y2UoY2FsbGJhY2ssIDApIC8gZmFjdG9yO1xuICAgIHJldHVybiBuO1xufVxuXG5mdW5jdGlvbiBzdWJ0cmFjdChuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IHZhbHVlID0gb3RoZXI7XG5cbiAgICBpZiAobnVtYnJvLmlzTnVtYnJvKG90aGVyKSkge1xuICAgICAgICB2YWx1ZSA9IG90aGVyLl92YWx1ZTtcbiAgICB9XG5cbiAgICBsZXQgZmFjdG9yID0gY29ycmVjdGlvbkZhY3RvcihuLl92YWx1ZSwgdmFsdWUpO1xuXG4gICAgZnVuY3Rpb24gY2FsbGJhY2soYWNjLCBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGFjYyAtIGZhY3RvciAqIG51bWJlcjtcbiAgICB9XG5cbiAgICBuLl92YWx1ZSA9IFt2YWx1ZV0ucmVkdWNlKGNhbGxiYWNrLCBuLl92YWx1ZSAqIGZhY3RvcikgLyBmYWN0b3I7XG4gICAgcmV0dXJuIG47XG59XG5cbmZ1bmN0aW9uIG11bHRpcGx5KG4sIG90aGVyLCBudW1icm8pIHtcbiAgICBsZXQgdmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIHZhbHVlID0gb3RoZXIuX3ZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGFjY3VtLCBjdXJyKSB7XG4gICAgICAgIGxldCBmYWN0b3IgPSBjb3JyZWN0aW9uRmFjdG9yKGFjY3VtLCBjdXJyKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGFjY3VtICogZmFjdG9yO1xuICAgICAgICByZXN1bHQgKj0gY3VyciAqIGZhY3RvcjtcbiAgICAgICAgcmVzdWx0IC89IGZhY3RvciAqIGZhY3RvcjtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIG4uX3ZhbHVlID0gW24uX3ZhbHVlLCB2YWx1ZV0ucmVkdWNlKGNhbGxiYWNrLCAxKTtcbiAgICByZXR1cm4gbjtcbn1cblxuZnVuY3Rpb24gZGl2aWRlKG4sIG90aGVyLCBudW1icm8pIHtcbiAgICBsZXQgdmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIHZhbHVlID0gb3RoZXIuX3ZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGFjY3VtLCBjdXJyKSB7XG4gICAgICAgIGxldCBmYWN0b3IgPSBjb3JyZWN0aW9uRmFjdG9yKGFjY3VtLCBjdXJyKTtcbiAgICAgICAgcmV0dXJuIChhY2N1bSAqIGZhY3RvcikgLyAoY3VyciAqIGZhY3Rvcik7XG4gICAgfVxuXG4gICAgbi5fdmFsdWUgPSBbbi5fdmFsdWUsIHZhbHVlXS5yZWR1Y2UoY2FsbGJhY2spO1xuICAgIHJldHVybiBuO1xufVxuXG5mdW5jdGlvbiBzZXQgKG4sIG90aGVyLCBudW1icm8pIHtcbiAgICBsZXQgdmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIHZhbHVlID0gb3RoZXIuX3ZhbHVlO1xuICAgIH1cblxuICAgIG4uX3ZhbHVlID0gdmFsdWU7XG4gICAgcmV0dXJuIG47XG59XG5cbmZ1bmN0aW9uIGRpZmZlcmVuY2Uobiwgb3RoZXIsIG51bWJybykge1xuICAgIGxldCBjbG9uZSA9IG51bWJybyhuLl92YWx1ZSk7XG4gICAgc3VidHJhY3QoY2xvbmUsIG90aGVyLCBudW1icm8pO1xuXG4gICAgcmV0dXJuIE1hdGguYWJzKGNsb25lLl92YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbnVtYnJvID0+ICh7XG4gICAgYWRkOiAobiwgb3RoZXIpID0+IGFkZChuLCBvdGhlciwgbnVtYnJvKSxcbiAgICBzdWJ0cmFjdDogKG4sIG90aGVyKSA9PiBzdWJ0cmFjdChuLCBvdGhlciwgbnVtYnJvKSxcbiAgICBtdWx0aXBseTogKG4sIG90aGVyKSA9PiBtdWx0aXBseShuLCBvdGhlciwgbnVtYnJvKSxcbiAgICBkaXZpZGU6IChuLCBvdGhlcikgPT4gZGl2aWRlKG4sIG90aGVyLCBudW1icm8pLFxuICAgIHNldDogKG4sIG90aGVyKSA9PiBzZXQobiwgb3RoZXIsIG51bWJybyksXG4gICAgZGlmZmVyZW5jZTogKG4sIG90aGVyKSA9PiBkaWZmZXJlbmNlKG4sIG90aGVyLCBudW1icm8pXG59KTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBWRVJTSU9OID0gXCIyLjAuMFwiO1xuXG4vL1xuLy8gQ29uc3RydWN0b3Jcbi8vXG5cbmZ1bmN0aW9uIE51bWJybyhudW1iZXIpIHtcbiAgICB0aGlzLl92YWx1ZSA9IG51bWJlcjtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplSW5wdXQoaW5wdXQpIHtcbiAgICBsZXQgcmVzdWx0ID0gaW5wdXQ7XG4gICAgaWYgKG51bWJyby5pc051bWJybyhpbnB1dCkpIHtcbiAgICAgICAgcmVzdWx0ID0gaW5wdXQuX3ZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJlc3VsdCA9IG51bWJyby51bmZvcm1hdChpbnB1dCk7XG4gICAgfSBlbHNlIGlmIChpc05hTihpbnB1dCkpIHtcbiAgICAgICAgcmVzdWx0ID0gTmFOO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG51bWJybyhpbnB1dCkge1xuICAgIHJldHVybiBuZXcgTnVtYnJvKG5vcm1hbGl6ZUlucHV0KGlucHV0KSk7XG59XG5cbm51bWJyby52ZXJzaW9uID0gVkVSU0lPTjtcblxubnVtYnJvLmlzTnVtYnJvID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIE51bWJybztcbn07XG5cbmNvbnN0IGdsb2JhbFN0YXRlID0gcmVxdWlyZShcIi4vZ2xvYmFsU3RhdGVcIik7XG5jb25zdCB2YWxpZGF0b3IgPSByZXF1aXJlKFwiLi92YWxpZGF0aW5nXCIpO1xuY29uc3QgbG9hZGVyID0gcmVxdWlyZShcIi4vbG9hZGluZ1wiKShudW1icm8pO1xuY29uc3QgdW5mb3JtYXR0ZXIgPSByZXF1aXJlKFwiLi91bmZvcm1hdHRpbmdcIik7XG5sZXQgZm9ybWF0dGVyID0gcmVxdWlyZShcIi4vZm9ybWF0dGluZ1wiKShudW1icm8pO1xubGV0IG1hbmlwdWxhdGUgPSByZXF1aXJlKFwiLi9tYW5pcHVsYXRpbmdcIikobnVtYnJvKTtcblxuTnVtYnJvLnByb3RvdHlwZSA9IHtcbiAgICBjbG9uZTogZnVuY3Rpb24oKSB7IHJldHVybiBudW1icm8odGhpcy5fdmFsdWUpOyB9LFxuICAgIGZvcm1hdDogZnVuY3Rpb24oZm9ybWF0ID0ge30pIHsgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQodGhpcywgZm9ybWF0KTsgfSxcbiAgICBmb3JtYXRDdXJyZW5jeTogZnVuY3Rpb24oZm9ybWF0ID0ge30pIHtcbiAgICAgICAgZm9ybWF0Lm91dHB1dCA9IFwiY3VycmVuY3lcIjtcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQodGhpcywgZm9ybWF0KTtcbiAgICB9LFxuICAgIGZvcm1hdFRpbWU6IGZ1bmN0aW9uKGZvcm1hdCA9IHt9KSB7XG4gICAgICAgIGZvcm1hdC5vdXRwdXQgPSBcInRpbWVcIjtcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQodGhpcywgZm9ybWF0KTtcbiAgICB9LFxuICAgIGJpbmFyeUJ5dGVVbml0czogZnVuY3Rpb24oKSB7IHJldHVybiBmb3JtYXR0ZXIuZ2V0QmluYXJ5Qnl0ZVVuaXQodGhpcyk7fSxcbiAgICBkZWNpbWFsQnl0ZVVuaXRzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZvcm1hdHRlci5nZXREZWNpbWFsQnl0ZVVuaXQodGhpcyk7fSxcbiAgICBieXRlVW5pdHM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZm9ybWF0dGVyLmdldEJ5dGVVbml0KHRoaXMpO30sXG4gICAgZGlmZmVyZW5jZTogZnVuY3Rpb24ob3RoZXIpIHsgcmV0dXJuIG1hbmlwdWxhdGUuZGlmZmVyZW5jZSh0aGlzLCBvdGhlcik7IH0sXG4gICAgYWRkOiBmdW5jdGlvbihvdGhlcikgeyByZXR1cm4gbWFuaXB1bGF0ZS5hZGQodGhpcywgb3RoZXIpOyB9LFxuICAgIHN1YnRyYWN0OiBmdW5jdGlvbihvdGhlcikgeyByZXR1cm4gbWFuaXB1bGF0ZS5zdWJ0cmFjdCh0aGlzLCBvdGhlcik7IH0sXG4gICAgbXVsdGlwbHk6IGZ1bmN0aW9uKG90aGVyKSB7IHJldHVybiBtYW5pcHVsYXRlLm11bHRpcGx5KHRoaXMsIG90aGVyKTsgfSxcbiAgICBkaXZpZGU6IGZ1bmN0aW9uKG90aGVyKSB7IHJldHVybiBtYW5pcHVsYXRlLmRpdmlkZSh0aGlzLCBvdGhlcik7IH0sXG4gICAgc2V0OiBmdW5jdGlvbihpbnB1dCkgeyByZXR1cm4gbWFuaXB1bGF0ZS5zZXQodGhpcywgbm9ybWFsaXplSW5wdXQoaW5wdXQpKTsgfSxcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl92YWx1ZTsgfSxcbiAgICB2YWx1ZU9mOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG59O1xuXG4vL1xuLy8gYG51bWJyb2Agc3RhdGljIG1ldGhvZHNcbi8vXG5cbm51bWJyby5sYW5ndWFnZSA9IGdsb2JhbFN0YXRlLmN1cnJlbnRMYW5ndWFnZTtcbm51bWJyby5yZWdpc3Rlckxhbmd1YWdlID0gZ2xvYmFsU3RhdGUucmVnaXN0ZXJMYW5ndWFnZTtcbm51bWJyby5zZXRMYW5ndWFnZSA9IGdsb2JhbFN0YXRlLnNldExhbmd1YWdlO1xubnVtYnJvLmxhbmd1YWdlcyA9IGdsb2JhbFN0YXRlLmxhbmd1YWdlcztcbm51bWJyby5sYW5ndWFnZURhdGEgPSBnbG9iYWxTdGF0ZS5sYW5ndWFnZURhdGE7XG5udW1icm8uemVyb0Zvcm1hdCA9IGdsb2JhbFN0YXRlLnNldFplcm9Gb3JtYXQ7XG5udW1icm8uZGVmYXVsdEZvcm1hdCA9IGdsb2JhbFN0YXRlLmN1cnJlbnREZWZhdWx0cztcbm51bWJyby5zZXREZWZhdWx0cyA9IGdsb2JhbFN0YXRlLnNldERlZmF1bHRzO1xubnVtYnJvLmRlZmF1bHRDdXJyZW5jeUZvcm1hdCA9IGdsb2JhbFN0YXRlLmN1cnJlbnRDdXJyZW5jeURlZmF1bHRzO1xubnVtYnJvLnZhbGlkYXRlID0gdmFsaWRhdG9yLnZhbGlkYXRlO1xubnVtYnJvLmxvYWRMYW5ndWFnZXNJbk5vZGUgPSBsb2FkZXIubG9hZExhbmd1YWdlc0luTm9kZTtcbm51bWJyby51bmZvcm1hdCA9IHVuZm9ybWF0dGVyLnVuZm9ybWF0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51bWJybztcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5mdW5jdGlvbiBwYXJzZVByZWZpeChzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBtYXRjaCA9IHN0cmluZy5tYXRjaCgvXnsoW159XSopfS8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgICByZXN1bHQucHJlZml4ID0gbWF0Y2hbMV07XG4gICAgICAgIHJldHVybiBzdHJpbmcuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBwYXJzZVBvc3RmaXgoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBsZXQgbWF0Y2ggPSBzdHJpbmcubWF0Y2goL3soW159XSopfSQvKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgcmVzdWx0LnBvc3RmaXggPSBtYXRjaFsxXTtcblxuICAgICAgICByZXR1cm4gc3RyaW5nLnNsaWNlKDAsIC1tYXRjaFswXS5sZW5ndGgpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIHBhcnNlT3V0cHV0KHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiJFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwiY3VycmVuY3lcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIiVcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5vdXRwdXQgPSBcInBlcmNlbnRcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcImJkXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJieXRlXCI7XG4gICAgICAgIHJlc3VsdC5iYXNlID0gXCJnZW5lcmFsXCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCJiXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJieXRlXCI7XG4gICAgICAgIHJlc3VsdC5iYXNlID0gXCJiaW5hcnlcIjtcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiZFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwiYnl0ZVwiO1xuICAgICAgICByZXN1bHQuYmFzZSA9IFwiZGVjaW1hbFwiO1xuICAgICAgICByZXR1cm47XG5cbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCI6XCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJ0aW1lXCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCJvXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJvcmRpbmFsXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZVRob3VzYW5kU2VwYXJhdGVkKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiLFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LnRob3VzYW5kU2VwYXJhdGVkID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhY2VTZXBhcmF0ZWQoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCIgXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQuc3BhY2VTZXBhcmF0ZWQgPSB0cnVlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUb3RhbExlbmd0aChzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBtYXRjaCA9IHN0cmluZy5tYXRjaCgvWzEtOV0rWzAtOV0qLyk7XG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgcmVzdWx0LnRvdGFsTGVuZ3RoID0gK21hdGNoWzBdO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VDaGFyYWN0ZXJpc3RpYyhzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBjaGFyYWN0ZXJpc3RpYyA9IHN0cmluZy5zcGxpdChcIi5cIilbMF07XG4gICAgbGV0IG1hdGNoID0gY2hhcmFjdGVyaXN0aWMubWF0Y2goLzArLyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJlc3VsdC5jaGFyYWN0ZXJpc3RpYyA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWFudGlzc2Eoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBsZXQgbWFudGlzc2EgPSBzdHJpbmcuc3BsaXQoXCIuXCIpWzFdO1xuICAgIGlmIChtYW50aXNzYSkge1xuICAgICAgICBsZXQgbWF0Y2ggPSBtYW50aXNzYS5tYXRjaCgvMCsvKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICByZXN1bHQubWFudGlzc2EgPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXZlcmFnZShzdHJpbmcsIHJlc3VsdCkge1xuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcImFcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5hdmVyYWdlID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRm9yY2VBdmVyYWdlKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiS1wiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LmZvcmNlQXZlcmFnZSA9IFwidGhvdXNhbmRcIjtcbiAgICB9IGVsc2UgaWYgKHN0cmluZy5pbmRleE9mKFwiTVwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LmZvcmNlQXZlcmFnZSA9IFwibWlsbGlvblwiO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nLmluZGV4T2YoXCJCXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQuZm9yY2VBdmVyYWdlID0gXCJiaWxsaW9uXCI7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcuaW5kZXhPZihcIlRcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5mb3JjZUF2ZXJhZ2UgPSBcInRyaWxsaW9uXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZU9wdGlvbmFsTWFudGlzc2Eoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLm1hdGNoKC9cXFtcXC5dLykpIHtcbiAgICAgICAgcmVzdWx0Lm9wdGlvbmFsTWFudGlzc2EgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nLm1hdGNoKC9cXC4vKSkge1xuICAgICAgICByZXN1bHQub3B0aW9uYWxNYW50aXNzYSA9IGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VPcHRpb25hbENoYXJhY3RlcmlzdGljKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiLlwiKSAhPT0gLTEpIHtcbiAgICAgICAgbGV0IGNoYXJhY3RlcmlzdGljID0gc3RyaW5nLnNwbGl0KFwiLlwiKVswXTtcbiAgICAgICAgcmVzdWx0Lm9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMgPSBjaGFyYWN0ZXJpc3RpYy5pbmRleE9mKFwiMFwiKSA9PT0gLTE7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZU5lZ2F0aXZlKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5tYXRjaCgvXlxcKz9cXChbXildKlxcKSQvKSkge1xuICAgICAgICByZXN1bHQubmVnYXRpdmUgPSBcInBhcmVudGhlc2lzXCI7XG4gICAgfVxuICAgIGlmIChzdHJpbmcubWF0Y2goL15cXCs/LS8pKSB7XG4gICAgICAgIHJlc3VsdC5uZWdhdGl2ZSA9IFwic2lnblwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VGb3JjZVNpZ24oc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLm1hdGNoKC9eXFwrLykpIHtcbiAgICAgICAgcmVzdWx0LmZvcmNlU2lnbiA9IHRydWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUZvcm1hdChzdHJpbmcsIHJlc3VsdCA9IHt9KSB7XG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG5cbiAgICBzdHJpbmcgPSBwYXJzZVByZWZpeChzdHJpbmcsIHJlc3VsdCk7XG4gICAgc3RyaW5nID0gcGFyc2VQb3N0Zml4KHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZU91dHB1dChzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VUb3RhbExlbmd0aChzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VDaGFyYWN0ZXJpc3RpYyhzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VPcHRpb25hbENoYXJhY3RlcmlzdGljKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZUF2ZXJhZ2Uoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlRm9yY2VBdmVyYWdlKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZU1hbnRpc3NhKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZU9wdGlvbmFsTWFudGlzc2Eoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlVGhvdXNhbmRTZXBhcmF0ZWQoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlU3BhY2VTZXBhcmF0ZWQoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlTmVnYXRpdmUoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlRm9yY2VTaWduKHN0cmluZywgcmVzdWx0KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBhcnNlRm9ybWF0XG59O1xuIiwiLyohXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQmVuamFtaW4gVmFuIFJ5c2VnaGVtPGJlbmphbWluQHZhbnJ5c2VnaGVtLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG5cbmNvbnN0IGFsbFN1ZmZpeGVzID0gW1xuICAgIHtrZXk6IFwiWmlCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgNyl9LFxuICAgIHtrZXk6IFwiWkJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCA3KX0sXG4gICAge2tleTogXCJZaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCA4KX0sXG4gICAge2tleTogXCJZQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDgpfSxcbiAgICB7a2V5OiBcIlRpQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDQpfSxcbiAgICB7a2V5OiBcIlRCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgNCl9LFxuICAgIHtrZXk6IFwiUGlCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgNSl9LFxuICAgIHtrZXk6IFwiUEJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCA1KX0sXG4gICAge2tleTogXCJNaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCAyKX0sXG4gICAge2tleTogXCJNQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDIpfSxcbiAgICB7a2V5OiBcIktpQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDEpfSxcbiAgICB7a2V5OiBcIktCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgMSl9LFxuICAgIHtrZXk6IFwiR2lCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgMyl9LFxuICAgIHtrZXk6IFwiR0JcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCAzKX0sXG4gICAge2tleTogXCJFaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCA2KX0sXG4gICAge2tleTogXCJFQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDYpfSxcbiAgICB7a2V5OiBcIkJcIiwgZmFjdG9yOiAxfVxuXTtcblxuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHMpIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKC9bLS9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKTtcbn1cblxuZnVuY3Rpb24gdW5mb3JtYXRWYWx1ZShpbnB1dFN0cmluZywgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wgPSBcIlwiLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpIHtcbiAgICBpZiAoaW5wdXRTdHJpbmcgPT09IFwiXCIpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoIWlzTmFOKCtpbnB1dFN0cmluZykpIHtcbiAgICAgICAgcmV0dXJuICtpbnB1dFN0cmluZztcbiAgICB9XG5cbiAgICAvLyBaZXJvIEZvcm1hdFxuXG4gICAgaWYgKGlucHV0U3RyaW5nID09PSB6ZXJvRm9ybWF0KSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8vIE5lZ2F0aXZlXG5cbiAgICBsZXQgbWF0Y2ggPSBpbnB1dFN0cmluZy5tYXRjaCgvXFwoKFteKV0qKVxcKS8pO1xuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiAtMSAqIHVuZm9ybWF0VmFsdWUobWF0Y2hbMV0sIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIC8vIEN1cnJlbmN5XG5cbiAgICBsZXQgc3RyaXBwZWQgPSBpbnB1dFN0cmluZy5yZXBsYWNlKGN1cnJlbmN5U3ltYm9sLCBcIlwiKTtcblxuICAgIGlmIChzdHJpcHBlZCAhPT0gaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHVuZm9ybWF0VmFsdWUoc3RyaXBwZWQsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIC8vIFRob3VzYW5kIHNlcGFyYXRvcnNcblxuICAgIHN0cmlwcGVkID0gaW5wdXRTdHJpbmcucmVwbGFjZShuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cChkZWxpbWl0ZXJzLnRob3VzYW5kcyksIFwiZ1wiKSwgXCJcIik7XG5cbiAgICBpZiAoc3RyaXBwZWQgIT09IGlucHV0U3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB1bmZvcm1hdFZhbHVlKHN0cmlwcGVkLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KTtcbiAgICB9XG5cbiAgICAvLyBEZWNpbWFsXG5cbiAgICBzdHJpcHBlZCA9IGlucHV0U3RyaW5nLnJlcGxhY2UoZGVsaW1pdGVycy5kZWNpbWFsLCBcIi5cIik7XG5cbiAgICBpZiAoc3RyaXBwZWQgIT09IGlucHV0U3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB1bmZvcm1hdFZhbHVlKHN0cmlwcGVkLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KTtcbiAgICB9XG5cbiAgICAvLyBCeXRlXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFN1ZmZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBzdWZmaXggPSBhbGxTdWZmaXhlc1tpXTtcbiAgICAgICAgc3RyaXBwZWQgPSBpbnB1dFN0cmluZy5yZXBsYWNlKHN1ZmZpeC5rZXksIFwiXCIpO1xuXG4gICAgICAgIGlmIChzdHJpcHBlZCAhPT0gaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmZvcm1hdFZhbHVlKHN0cmlwcGVkLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KSAqIHN1ZmZpeC5mYWN0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQZXJjZW50XG5cbiAgICBzdHJpcHBlZCA9IGlucHV0U3RyaW5nLnJlcGxhY2UoXCIlXCIsIFwiXCIpO1xuXG4gICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICByZXR1cm4gdW5mb3JtYXRWYWx1ZShzdHJpcHBlZCwgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wsIG9yZGluYWwsIHplcm9Gb3JtYXQsIGFiYnJldmlhdGlvbnMsIGZvcm1hdCkgLyAxMDA7XG4gICAgfVxuXG4gICAgLy8gT3JkaW5hbFxuXG4gICAgbGV0IHBvc3NpYmxlT3JkaW5hbFZhbHVlID0gcGFyc2VJbnQoaW5wdXRTdHJpbmcsIDEwKTtcblxuICAgIGlmIChpc05hTihwb3NzaWJsZU9yZGluYWxWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBsZXQgb3JkaW5hbFN0cmluZyA9IG9yZGluYWwocG9zc2libGVPcmRpbmFsVmFsdWUpO1xuICAgIHN0cmlwcGVkID0gaW5wdXRTdHJpbmcucmVwbGFjZShvcmRpbmFsU3RyaW5nLCBcIlwiKTtcblxuICAgIGlmIChzdHJpcHBlZCAhPT0gaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHVuZm9ybWF0VmFsdWUoc3RyaXBwZWQsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIC8vIEF2ZXJhZ2VcbiAgICBsZXQgYWJicmV2aWF0aW9uS2V5cyA9IE9iamVjdC5rZXlzKGFiYnJldmlhdGlvbnMpO1xuICAgIGxldCBudW1iZXJPZkFiYnJldmlhdGlvbnMgPSBhYmJyZXZpYXRpb25LZXlzLmxlbmd0aDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZBYmJyZXZpYXRpb25zOyBpKyspIHtcbiAgICAgICAgbGV0IGtleSA9IGFiYnJldmlhdGlvbktleXNbaV07XG5cbiAgICAgICAgc3RyaXBwZWQgPSBpbnB1dFN0cmluZy5yZXBsYWNlKGFiYnJldmlhdGlvbnNba2V5XSwgXCJcIik7XG5cbiAgICAgICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgbGV0IGZhY3RvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVmYXVsdC1jYXNlXG4gICAgICAgICAgICAgICAgY2FzZSBcInRob3VzYW5kXCI6XG4gICAgICAgICAgICAgICAgICAgIGZhY3RvciA9IE1hdGgucG93KDEwMDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwibWlsbGlvblwiOlxuICAgICAgICAgICAgICAgICAgICBmYWN0b3IgPSBNYXRoLnBvdygxMDAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImJpbGxpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgZmFjdG9yID0gTWF0aC5wb3coMTAwMCwgMyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ0cmlsbGlvblwiOlxuICAgICAgICAgICAgICAgICAgICBmYWN0b3IgPSBNYXRoLnBvdygxMDAwLCA0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdW5mb3JtYXRWYWx1ZShzdHJpcHBlZCwgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wsIG9yZGluYWwsIHplcm9Gb3JtYXQsIGFiYnJldmlhdGlvbnMsIGZvcm1hdCkgKiBmYWN0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzVGltZShpbnB1dFN0cmluZywgZGVsaW1pdGVycykge1xuICAgIGxldCBzZXBhcmF0b3JzID0gaW5wdXRTdHJpbmcuaW5kZXhPZihcIjpcIikgJiYgZGVsaW1pdGVycy50aG91c2FuZHMgIT09IFwiOlwiO1xuXG4gICAgaWYgKCFzZXBhcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgc2VnbWVudHMgPSBpbnB1dFN0cmluZy5zcGxpdChcIjpcIik7XG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCAhPT0gMykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IGhvdXJzID0gK3NlZ21lbnRzWzBdO1xuICAgIGxldCBtaW51dGVzID0gK3NlZ21lbnRzWzFdO1xuICAgIGxldCBzZWNvbmRzID0gK3NlZ21lbnRzWzJdO1xuXG4gICAgcmV0dXJuICFpc05hTihob3VycykgJiYgIWlzTmFOKG1pbnV0ZXMpICYmICFpc05hTihzZWNvbmRzKTtcbn1cblxuZnVuY3Rpb24gdW5mb3JtYXRUaW1lKGlucHV0U3RyaW5nKSB7XG4gICAgbGV0IHNlZ21lbnRzID0gaW5wdXRTdHJpbmcuc3BsaXQoXCI6XCIpO1xuXG4gICAgbGV0IGhvdXJzID0gK3NlZ21lbnRzWzBdO1xuICAgIGxldCBtaW51dGVzID0gK3NlZ21lbnRzWzFdO1xuICAgIGxldCBzZWNvbmRzID0gK3NlZ21lbnRzWzJdO1xuXG4gICAgcmV0dXJuIHNlY29uZHMgKyA2MCAqIG1pbnV0ZXMgKyAzNjAwICogaG91cnM7XG59XG5cbmZ1bmN0aW9uIHVuZm9ybWF0KGlucHV0U3RyaW5nLCBmb3JtYXQpIHtcbiAgICAvLyBBdm9pZCBjaXJjdWxhciByZWZlcmVuY2VzXG4gICAgY29uc3QgZ2xvYmFsU3RhdGUgPSByZXF1aXJlKFwiLi9nbG9iYWxTdGF0ZVwiKTtcblxuICAgIGxldCBkZWxpbWl0ZXJzID0gZ2xvYmFsU3RhdGUuY3VycmVudERlbGltaXRlcnMoKTtcbiAgICBsZXQgY3VycmVuY3lTeW1ib2wgPSBnbG9iYWxTdGF0ZS5jdXJyZW50Q3VycmVuY3koKS5zeW1ib2w7XG4gICAgbGV0IG9yZGluYWwgPSBnbG9iYWxTdGF0ZS5jdXJyZW50T3JkaW5hbCgpO1xuICAgIGxldCB6ZXJvRm9ybWF0ID0gZ2xvYmFsU3RhdGUuZ2V0WmVyb0Zvcm1hdCgpO1xuICAgIGxldCBhYmJyZXZpYXRpb25zID0gZ2xvYmFsU3RhdGUuY3VycmVudEFiYnJldmlhdGlvbnMoKTtcblxuICAgIGxldCB2YWx1ZSA9IHVuZGVmaW5lZDtcblxuICAgIGlmICh0eXBlb2YgaW5wdXRTdHJpbmcgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgaWYgKG1hdGNoZXNUaW1lKGlucHV0U3RyaW5nLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgICAgICAgdmFsdWUgPSB1bmZvcm1hdFRpbWUoaW5wdXRTdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSB1bmZvcm1hdFZhbHVlKGlucHV0U3RyaW5nLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0U3RyaW5nID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHZhbHVlID0gaW5wdXRTdHJpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdW5mb3JtYXRcbn07XG4iLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNyBCZW5qYW1pbiBWYW4gUnlzZWdoZW08YmVuamFtaW5AdmFucnlzZWdoZW0uY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKi9cblxubGV0IHVuZm9ybWF0dGVyID0gcmVxdWlyZShcIi4vdW5mb3JtYXR0aW5nXCIpO1xuXG5jb25zdCB2YWxpZE91dHB1dFZhbHVlcyA9IFtcbiAgICBcImN1cnJlbmN5XCIsXG4gICAgXCJwZXJjZW50XCIsXG4gICAgXCJieXRlXCIsXG4gICAgXCJ0aW1lXCIsXG4gICAgXCJvcmRpbmFsXCIsXG4gICAgXCJudW1iZXJcIlxuXTtcblxuY29uc3QgdmFsaWRGb3JjZUF2ZXJhZ2VWYWx1ZXMgPSBbXG4gICAgXCJ0cmlsbGlvblwiLFxuICAgIFwiYmlsbGlvblwiLFxuICAgIFwibWlsbGlvblwiLFxuICAgIFwidGhvdXNhbmRcIlxuXTtcblxuY29uc3QgdmFsaWROZWdhdGl2ZVZhbHVlcyA9IFtcbiAgICBcInNpZ25cIixcbiAgICBcInBhcmVudGhlc2lzXCJcbl07XG5cbmNvbnN0IHZhbGlkTWFuZGF0b3J5QWJicmV2aWF0aW9ucyA9IHtcbiAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgIGNoaWxkcmVuOiB7XG4gICAgICAgIHRob3VzYW5kOiB7XG4gICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIG1pbGxpb246IHtcbiAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgYmlsbGlvbjoge1xuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB0cmlsbGlvbjoge1xuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSxcbiAgICBtYW5kYXRvcnk6IHRydWVcbn07XG5jb25zdCB2YWxpZEFiYnJldmlhdGlvbnMgPSB7XG4gICAgdHlwZTogXCJvYmplY3RcIixcbiAgICBjaGlsZHJlbjoge1xuICAgICAgICB0aG91c2FuZDogXCJzdHJpbmdcIixcbiAgICAgICAgbWlsbGlvbjogXCJzdHJpbmdcIixcbiAgICAgICAgYmlsbGlvbjogXCJzdHJpbmdcIixcbiAgICAgICAgdHJpbGxpb246IFwic3RyaW5nXCJcbiAgICB9XG59O1xuXG5jb25zdCB2YWxpZEJhc2VWYWx1ZXMgPSBbXG4gICAgXCJkZWNpbWFsXCIsXG4gICAgXCJiaW5hcnlcIixcbiAgICBcImdlbmVyYWxcIlxuXTtcblxuY29uc3QgdmFsaWRGb3JtYXQgPSB7XG4gICAgb3V0cHV0OiB7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIHZhbGlkVmFsdWVzOiB2YWxpZE91dHB1dFZhbHVlc1xuICAgIH0sXG4gICAgYmFzZToge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICB2YWxpZFZhbHVlczogdmFsaWRCYXNlVmFsdWVzLFxuICAgICAgICByZXN0cmljdGlvbjogKG51bWJlciwgZm9ybWF0KSA9PiBmb3JtYXQub3V0cHV0ID09PSBcImJ5dGVcIixcbiAgICAgICAgbWVzc2FnZTogXCJgYmFzZWAgbXVzdCBiZSBwcm92aWRlZCBvbmx5IHdoZW4gdGhlIG91dHB1dCBpcyBgYnl0ZWBcIixcbiAgICAgICAgbWFuZGF0b3J5OiAoZm9ybWF0KSA9PiBmb3JtYXQub3V0cHV0ID09PSBcImJ5dGVcIlxuICAgIH0sXG4gICAgY2hhcmFjdGVyaXN0aWM6IHtcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgcmVzdHJpY3Rpb246IChudW1iZXIpID0+IG51bWJlciA+PSAwLFxuICAgICAgICBtZXNzYWdlOiBcInZhbHVlIG11c3QgYmUgcG9zaXRpdmVcIlxuICAgIH0sXG4gICAgcHJlZml4OiBcInN0cmluZ1wiLFxuICAgIHBvc3RmaXg6IFwic3RyaW5nXCIsXG4gICAgZm9yY2VBdmVyYWdlOiB7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIHZhbGlkVmFsdWVzOiB2YWxpZEZvcmNlQXZlcmFnZVZhbHVlc1xuICAgIH0sXG4gICAgYXZlcmFnZTogXCJib29sZWFuXCIsXG4gICAgdG90YWxMZW5ndGg6IHtcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgcmVzdHJpY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Rpb246IChudW1iZXIpID0+IG51bWJlciA+PSAwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwidmFsdWUgbXVzdCBiZSBwb3NpdGl2ZVwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0aW9uOiAobnVtYmVyLCBmb3JtYXQpID0+ICFmb3JtYXQuZXhwb25lbnRpYWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJgdG90YWxMZW5ndGhgIGlzIGluY29tcGF0aWJsZSB3aXRoIGBleHBvbmVudGlhbGBcIlxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICBtYW50aXNzYToge1xuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICByZXN0cmljdGlvbjogKG51bWJlcikgPT4gbnVtYmVyID49IDAsXG4gICAgICAgIG1lc3NhZ2U6IFwidmFsdWUgbXVzdCBiZSBwb3NpdGl2ZVwiXG4gICAgfSxcbiAgICBvcHRpb25hbE1hbnRpc3NhOiBcImJvb2xlYW5cIixcbiAgICBvcHRpb25hbENoYXJhY3RlcmlzdGljOiBcImJvb2xlYW5cIixcbiAgICB0aG91c2FuZFNlcGFyYXRlZDogXCJib29sZWFuXCIsXG4gICAgc3BhY2VTZXBhcmF0ZWQ6IFwiYm9vbGVhblwiLFxuICAgIGFiYnJldmlhdGlvbnM6IHZhbGlkQWJicmV2aWF0aW9ucyxcbiAgICBuZWdhdGl2ZToge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICB2YWxpZFZhbHVlczogdmFsaWROZWdhdGl2ZVZhbHVlc1xuICAgIH0sXG4gICAgZm9yY2VTaWduOiBcImJvb2xlYW5cIixcbiAgICBleHBvbmVudGlhbDoge1xuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgIH0sXG4gICAgcHJlZml4U3ltYm9sOiB7XG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICByZXN0cmljdGlvbjogKG51bWJlciwgZm9ybWF0KSA9PiBmb3JtYXQub3V0cHV0ID09PSBcInBlcmNlbnRcIixcbiAgICAgICAgbWVzc2FnZTogXCJgcHJlZml4U3ltYm9sYCBjYW4gYmUgcHJvdmlkZWQgb25seSB3aGVuIHRoZSBvdXRwdXQgaXMgYHBlcmNlbnRgXCJcbiAgICB9XG59O1xuXG5jb25zdCB2YWxpZExhbmd1YWdlID0ge1xuICAgIGxhbmd1YWdlVGFnOiB7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgIH0sXG4gICAgZGVsaW1pdGVyczoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgICAgdGhvdXNhbmRzOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgZGVjaW1hbDogXCJzdHJpbmdcIlxuICAgICAgICB9LFxuICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICB9LFxuICAgIGFiYnJldmlhdGlvbnM6IHZhbGlkTWFuZGF0b3J5QWJicmV2aWF0aW9ucyxcbiAgICBzcGFjZVNlcGFyYXRlZDogXCJib29sZWFuXCIsXG4gICAgb3JkaW5hbDoge1xuICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgIH0sXG4gICAgY3VycmVuY3k6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgY2hpbGRyZW46IHtcbiAgICAgICAgICAgIHN5bWJvbDogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgY29kZTogXCJzdHJpbmdcIlxuICAgICAgICB9LFxuICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHRzOiBcImZvcm1hdFwiLFxuICAgIG9yZGluYWxEZWZhdWx0czogXCJmb3JtYXRcIixcbiAgICBieXRlRGVmYXVsdHM6IFwiZm9ybWF0XCIsXG4gICAgcGVyY2VudGFnZURlZmF1bHRzOiBcImZvcm1hdFwiLFxuICAgIGN1cnJlbmN5RGVmYXVsdHM6IFwiZm9ybWF0XCIsXG4gICAgZm9ybWF0czoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgICAgZm91ckRpZ2l0czoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVsbFdpdGhUd29EZWNpbWFsczoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVsbFdpdGhUd29EZWNpbWFsc05vQ3VycmVuY3k6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZvcm1hdFwiLFxuICAgICAgICAgICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bGxXaXRoTm9EZWNpbWFsczoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIENoZWNrIHRoZSB2YWxpZGl0eSBvZiB0aGUgcHJvdmlkZWQgaW5wdXQgYW5kIGZvcm1hdC5cbiAqIFRoZSBjaGVjayBpcyBOT1QgbGF6eS5cbiAqXG4gKiBAcGFyYW0gaW5wdXRcbiAqIEBwYXJhbSBmb3JtYXRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgd2hlbiBldmVyeXRoaW5nIGlzIGNvcnJlY3RcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGUoaW5wdXQsIGZvcm1hdCkge1xuICAgIGxldCB2YWxpZElucHV0ID0gdmFsaWRhdGVJbnB1dChpbnB1dCk7XG4gICAgbGV0IGlzRm9ybWF0VmFsaWQgPSB2YWxpZGF0ZUZvcm1hdChmb3JtYXQpO1xuXG4gICAgcmV0dXJuIHZhbGlkSW5wdXQgJiYgaXNGb3JtYXRWYWxpZDtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVJbnB1dChpbnB1dCkge1xuICAgIGxldCB2YWx1ZSA9IHVuZm9ybWF0dGVyLnVuZm9ybWF0KGlucHV0KTtcblxuICAgIHJldHVybiAhIXZhbHVlO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVNwZWModG9WYWxpZGF0ZSwgc3BlYywgcHJlZml4LCBza2lwTWFuZGF0b3J5Q2hlY2spIHtcbiAgICBsZXQgcmVzdWx0cyA9IE9iamVjdC5rZXlzKHRvVmFsaWRhdGUpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGlmICghc3BlY1trZXldKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3ByZWZpeH0gSW52YWxpZCBrZXk6ICR7a2V5fWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2YWx1ZSA9IHRvVmFsaWRhdGVba2V5XTtcbiAgICAgICAgbGV0IGRhdGEgPSBzcGVjW2tleV07XG5cbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBkYXRhID0ge3R5cGU6IGRhdGF9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gXCJmb3JtYXRcIikgeyAvLyBhbGwgZm9ybWF0cyBhcmUgcGFydGlhbCAoYS5rLmEgd2lsbCBiZSBtZXJnZWQgd2l0aCBzb21lIGRlZmF1bHQgdmFsdWVzKSB0aHVzIG5vIG5lZWQgdG8gY2hlY2sgbWFuZGF0b3J5IHZhbHVlc1xuICAgICAgICAgICAgbGV0IHZhbGlkID0gdmFsaWRhdGVTcGVjKHZhbHVlLCB2YWxpZEZvcm1hdCwgYFtWYWxpZGF0ZSAke2tleX1dYCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSBkYXRhLnR5cGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSAke2tleX0gdHlwZSBtaXNtYXRjaGVkOiBcIiR7ZGF0YS50eXBlfVwiIGV4cGVjdGVkLCBcIiR7dHlwZW9mIHZhbHVlfVwiIHByb3ZpZGVkYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEucmVzdHJpY3Rpb25zICYmIGRhdGEucmVzdHJpY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IGRhdGEucmVzdHJpY3Rpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQge3Jlc3RyaWN0aW9uLCBtZXNzYWdlfSA9IGRhdGEucmVzdHJpY3Rpb25zW2ldO1xuICAgICAgICAgICAgICAgIGlmICghcmVzdHJpY3Rpb24odmFsdWUsIHRvVmFsaWRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSAke2tleX0gaW52YWxpZCB2YWx1ZTogJHttZXNzYWdlfWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXRhLnJlc3RyaWN0aW9uICYmICFkYXRhLnJlc3RyaWN0aW9uKHZhbHVlLCB0b1ZhbGlkYXRlKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtwcmVmaXh9ICR7a2V5fSBpbnZhbGlkIHZhbHVlOiAke2RhdGEubWVzc2FnZX1gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS52YWxpZFZhbHVlcyAmJiBkYXRhLnZhbGlkVmFsdWVzLmluZGV4T2YodmFsdWUpID09PSAtMSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtwcmVmaXh9ICR7a2V5fSBpbnZhbGlkIHZhbHVlOiBtdXN0IGJlIGFtb25nICR7SlNPTi5zdHJpbmdpZnkoZGF0YS52YWxpZFZhbHVlcyl9LCBcIiR7dmFsdWV9XCIgcHJvdmlkZWRgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5jaGlsZHJlbikge1xuICAgICAgICAgICAgbGV0IHZhbGlkID0gdmFsaWRhdGVTcGVjKHZhbHVlLCBkYXRhLmNoaWxkcmVuLCBgW1ZhbGlkYXRlICR7a2V5fV1gKTtcblxuICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgaWYgKCFza2lwTWFuZGF0b3J5Q2hlY2spIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKC4uLk9iamVjdC5rZXlzKHNwZWMpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IHNwZWNba2V5XTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSB7dHlwZTogZGF0YX07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkYXRhLm1hbmRhdG9yeSkge1xuICAgICAgICAgICAgICAgIGxldCBtYW5kYXRvcnkgPSBkYXRhLm1hbmRhdG9yeTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1hbmRhdG9yeSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hbmRhdG9yeSA9IG1hbmRhdG9yeSh0b1ZhbGlkYXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobWFuZGF0b3J5ICYmIHRvVmFsaWRhdGVba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSBNaXNzaW5nIG1hbmRhdG9yeSBrZXkgXCIke2tleX1cImApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKGFjYywgY3VycmVudCkgPT4ge1xuICAgICAgICByZXR1cm4gYWNjICYmIGN1cnJlbnQ7XG4gICAgfSwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRm9ybWF0KGZvcm1hdCkge1xuICAgIHJldHVybiB2YWxpZGF0ZVNwZWMoZm9ybWF0LCB2YWxpZEZvcm1hdCwgXCJbVmFsaWRhdGUgZm9ybWF0XVwiKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVMYW5ndWFnZShkYXRhKSB7XG4gICAgcmV0dXJuIHZhbGlkYXRlU3BlYyhkYXRhLCB2YWxpZExhbmd1YWdlLCBcIltWYWxpZGF0ZSBsYW5ndWFnZV1cIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHZhbGlkYXRlLFxuICAgIHZhbGlkYXRlRm9ybWF0LFxuICAgIHZhbGlkYXRlSW5wdXQsXG4gICAgdmFsaWRhdGVMYW5ndWFnZVxufTtcbiJdfQ==
