import { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Default calculator data structure
 */
const DEFAULT_CALCULATOR_DATA = {
  applicant: { 
    hourlyRate: '', 
    weeklyOvertimeHours: '', 
    fixedMonthly: '', 
    annualSalary: '', 
    ssi: '', 
    childSupport: '', 
    retirement: '', 
    other: '' 
  },
  coapplicant: { 
    hourlyRate: '', 
    weeklyOvertimeHours: '', 
    fixedMonthly: '', 
    annualSalary: '', 
    ssi: '', 
    childSupport: '', 
    retirement: '', 
    other: '' 
  },
  buyerDebts: { 
    payment1: '', 
    payment2: '', 
    payment3: '', 
    payment4: '', 
    payment5: '', 
    payment6: '', 
    deferredStudentLoans: '', 
    collection1: '', 
    collection2: '', 
    collection3: '', 
    collection4: '', 
    collection5: '' 
  },
  coBuyerDebts: { 
    payment1: '', 
    payment2: '', 
    payment3: '', 
    payment4: '', 
    payment5: '', 
    payment6: '', 
    deferredStudentLoans: '', 
    collection1: '', 
    collection2: '', 
    collection3: '', 
    collection4: '', 
    collection5: '' 
  }
};

/**
 * Custom hook for managing budget calculator data
 * @param {object} params - Hook parameters
 * @param {string} params.prospectId - Prospect ID
 * @param {string} params.companyId - Company ID
 * @param {boolean} params.isDeal - Whether this is a deal or prospect
 * @param {object} params.prospect - Prospect object to initialize from
 * @returns {object} Calculator state and handlers
 */
export const useCalculatorData = ({ prospectId, companyId, isDeal = false, prospect }) => {
  // State
  const [calculatorData, setCalculatorData] = useState(DEFAULT_CALCULATOR_DATA);
  const [savingCalculator, setSavingCalculator] = useState(false);

  // Initialize calculator data when prospect loads
  useEffect(() => {
    if (prospect?.calculator) {
      setCalculatorData(prev => ({ ...prev, ...prospect.calculator }));
    }
  }, [prospect?.calculator]);

  /**
   * Set a calculator field value using dot notation path
   * @param {string} path - Dot notation path (e.g., 'applicant.hourlyRate')
   * @returns {Function} Change handler
   */
  const setCalculatorField = (path) => (e) => {
    const value = e?.target?.value ?? e;
    setCalculatorData((d) => {
      const keys = path.split('.');
      let curr = { ...d };
      let ref = curr;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        ref[k] = { ...(ref[k] || {}) };
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
      return curr;
    });
  };

  /**
   * Compute monthly income for applicant or coapplicant
   * @param {string} key - Key name ('applicant' or 'coapplicant')
   * @param {object} d - Calculator data
   * @returns {number} Monthly income
   */
  const computeApplicantMonthly = (key, d) => {
    const e = d[key] || {};
    const hourly = (parseFloat(e.hourlyRate || 0) * 40 * 52) / 12;
    const overtime = (parseFloat(e.hourlyRate || 0) * 1.5 * parseFloat(e.weeklyOvertimeHours || 0) * 52) / 12;
    const salary = parseFloat(e.annualSalary || 0) / 12;
    const fixed = parseFloat(e.fixedMonthly || 0);
    const ssi = parseFloat(e.ssi || 0);
    const childSupport = parseFloat(e.childSupport || 0);
    const retirement = parseFloat(e.retirement || 0);
    const other = parseFloat(e.other || 0);
    return hourly + overtime + salary + fixed + ssi + childSupport + retirement + other;
  };

  /**
   * Compute total debt for buyer or co-buyer
   * @param {string} key - Key name ('buyerDebts' or 'coBuyerDebts')
   * @param {object} d - Calculator data
   * @returns {number} Total monthly debt
   */
  const computeDebtTotal = (key, d) => {
    const debts = d[key] || {};
    return ['payment1', 'payment2', 'payment3', 'payment4', 'payment5', 'payment6', 'deferredStudentLoans', 'collection1', 'collection2', 'collection3', 'collection4', 'collection5']
      .map((f) => parseFloat(debts[f] || 0) || 0)
      .reduce((a, b) => a + b, 0);
  };

  /**
   * Computed income values
   */
  const applicantMonthly = useMemo(() => 
    computeApplicantMonthly('applicant', calculatorData), 
    [calculatorData]
  );

  const coappMonthly = useMemo(() => 
    computeApplicantMonthly('coapplicant', calculatorData), 
    [calculatorData]
  );

  const grossMonthlyIncome = applicantMonthly + coappMonthly;

  /**
   * Computed debt values
   */
  const buyerDebtTotal = useMemo(() => 
    computeDebtTotal('buyerDebts', calculatorData), 
    [calculatorData]
  );

  const coBuyerDebtTotal = useMemo(() => 
    computeDebtTotal('coBuyerDebts', calculatorData), 
    [calculatorData]
  );

  const totalMonthlyDebts = buyerDebtTotal + coBuyerDebtTotal;

  /**
   * Compute debt-to-income ratio
   */
  const debtToIncomeRatio = useMemo(() => {
    if (grossMonthlyIncome === 0) return 0;
    return (totalMonthlyDebts / grossMonthlyIncome) * 100;
  }, [totalMonthlyDebts, grossMonthlyIncome]);

  /**
   * Save calculator data to Firestore
   */
  const saveCalculatorData = async () => {
    if (!companyId || !prospectId) return;
    
    setSavingCalculator(true);
    try {
      const collectionName = isDeal ? 'deals' : 'prospects';
      const ref = doc(db, 'companies', companyId, collectionName, prospectId);
      await updateDoc(ref, { calculator: calculatorData });
    } catch (err) {
      console.error('Error saving calculator data:', err);
      throw err;
    } finally {
      setSavingCalculator(false);
    }
  };

  /**
   * Reset calculator data to defaults
   */
  const resetCalculatorData = () => {
    setCalculatorData(DEFAULT_CALCULATOR_DATA);
  };

  return {
    // State
    calculatorData,
    savingCalculator,
    
    // Setters
    setCalculatorData,
    setCalculatorField,
    
    // Computed values - Income
    applicantMonthly,
    coappMonthly,
    grossMonthlyIncome,
    
    // Computed values - Debts
    buyerDebtTotal,
    coBuyerDebtTotal,
    totalMonthlyDebts,
    
    // Computed values - Ratios
    debtToIncomeRatio,
    
    // Handlers
    saveCalculatorData,
    resetCalculatorData
  };
};

