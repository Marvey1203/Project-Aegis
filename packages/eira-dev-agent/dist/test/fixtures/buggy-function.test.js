"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var buggy_function_1 = require("./buggy-function");
(0, vitest_1.describe)('buggy-function', function () {
    (0, vitest_1.it)('should correctly multiply two numbers', function () {
        // This assertion will fail because multiply(2, 3) will return 5, not 6.
        (0, vitest_1.expect)((0, buggy_function_1.multiply)(2, 3)).toBe(6);
    });
});
