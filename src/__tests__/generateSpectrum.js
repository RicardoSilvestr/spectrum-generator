import {generateSpectrum} from '..';

const simpleGetWidth = () => 1;

describe('generateSpectrum', () => {
    it('should work from zero', () => {
        assertSimple({
            start: 0,
            end: 10,
            peak: 5
        });
    });

    it('should work from positive start', () => {
        assertSimple({
            start: 5,
            end: 15,
            peak: 10
        });
    });

    it('should work from negative start', () => {
        assertSimple({
            start: -15,
            end: -5,
            peak: -10
        });
    });
});

function assertSimple({start, end, peak}) {
    const spectrum = generateSpectrum([[peak, 1]], {start, end, pointsPerUnit: 1, getWidth: simpleGetWidth});
    assertSize(spectrum, end - start + 1);
    assertInterval(spectrum, start);
}

function assertSize(spectrum, size) {
    expect(spectrum.x.length).toBe(size);
    expect(spectrum.y.length).toBe(size);
}

function assertInterval(spectrum, start) {
    let expected = start;
    for (const value of spectrum.x) {
        expect(value).toBe(expected);
        expected++;
    }
}
