import { getMatchers } from "expect/build/jestMatchersObject";

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

export default class Mymont implements IDate {
  static of(val: number | Date, format?: string) {
    return val instanceof Date
      ? new Mymont(val.getTime(), format)
      : new Mymont(val);
  }

  static now(format?: string) {
    return Mymont.of(new Date(), format);
  }

  static parse(value: string, format = defaultFormat) {
    return Mymont.of(parseDate(value, format), format);
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
    public readonly format = defaultFormat
  ) {
    Object.seal(this);
  }

  toString(format?: string) {
    return formatDate(this.time, format || this.format);
  }

  move(op: IDuration) {
    return this.change(mapDurationToDate(op, (key, val) => this[key] + val));
  }

  change(targetDate: IDate) {
    const d = new Date(this.time);
    lookKeys(targetDate, (h) => { 
      const val = targetDate[h.key];
      console.log('change date', h.key, val );
      if (val !== undefined) {
        h.parse(val.toString(), d);
      }
    });
    return Mymont.of(d);
  }

  // change()
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
  genRegx?: string;
  get?: (date: Date) => number;
  parse: (part: string, date: Date) => void;
  stringify: (date: Date) => string;
}

const tokenHandles: TokenHandle[] = [
  {
    sortWeight: 0,
    key: 'year',
    token: "YYYY",
    genRegx: '(\\d{4})',
    get: (date) => date.getFullYear(),
    stringify: (date) => date.getFullYear().toString(),
    parse: (part, date) => date.setFullYear(parseInt(part, 10)),
  },
  {
    sortWeight: 1,
    key: 'month',
    token: /^MM?$/,
    get: (date) => date.getMonth(),
    stringify: (date) => formatNum(date.getMonth() + 1),
    parse: (part, date) => date.setMonth(parseInt(part, 10) - 1),
  },
  {
    sortWeight: 2,
    key: 'date',
    token: /^DD?$/,
    get: (date) => date.getDate(),
    stringify: (date) => formatNum(date.getDate()),
    parse: (part, date) => date.setDate(parseInt(part, 10)),
  },
  {
    sortWeight: 3,
    key: 'hours',
    token: /^HH?$/,
    get: (date) => date.getHours(),
    stringify: (date) => formatNum(date.getHours()),
    parse: (part, date) => date.setHours(parseInt(part, 10)),
  },
  {
    sortWeight: 4,
    key: 'minutes',
    token: /^mm?$/,
    get: (date) => date.getMinutes(),
    stringify: (date) => formatNum(date.getMinutes()),
    parse: (part, date) => date.setMinutes(parseInt(part, 10))
  },
  {
    sortWeight: 5,
    key: 'seconds',
    token: /^ss?$/,
    get: (date) => date.getSeconds(),
    stringify: (date) => formatNum(date.getSeconds()),
    parse: (part, date) => date.setSeconds(parseInt(part, 10))
  },
  {
    sortWeight: 6,
    key: 'milliSeconds',
    token: /^zz?$/,
    get: (date) => date.getMilliseconds(),
    genRegx: '(\\d{1,3})',
    stringify: (date) => date.getMilliseconds().toString(),
    parse: (part, date) => date.setMilliseconds(parseInt(part, 10))
  }
];

function matchToken(part: string) {
  return tokenHandles.find(({ token }) => token instanceof RegExp ? token.test(part) : token === part);
}

function mapDurationToDate(op: IDuration, cb: (key: DateKeys, value: number) => number) {
  const res: IDate = {};
  const values: IDate = op.day === undefined ? op : { ... op, date: op.day };
  lookKeys(values, (handle) => res[handle.key] = cb(handle.key, values[handle.key]!));
  return res;
}

function lookKeys(op: IDate, cb: (handle: TokenHandle) => void) {
  const regx = new RegExp(`^${Object.keys(op).join('|')}$`);
  return tokenHandles.filter(({ key }) => regx.test(key)).sort(sortHandles).forEach(cb);
}

function sortHandles(a: TokenHandle, b: TokenHandle) {
  return a.sortWeight > b.sortWeight ? 1 : -1;
}

function formatDate(time: number, format: string) {
  const date = new Date(time);
  return format.replace(formatTokens, (part) => {
    const handle = matchToken(part);
    return handle ? handle.stringify(date) : '';
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
        return '';
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
  handles.map((handle, i) => ({ handle, value: match[i + 1] }))
    .sort((a, b) => sortHandles(a.handle, b.handle))
    .forEach(({ handle, value }) => handle.parse(value, date));

  return date.getTime();
}
