import { piecewiseCubic } from './cubic-interpolation-helper';
import { Color } from './color';

export class ColorScheme {
    constructor(
        // label for the color scheme
        readonly label: string,
        // function that gives a color for each value between 0 and 1
        readonly coloring: (_: number) => Color
    ) { }

    // create a ColorScheme from some control points using a piecewise cubic function
    // colorPoints have to define a color for 0 and 1, otherwise this will break!
    static cubicInterpolation(label: string, colorPoints: { position: number, color: Color }[]): ColorScheme {
        // sort by position
        colorPoints = colorPoints.sort((a, b) => a.position - b.position);
        const count = colorPoints.length;
        const components = ['r', 'g', 'b']; // color components

        // secantSlopes[k] = slope between colorPoints[k] and colorPoints[k + 1]
        const secantSlopes = Array(count - 1);
        for (let k = 0; k < count - 1; k++) {
            const dPos = colorPoints[k + 1].position - colorPoints[k].position;
            secantSlopes[k] = { };
            // slope for each color-component (RGB)
            components.forEach(component => {
                secantSlopes[k][component] = (colorPoints[k + 1].color[component] - colorPoints[k].color[component]) / dPos;
            });
        }

        // tangent slopes in each point
        const slopes = Array(count);
        slopes[0] = secantSlopes[0];
        slopes[count - 1] = secantSlopes[count - 2];
        for (let k = 1; k < count - 1; k++) {
            // average between adjacent slopes
            slopes[k] = { };
            components.forEach(component => {
                slopes[k][component] = (secantSlopes[k - 1][component] + secantSlopes[k][component]) / 2;
            });
        }

        // interpolating cubic for each component (RGB)
        const cubics = { };
        components.forEach(component => {
            const points = colorPoints.map((p, i) => {
                return {
                    x: p.position,
                    y: p.color[component],
                    m: slopes[i][component]
                };
            });
            cubics[component] = piecewiseCubic(points);
        });

        // the full interpolating function
        const interpolating = x => {
            return new Color(
                ColorScheme.toUInt8(cubics['r'](x)),
                ColorScheme.toUInt8(cubics['g'](x)),
                ColorScheme.toUInt8(cubics['b'](x))
            );
        };

        return new ColorScheme(label, interpolating);
    }

    private static toUInt8(x: number): number {
        if (x <= 0) {
            return 0;
        }
        if (x >= 255) {
            return 255;
        }
        return Math.round(x);
    }
}
