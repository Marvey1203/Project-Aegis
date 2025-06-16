"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CJDropshippingClient = void 0;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var CJ_DROPSHIPPING_API_URL = 'https://api.cjdropshipping.com/api';
var CJDropshippingClient = /** @class */ (function () {
    function CJDropshippingClient(accessToken) {
        this.accessToken = accessToken;
    }
    return CJDropshippingClient;
}());
exports.CJDropshippingClient = CJDropshippingClient;
-create - signature(str, string, key, string);
string;
{
    var hmac = (0, crypto_1.createHmac)('sha256', key);
    hmac.update(str);
    return hmac.digest('hex');
}
async;
getCJProducts(productName, string);
Promise < any > {
    const: requestBody = {
        productName: productName,
        page: 1,
        limit: 10,
    },
    try: {
        const: response = await axios_1.default.post("".concat(CJ_DROPSHIPPING_API_URL, "/product/list"), requestBody, {
            headers: {
                'CJ-Access-Token': this.accessToken,
                'Content-Type': 'application/json',
            },
        }),
        return: response.data
    },
    catch: function (error) {
        var _a;
        if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 429) {
            console.log('Rate limit hit. Waiting for 301 seconds...');
            yield new Promise(function (resolve) { return setTimeout(resolve, 301000); });
            console.log('Retrying API call...');
            var response = yield axios_1.default.post("".concat(CJ_DROPSHIPPING_API_URL, "/product/list"), requestBody, {
                headers: {
                    'CJ-Access-Token': this.accessToken,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        throw error;
    }
};
