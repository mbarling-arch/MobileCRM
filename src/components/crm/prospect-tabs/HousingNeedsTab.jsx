import React from 'react';
import HousingNeeds from '../HousingNeeds';

const HousingNeedsTab = ({ prospectId, userProfile, context }) => {
  return (
    <HousingNeeds
      companyId={userProfile?.companyId}
      prospectId={prospectId}
      initial={null}
      context={context}
    />
  );
};

export default HousingNeedsTab;
