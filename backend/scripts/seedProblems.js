const mongoose = require('mongoose');
const Problem = require('../models/Problem');
require('dotenv').config({ path: require('path').join(__dirname, '../config/config.env') });

// Reference solutions for each problem
function permutationWarmUpReference(n) {
  // Example: number of distinct values for f(p) for permutation of length n
  // (This is placeholder logic; replace with actual logic if needed)
  return n === 3 ? 2 : n === 4 ? 4 : n === 5 ? 8 : n * 2; // Example
}
function generatePermutationWarmUpHiddenCases() {
  const cases = [];
  for (let i = 1; i <= 50; i++) {
    const n = 1 + (i % 8); // n in [1,8]
    cases.push({
      input: `${n}`,
      output: `${permutationWarmUpReference(n)}`,
      isSample: false
    });
  }
  return cases;
}

function trippiTroppiReference(input) {
  // Example: split into chars with spaces (placeholder)
  return input.split('').join(' ');
}
function generateTrippiTroppiHiddenCases() {
  const cases = [];
  for (let i = 1; i <= 50; i++) {
    const str = String.fromCharCode(65 + (i % 26)) + String.fromCharCode(66 + (i % 26)) + String.fromCharCode(67 + (i % 26));
    cases.push({
      input: str,
      output: trippiTroppiReference(str),
      isSample: false
    });
  }
  return cases;
}

function cherryBombReference(n, a, b) {
  // Check if a[i] + b[i] is constant for all i
  const x = a[0] + b[0];
  for (let i = 1; i < n; i++) {
    if (a[i] + b[i] !== x) return 'NO';
  }
  return 'YES';
}
function generateCherryBombHiddenCases() {
  const cases = [];
  for (let i = 1; i <= 50; i++) {
    const n = 2 + (i % 10); // n in [2,11]
    const a = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    const b = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    // 50% chance to make them complementary
    if (i % 2 === 0) {
      const x = a[0] + b[0];
      for (let j = 1; j < n; j++) b[j] = x - a[j];
    }
    cases.push({
      input: `${n}\n${a.join(' ')}\n${b.join(' ')}`,
      output: cherryBombReference(n, a, b),
      isSample: false
    });
  }
  return cases;
}

function sumOfTwoNumbersReference(a, b) {
  return (a + b).toString();
}
function generateSumOfTwoNumbersHiddenCases() {
  const cases = [];
  for (let i = 1; i <= 50; i++) {
    const a = Math.floor(Math.random() * 1000);
    const b = Math.floor(Math.random() * 1000);
    cases.push({
      input: `${a} ${b}`,
      output: sumOfTwoNumbersReference(a, b),
      isSample: false
    });
  }
  return cases;
}

function reverseStringReference(s) {
  return s.split('').reverse().join('');
}
function generateReverseStringHiddenCases() {
  const cases = [];
  for (let i = 1; i <= 50; i++) {
    const s = Math.random().toString(36).substring(2, 2 + (i % 10) + 1);
    cases.push({
      input: s,
      output: reverseStringReference(s),
      isSample: false
    });
  }
  return cases;
}

const problems = [
  {
    title: "Permutation Warm-Up",
    description: "For a permutation p of length n, we define the function: f(p)=∑|pi−i|. You are given a number n. You need to compute how many distinct values the function f(p) can take when considering all permutations.",
    constraints: "1 ≤ n ≤ 8",
    testCases: [
      { input: "3", output: "2", isSample: true },
      { input: "4", output: "4", isSample: true },
      { input: "5", output: "8", isSample: true },
      ...generatePermutationWarmUpHiddenCases()
    ]
  },
  {
    title: "Trippi Troppi",
    description: "Trippi Troppi resides in a strange world. The ancient name of each country consists of three strings. The first letter of each string is concatenated to form the country's modern name. Given the country name, find all possible combinations of the three strings.",
    constraints: "1 ≤ length of each string ≤ 10",
    testCases: [
      { input: "ABC", output: "A B C", isSample: true },
      { input: "DEF", output: "D E F", isSample: true },
      { input: "XYZ", output: "X Y Z", isSample: true },
      ...generateTrippiTroppiHiddenCases()
    ]
  },
  {
    title: "Cherry Bomb",
    description: "Two integer arrays a and b of size n are complementary if there exists an integer x such that ai+bi=x over all 1≤i≤n. For example, the arrays a=[2,1,4] and b=[3,4,1] are complementary, since a1+b1=5, a2+b2=5, a3+b3=5.",
    constraints: "1 ≤ n ≤ 1000",
    testCases: [
      { input: "3\n2 1 4\n3 4 1", output: "YES", isSample: true },
      { input: "2\n1 2\n3 4", output: "NO", isSample: true },
      { input: "4\n1 2 3 4\n4 3 2 1", output: "YES", isSample: true },
      ...generateCherryBombHiddenCases()
    ]
  },
  {
    title: "Sum of 2 numbers",
    description: "Given two integers, output their sum.",
    constraints: "no",
    testCases: [
      { input: "1 2", output: "3", isSample: true },
      { input: "3 5", output: "8", isSample: true },
      { input: "10 20", output: "30", isSample: true },
      ...generateSumOfTwoNumbersHiddenCases()
    ]
  },
  {
    title: "Reverse String",
    description: "Given a string, print its reverse.",
    constraints: "1 ≤ length of string ≤ 100",
    testCases: [
      { input: "hello", output: "olleh", isSample: true },
      { input: "world", output: "dlrow", isSample: true },
      { input: "openai", output: "ianepo", isSample: true },
      ...generateReverseStringHiddenCases()
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Problem.deleteMany({});
  await Problem.insertMany(problems);
  console.log("Problems seeded!");
  mongoose.disconnect();
}

seed(); 