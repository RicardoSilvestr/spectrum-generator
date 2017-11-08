const gaussianFactor = 5; // after 5 the value is nearly 0, nearly no artifacts
const gaussianWidth = 1000; // half height peak Width in point
const gaussian = [];
const ratio = Math.sqrt(Math.log(4));
for (let i = 0; i <= gaussianWidth * gaussianFactor; i++) {
    gaussian.push(Math.exp(-1 / 2 * Math.pow((i - (gaussianFactor * gaussianWidth / 2)) * 2 / gaussianWidth * ratio, 2)));
}

function defaultGetWidth(value) {
    return 1 + 3 * value / 1000;
}

const kStart = Symbol('start');
const kEnd = Symbol('end');
const kPointsPerUnit = Symbol('pointsPerUnit');
const kGetWidth = Symbol('getWidth');
const kSize = Symbol('size');
const kSpectrum = Symbol('spectrum');

/**
 * @class SpectrumGenerator
 */
export class SpectrumGenerator {
    /**
     * @param {object} [options]
     * @param {number} [options.start=0] - First x value (inclusive)
     * @param {number} [options.end=1000] - Last x value (inclusive)
     * @param {number} [options.pointsPerUnit=5] - Number of values between each x
     * @param {function} [options.getWidth] - Returns the width of a peak for a given value. Defaults to (1 + 3 * value / 1000)
     */
    constructor(options = {}) {
        const {
            start = 0,
            end = 1000,
            pointsPerUnit = 5,
            getWidth = defaultGetWidth
        } = options;

        assertInteger(start, 'start');
        assertInteger(end, 'end');
        assertInteger(pointsPerUnit, 'pointsPerUnit');

        if (end <= start) {
            throw new RangeError('end option must be larger than start');
        }

        if (typeof getWidth !== 'function') {
            throw new TypeError('getWidth option must be a function');
        }

        this[kStart] = start;
        this[kEnd] = end;
        this[kPointsPerUnit] = pointsPerUnit;
        this[kGetWidth] = getWidth;

        this[kSize] = (end - start) * pointsPerUnit + 1;

        this.reset();
    }

    /**
     * Add a serie of peaks to the spectrum.
     * @param {Array<Array<number>>} peaks
     * @return {this}
     */
    addPeaks(peaks) {
        if (!Array.isArray(peaks)) {
            throw new TypeError('peaks must be an array');
        }
        for (const peak of peaks) {
            this.addPeak(peak);
        }
        return this;
    }

    /**
     * Add a single peak to the spectrum.
     * @param {Array<number>} peak
     * @return {this}
     */
    addPeak(peak) {
        if (!Array.isArray(peak) || peak.length !== 2) {
            throw new Error('peak must be an array with two values');
        }

        const value = peak[0];
        const intensity = peak[1];
        const width = this[kGetWidth](value);
        const firstValue = value - (width / 2 * gaussianFactor);
        const lastValue = value + (width / 2 * gaussianFactor);

        const firstPoint = Math.max(Math.ceil(firstValue * this[kPointsPerUnit]), this[kStart]);
        const lastPoint = Math.min(Math.floor(lastValue * this[kPointsPerUnit]), this[kEnd]);
        const middlePoint = (firstPoint + lastPoint) / 2;

        for (var j = firstPoint; j <= lastPoint; j++) {
            var gaussianIndex = Math.floor(gaussianWidth / width * (j - middlePoint) / this[kPointsPerUnit] + gaussianFactor * gaussianWidth / 2);
            if (gaussianIndex >= 0 && gaussianIndex < gaussian.length) {
                this[kSpectrum].y[j - this[kStart]] += gaussian[gaussianIndex] * intensity;
            }
        }

        return this;
    }

    /**
     * Get the generated spectrum.
     * @param {boolean} [copy=true] - If true, returns a copy of the spectrum.
     * Otherwise, return the internal value that can be mutated if subsequent calls to addPeak are made.
     * @return {object}
     */
    getSpectrum(copy = true) {
        if (copy) {
            return {
                x: this[kSpectrum].x.slice(),
                y: this[kSpectrum].y.slice()
            };
        } else {
            return this[kSpectrum];
        }
    }

    /**
     * Resets the generator with an empty spectrum.
     * @return {this}
     */
    reset() {
        const spectrum = this[kSpectrum] = {
            x: [],
            y: []
        };

        const interval = 1 / this[kPointsPerUnit];
        const js = [];
        for (let j = 0; j < this[kPointsPerUnit]; j++) {
            js.push(j * interval);
        }

        for (let i = this[kStart]; i < this[kEnd]; i++) {
            for (let j = 0; j < this[kPointsPerUnit]; j++) {
                spectrum.x.push(i + js[j]);
                spectrum.y.push(0);
            }
        }

        spectrum.x.push(this[kEnd]);
        spectrum.y.push(0);

        return this;
    }
}

function assertInteger(value, name) {
    if (!Number.isInteger(value)) {
        throw new TypeError(`${name} option must be an integer`);
    }
}

export function generateSpectrum(peaks, options) {
    const generator = new SpectrumGenerator(options);
    generator.addPeaks(peaks);
    return generator.getSpectrum();
}
