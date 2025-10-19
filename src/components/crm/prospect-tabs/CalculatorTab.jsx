import React from 'react';
import FinancialCalculator from '../FinancialCalculator';

const CalculatorTab = ({ prospectId, userProfile, context }) => {
  return (
    <FinancialCalculator
      companyId={userProfile?.companyId}
      prospectId={prospectId}
      initial={context?.prospect?.calculator || null}
      context={context}
    />
  );
};

export default CalculatorTab;
