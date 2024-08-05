import React, { useState } from 'react';
import ITHelpersList from './ITHelpersList';
import ITHelperCalendar from './ITHelperCalendar';
import BackButton from './BackButton';

function ITHelpersPage() {
  const [selectedHelper, setSelectedHelper] = useState(null);

  const handleSelectHelper = (helper) => {
    setSelectedHelper(helper);
  };

  return (
    <div className="it-helpers-page">
      <BackButton />
      <div className="it-helpers-list">
        <h2>IT Helpers</h2>
        <ITHelpersList onSelectHelper={handleSelectHelper} />
      </div>
      <div className="it-helper-calendar">
        {selectedHelper && (
          <>
            <h2>{selectedHelper.username}'s Calendar</h2>
            <ITHelperCalendar helperId={selectedHelper.id} />
          </>
        )}
      </div>
    </div>
  );
}

export default ITHelpersPage;
