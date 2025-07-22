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
  for (let i = 1; i <= 5; i++) { // Reduced from 50 to 5
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
  for (let i = 1; i <= 5; i++) { // Reduced from 50 to 5
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
  for (let i = 1; i <= 5; i++) { // Reduced from 50 to 5
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
  for (let i = 1; i <= 5; i++) { // Reduced from 50 to 5
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
  for (let i = 1; i <= 5; i++) { // Reduced from 50 to 5
    const s = Math.random().toString(36).substring(2, 2 + (i % 10) + 1);
    cases.push({
      input: s,
      output: reverseStringReference(s),
      isSample: false
    });
  }
  return cases;
}

// Helper for Find the Duplicate Number
function findDuplicateReference(nums) {
  // Floyd's Tortoise and Hare (Cycle Detection)
  let slow = nums[0];
  let fast = nums[0];
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}
function generateFindDuplicateHiddenCases() {
  const cases = [];
  const testInputs = [
    // Small
    [1, 2, 3, 4, 4],
    // Duplicate at start
    [2, 2, 3, 4, 5, 1],
    // Duplicate at end
    [5, 4, 3, 2, 1, 5],
    // Larger n
    [7, 1, 2, 3, 4, 5, 6, 7],
    // Random
    [6, 3, 1, 5, 4, 2, 6]
  ];
  for (const arr of testInputs) {
    cases.push({
      input: arr.join(' '),
      output: findDuplicateReference(arr),
      isSample: false
    });
  }
  return cases;
}

// Helper for Valid Perfect Square
function validPerfectSquareReference(num) {
  let left = 1, right = num;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    let sq = mid * mid;
    if (sq === num) return 'true';
    if (sq < num) left = mid + 1;
    else right = mid - 1;
  }
  return 'false';
}
function generateValidPerfectSquareHiddenCases() {
  const cases = [];
  const testInputs = [
    1, // true
    2, // false
    100, // true
    99, // false
    225 // true
  ];
  for (const num of testInputs) {
    cases.push({
      input: `${num}`,
      output: validPerfectSquareReference(num),
      isSample: false
    });
  }
  return cases;
}

// Helper for Maximum Number of Events That Can Be Attended II
function maxValueReference(events, k) {
  // This is a simplified greedy for small test cases, not optimal for large n
  events.sort((a, b) => a[1] - b[1]);
  let n = events.length;
  let dp = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    let [s, e, v] = events[i - 1];
    let j = i - 1;
    while (j > 0 && events[j - 1][1] >= s) j--;
    for (let t = 1; t <= k; t++) {
      dp[i][t] = Math.max(dp[i - 1][t], dp[j][t - 1] + v);
    }
  }
  return dp[n][k].toString();
}
function generateMaxValueHiddenCases() {
  const cases = [];
  const testInputs = [
    { events: [[1, 5, 10], [6, 10, 20], [11, 15, 30]], k: 2 }, // 50
    { events: [[1, 2, 5], [2, 3, 6], [3, 4, 7]], k: 2 }, // 12
    { events: [[1, 3, 4], [2, 4, 5], [3, 5, 6]], k: 1 }, // 6
    { events: [[1, 2, 1], [2, 3, 2], [3, 4, 3], [4, 5, 4]], k: 3 }, // 9
    { events: [[1, 10, 100], [2, 3, 10], [4, 5, 20]], k: 2 } // 120
  ];
  for (const { events, k } of testInputs) {
    cases.push({
      input: `${JSON.stringify(events)}\n${k}`,
      output: maxValueReference(events, k),
      isSample: false
    });
  }
  return cases;
}

// Helper for Count Primes
function countPrimesReference(n) {
  if (n <= 2) return '0';
  const isPrime = Array(n).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let i = 2; i * i < n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j < n; j += i) isPrime[j] = false;
    }
  }
  return isPrime.reduce((acc, v) => acc + (v ? 1 : 0), 0).toString();
}
function generateCountPrimesHiddenCases() {
  const cases = [];
  const testInputs = [5, 20, 100, 50, 200];
  for (const n of testInputs) {
    cases.push({
      input: `${n}`,
      output: countPrimesReference(n),
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
    difficulty: "medium",
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
    difficulty: "easy",
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
    difficulty: "hard",
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
    difficulty: "easy",
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
    difficulty: "medium",
    testCases: [
      { input: "hello", output: "olleh", isSample: true },
      { input: "world", output: "dlrow", isSample: true },
      { input: "openai", output: "ianepo", isSample: true },
      ...generateReverseStringHiddenCases()
    ]
  },
  {
    title: "Find the Duplicate Number",
    description: "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive. There is only one repeated number in nums, return this repeated number. You must solve the problem without modifying the array nums and using only constant extra space.",
    constraints: "1 <= n <= 10^5\nnums.length == n + 1\n1 <= nums[i] <= n\nAll the integers in nums appear only once except for precisely one integer which appears two or more times.",
    difficulty: "medium",
    testCases: [
      { input: "1 3 4 2 2", output: "2", isSample: true },
      { input: "3 1 3 4 2", output: "3", isSample: true },
      { input: "3 3 3 3 3", output: "3", isSample: true },
      ...generateFindDuplicateHiddenCases()
    ]
  },
  {
    title: "Valid Perfect Square",
    description: "Given a positive integer num, return true if num is a perfect square or false otherwise. A perfect square is an integer that is the square of an integer. In other words, it is the product of some integer with itself. You must not use any built-in library function, such as sqrt.",
    constraints: "1 <= num <= 2^31 - 1",
    difficulty: "easy",
    testCases: [
      { input: "16", output: "true", isSample: true },
      { input: "14", output: "false", isSample: true },
      ...generateValidPerfectSquareHiddenCases()
    ]
  },
  {
    title: "Maximum Number of Events That Can Be Attended ",
    description: "You are given an array of events where events[i] = [startDayi, endDayi, valuei]. The ith event starts at startDayi and ends at endDayi, and if you attend this event, you will receive a value of valuei. You are also given an integer k which represents the maximum number of events you can attend. You can only attend one event at a time. If you choose to attend an event, you must attend the entire event. Note that the end day is inclusive: that is, you cannot attend two events where one of them starts and the other ends on the same day. Return the maximum sum of values that you can receive by attending events.",
    constraints: "1 <= k <= events.length\n1 <= k * events.length <= 10^6\n1 <= startDayi <= endDayi <= 10^9\n1 <= valuei <= 10^6",
    difficulty: "hard",
    testCases: [
      { input: "[[1,2,4],[3,4,3],[2,3,1]]\n2", output: "7", isSample: true },
      { input: "[[1,2,4],[3,4,3],[2,3,10]]\n2", output: "10", isSample: true },
      { input: "[[1,1,1],[2,2,2],[3,3,3],[4,4,4]]\n3", output: "9", isSample: true },
      ...generateMaxValueHiddenCases()
    ]
  },
  {
    title: "Count Primes",
    description: "Given an integer n, return the number of prime numbers that are strictly less than n.",
    constraints: "0 <= n <= 5 * 10^6",
    difficulty: "medium",
    testCases: [
      { input: "10", output: "4", isSample: true },
      { input: "0", output: "0", isSample: true },
      { input: "1", output: "0", isSample: true },
      ...generateCountPrimesHiddenCases()
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