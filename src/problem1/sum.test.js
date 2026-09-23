const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./sum.js');

// Helper function để test
const test = (name, fn) => {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
    }
};

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

console.log('\n=== TEST CASES ===\n');

// TEST 1: n = 0 (edge case)
test('All functions return 0 for n=0', () => {
    assert(sum_to_n_a(0) === 0, 'sum_to_n_a(0) should return 0');
    assert(sum_to_n_b(0) === 0, 'sum_to_n_b(0) should return 0');
    assert(sum_to_n_c(0) === 0, 'sum_to_n_c(0) should return 0');
});

// TEST 2: n = 1 (base case)
test('All functions return 1 for n=1', () => {
    assert(sum_to_n_a(1) === 1, 'sum_to_n_a(1) should return 1');
    assert(sum_to_n_b(1) === 1, 'sum_to_n_b(1) should return 1');
    assert(sum_to_n_c(1) === 1, 'sum_to_n_c(1) should return 1');
});

// TEST 3: n = 5 (normal case)
test('All functions return 15 for n=5', () => {
    // 1+2+3+4+5 = 15
    assert(sum_to_n_a(5) === 15, 'sum_to_n_a(5) should return 15');
    assert(sum_to_n_b(5) === 15, 'sum_to_n_b(5) should return 15');
    assert(sum_to_n_c(5) === 15, 'sum_to_n_c(5) should return 15');
});

// TEST 4: n = 10 (larger normal case)
test('All functions return 55 for n=10', () => {
    // 1+2+...+10 = 55
    assert(sum_to_n_a(10) === 55, 'sum_to_n_a(10) should return 55');
    assert(sum_to_n_b(10) === 55, 'sum_to_n_b(10) should return 55');
    assert(sum_to_n_c(10) === 55, 'sum_to_n_c(10) should return 55');
});

// TEST 5: negative number (edge case)
test('All functions return 0 for negative numbers', () => {
    assert(sum_to_n_a(-5) === 0, 'sum_to_n_a(-5) should return 0');
    assert(sum_to_n_b(-5) === 0, 'sum_to_n_b(-5) should return 0');
    assert(sum_to_n_c(-5) === 0, 'sum_to_n_c(-5) should return 0');
});

// TEST 6: n = 100 (large number)
test('All functions return 5050 for n=100', () => {
    // 1+2+...+100 = 5050
    assert(sum_to_n_a(100) === 5050, 'sum_to_n_a(100) should return 5050');
    assert(sum_to_n_b(100) === 5050, 'sum_to_n_b(100) should return 5050');
    assert(sum_to_n_c(100) === 5050, 'sum_to_n_c(100) should return 5050');
});

// TEST 7: consistency check - all 3 should give same result
test('All three functions produce same results for n=1 to 15', () => {
    for (let n = 1; n <= 15; n++) {
        const a = sum_to_n_a(n);
        const b = sum_to_n_b(n);
        const c = sum_to_n_c(n);
        assert(a === b && b === c, `Mismatch for n=${n}: a=${a}, b=${b}, c=${c}`);
    }
});

console.log('\n=== PERFORMANCE COMPARISON ===\n');

// Compare performance
const n = 1000;
console.time('sum_to_n_a (loop)');
sum_to_n_a(n);
console.timeEnd('sum_to_n_a (loop)');

console.time('sum_to_n_b (recursion)');
sum_to_n_b(n);
console.timeEnd('sum_to_n_b (recursion)');

console.time('sum_to_n_c (formula)');
sum_to_n_c(n);
console.timeEnd('sum_to_n_c (formula)');

console.log('\n');