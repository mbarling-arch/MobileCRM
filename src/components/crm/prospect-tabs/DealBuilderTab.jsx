import React from 'react';
import DealBuilder from '../DealBuilder';

const DealBuilderTab = ({ prospectId, userProfile, isDeal, context }) => {

  return (
    <DealBuilder
      companyId={userProfile?.companyId}
      prospectId={prospectId}
      isDeal={isDeal}
      initial={null}
    />
  );
};

export default DealBuilderTab;
