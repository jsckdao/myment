
const defaultFormat = 'YYYY-MM-DD HH:mm:ss';
const formatTokens = /YYYY|YY|MM?|DD?|HH?|mm?|ss?/g;

export interface IDuration {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export default class Mymont {
  static of(val: number | Date, format?: string) {
    return val instanceof Date ? new Mymont(val.getTime(), format): new Mymont(val);
  }

  static now(format?: string) {
    return Mymont.of(new Date(), format);
  }

  static parse(value: string, format = defaultFormat) {
    return Mymont.of(parseDate(value, format), format);
  }

  constructor(public readonly time: number, public readonly format = defaultFormat) {
    Object.seal(this);
  }

  toString(format?: string) {
    return formatDate(this.time, format || this.format);
  }

  move(op: IDuration) {
    // return Mymont.of(O)
  }
}

export class Duration implements IDuration {

  year = 0;

  month = 0;

  day = 0;

  minute = 0;

  second = 0;

  constructor(params: IDuration) {
    Object.assign(this, params);
  }


}


function formatDate(time: number, format: string) {
  const date = new Date(time);
  return format.replace(formatTokens, (part) => {
    if (part === 'YYYY') {
      return date.getFullYear().toString();
    } else if (/^MM?$/.test(part)) {
      return formatNum(date.getMonth() + 1);
    } else if (/^DD?$/.test(part)) {
      return formatNum(date.getDate());
    } else if (/^HH?$/.test(part)) {
      return formatNum(date.getHours());
    } else if (/^mm?$/.test(part)) {
      return formatNum(date.getMinutes());
    } else if (/^ss?$/.test(part)) {
      return formatNum(date.getSeconds());
    }
    return '';
  });
}

function formatNum(num: number) {
  return num >= 10 ? num.toString() : '0' + num;
}

function parseDate(input: string, format: string) {
  const regx = new RegExp(format.replace(formatTokens, (part) => {
    return '(\\d{2})';
  }));
  const match = regx.exec(input);
  if (!match) {
    return -1;
  }
  const date = new Date();
  match.forEach(() => {

  });
  return date.getTime();
}
