import React from "react";

const formatDate = (date) => {
  if (!date) return "Waiting...";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const ComplaintTimeline = ({ complaint }) => {
  const steps = [
    {
      title: "Complaint Registered",
      date: complaint.createdAt,
      completed: true,
      color: "bg-green-500",
      message: "Your complaint has been successfully registered.",
    },
    {
      title: "Complaint Accepted",
      date: complaint.acceptedAt,
      completed: !!complaint.acceptedAt,
      color: "bg-blue-500",
      message: "The concerned department has accepted your complaint.",
    },
    {
      title: "Work In Progress",
      date: complaint.inProgressAt,
      completed: !!complaint.inProgressAt,
      color: "bg-yellow-500",
      message: "The team is actively working on resolving your issue.",
    },
    {
      title: "Complaint Completed",
      date: complaint.completedAt,
      completed: !!complaint.completedAt,
      color: "bg-purple-500",
      message: "The work has been completed. Awaiting citizen verification.",
    },
    {
      title: "Complaint Closed",
      date: complaint.closedAt,
      completed: !!complaint.closedAt,
      color: "bg-gray-700",
      message: "Complaint has been successfully closed.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Complaint Timeline</h2>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full ${
                  step.completed ? step.color : "bg-gray-300"
                }`}
              />
              {index !== steps.length - 1 && (
                <div className="w-1 flex-1 bg-gray-300 mt-1" />
              )}
            </div>

            <div className="pb-6">
              <h3 className="font-semibold text-lg">{step.title}</h3>

              <p className="text-sm text-gray-500">
                {formatDate(step.date)}
              </p>

              <p className="text-gray-700 mt-1">
                {step.completed ? step.message : "Pending"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintTimeline;