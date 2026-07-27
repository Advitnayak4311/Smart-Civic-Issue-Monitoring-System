// =======================================
// ACCEPTED EMAIL
// =======================================

export const acceptedEmail = (complaint) => {
  return {
    subject: "🏛 Smart Civic - Complaint Accepted",

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          background:#f4f7fb;
          padding:40px;
        "
      >

        <div
          style="
            max-width:650px;
            margin:auto;
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
          "
        >

          <div
            style="
              background:#2563eb;
              color:white;
              text-align:center;
              padding:24px;
            "
          >

            <h1 style="margin:0;">
              🏛 Smart Civic
            </h1>

            <p style="margin-top:8px;">
              Complaint Status Update
            </p>

          </div>

          <div style="padding:30px;">

            <h2 style="color:#2563eb;">
              🎉 Complaint Accepted
            </h2>

            <p>
              Hello <b>${complaint.citizenName}</b>,
            </p>

            <p>
              Your complaint has been accepted and forwarded to the concerned department.
            </p>

            <div
              style="
                background:#f8fafc;
                border-left:5px solid #2563eb;
                padding:18px;
                border-radius:8px;
                margin:25px 0;
              "
            >

              <p><b>Complaint ID:</b> ${complaint.complaintId}</p>

              <p><b>Category:</b> ${complaint.category}</p>

              <p><b>Issue:</b> ${complaint.issue}</p>

              <p>
                <b>Status:</b>

                <span
                  style="
                    background:#2563eb;
                    color:white;
                    padding:4px 10px;
                    border-radius:20px;
                  "
                >
                  Accepted
                </span>
              </p>

            </div>

            <p>
              Our team will begin processing your complaint shortly.
            </p>

            <hr style="margin:30px 0;">

            <p
              style="
                color:#64748b;
                font-size:14px;
              "
            >
              Thank you for choosing Smart Civic.
            </p>

          </div>

        </div>

      </div>
    `,
  };
};

// =======================================
// IN PROGRESS EMAIL
// =======================================

export const inProgressEmail = (complaint) => {
  return {
    subject: "👷 Smart Civic - Work In Progress",

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          background:#f4f7fb;
          padding:40px;
        "
      >

        <div
          style="
            max-width:650px;
            margin:auto;
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
          "
        >

          <div
            style="
              background:#2563eb;
              color:white;
              text-align:center;
              padding:24px;
            "
          >

            <h1 style="margin:0;">
              🏛 Smart Civic
            </h1>

            <p style="margin-top:8px;">
              Complaint Status Update
            </p>

          </div>

          <div style="padding:30px;">

            <h2 style="color:#f59e0b;">
              👷 Work In Progress
            </h2>

            <p>
              Hello <b>${complaint.citizenName}</b>,
            </p>

            <p>
              The concerned department has started working on your complaint.
            </p>

            <div
              style="
                background:#f8fafc;
                border-left:5px solid #f59e0b;
                padding:18px;
                border-radius:8px;
                margin:25px 0;
              "
            >

              <p><b>Complaint ID:</b> ${complaint.complaintId}</p>

              <p><b>Category:</b> ${complaint.category}</p>

              <p><b>Issue:</b> ${complaint.issue}</p>

              <p>
                <b>Status:</b>

                <span
                  style="
                    background:#f59e0b;
                    color:white;
                    padding:4px 10px;
                    border-radius:20px;
                  "
                >
                  In Progress
                </span>
              </p>

            </div>

            <p>
              Our team is actively resolving the issue. You'll receive another update once the work has been completed.
            </p>

            <hr style="margin:30px 0;">

            <p
              style="
                color:#64748b;
                font-size:14px;
              "
            >
              Thank you for your patience.
            </p>

          </div>

        </div>

      </div>
    `,
  };
};
// =======================================
// COMPLETED EMAIL
// =======================================

export const completedEmail = (complaint) => {
  return {
    subject: "✅ Smart Civic - Complaint Resolved",

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          background:#f4f7fb;
          padding:40px;
        "
      >

        <div
          style="
            max-width:650px;
            margin:auto;
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
          "
        >

          <div
            style="
              background:#16a34a;
              color:white;
              text-align:center;
              padding:24px;
            "
          >

            <h1 style="margin:0;">
              🏛 Smart Civic
            </h1>

            <p style="margin-top:8px;">
              Complaint Resolution Update
            </p>

          </div>

          <div style="padding:30px;">

            <h2 style="color:#16a34a;">
              🎉 Your Complaint Has Been Resolved
            </h2>

            <p>
              Hello <b>${complaint.citizenName}</b>,
            </p>

            <p>
              We're happy to inform you that your complaint has been marked as <b>Completed</b> by the concerned department.
            </p>

            <div
              style="
                background:#f8fafc;
                border-left:5px solid #16a34a;
                padding:18px;
                border-radius:8px;
                margin:25px 0;
              "
            >

              <p><b>Complaint ID:</b> ${complaint.complaintId}</p>

              <p><b>Category:</b> ${complaint.category}</p>

              <p><b>Issue:</b> ${complaint.issue}</p>

              <p>
                <b>Status:</b>

                <span
                  style="
                    background:#16a34a;
                    color:white;
                    padding:4px 10px;
                    border-radius:20px;
                  "
                >
                  Completed
                </span>
              </p>

            </div>

            <p>
              Please verify whether the issue has been resolved satisfactorily.
            </p>

            <div style="text-align:center;margin:35px 0;">

              <a
                href="http://localhost:5173/verify/${complaint.verificationToken}"
                style="
                  display:inline-block;
                  background:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 28px;
                  border-radius:8px;
                  font-weight:bold;
                  font-size:16px;
                "
              >
                ✔ Verify Resolution
              </a>

            </div>

            <p style="color:#64748b;font-size:14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>

            <p style="word-break:break-all;color:#2563eb;">
              http://localhost:5173/verify/${complaint.verificationToken}
            </p>

            <hr style="margin:30px 0;">

            <p
              style="
                color:#64748b;
                font-size:14px;
              "
            >
              Thank you for helping us improve our community through Smart Civic.
            </p>

          </div>

        </div>

      </div>
    `,
  };
};