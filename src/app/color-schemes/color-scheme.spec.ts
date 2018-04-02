import { ColorScheme } from './color-scheme';
import { Color } from './color';

describe('2-point interpolation', function() {
    const linear = ColorScheme.cubicInterpolation('test', [
        { position: 0.0, color: { r: 0, g: 255, b: 127 } },
        { position: 1.0, color: { r: 255, g: 0, b: 127 } }
    ]);
    it('interpolates linearly', function() {
        expect(linear.coloring(0.25)).toEqual(new Color(64, 191, 127));
        expect(linear.coloring(0.5)).toEqual(new Color(128, 128, 127));
        expect(linear.coloring(0.75)).toEqual(new Color(191, 64, 127));
    });
    it('has the given label', function() {
        expect(linear.label).toBe('test');
    });
});

describe('simple 3-point interpolation', function() {
    const simple = ColorScheme.cubicInterpolation('testCubic', [
        { position: 0.0, color: new Color(0, 0, 0) },
        { position: 0.3, color: new Color(100, 100, 100) },
        { position: 1.0, color: new Color(50, 50, 50) }
    ]);
    it('has given colors at predefined positions', function() {
        expect(simple.coloring(0.0)).toEqual(new Color(0, 0, 0));
        expect(simple.coloring(0.3)).toEqual(new Color(100, 100, 100));
        expect(simple.coloring(1.0)).toEqual(new Color(50, 50, 50));
    });
});
