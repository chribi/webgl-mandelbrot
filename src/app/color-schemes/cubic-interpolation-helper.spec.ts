import { intervalCubic, piecewiseCubic } from "./cubic-interpolation-helper";
const epsilon = 1e-5;

describe('intervalCubic', function() {
    it('is linear with slope of secant', function() {
        const c = intervalCubic(1, 2, 2.5, 3, 7, 2.5);
        expect(c(1)).toBeCloseTo(2, epsilon);
        expect(c(1.5)).toBeCloseTo(3.25, epsilon);
        expect(c(2)).toBeCloseTo(4.5, epsilon);
        expect(c(2.5)).toBeCloseTo(5.75, epsilon);
        expect(c(3)).toBeCloseTo(7, epsilon);
    });

    it('takes given value at boundary', function() {
        const c = intervalCubic(0, 12.3, 0, 2, 32.1, 1);
        expect(c(0)).toBeCloseTo(12.3, epsilon);
        expect(c(2)).toBeCloseTo(32.1, epsilon);
    });

    // approximation of f'(x)
    const diff = (f, x) => {
        const h = 1e-4;
        return (f(x + h) - f(x - h)) / (2 * h);
    };
    it('has given slope at boundary', function() {
        const c = intervalCubic(0, 12.3, 0.1, 2, 32.1, 1.1);
        expect(diff(c, 0)).toBeCloseTo(0.1, epsilon);
        expect(diff(c, 2)).toBeCloseTo(1.1, epsilon);
    });
});

describe('piecewiseCubic', function() {
    it('is defined by intervalCubic on segments', function() {
        const points = [
            { x: 0, y: 2, m: 3},
            { x: 3, y: 4, m: 0},
            { x: 4, y: 3, m: -1}
        ];
        const c = piecewiseCubic(points);
        const c1 = intervalCubic(points[0].x, points[0].y, points[0].m,
            points[1].x, points[1].y, points[1].m);
        const c2 = intervalCubic(points[1].x, points[1].y, points[1].m,
            points[2].x, points[2].y, points[2].m);

        expect(c(-1)).toEqual(c1(-1));
        expect(c(0)).toEqual(c1(0));
        expect(c(0.5)).toEqual(c1(0.5));
        expect(c(2)).toEqual(c1(2));
        expect(c(3)).toEqual(c1(3));

        expect(c(3)).toEqual(c2(3));
        expect(c(3.5)).toEqual(c2(3.5));
        expect(c(4)).toEqual(c2(4));
        expect(c(4.5)).toEqual(c2(4.5));
    });
});
