import React from "react";
import JourneyTimeline from "./admin/JourneyTimeline";

const ComplaintTimeline = ({ complaint }) => {
  if (!complaint) return null;

  return (
    <div className="space-y-4">
      <JourneyTimeline complaint={complaint} />
    </div>
  );
};

export default ComplaintTimeline;