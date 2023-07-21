"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Duration = void 0;
var defaultFormat = "YYYY-MM-DD HH:mm:ss";
var formatTokens = /YYYY|YY|MM?|DD?|HH?|mm?|ss?|zz?/g;
/**
 * @class Mymont
 */
var Mymont = /** @class */ (function () {
    function Mymont(time, formatStr) {
        if (formatStr === void 0) { formatStr = defaultFormat; }
        this.time = time;
        this.formatStr = formatStr;
        Object.seal(this);
    }
    /**
     * 构造新的 Mymont 实例
     * @param val 时间戳或 Date 实例
     * @param format 格式化字符串，Myment 实例在执行 toString 方法时会默认使用该格式
     *  生成日期字符串。默认格式为 YYYY-MM-DD HH:mm:ss
     * @returns Mymont 实例
     * @example
     * Mymont.of(1557902430000);
     * Mymont.of(new Date());
     */
    Mymont.of = function (val, formatStr) {
        return val instanceof Date
            ? new Mymont(val.getTime(), formatStr)
            : new Mymont(val);
    };
    /**
     * 获取当前时间的 Mymont 实例
     * @param format 格式化字符串
     * @returns Mymont 实例
     * @example
     * Mymont.now();
     * Mymont.now('YYYY-MM-DD HH:mm:ss');
     */
    Mymont.now = function (format) {
        return Mymont.of(new Date(), format);
    };
    /**
     * 解析时间字符串
     * @param value 时间字符串
     * @param format 格式化字符串
     * @returns Mymont 实例
     * @example
     * Mymont.parse('2019-05-15 10:20:30', 'YYYY-MM-DD HH:mm:ss');
     * Mymont.parse('2019-05-15 10:20:30');
     */
    Mymont.parse = function (value, formatStr) {
        if (formatStr === void 0) { formatStr = defaultFormat; }
        return Mymont.of(parseDate(value, formatStr), formatStr);
    };
    Mymont.during = function (op) {
        return Duration.of(op);
    };
    Object.defineProperty(Mymont.prototype, "year", {
        get: function () {
            return new Date(this.time).getFullYear();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mymont.prototype, "month", {
        get: function () {
            return new Date(this.time).getMonth() + 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mymont.prototype, "date", {
        get: function () {
            return new Date(this.time).getDate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mymont.prototype, "hours", {
        get: function () {
            return new Date(this.time).getHours();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mymont.prototype, "minutes", {
        get: function () {
            return new Date(this.time).getMinutes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mymont.prototype, "seconds", {
        get: function () {
            return new Date(this.time).getSeconds();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mymont.prototype, "weekDay", {
        get: function () {
            return new Date(this.time).getDay();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mymont.prototype, "milliSeconds", {
        get: function () {
            return new Date(this.time).getMilliseconds();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 格式化日期
     * @param format 格式化字符串, 默认为 YYYY-MM-DD HH:mm:ss
     * @returns
     */
    Mymont.prototype.toString = function (formatStr) {
        return formatDate(this.time, formatStr || this.formatStr);
    };
    Mymont.prototype.format = function (formatStr) {
        return this.toString(formatStr);
    };
    /**
     * 修改日期, 返回新的 Mymont 实例
     * @param op 日期操作对象, 未传入的字段会沿用当前实例的值, 传入的字段会在当前实例的基础上进行计算修改
     * @returns  新的 Mymont 实例
     * @example
     * Myment.now() // 2019-05-15 10:20:30
     * Mymont.now().move({ year: 1 }); // 2020-05-15 10:20:30
     * Mymont.now().move({ year: -1 }); // 2018-05-15 10:20:30
     * Mymont.now().move({ year: 1, month: 1 }); // 2020-06-15 10:20:30
     */
    Mymont.prototype.move = function (op) {
        return Mymont.of(Object.entries(op).reduce(function (t, _a) {
            var k = _a[0], v = _a[1];
            return t + calcDuration(k, v);
        }, this.time));
    };
    /**
     * 修改日期, 返回新的 Mymont 实例
     * @param targetDate 目标日期，只会修改传入的日期中存在的字段，未传入的字段会沿用当前实例的值
     * @returns  新的 Mymont 实例
     */
    Mymont.prototype.change = function (targetDate) {
        var d = new Date(this.time);
        lookKeys(targetDate, function (h) {
            var val = targetDate[h.key];
            if (val !== undefined) {
                h.parse(val.toString(), d);
            }
        });
        return Mymont.of(d);
    };
    /**
     * 获取当前日期的开始时间
     * @param key  日期字段
     * @returns  新的 Mymont 实例
     * @example
     * Mymont.now().startOf('year'); // 2019-01-01 00:00:00
     * Mymont.now().startOf('month'); // 2019-05-01 00:00:00
     * Mymont.now().startOf('date'); // 2019-05-15 00:00:00
     * Mymont.now().startOf('hours'); // 2019-05-15 10:00:00
     */
    Mymont.prototype.startOf = function (key) {
        var i = tokenHandles.findIndex(function (h) { return h.key === key; });
        if (i === -1 || key === "milliSeconds") {
            return this;
        }
        var targetValue = tokenHandles.slice(i + 1).reduce(function (d, h) {
            var _a;
            return (__assign(__assign({}, d), (_a = {}, _a[h.key] = h.minValue || 0, _a)));
        }, {});
        return this.change(targetValue);
    };
    /**
     * 获取当前日期的结束时间
     * @param key  日期字段
     * @returns  新的 Mymont 实例
     * @example
     * Mymont.now().endOf('year'); // 2019-12-31 23:59:59
     * Mymont.now().endOf('month'); // 2019-05-31 23:59:59
     * Mymont.now().endOf('date'); // 2019-05-15 23:59:59
     * Mymont.now().endOf('hours'); // 2019-05-15 10:59:59
     */
    Mymont.prototype.endOf = function (key) {
        var _a;
        var i = tokenHandles.findIndex(function (h) { return h.key === key; });
        if (key === "milliSeconds") {
            return this;
        }
        return this.move((_a = {}, _a[key === 'date' ? 'day' : key] = 1, _a))
            .startOf(key)
            .move({ milliSeconds: -1 });
    };
    Mymont.prototype.isBefore = function (date, key) {
        return compareMyment(this, tryParse(date, this.formatStr), function (a, b) { return a < b; }, key);
    };
    Mymont.prototype.isAfter = function (date, key) {
        return compareMyment(this, tryParse(date, this.formatStr), function (a, b) { return a > b; }, key);
    };
    Mymont.prototype.isSame = function (date, key) {
        return compareMyment(this, tryParse(date, this.formatStr), function (a, b) { return a === b; }, key);
    };
    Mymont.prototype.isSameOrBefore = function (date, key) {
        return compareMyment(this, tryParse(date, this.formatStr), function (a, b) { return a <= b; }, key);
    };
    Mymont.prototype.isSameOrAfter = function (date, key) {
        return compareMyment(this, tryParse(date, this.formatStr), function (a, b) { return a >= b; }, key);
    };
    return Mymont;
}());
exports.default = Mymont;
var Duration = /** @class */ (function () {
    function Duration(params) {
        this.year = 0;
        this.month = 0;
        this.day = 0;
        this.minute = 0;
        this.second = 0;
        this.milliSeconds = 0;
        Object.assign(this, params);
        Object.seal(this);
    }
    Duration.of = function (params) {
        return new Duration(params);
    };
    return Duration;
}());
exports.Duration = Duration;
var tokenHandles = [
    {
        sortWeight: 0,
        key: "year",
        token: "YYYY",
        genRegx: "(\\d{4})",
        get: function (date) { return date.getFullYear(); },
        stringify: function (date) { return date.getFullYear().toString(); },
        parse: function (part, date) { return date.setFullYear(parseInt(part, 10)); },
    },
    {
        sortWeight: 1,
        key: "month",
        minValue: 1,
        token: /^MM?$/,
        get: function (date) { return date.getMonth(); },
        stringify: function (date) { return formatNum(date.getMonth() + 1); },
        parse: function (part, date) { return date.setMonth(parseInt(part, 10) - 1); },
    },
    {
        sortWeight: 2,
        key: "date",
        minValue: 1,
        token: /^DD?$/,
        get: function (date) { return date.getDate(); },
        stringify: function (date) { return formatNum(date.getDate()); },
        parse: function (part, date) { return date.setDate(parseInt(part, 10)); },
    },
    {
        sortWeight: 3,
        key: "hours",
        token: /^HH?$/,
        get: function (date) { return date.getHours(); },
        stringify: function (date) { return formatNum(date.getHours()); },
        parse: function (part, date) { return date.setHours(parseInt(part, 10)); },
    },
    {
        sortWeight: 4,
        key: "minutes",
        token: /^mm?$/,
        get: function (date) { return date.getMinutes(); },
        stringify: function (date) { return formatNum(date.getMinutes()); },
        parse: function (part, date) { return date.setMinutes(parseInt(part, 10)); },
    },
    {
        sortWeight: 5,
        key: "seconds",
        token: /^ss?$/,
        get: function (date) { return date.getSeconds(); },
        stringify: function (date) { return formatNum(date.getSeconds()); },
        parse: function (part, date) { return date.setSeconds(parseInt(part, 10)); },
    },
    {
        sortWeight: 6,
        key: "milliSeconds",
        token: /^zz?$/,
        get: function (date) { return date.getMilliseconds(); },
        genRegx: "(\\d{1,3})",
        stringify: function (date) { return date.getMilliseconds().toString(); },
        parse: function (part, date) { return date.setMilliseconds(parseInt(part, 10)); },
    },
];
function tryParse(date, format) {
    return typeof date === "string" ? Mymont.parse(date, format) : date;
}
function matchToken(part) {
    return tokenHandles.find(function (_a) {
        var token = _a.token;
        return token instanceof RegExp ? token.test(part) : token === part;
    });
}
function calcDuration(key, val) {
    if (val === void 0) { val = 0; }
    switch (key) {
        case "year":
            return val * 365 * 24 * 60 * 60 * 1000;
        case "month":
            return val * 30 * 24 * 60 * 60 * 1000;
        case "day":
            return val * 24 * 60 * 60 * 1000;
        case "hours":
            return val * 60 * 60 * 1000;
        case "minutes":
            return val * 60 * 1000;
        case "seconds":
            return val * 1000;
        default:
            return val;
    }
}
function lookKeys(op, cb) {
    var regx = new RegExp("^".concat(Object.keys(op).join("|"), "$"));
    return tokenHandles
        .filter(function (_a) {
        var key = _a.key;
        return regx.test(key);
    })
        .sort(sortHandles)
        .forEach(cb);
}
function sortHandles(a, b) {
    return a.sortWeight > b.sortWeight ? 1 : -1;
}
function formatDate(time, format) {
    var date = new Date(time);
    return format.replace(formatTokens, function (part) {
        var handle = matchToken(part);
        return handle ? handle.stringify(date) : "";
    });
}
function formatNum(num) {
    return num >= 10 ? num.toString() : "0" + num;
}
function parseDate(input, format) {
    var handles = [];
    var regx = new RegExp(format.replace(formatTokens, function (token) {
        var handle = matchToken(token);
        if (!handle) {
            return "";
        }
        handles.push(handle);
        return handle.genRegx || "(\\d{1,2})";
    }));
    var match = regx.exec(input);
    if (!match) {
        return -1;
    }
    var date = new Date();
    handles
        .map(function (handle, i) { return ({ handle: handle, value: match[i + 1] }); })
        .sort(function (a, b) { return sortHandles(a.handle, b.handle); })
        .forEach(function (_a) {
        var handle = _a.handle, value = _a.value;
        return handle.parse(value, date);
    });
    return date.getTime();
}
function compareMyment(a, b, expr, key) {
    if (key === void 0) { key = 'milliSeconds'; }
    if (key === "milliSeconds") {
        return expr(a.time, b.time);
    }
    else {
        return expr(a.startOf(key).time, b.startOf(key).time);
    }
}
