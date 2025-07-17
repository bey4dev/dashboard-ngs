// Performance Testing Script
// Paste this in browser console to test loading times

console.log('🧪 Starting Performance Test...');

const performanceTest = {
  tests: [],
  
  async testFunction(name, fn, iterations = 3) {
    console.log(`\n🔄 Testing: ${name}`);
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      try {
        await fn();
        const endTime = performance.now();
        const duration = endTime - startTime;
        times.push(duration);
        console.log(`  Attempt ${i + 1}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        console.error(`  Attempt ${i + 1} failed:`, error);
        times.push(Infinity);
      }
    }
    
    const avg = times.filter(t => t !== Infinity).reduce((a, b) => a + b, 0) / times.filter(t => t !== Infinity).length;
    const min = Math.min(...times.filter(t => t !== Infinity));
    const max = Math.max(...times.filter(t => t !== Infinity));
    
    const result = {
      name,
      times,
      average: avg,
      min,
      max,
      successRate: times.filter(t => t !== Infinity).length / times.length * 100
    };
    
    this.tests.push(result);
    
    console.log(`  ✅ Average: ${avg.toFixed(2)}ms`);
    console.log(`  ⚡ Fastest: ${min.toFixed(2)}ms`);
    console.log(`  🐌 Slowest: ${max.toFixed(2)}ms`);
    console.log(`  📊 Success Rate: ${result.successRate.toFixed(1)}%`);
    
    return result;
  },
  
  async runAllTests() {
    console.log('🏁 Running comprehensive performance tests...\n');
    
    // Test 1: Debt Data
    await this.testFunction('Debt Data Loading', async () => {
      if (window.getDebtData) {
        await window.getDebtData();
      } else {
        throw new Error('getDebtData function not available');
      }
    });
    
    // Test 2: Sales Data
    await this.testFunction('Sales Data Loading', async () => {
      if (window.getSalesData) {
        await window.getSalesData();
      } else {
        throw new Error('getSalesData function not available');
      }
    });
    
    // Test 3: Transaction Data
    await this.testFunction('Transaction Data Loading', async () => {
      if (window.getTransactionData) {
        await window.getTransactionData();
      } else {
        throw new Error('getTransactionData function not available');
      }
    });
    
    // Test 4: Direct API Call (if available)
    if (window.location.hostname !== 'localhost') {
      await this.testFunction('Direct API Call', async () => {
        const response = await fetch('/api/sheets-optimized?sheetId=1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk&gid=0');
        if (!response.ok) throw new Error(`API failed: ${response.status}`);
        await response.text();
      });
    }
    
    console.log('\n📋 Performance Test Summary:');
    console.log('═'.repeat(50));
    
    this.tests.forEach(test => {
      console.log(`\n${test.name}:`);
      console.log(`  Average: ${test.average.toFixed(2)}ms`);
      console.log(`  Range: ${test.min.toFixed(2)}ms - ${test.max.toFixed(2)}ms`);
      console.log(`  Success: ${test.successRate.toFixed(1)}%`);
    });
    
    // Performance recommendations
    const avgTime = this.tests.reduce((sum, test) => sum + test.average, 0) / this.tests.length;
    console.log('\n🎯 Performance Analysis:');
    if (avgTime < 1000) {
      console.log('✅ EXCELLENT: Average load time under 1 second');
    } else if (avgTime < 2000) {
      console.log('✅ GOOD: Average load time under 2 seconds');
    } else if (avgTime < 3000) {
      console.log('⚠️ FAIR: Load time acceptable but could be improved');
    } else {
      console.log('❌ SLOW: Consider optimization or alternative hosting');
    }
    
    return this.tests;
  }
};

// Auto-expose functions for testing
setTimeout(() => {
  try {
    // Try to get functions from React app
    const app = document.querySelector('#root')?._reactInternalFiber?.memoizedProps;
    console.log('🔍 Looking for React functions...');
    
    // Export test runner to global scope
    window.performanceTest = performanceTest;
    console.log('🧪 Performance test available at: window.performanceTest.runAllTests()');
    
  } catch (error) {
    console.log('⚠️ Could not auto-detect functions. Manual testing required.');
  }
}, 2000);

// Instructions
console.log(`
📖 How to use:
1. Wait for app to fully load
2. Run: performanceTest.runAllTests()
3. Compare results between localhost and Vercel
4. Look for consistent performance improvements

🔧 Manual Testing:
- Open Network tab in DevTools
- Reload page and measure load times
- Check for 'sheets-optimized' API calls
- Verify caching (subsequent loads should be faster)
`);
