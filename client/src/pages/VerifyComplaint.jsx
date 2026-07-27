import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function VerifyComplaint() {
  const { token } = useParams();
  const [result, setResult] = useState(null);

  const handleYes = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/complaint/verify/${token}`,
        {
          decision: "yes",
        }
      );

      setResult("yes");
    } catch (error) {
      console.error(error);
      alert("Verification failed.");
    }
  };

  const handleNo = async () => {
  try {
    const res = await axios.post(
      `http://localhost:8000/api/complaint/verify/${token}`,
      {
        decision: "no",
      }
    );

   setResult("no");
  } catch (error) {
    console.error(error);
    alert("Verification failed.");
  }
};

if (result === "yes") {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg">
        <div className="text-6xl mb-4">✅</div>

        <h1 className="text-3xl font-bold text-green-700">
          Complaint Closed
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you for confirming that your issue has been resolved.
        </p>

        <p className="mt-2 text-gray-500">
          Your complaint has been officially closed.
        </p>
      </div>
    </div>
  );
}

if (result === "no") {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg">
        <div className="text-6xl mb-4">⚠️</div>

        <h1 className="text-3xl font-bold text-red-600">
          Complaint Reopened
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you for your feedback.
        </p>

        <p className="mt-2 text-gray-500">
          The complaint has been reopened and will be reviewed by the concerned department.
        </p>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-[90%] max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-6">
          Complaint Resolution Verification
        </h1>

        <p className="text-gray-600 mb-8">
          Has your complaint been resolved satisfactorily?
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={handleYes}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold"
          >
            ✅ YES
          </button>

        <button
  onClick={handleNo}
  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold"
>
  ❌ NO
</button>
        </div>
      </div>
    </div>
  );
}