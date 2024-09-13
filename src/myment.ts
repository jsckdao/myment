const defaultFormat = "YYYY-MM-DD HH:mm:ss";
const formatTokens = /YYYY|YY|MM?|DD?|HH?|mm?|ss?|zz?/g;

export interface IDuration {
  year?: number;
  month?: number;
  day?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliSeconds?: number;
}

export interface IDate {
  year?: number;
  month?: number;
  date?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliSeconds?: number;
}

type DateKeys = keyof IDate;

type DurationKeys = keyof IDuration;

/**
 * @class Mymont
 */
export default class Mymont implements IDate {
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
  static of(val: number | Date, formatStr?: string) {
    return val instanceof Date
      ? new Mymont(val.getTime(), formatStr)
      : new Mymont(val);
  }

  /**
   * 获取当前时间的 Mymont 实例
   * @param format 格式化字符串
   * @returns Mymont 实例
   * @example
   * Mymont.now();
   * Mymont.now('YYYY-MM-DD HH:mm:ss');
   */
  static now(format?: string) {
    return Mymont.of(new Date(), format);
  }

  /**
   * 解析时间字符串
   * @param value 时间字符串
   * @param format 格式化字符串
   * @returns Mymont 实例
   * @example
   * Mymont.parse('2019-05-15 10:20:30', 'YYYY-MM-DD HH:mm:ss');
   * Mymont.parse('2019-05-15 10:20:30');
   */
  static parse(value: string, formatStr = defaultFormat) {
    return Mymont.of(parseDate(value, formatStr), formatStr);
  }

  static during(op: IDuration) {
    return Duration.of(op);
  }

  get year() {
    return new Date(this.time).getFullYear();
  }

  get month() {
    return new Date(this.time).getMonth() + 1;
  }

  get date() {
    return new Date(this.time).getDate();
  }

  get hours() {
    return new Date(this.time).getHours();
  }

  get minutes() {
    return new Date(this.time).getMinutes();
  }

  get seconds() {
    return new Date(this.time).getSeconds();
  }

  get weekDay() {
    return new Date(this.time).getDay();
  }

  get milliSeconds() {
    return new Date(this.time).getMilliseconds();
  }

  private constructor(
    public readonly time: number,
    public readonly formatStr = defaultFormat
  ) {
    Object.seal(this);
  }

  /**
   * 格式化日期
   * @param format 格式化字符串, 默认为 YYYY-MM-DD HH:mm:ss
   * @returns
   */
  toString(formatStr?: string) {
    return formatDate(this.time, formatStr || this.formatStr);
  }


  format(formatStr?: string) {
    return this.toString(formatStr);
  }

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
  move(op: IDuration) {
    return Mymont.of(
      Object.entries(op).reduce((t, [k, v]) => {
        return t + calcDuration(k as DurationKeys, v);
      }, this.time)
    );
  }

  /**
   * 修改日期, 返回新的 Mymont 实例
   * @param targetDate 目标日期，只会修改传入的日期中存在的字段，未传入的字段会沿用当前实例的值
   * @returns  新的 Mymont 实例
   */
  change(targetDate: IDate) {
    const d = new Date(this.time);
    lookKeys(targetDate, (h) => {
      const val = targetDate[h.key];
      if (val !== undefined) {
        h.parse(val.toString(), d);
      }
    });
    return Mymont.of(d);
  }

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
  startOf(key: DateKeys) {
    const i = tokenHandles.findIndex((h) => h.key === key);
    if (i === -1 || key === "milliSeconds") {
      return this;
    }
    const targetValue = tokenHandles.slice(i + 1).reduce(
      (d, h) => ({
        ...d,
        [h.key]: h.minValue || 0,
      }),
      {} as IDate
    );
    return this.change(targetValue);
  }

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
  endOf(key: DateKeys) {
    const i = tokenHandles.findIndex((h) => h.key === key);
    if (key === "milliSeconds") {
      return this;
    }
    return this.move({ [key === 'date' ? 'day' : key]: 1 })
      .startOf(key)
      .move({ milliSeconds: -1 });
  }

  isBefore(date: Mymont | string, key?: DateKeys) {
    return compareMyment(this, tryParse(date, this.formatStr), (a, b) => a < b, key);
  }

  isAfter(date: Mymont | string, key?: DateKeys) {
    return compareMyment(this, tryParse(date, this.formatStr), (a, b) => a > b, key);
  }

  isSame(date: Mymont | string, key?: DateKeys) {
    return compareMyment(this, tryParse(date, this.formatStr), (a, b) => a === b, key);
  }

  isSameOrBefore(date: Mymont | string, key?: DateKeys) {
    return compareMyment(this, tryParse(date, this.formatStr), (a, b) => a <= b, key);
  }

  isSameOrAfter(date: Mymont | string, key?: DateKeys) {
    return compareMyment(this, tryParse(date, this.formatStr), (a, b) => a >= b, key);
  }

  measure(date: Mymont | string): IDuration {
    const target = tryParse(date, this.formatStr);
    let diff = this.time - target.time;
    const duration: IDuration = {};
    lookKeys(this, (h) => {
      const k = h.key === 'date' ? 'day' : h.key;
      if (diff === 0) {
        duration[k] = 0;
        return;
      }
      const _round = diff < 0 ? Math.ceil : Math.floor;
      duration[k] = _round(diff / calcDuration(h.key === 'date' ? 'day' : k));
      diff %= calcDuration(k);
    });
    return duration;
  }
}

export class Duration implements IDuration {
  year = 0;

  month = 0;

  day = 0;

  minute = 0;

  second = 0;

  milliSeconds = 0;

  private constructor(params: IDuration) {
    Object.assign(this, params);
    Object.seal(this);
  }

  static of(params: IDuration) {
    return new Duration(params);
  }
}

interface TokenHandle {
  sortWeight: number;
  key: DateKeys;
  token: string | RegExp;
  minValue?: number;
  genRegx?: string;
  get?: (date: Date) => number;
  parse: (part: string, date: Date) => void;
  stringify: (date: Date) => string;
}

const tokenHandles: TokenHandle[] = [
  {
    sortWeight: 0,
    key: "year",
    token: "YYYY",
    genRegx: "(\\d{4})",
    get: (date) => date.getFullYear(),
    stringify: (date) => date.getFullYear().toString(),
    parse: (part, date) => date.setFullYear(parseInt(part, 10)),
  },
  {
    sortWeight: 1,
    key: "month",
    minValue: 1,
    token: /^MM?$/,
    get: (date) => date.getMonth(),
    stringify: (date) => formatNum(date.getMonth() + 1),
    parse: (part, date) => date.setMonth(parseInt(part, 10) - 1),
  },
  {
    sortWeight: 2,
    key: "date",
    minValue: 1,
    token: /^DD?$/,
    get: (date) => date.getDate(),
    stringify: (date) => formatNum(date.getDate()),
    parse: (part, date) => date.setDate(parseInt(part, 10)),
  },
  {
    sortWeight: 3,
    key: "hours",
    token: /^HH?$/,
    get: (date) => date.getHours(),
    stringify: (date) => formatNum(date.getHours()),
    parse: (part, date) => date.setHours(parseInt(part, 10)),
  },
  {
    sortWeight: 4,
    key: "minutes",
    token: /^mm?$/,
    get: (date) => date.getMinutes(),
    stringify: (date) => formatNum(date.getMinutes()),
    parse: (part, date) => date.setMinutes(parseInt(part, 10)),
  },
  {
    sortWeight: 5,
    key: "seconds",
    token: /^ss?$/,
    get: (date) => date.getSeconds(),
    stringify: (date) => formatNum(date.getSeconds()),
    parse: (part, date) => date.setSeconds(parseInt(part, 10)),
  },
  {
    sortWeight: 6,
    key: "milliSeconds",
    token: /^zz?$/,
    get: (date) => date.getMilliseconds(),
    genRegx: "(\\d{1,3})",
    stringify: (date) => date.getMilliseconds().toString(),
    parse: (part, date) => date.setMilliseconds(parseInt(part, 10)),
  },
];

function tryParse(date: Mymont | string, format?: string) {
  return typeof date === "string" ? Mymont.parse(date, format) : date;
}

function matchToken(part: string) {
  return tokenHandles.find(({ token }) =>
    token instanceof RegExp ? token.test(part) : token === part
  );
}

function calcDuration(key: DurationKeys, val: number = 0) {
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

function lookKeys(op: IDate, cb: (handle: TokenHandle) => void) {
  return tokenHandles
    .filter(({ key }) => key in op)
    .sort(sortHandles)
    .forEach(cb);
}

function sortHandles(a: TokenHandle, b: TokenHandle) {
  return a.sortWeight > b.sortWeight ? 1 : -1;
}

function formatDate(time: number, format: string) {
  const date = new Date(time);
  return format.replace(formatTokens, (part) => {
    const handle = matchToken(part);
    return handle ? handle.stringify(date) : "";
  });
}

function formatNum(num: number) {
  return num >= 10 ? num.toString() : "0" + num;
}

function parseDate(input: string, format: string) {
  const handles: Array<TokenHandle> = [];
  const regx = new RegExp(
    format.replace(formatTokens, (token) => {
      const handle = matchToken(token);
      if (!handle) {
        return "";
      }
      handles.push(handle);
      return handle.genRegx || "(\\d{1,2})";
    })
  );
  const match = regx.exec(input);
  if (!match) {
    return -1;
  }
  const date = new Date();
  handles
    .map((handle, i) => ({ handle, value: match[i + 1] }))
    .sort((a, b) => sortHandles(a.handle, b.handle))
    .forEach(({ handle, value }) => handle.parse(value, date));

  return date.getTime();
}

function compareMyment(a: Mymont, b: Mymont, expr: (a: number, b: number) => boolean, key: DateKeys = 'milliSeconds') {
  if (key === "milliSeconds") {
    return expr(a.time, b.time);
  } else {
    return expr(a.startOf(key).time, b.startOf(key).time);
  }
}