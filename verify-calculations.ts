// Test script to verify calculations against reference site
// Reference: https://retirement.samasthiti.in
// Expected: ₹2.28 Cr for Annual Exp ₹12L, 50% equity, 360mo, 12% equity, 7% debt, 5% inflation, 12.5% tax

import { calculateDeterministicCorpus } from './src/lib/calculations/retirement';
import { calculateStochasticCorpus, testAdequacy, computeSWRFormula } from './src/lib/calculations/stochastic';

console.log('=== DETERMINISTIC CALCULATOR ===');
const detResult = calculateDeterministicCorpus({
  annualExpenditure: 1200000,
  equityAllocation: 50,
  retirementPeriodMonths: 360,
  expectedEquityReturn: 12,
  expectedDebtReturn: 7,
  expectedInflation: 5,
  taxRate: 12.5,
});
console.log(`Required Corpus: ₹${(detResult.requiredCorpus / 100000).toFixed(2)} Lakh = ₹${(detResult.requiredCorpus / 10000000).toFixed(2)} Cr`);
console.log(`Expected: ₹2.28 Cr (₹2,28,00,000)`);
console.log(`Match: ${Math.abs(detResult.requiredCorpus - 22800000) < 100000 ? 'YES ✓' : 'NO ✗ (diff: ₹' + Math.abs(detResult.requiredCorpus - 22800000).toLocaleString('en-IN') + ')'}`);

console.log('\n=== STOCHASTIC CALCULATOR ===');
const stochResult = calculateStochasticCorpus({
  annualExpenditure: 1200000,
  equityAllocation: 50,
  retirementPeriodMonths: 360,
  numSimulations: 3000,
});
console.log(`Required Corpus: ₹${(stochResult.requiredCorpus / 10000000).toFixed(2)} Cr`);
console.log(`Expected: ₹3.78 Cr (₹3,78,00,000)`);
console.log(`Failure Rate: ${stochResult.failureRate.toFixed(1)}%`);
console.log(`Match: ${Math.abs(stochResult.requiredCorpus - 37800000) < 500000 ? 'YES ✓' : 'NO ✗ (diff: ₹' + Math.abs(stochResult.requiredCorpus - 37800000).toLocaleString('en-IN') + ')'}`);

console.log('\n=== TEST ADEQUACY ===');
const testResult = testAdequacy(
  1200000,  // annualExpenditure
  22800000, // retirementCorpus
  50,       // equityAllocation
  360,      // retirementPeriodMonths
  3000,     // numSimulations
  12.5      // taxRate
);
console.log(`Failure Rate: ${testResult.failureRate.toFixed(1)}%`);
console.log(`Expected: ~53%`);
console.log(`Match: ${Math.abs(testResult.failureRate - 53) < 10 ? 'YES ✓' : 'NO ✗ (diff: ' + Math.abs(testResult.failureRate - 53).toFixed(1) + '%)'}`);

console.log('\n=== SWR FORMULA ===');
const swr = computeSWRFormula(50, 30);
console.log(`SWR for 50% equity, 30yr: ${swr.toFixed(2)}%`);

console.log('\n=== SUMMARY ===');
console.log('Deterministic: ₹' + (detResult.requiredCorpus / 10000000).toFixed(2) + ' Cr (expected: ₹2.28 Cr)');
console.log('Stochastic: ₹' + (stochResult.requiredCorpus / 10000000).toFixed(2) + ' Cr (expected: ₹3.78 Cr)');
console.log('Test Adequacy: ' + testResult.failureRate.toFixed(1) + '% failure (expected: ~53%)');
