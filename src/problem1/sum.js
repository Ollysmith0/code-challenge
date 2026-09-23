var sum_to_n_a = function(n) {
    if(n <= 0) return 0

    let result = 0;
    for(let i = 0; i <= n; i++) {
        result += i
    }
    return result;
};

var sum_to_n_b = function(n) {
    if (n <= 0) return 0;
    return n + sum_to_n_b(n - 1);
};

var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
}