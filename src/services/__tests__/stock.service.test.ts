import { describe, test, expect, beforeEach } from 'bun:test';
import StockService from '../stock.service';
import type { StockRange } from '../../db/schema';
import type { Position } from '../../types/racional.types';

describe('StockService', () => {
    const baseTestRanges: StockRange[] = [
        { value: 2, in: false },
        { value: 1, in: false },
        { value: 0.5, in: true },
        { value: -0.5, in: true },
        { value: -1, in: false },
        { value: -2, in: false },
    ];

    describe('getVariation', () => {
        describe('in range', () => {
            test('variation is inside the current range', () => {
                const position = { unrealizedPLPercent: 0.1 } as Position;
                const result = StockService.getVariation(position, baseTestRanges);

                expect(result).toBeUndefined();
            });

            test('variation is outside the range - positive ', () => {
                const position = { unrealizedPLPercent: 2.5 } as Position;

                const testRanges: StockRange[] = [
                    { value: 2, in: true },
                    { value: 1, in: false },
                    { value: 0.5, in: false },
                    { value: -0.5, in: false },
                    { value: -1, in: false },
                    { value: -2, in: false },
                ];

                const result = StockService.getVariation(position, testRanges);
                expect(result).toBeUndefined();
            });

            test('variation is outside the range - negative', () => {
                const position = { unrealizedPLPercent: -2.5 } as Position;

                const testRanges: StockRange[] = [
                    { value: 2, in: false },
                    { value: 1, in: false },
                    { value: 0.5, in: false },
                    { value: -0.5, in: false },
                    { value: -1, in: false },
                    { value: -2, in: true },
                ];

                const result = StockService.getVariation(position, testRanges);
                expect(result).toBeUndefined();
            });
        });

        describe('out of range', () => {
            test('variation is outside the current range', () => {
                const position1 = { unrealizedPLPercent: 1.9 } as Position;
                const position2 = { unrealizedPLPercent: 0.9 } as Position;
                const position3 = { unrealizedPLPercent: -0.9 } as Position;
                const position4 = { unrealizedPLPercent: -1.9 } as Position;

                const expectedResult1: StockRange[] = [
                    { value: 2, in: true },
                    { value: 1, in: true },
                    { value: 0.5, in: false },
                    { value: -0.5, in: false },
                    { value: -1, in: false },
                    { value: -2, in: false },
                ];
                const expectedResult2: StockRange[] = [
                    { value: 2, in: false },
                    { value: 1, in: true },
                    { value: 0.5, in: true },
                    { value: -0.5, in: false },
                    { value: -1, in: false },
                    { value: -2, in: false },
                ];
                const expectedResult3: StockRange[] = [
                    { value: 2, in: false },
                    { value: 1, in: false },
                    { value: 0.5, in: false },
                    { value: -0.5, in: true },
                    { value: -1, in: true },
                    { value: -2, in: false },
                ];
                const expectedResult4: StockRange[] = [
                    { value: 2, in: false },
                    { value: 1, in: false },
                    { value: 0.5, in: false },
                    { value: -0.5, in: false },
                    { value: -1, in: true },
                    { value: -2, in: true },
                ];

                const result1 = StockService.getVariation(position1, baseTestRanges);
                const result2 = StockService.getVariation(position2, baseTestRanges);
                const result3 = StockService.getVariation(position3, baseTestRanges);
                const result4 = StockService.getVariation(position4, baseTestRanges);

                expect(result1).toEqual(expectedResult1);
                expect(result2).toEqual(expectedResult2);
                expect(result3).toEqual(expectedResult3);
                expect(result4).toEqual(expectedResult4);
            });

            test('variation is outside the current range - positive', () => {
                const position = { unrealizedPLPercent: 3 } as Position;

                const expectedResult: StockRange[] = [
                    { value: 2, in: true },
                    { value: 1, in: false },
                    { value: 0.5, in: false },
                    { value: -0.5, in: false },
                    { value: -1, in: false },
                    { value: -2, in: false },
                ];

                const result = StockService.getVariation(position, baseTestRanges);
                expect(result).toEqual(expectedResult);
            });
            test('variation is outside the current range - negative', () => {
                const position = { unrealizedPLPercent: -3 } as Position;

                const expectedResult: StockRange[] = [
                    { value: 2, in: false },
                    { value: 1, in: false },
                    { value: 0.5, in: false },
                    { value: -0.5, in: false },
                    { value: -1, in: false },
                    { value: -2, in: true },
                ];

                const result = StockService.getVariation(position, baseTestRanges);
                expect(result).toEqual(expectedResult);
            });
        });
    });
});
