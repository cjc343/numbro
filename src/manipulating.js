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

/**
 * Compute the power of 10 to use to not require a mantissa anymore.
 *
 * @param {number} x - number used for computation
 * @return {number}
 */
function multiplier(x) {
    let mantissa = x.toString().split(".")[1];

    if (!mantissa) {
        return 1;
    }

    return Math.pow(10, mantissa.length);
}

/**
 * Compute a factor use to reduce floating error while manipulating numbers.
 *
 * @param {number} args - numbers used to compute a matching correction factor
 */
function correctionFactor(...args) {
    let smaller = args.reduce((prev, next) => {
        let mp = multiplier(prev);
        let mn = multiplier(next);
        return mp > mn ? prev : next;
    }, -Infinity);

    return multiplier(smaller);
}

/**
 * Add a number or a numbro to N.
 *
 * @param {Numbro} n - augend
 * @param {number|Numbro} other - addend
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function add(n, other, numbro) {
    let value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    let factor = correctionFactor(n._value, value);

    function callback(acc, number) {
        return acc + factor * number;
    }

    n._value = [n._value, value].reduce(callback, 0) / factor;
    return n;
}

/**
 * Subtract a number or a numbro from N.
 *
 * @param {Numbro} n - minuend
 * @param {number|Numbro} other - subtrahend
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function subtract(n, other, numbro) {
    let value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    let factor = correctionFactor(n._value, value);

    function callback(acc, number) {
        return acc - factor * number;
    }

    n._value = [value].reduce(callback, n._value * factor) / factor;
    return n;
}

/**
 * Multiply N by a number or a numbro.
 *
 * @param {Numbro} n - multiplicand
 * @param {number|Numbro} other - multiplier
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function multiply(n, other, numbro) {
    let value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    function callback(accum, curr) {
        let factor = correctionFactor(accum, curr);
        let result = accum * factor;
        result *= curr * factor;
        result /= factor * factor;

        return result;
    }

    n._value = [n._value, value].reduce(callback, 1);
    return n;
}

/**
 * Divide N by a number or a numbro.
 *
 * @param {Numbro} n - dividend
 * @param {number|Numbro} other - divisor
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function divide(n, other, numbro) {
    let value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    function callback(accum, curr) {
        let factor = correctionFactor(accum, curr);
        return (accum * factor) / (curr * factor);
    }

    n._value = [n._value, value].reduce(callback);
    return n;
}

/**
 * Set N to the OTHER (or the value of OTHER when it's a numbro instance).
 *
 * @param {Numbro} n - numbro instance to mutate
 * @param {number|Numbro} other - new value to assign to N
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function set (n, other, numbro) {
    let value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    n._value = value;
    return n;
}

/**
 * Return the distance between N and OTHER.
 *
 * @param {Numbro} n
 * @param {number|Numbro} other
 * @param {numbro} numbro - numbro singleton
 * @return {number}
 */
function difference(n, other, numbro) {
    let clone = numbro(n._value);
    subtract(clone, other, numbro);

    return Math.abs(clone._value);
}

module.exports = numbro => ({
    add: (n, other) => add(n, other, numbro),
    subtract: (n, other) => subtract(n, other, numbro),
    multiply: (n, other) => multiply(n, other, numbro),
    divide: (n, other) => divide(n, other, numbro),
    set: (n, other) => set(n, other, numbro),
    difference: (n, other) => difference(n, other, numbro)
});
