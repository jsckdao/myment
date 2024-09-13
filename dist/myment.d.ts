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
/**
 * @class Mymont
 */
export default class Mymont implements IDate {
    readonly time: number;
    readonly formatStr: string;
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
    static of(val: number | Date, formatStr?: string): Mymont;
    /**
     * 获取当前时间的 Mymont 实例
     * @param format 格式化字符串
     * @returns Mymont 实例
     * @example
     * Mymont.now();
     * Mymont.now('YYYY-MM-DD HH:mm:ss');
     */
    static now(format?: string): Mymont;
    /**
     * 解析时间字符串
     * @param value 时间字符串
     * @param format 格式化字符串
     * @returns Mymont 实例
     * @example
     * Mymont.parse('2019-05-15 10:20:30', 'YYYY-MM-DD HH:mm:ss');
     * Mymont.parse('2019-05-15 10:20:30');
     */
    static parse(value: string, formatStr?: string): Mymont;
    static during(op: IDuration): Duration;
    get year(): number;
    get month(): number;
    get date(): number;
    get hours(): number;
    get minutes(): number;
    get seconds(): number;
    get weekDay(): number;
    get milliSeconds(): number;
    private constructor();
    /**
     * 格式化日期
     * @param format 格式化字符串, 默认为 YYYY-MM-DD HH:mm:ss
     * @returns
     */
    toString(formatStr?: string): string;
    format(formatStr?: string): string;
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
    move(op: IDuration): Mymont;
    /**
     * 修改日期, 返回新的 Mymont 实例
     * @param targetDate 目标日期，只会修改传入的日期中存在的字段，未传入的字段会沿用当前实例的值
     * @returns  新的 Mymont 实例
     */
    change(targetDate: IDate): Mymont;
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
    startOf(key: DateKeys): Mymont;
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
    endOf(key: DateKeys): Mymont;
    isBefore(date: Mymont | string, key?: DateKeys): boolean;
    isAfter(date: Mymont | string, key?: DateKeys): boolean;
    isSame(date: Mymont | string, key?: DateKeys): boolean;
    isSameOrBefore(date: Mymont | string, key?: DateKeys): boolean;
    isSameOrAfter(date: Mymont | string, key?: DateKeys): boolean;
    measure(date: Mymont | string): IDuration;
}
export declare class Duration implements IDuration {
    year: number;
    month: number;
    day: number;
    minute: number;
    second: number;
    milliSeconds: number;
    private constructor();
    static of(params: IDuration): Duration;
}
export {};
