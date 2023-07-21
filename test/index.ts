import { describe, it } from 'mocha';
import * as expect from 'expect';
import M from '../src/myment';

describe('parse and format', () => {

  it('parse', () => {
    const d = M.parse('2019-05-15 10:20:30', 'YYYY-MM-DD HH:mm:ss');
    expect(d.year).toBe(2019);
    expect(d.month).toBe(5);
    expect(d.date).toBe(15);
    expect(d.hours).toBe(10);
    expect(d.minutes).toBe(20);
    expect(d.seconds).toBe(30);
  });

  it('format', () => {
    const d = M.parse('2019-05-15 10:20:30');
    expect(d.toString()).toBe('2019-05-15 10:20:30');
    expect(d.toString('YYYY/MM/DD HH:mm:ss')).toBe('2019/05/15 10:20:30');
  });
});


describe('move', () => {
  it('move', () => {
    const d = M.parse('2019-05-15 10:20:30');
    expect(d.move({ year: 1 })).toHaveProperty('year', 2020);
    expect(d.move({ year: -1 }).year).toBe(2018);
    const d2 = M.parse('2020-02-29 10:20:30');
    expect(d2.move({ year: 1 }).toString()).toBe('2021-02-28 10:20:30');
  })
});

describe('startOf', () => {
  it('startOf', () => {
    const d = M.parse('2019-05-15 10:20:30');
    expect(d.startOf('year').toString()).toBe('2019-01-01 00:00:00');
    expect(d.startOf('month').toString()).toBe('2019-05-01 00:00:00');
    expect(d.startOf('date').toString()).toBe('2019-05-15 00:00:00');
    expect(d.startOf('hours').toString()).toBe('2019-05-15 10:00:00');
    expect(d.startOf('minutes').toString()).toBe('2019-05-15 10:20:00');
    expect(d.startOf('seconds').toString()).toBe('2019-05-15 10:20:30');
  });
});

describe('endOf', () => {
  it('endOf', () => {
    const d = M.parse('2019-05-15 10:20:30');
    expect(d.endOf('year').toString()).toBe('2019-12-31 23:59:59');
    expect(d.endOf('month').toString()).toBe('2019-05-31 23:59:59');
    expect(d.endOf('date').toString()).toBe('2019-05-15 23:59:59');
    expect(d.endOf('hours').toString()).toBe('2019-05-15 10:59:59');
    expect(d.endOf('minutes').toString()).toBe('2019-05-15 10:20:59');
    expect(d.endOf('seconds').toString()).toBe('2019-05-15 10:20:30');
  });
});

describe('compare', () => {
  it('isBefore', () => {
    const d = M.parse('2019-05-15 10:20:30');
    expect(d.isBefore('2019-05-15 10:20:31', 'seconds')).toBe(true);
    expect(d.isBefore('2019-05-15 10:20:30', 'seconds')).toBe(false);
    expect(d.isBefore('2019-05-15 10:20:29', 'seconds')).toBe(false);

    expect(d.isBefore('2019-05-15 10:21:30', 'minutes')).toBe(true);
    expect(d.isBefore('2019-05-15 10:20:50', 'minutes')).toBe(false);
    expect(d.isBefore('2019-05-15 10:19:30', 'minutes')).toBe(false);

    expect(d.isBefore('2019-05-15 11:20:30', 'hours')).toBe(true);
    expect(d.isBefore('2019-05-15 10:50:30', 'hours')).toBe(false);
    expect(d.isBefore('2019-05-15 09:20:30', 'hours')).toBe(false);

    expect(d.isBefore('2019-05-16 10:20:30', 'date')).toBe(true);
    expect(d.isBefore('2019-05-15 20:20:30', 'date')).toBe(false);
    expect(d.isBefore('2019-05-14 10:20:30', 'date')).toBe(false);

    expect(d.isBefore('2019-06-15 10:20:30', 'month')).toBe(true);
    expect(d.isBefore('2019-05-25 10:20:30', 'month')).toBe(false);
    expect(d.isBefore('2019-04-15 10:20:30', 'month')).toBe(false);

    expect(d.isBefore('2020-05-15 10:20:30', 'year')).toBe(true);
    expect(d.isBefore('2019-06-15 10:20:30', 'year')).toBe(false);
    expect(d.isBefore('2018-05-15 10:20:30', 'year')).toBe(false);
  });

  it('isAfter', () => {
    const d = M.parse('2019-05-15 10:20:30');
    expect(d.isAfter('2019-05-15 10:20:31', 'seconds')).toBe(false);
    expect(d.isAfter('2019-05-15 10:20:30', 'seconds')).toBe(false);
    expect(d.isAfter('2019-05-15 10:20:29', 'seconds')).toBe(true);

    expect(d.isAfter('2019-05-15 10:21:30', 'minutes')).toBe(false);
    expect(d.isAfter('2019-05-15 10:20:50', 'minutes')).toBe(false);
    expect(d.isAfter('2019-05-15 10:19:30', 'minutes')).toBe(true);

    expect(d.isAfter('2019-05-15 11:20:30', 'hours')).toBe(false);
    expect(d.isAfter('2019-05-15 10:50:30', 'hours')).toBe(false);
    expect(d.isAfter('2019-05-15 09:20:30', 'hours')).toBe(true);

    expect(d.isAfter('2019-05-16 10:20:30', 'date')).toBe(false);
    expect(d.isAfter('2019-05-15 20:20:30', 'date')).toBe(false);
    expect(d.isAfter('2019-05-14 10:20:30', 'date')).toBe(true);

    expect(d.isAfter('2019-06-15 10:20:30', 'month')).toBe(false);
    expect(d.isAfter('2019-05-25 10:20:30', 'month')).toBe(false);
    expect(d.isAfter('2019-04-15 10:20:30', 'month')).toBe(true);

    expect(d.isAfter('2020-05-15 10:20:30', 'year')).toBe(false);
    expect(d.isAfter('2019-06-15 10:20:30', 'year')).toBe(false);
    expect(d.isAfter('2018-05-15 10:20:30', 'year')).toBe(true);
  });
})