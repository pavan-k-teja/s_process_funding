import { optimize } from 'mathjs';

function nearestPoint(a, b, px, py) {
  const k = 3;

  // Objective function
  const objective = ([x, y]) => Math.pow(x - px, 2) + Math.pow(y - py, 2);

  // Constraint
  const constraint = ([x, y]) => Math.pow(x / a, k) + Math.pow(y / b, k) - 1;

  // Use mathjs optimization
  const result = optimize(objective, [px, py], {
    constraints: [{ f: constraint, type: 'eq' }],
    method: 'gradient-descent',
  });

  return result;
}

// Example usage
const a = 3, b = 2;
const px = 1, py = 4;
console.log(nearestPoint(a, b, px, py));
