"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiply = multiply;
// This function contains a deliberate bug. It uses addition instead of multiplication.
function multiply(a, b) {
    return a + b; // <-- THE BUG IS HERE
}
