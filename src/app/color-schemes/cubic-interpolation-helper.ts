// Helper functions for cubic interpolation, see
// https://en.wikipedia.org/wiki/Cubic_Hermite_spline

// cubic interpolation between two points (xLeft, yLeft) and (xRight, yRight)
// with given tangent slopes mLeft, mRight
export function intervalCubic(xLeft, yLeft, mLeft, xRight, yRight, mRight): ((x: number) => number) {
    const d = xRight - xLeft;
    return x => {
        const t = (x - xLeft) / d;
        const tm = t - 1;
        return (1 + 2 * t) * tm * tm * yLeft
            +  t * tm * tm * d * mLeft
            +  t * t * (3 - 2 * t) * yRight
            +  t * t * tm * d * mRight;
    };
}

// piecewise cubic interpolation between mulitple points with given tangents
export function piecewiseCubic(points: {x: number, y: number, m: number}[]): ((x: number) => number) {
    // sort points by x coordinate
    points = points.sort((a, b) => a.x - b.x);
    const cubics = Array(points.length - 1);
    for (let k = 0; k < cubics.length; k++) {
        const left = points[k];
        const right = points[k + 1];
        cubics[k] = intervalCubic(left.x, left.y, left.m, right.x, right.y, right.m);
    }
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;

    return x => {
        let segmentIndex: number;
        if (x <= xMin) {
            segmentIndex = 0;
        } else if (x >= xMax) {
            segmentIndex = cubics.length - 1;
        } else {
            segmentIndex = points.findIndex(p => p.x >= x) - 1;
        }
        return cubics[segmentIndex](x);
    };
}
