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
  })
});