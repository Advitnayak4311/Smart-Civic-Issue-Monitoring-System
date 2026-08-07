// Premium Executive E-Governance Email Templates with State-of-the-Art HTML Layouts

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// Master Luxury HTML Email Frame Component
const renderMasterFrame = ({
  headerBg = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  headerTitle = "Smart Civic e-Governance",
  headerSubtitle = "Official Municipal Response Desk",
  headerBadge = "GOVERNMENT OF INDIA • MUNICIPAL INFRASTRUCTURE PORTAL",
  contentHtml = "",
  ctaUrl = "",
  ctaText = "",
  ctaBg = "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Smart Civic Portal Notification</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">
      <div style="background-color:#f1f5f9;padding:40px 15px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">
          
          <!-- OFFICIAL TOP BANNER -->
          <tr>
            <td style="background:${headerBg};padding:32px 36px;text-align:center;position:relative;">
              <div style="display:inline-block;background:rgba(255,255,255,0.12);padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.2);margin-bottom:12px;">
                <span style="color:#f8fafc;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                  ${headerBadge}
                </span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;">
                ${headerTitle}
              </h1>
              <p style="margin:6px 0 0 0;color:#cbd5e1;font-size:13px;font-weight:500;">
                ${headerSubtitle}
              </p>
            </td>
          </tr>

          <!-- MAIN BODY CONTENT -->
          <tr>
            <td style="padding:36px;color:#334155;font-size:14px;line-height:1.65;">
              ${contentHtml}

              ${
                ctaUrl && ctaText
                  ? `
                <div style="text-align:center;margin:32px 0 10px 0;">
                  <a href="${ctaUrl}" target="_blank" style="display:inline-block;background:${ctaBg};color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.3px;box-shadow:0 6px 18px rgba(37,99,235,0.25);">
                    ${ctaText}
                  </a>
                </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- OFFICIAL GOVERNMENT FOOTER -->
          <tr>
            <td style="background:#f8fafc;padding:24px 36px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#0f172a;letter-spacing:0.2px;">
                Ministry of Urban & Municipal Infrastructure Response Desk
              </p>
              <p style="margin:0 0 12px 0;font-size:11px;color:#64748b;">
                Toll-Free Helpline: <strong style="color:#0f172a;">1800-111-2470</strong> &bull; Portal: <a href="${clientUrl}" style="color:#2563eb;text-decoration:none;font-weight:600;">www.smartcivic.gov.in</a>
              </p>
              <div style="border-top:1px solid #cbd5e1;padding-top:12px;margin-top:12px;">
                <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.4;">
                  This is an automated e-governance transactional notification. Please do not reply directly to this message. Designed in compliance with ISO/IEC 27001 Security Standards & WCAG 2.1 Accessibility Guidelines.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </div>
    </body>
    </html>
  `;
};

// 1. Welcome & Signup Email
export const signupWelcomeEmail = (user) => {
  return {
    subject: "Smart Civic Portal: Official Citizen Account Registration Notice",
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
      headerTitle: "Welcome to Smart Civic Portal",
      headerSubtitle: "Public Grievance & SLA Response Network",
      contentHtml: `
        <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin-top:0;margin-bottom:16px;">
          Welcome, ${user.fullName}!
        </h2>
        <p style="margin-bottom:20px;">
          Your public citizen account has been successfully registered on the official municipal e-governance platform. You now have full access to submit civic infrastructure complaints, track field repair status, and audit SLA completion timelines in real-time.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:12px;padding:20px;margin:24px 0;">
          <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Account Profile Credentials</p>
          <p style="margin:0 0 6px 0;font-size:14px;"><strong>Full Name:</strong> ${user.fullName}</p>
          <p style="margin:0 0 6px 0;font-size:14px;"><strong>Registered Email:</strong> ${user.email}</p>
          <p style="margin:0;font-size:14px;"><strong>Assigned Zone:</strong> ${user.district || "BENGALURU URBAN"}, ${user.state || "Karnataka"}</p>
        </div>

        <p style="color:#475569;font-size:13px;">
          Keep your login credentials secure. You can log in anytime to monitor municipal response desk updates.
        </p>
      `,
      ctaUrl: `${clientUrl}/profile`,
      ctaText: "ACCESS CITIZEN PORTAL",
    }),
  };
};

// 2. Profile Details Updated Security Alert Email
export const profileUpdatedEmail = (user) => {
  return {
    subject: "Smart Civic Portal: Security Notice - Profile Details Updated",
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #0f172a 0%, #065f46 100%)",
      headerTitle: "Account Security Notice",
      headerSubtitle: "Profile Information Modification Alert",
      contentHtml: `
        <h2 style="color:#0f172a;font-size:18px;font-weight:800;margin-top:0;margin-bottom:16px;">
          Security Alert: Account Profile Updated
        </h2>
        <p style="margin-bottom:20px;">
          Hello <strong>${user.fullName}</strong>, this is an official security confirmation that your citizen portal account credentials were modified on <strong>${new Date().toLocaleString("en-IN")}</strong>.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #059669;border-radius:12px;padding:18px;margin:20px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Updated Name:</strong> ${user.fullName}</p>
          <p style="margin:0 0 6px 0;"><strong>Phone Number:</strong> ${user.phone || "Not specified"}</p>
          <p style="margin:0 0 6px 0;"><strong>Address:</strong> ${user.address || "Configured in Profile"}</p>
          <p style="margin:0;"><strong>Jurisdiction:</strong> ${user.district || "BENGALURU URBAN"}, ${user.state || "Karnataka"}</p>
        </div>

        <p style="color:#64748b;font-size:12px;margin:0;">
          If you did not make this change, please log in immediately or contact the municipal security desk at 1800-111-2470.
        </p>
      `,
      ctaUrl: `${clientUrl}/profile`,
      ctaText: "VERIFY PROFILE CREDENTIALS",
      ctaBg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    }),
  };
};

// 3. New Complaint Registration Email (To Citizen)
export const complaintRegistrationCitizenEmail = (complaint) => {
  return {
    subject: `Smart Civic Portal: Grievance Registration Notice (Ref: ${complaint.complaintId})`,
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
      headerTitle: "Grievance Registration Acknowledgment",
      headerSubtitle: `Official Reference Ticket: ${complaint.complaintId}`,
      contentHtml: `
        <h2 style="color:#1e3a8a;font-size:20px;font-weight:800;margin-top:0;margin-bottom:12px;">
          Grievance Successfully Registered
        </h2>
        <p style="margin-bottom:20px;">
          Hello <strong>${complaint.citizenName}</strong>, your civic infrastructure complaint has been registered in the official municipal command desk.
        </p>

        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:14px;padding:22px;margin:24px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Reference ID:</td>
              <td style="padding:6px 0;font-size:14px;font-weight:800;color:#1e3a8a;font-family:monospace;">${complaint.complaintId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Category & Subcategory:</td>
              <td style="padding:6px 0;font-size:14px;font-weight:700;color:#0f172a;">${complaint.category} &rsaquo; ${complaint.issue}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Assigned Department:</td>
              <td style="padding:6px 0;font-size:14px;font-weight:700;color:#2563eb;">${complaint.department || "General Department"}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">SLA Priority Level:</td>
              <td style="padding:6px 0;font-size:13px;font-weight:800;color:#d97706;">${complaint.priority || "Medium Priority"}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Incident Location:</td>
              <td style="padding:6px 0;font-size:13px;color:#334155;">${complaint.address}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Current Status:</td>
              <td style="padding:6px 0;">
                <span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:800;text-transform:uppercase;border:1px solid #fde68a;">
                  Pending Dispatch
                </span>
              </td>
            </tr>
          </table>
        </div>

        <p style="color:#475569;font-size:13px;">
          Thank you for active civic participation in maintaining public infrastructure.
        </p>
      `,
      ctaUrl: `${clientUrl}/track/${complaint.complaintId}`,
      ctaText: "TRACK LIVE SLA REPAIR TIMELINE",
      ctaBg: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
    }),
  };
};

// 4. New Complaint Alert to Department Officer / Nodal Desk
export const complaintRegistrationAdminAlertEmail = (complaint) => {
  return {
    subject: `Smart Civic Portal: Dispatch Notice - ${complaint.category} (Ref: ${complaint.complaintId})`,
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
      headerTitle: "Municipal Dispatch Directive",
      headerSubtitle: `Assigned Department: ${complaint.department}`,
      headerBadge: "ACTION REQUIRED • DEPARTMENTAL DISPATCH COMMAND",
      contentHtml: `
        <h2 style="color:#991b1b;font-size:18px;font-weight:800;margin-top:0;margin-bottom:12px;">
          Action Required: Officer Dispatch
        </h2>
        <p style="margin-bottom:20px;">
          A new civic grievance has been submitted under your department's jurisdiction requiring field inspection and repair team assignment.
        </p>

        <div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:12px;padding:20px;margin:20px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Complaint ID:</strong> <span style="font-family:monospace;font-weight:700;">${complaint.complaintId}</span></p>
          <p style="margin:0 0 6px 0;"><strong>Citizen Contact:</strong> ${complaint.citizenName} (${complaint.phone})</p>
          <p style="margin:0 0 6px 0;"><strong>Grievance Type:</strong> ${complaint.category} &rsaquo; ${complaint.issue}</p>
          <p style="margin:0 0 6px 0;"><strong>SLA Priority:</strong> <strong style="color:#dc2626;">${complaint.priority}</strong></p>
          <p style="margin:0;"><strong>Incident Location:</strong> ${complaint.address}</p>
        </div>
      `,
      ctaUrl: `${clientUrl}/admin`,
      ctaText: "OPEN OFFICER COMMAND CONSOLE",
      ctaBg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    }),
  };
};

// 5. Accepted Email
export const acceptedEmail = (complaint) => {
  return {
    subject: `Smart Civic Portal: Grievance Accepted for Resolution (Ref: ${complaint.complaintId})`,
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
      headerTitle: "Grievance Status Accepted",
      headerSubtitle: `Reference Ticket: ${complaint.complaintId}`,
      contentHtml: `
        <h2 style="color:#1d4ed8;font-size:18px;font-weight:800;margin-top:0;margin-bottom:12px;">
          Grievance Accepted by Inspection Desk
        </h2>
        <p style="margin-bottom:20px;">
          Hello <strong>${complaint.citizenName}</strong>, your filed grievance has been reviewed and officially <strong>Accepted</strong> by the <strong>${complaint.department || "Municipal Inspection Desk"}</strong>.
        </p>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:12px;padding:20px;margin:20px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
          <p style="margin:0 0 6px 0;"><strong>Category:</strong> ${complaint.category} &rsaquo; ${complaint.issue}</p>
          <p style="margin:0;"><strong>Status:</strong> <span style="background:#2563eb;color:#ffffff;padding:3px 10px;border-radius:12px;font-weight:700;font-size:11px;">ACCEPTED</span></p>
        </div>

        <p style="color:#475569;font-size:13px;">
          Field work crews are scheduled to address the issue. You will receive further updates as progress unfolds.
        </p>
      `,
      ctaUrl: `${clientUrl}/track/${complaint.complaintId}`,
      ctaText: "TRACK REPAIR STATUS",
      ctaBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    }),
  };
};

// 6. In Progress Email
export const inProgressEmail = (complaint) => {
  return {
    subject: `Smart Civic Portal: Field Crew Active on Ground (Ref: ${complaint.complaintId})`,
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
      headerTitle: "Work In Progress Underway",
      headerSubtitle: `Field Dispatch Active: ${complaint.complaintId}`,
      contentHtml: `
        <h2 style="color:#b45309;font-size:18px;font-weight:800;margin-top:0;margin-bottom:12px;">
          Repair Crew Dispatched
        </h2>
        <p style="margin-bottom:20px;">
          Hello <strong>${complaint.citizenName}</strong>, municipal repair teams have commenced active physical repairs on your filed grievance.
        </p>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #d97706;border-radius:12px;padding:20px;margin:20px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
          <p style="margin:0 0 6px 0;"><strong>Category:</strong> ${complaint.category} &rsaquo; ${complaint.issue}</p>
          <p style="margin:0;"><strong>Status:</strong> <span style="background:#d97706;color:#ffffff;padding:3px 10px;border-radius:12px;font-weight:700;font-size:11px;">IN PROGRESS</span></p>
        </div>

        <p style="color:#475569;font-size:13px;">
          You will receive a notification upon completion for official citizen audit verification.
        </p>
      `,
      ctaUrl: `${clientUrl}/track/${complaint.complaintId}`,
      ctaText: "VIEW SLA TIMELINE",
      ctaBg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    }),
  };
};

// 7. Completed Email (Action Required: Citizen Verification)
export const completedEmail = (complaint) => {
  const verificationLink = `${clientUrl}/verify/${complaint.verificationToken || ''}`;
  return {
    subject: `Smart Civic Portal: Action Required - Official Resolution Verification (Ref: ${complaint.complaintId})`,
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #15803d 0%, #14532d 100%)",
      headerTitle: "Work Completion Notice",
      headerSubtitle: "Official Citizen Audit Loop Required",
      headerBadge: "ACTION REQUIRED • CITIZEN AUDIT VERIFICATION",
      contentHtml: `
        <h2 style="color:#15803d;font-size:20px;font-weight:800;margin-top:0;margin-bottom:12px;">
          Field Work Marked as Completed
        </h2>
        <p style="margin-bottom:20px;">
          Hello <strong>${complaint.citizenName}</strong>, municipal repair crews have marked your grievance ticket <strong>${complaint.complaintId}</strong> as completed.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:12px;padding:20px;margin:24px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
          <p style="margin:0 0 6px 0;"><strong>Category:</strong> ${complaint.category} &rsaquo; ${complaint.issue}</p>
          <p style="margin:0 0 6px 0;"><strong>Field Status:</strong> <span style="background:#16a34a;color:#ffffff;padding:3px 10px;border-radius:12px;font-weight:700;font-size:11px;">PENDING CITIZEN AUDIT</span></p>
        </div>

        <p style="color:#1e293b;font-size:14px;font-weight:600;margin-bottom:12px;">
          Please confirm whether the field repair has been completed satisfactorily.
        </p>

        <p style="color:#64748b;font-size:12px;margin:0 0 10px 0;">
          Clicking "Verify Resolution" allows you to either approve closure or reopen the ticket for re-inspection.
        </p>
      `,
      ctaUrl: verificationLink,
      ctaText: "VERIFY COMPLAINT RESOLUTION",
      ctaBg: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    }),
  };
};

// 8. Citizen Feedback Verification Email Receipt (To Citizen - NO ADMIN ACCESS BUTTON)
export const citizenVerificationReceiptEmail = (complaint, decision) => {
  const isSatisfied = decision === "yes" || complaint.citizenVerified === "Yes";
  return {
    subject: `Smart Civic Portal: Verification Feedback Confirmation (Ref: ${complaint.complaintId})`,
    html: renderMasterFrame({
      headerBg: isSatisfied
        ? "linear-gradient(135deg, #047857 0%, #064e3b 100%)"
        : "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
      headerTitle: isSatisfied ? "Resolution Audit Confirmed" : "Grievance Reopened for Field Review",
      headerSubtitle: `Official Feedback Acknowledgment for Ref: ${complaint.complaintId}`,
      contentHtml: `
        <h2 style="color:${isSatisfied ? '#047857' : '#b91c1c'};font-size:18px;font-weight:800;margin-top:0;margin-bottom:12px;">
          ${isSatisfied ? "Thank You for Verifying Resolution" : "Grievance Ticket Reopened"}
        </h2>
        <p style="margin-bottom:20px;">
          Hello <strong>${complaint.citizenName}</strong>, your verification audit feedback for grievance reference <strong>${complaint.complaintId}</strong> has been officially recorded in the e-governance database.
        </p>

        <div style="background:${isSatisfied ? '#f0fdf4' : '#fef2f2'};border:1px solid ${isSatisfied ? '#bbf7d0' : '#fecaca'};border-radius:12px;padding:20px;margin:20px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Your Recorded Audit Feedback:</strong> ${isSatisfied ? "Work Completed Satisfactorily (Closed & Verified)" : "Work Incomplete (Reopened - High Priority)"}</p>
          <p style="margin:0 0 6px 0;"><strong>Current Grievance Status:</strong> <strong>${complaint.status}</strong></p>
          <p style="margin:0;"><strong>Verification Timestamp:</strong> ${new Date().toLocaleString("en-IN")}</p>
        </div>

        <p style="color:#475569;font-size:13px;">
          Thank you for active civic participation in maintaining public municipal infrastructure quality.
        </p>
      `,
      ctaUrl: `${clientUrl}/track/${complaint.complaintId}`,
      ctaText: "TRACK GRIEVANCE STATUS",
      ctaBg: isSatisfied
        ? "linear-gradient(135deg, #047857 0%, #065f46 100%)"
        : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    }),
  };
};

// 9. Citizen Feedback Verification Email Alert (To Admin / Municipal Officer ONLY)
export const citizenVerificationAdminNoticeEmail = (complaint, decision) => {
  const isSatisfied = decision === "yes" || complaint.citizenVerified === "Yes";
  return {
    subject: `Smart Civic Portal: Citizen Audit Notice - ${isSatisfied ? "Closed" : "Reopened"} (Ref: ${complaint.complaintId})`,
    html: renderMasterFrame({
      headerBg: isSatisfied
        ? "linear-gradient(135deg, #047857 0%, #064e3b 100%)"
        : "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
      headerTitle: isSatisfied ? "Citizen Resolution Approved & Closed" : "Grievance Reopened by Citizen",
      headerSubtitle: `Officer Command Alert for Ticket: ${complaint.complaintId}`,
      headerBadge: "OFFICER ALERT • MUNICIPAL COMMAND CENTER",
      contentHtml: `
        <h2 style="color:${isSatisfied ? '#047857' : '#b91c1c'};font-size:18px;font-weight:800;margin-top:0;margin-bottom:12px;">
          ${isSatisfied ? "Citizen Approved Resolution" : "Citizen Reopened Grievance Ticket"}
        </h2>
        <p style="margin-bottom:20px;">
          Citizen <strong>${complaint.citizenName}</strong> (${complaint.phone}) submitted official audit feedback for grievance <strong>${complaint.complaintId}</strong>.
        </p>

        <div style="background:${isSatisfied ? '#f0fdf4' : '#fef2f2'};border:1px solid ${isSatisfied ? '#bbf7d0' : '#fecaca'};border-radius:12px;padding:20px;margin:20px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Citizen Audit Feedback:</strong> ${isSatisfied ? "Satisfied (Closed & Verified)" : "Unsatisfied (Reopened - High Priority Escalation)"}</p>
          <p style="margin:0 0 6px 0;"><strong>Department:</strong> ${complaint.department || "General Department"}</p>
          <p style="margin:0 0 6px 0;"><strong>Updated Ticket Status:</strong> <strong>${complaint.status}</strong></p>
          <p style="margin:0;"><strong>Verification Date:</strong> ${new Date().toLocaleString("en-IN")}</p>
        </div>
      `,
      ctaUrl: `${clientUrl}/admin`,
      ctaText: "OPEN OFFICER COMMAND CENTER",
      ctaBg: isSatisfied
        ? "linear-gradient(135deg, #047857 0%, #065f46 100%)"
        : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    }),
  };
};

// 9. SLA Policy Configuration Updated Email
export const serviceConfigNoticeEmail = (service) => {
  return {
    subject: `Smart Civic Portal: SLA Governance Policy Directive Updated (${service.category})`,
    html: renderMasterFrame({
      headerBg: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
      headerTitle: "Service SLA Rules Directive",
      headerSubtitle: `Policy Scope: ${service.category} - ${service.subcategory}`,
      contentHtml: `
        <h2 style="color:#0f172a;font-size:18px;font-weight:800;margin-top:0;margin-bottom:12px;">
          SLA Directive Rules Updated
        </h2>
        <p style="margin-bottom:20px;">
          The municipal SLA governance rules for <strong>${service.category} &rsaquo; ${service.subcategory}</strong> have been updated in the master service rule engine.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;font-size:13px;">
          <p style="margin:0 0 6px 0;"><strong>Department:</strong> ${service.department}</p>
          <p style="margin:0 0 6px 0;"><strong>Target SLA Timeline:</strong> ${service.slaHours} Hours</p>
          <p style="margin:0;"><strong>Priority Level:</strong> ${service.priority}</p>
        </div>
      `,
      ctaUrl: `${clientUrl}/admin`,
      ctaText: "VIEW SLA SERVICE CONFIGURATIONS",
    }),
  };
};