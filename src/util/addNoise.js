import { randomUniform, randomNormal } from 'd3-random';
import seedrandom from 'seedrandom';
/**
 * Add noise to the spectrum
 * @param {object} [data] - Your spectrum data in the format {x:[x1, x2, ...], y:[y1, y2, ...]}
 * @param {number} [percent = 0] - Noise's amplitude in percents of the spectrum max value
 * @param {object} [options={}]
 * @param {number} [options.seed] - Seed for a deterministic sequence of random number
 * @param {string} [options.distribution='uniform'] - Type of random: 'uniform' (true random), 'normal' (gaussian distribution),
 * @return {data} data
 */
export default function addNoise(data, percent = 0, options = {}) {
  const { distribution = 'uniform', seed } = options;

  let generateRandomNumber;
  switch (distribution) {
    case 'uniform': {
      generateRandomNumber = getRandom(randomUniform, seed, -0.5, 0.5);
      break;
    }
    case 'normal': {
      generateRandomNumber = getRandom(randomNormal, seed);
      break;
    }
    default:
      throw new Error(`Unknown distribution ${options.distribution}`);
  }

  if (!percent) return data;
  var ys = data.y;
  var factor = (percent * findMax(ys)) / 100;
  for (let i = 0; i < ys.length; i++) {
    ys[i] += generateRandomNumber() * factor;
  }
  return data;
}

function getRandom(func, seed, ...args) {
  return typeof seed === 'number'
    ? func.source(seedrandom(seed))(...args)
    : func(...args);
}

function findMax(array) {
  let max = Number.MIN_VALUE;
  for (let item of array) {
    if (item > max) max = item;
  }
  return max;
}
