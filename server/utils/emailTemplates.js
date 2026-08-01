// Comprehensive E-Governance System Email Templates for ALL Portal Actions

// 1. Welcome & Signup Email
export const signupWelcomeEmail = (user) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return {
    subject: "🎉 Welcome to Smart Civic e-Governance Portal",
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
          <div style="background:#0f172a;color:white;text-align:center;padding:24px;">
            <h1 style="margin:0;font-size:22px;">🏛 Smart Civic e-Gov Portal</h1>
            <p style="margin-top:6px;font-size:13px;color:#cbd5e1;">Citizen Account Verification & Welcome</p>
          </div>
          <div style="padding:28px;color:#334155;font-size:14px;line-height:1.6;">
            <h2 style="color:#0f172a;margin-top:0;">Welcome, ${user.fullName}!</h2>
            <p>Your public citizen portal account has been created successfully.</p>
            <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;"><b>Registered Email:</b> ${user.email}</p>
              <p style="margin:6px 0 0 0;"><b>Residential Address:</b> ${user.address || "Configured in Profile"}</p>
            </div>
            <p>You can now file civic infrastructure grievances, monitor live municipal SLA repair timelines, and track resolution progress.</p>
            <div style="text-align:center;margin:25px 0;">
              <a href="${clientUrl}/profile" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Access Citizen Portal</a>
            </div>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
            <p style="font-size:12px;color:#64748b;margin:0;">Ministry of Urban & Municipal Infrastructure • e-Governance Response Desk</p>
          </div>
        </div>
      </div>
    `,
  };
};

// 2. Profile Details Updated Security Alert Email
export const profileUpdatedEmail = (user) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return {
    subject: "🛡 Security Notice: Smart Civic Profile Credentials Updated",
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
          <div style="background:#0f172a;color:white;text-align:center;padding:20px;">
            <h1 style="margin:0;font-size:20px;">🏛 Smart Civic Portal</h1>
            <p style="margin-top:4px;font-size:12px;color:#cbd5e1;">Account Security Alert</p>
          </div>
          <div style="padding:24px;color:#334155;font-size:14px;">
            <h3 style="color:#0f172a;margin-top:0;">Profile Updated</h3>
            <p>Hello <b>${user.fullName}</b>,</p>
            <p>This is to confirm that your portal profile credentials and contact preferences were updated on ${new Date().toLocaleString("en-IN")}.</p>
            <div style="background:#f8fafc;border-left:4px solid #059669;padding:14px;border-radius:8px;margin:16px 0;font-size:13px;">
              <p style="margin:0;"><b>Full Name:</b> ${user.fullName}</p>
              <p style="margin:4px 0;"><b>Phone Number:</b> ${user.phone || "Not specified"}</p>
              <p style="margin:4px 0;"><b>Residential Address:</b> ${user.address || "Not specified"}</p>
              <p style="margin:4px 0;"><b>Region:</b> ${user.district || "BENGALURU URBAN"}, ${user.state || "Karnataka"}</p>
            </div>
            <p style="font-size:12px;color:#64748b;">If you did not initiate this change, please log in to your account immediately to verify credentials.</p>
          </div>
        </div>
      </div>
    `,
  };
};

// 3. New Complaint Registration Email (To Citizen)
export const complaintRegistrationCitizenEmail = (complaint) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return {
    subject: `🏛 Civic Grievance Registered - Complaint ID: ${complaint.complaintId}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
          <div style="background:#1e3a8a;color:white;text-align:center;padding:24px;">
            <h1 style="margin:0;font-size:22px;">🏛 Smart Civic e-Governance</h1>
            <p style="margin-top:6px;font-size:13px;color:#93c5fd;">Grievance Registration Acknowledgment</p>
          </div>
          <div style="padding:28px;color:#334155;font-size:14px;line-height:1.6;">
            <h2 style="color:#1e3a8a;margin-top:0;">Grievance Registered Successfully</h2>
            <p>Hello <b>${complaint.citizenName}</b>,</p>
            <p>Your civic complaint has been registered in the official municipal tracking desk.</p>
            <div style="background:#f8fafc;border-left:5px solid #2563eb;padding:18px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;"><b>Complaint ID:</b> <span style="font-family:monospace;color:#1e3a8a;font-weight:bold;">${complaint.complaintId}</span></p>
              <p style="margin:6px 0;"><b>Category:</b> ${complaint.category}</p>
              <p style="margin:6px 0;"><b>Issue Subcategory:</b> ${complaint.issue}</p>
              <p style="margin:6px 0;"><b>Assigned Department:</b> ${complaint.department || "General Department"}</p>
              <p style="margin:6px 0;"><b>Priority Level:</b> <span style="color:#d97706;font-weight:bold;">${complaint.priority || "Medium"}</span></p>
              <p style="margin:6px 0;"><b>Incident Location:</b> ${complaint.address}</p>
              <p style="margin:6px 0;"><b>Status:</b> <span style="background:#fef3c7;color:#92400e;padding:2px 8px;rounded:4px;font-weight:bold;">Pending Dispatch</span></p>
            </div>
            <div style="text-align:center;margin:30px 0;">
              <a href="${clientUrl}/track/${complaint.complaintId}" style="background:#1e3a8a;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;display:inline-block;">Track Live SLA Progress</a>
            </div>
            <p style="font-size:13px;color:#64748b;">Thank you for active civic participation in maintaining public municipal infrastructure.</p>
          </div>
        </div>
      </div>
    `,
  };
};

// 4. New Complaint Alert to Department Officer / Nodal Desk
export const complaintRegistrationAdminAlertEmail = (complaint) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return {
    subject: `🚨 New Civic Action Required: ${complaint.category} - ${complaint.complaintId}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
          <div style="background:#991b1b;color:white;text-align:center;padding:24px;">
            <h1 style="margin:0;font-size:22px;">🚨 Municipal Dispatch Alert</h1>
            <p style="margin-top:6px;font-size:13px;color:#fca5a5;">New Grievance Assigned to ${complaint.department}</p>
          </div>
          <div style="padding:28px;color:#334155;font-size:14px;line-height:1.6;">
            <h3 style="color:#991b1b;margin-top:0;">Action Required: Officer Dispatch</h3>
            <p>A new civic complaint has been submitted under your department jurisdiction.</p>
            <div style="background:#fef2f2;border-left:5px solid #dc2626;padding:18px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;"><b>Complaint ID:</b> ${complaint.complaintId}</p>
              <p style="margin:6px 0;"><b>Citizen Name:</b> ${complaint.citizenName} (${complaint.phone})</p>
              <p style="margin:6px 0;"><b>Category / Issue:</b> ${complaint.category} &rsaquo; ${complaint.issue}</p>
              <p style="margin:6px 0;"><b>Priority:</b> ${complaint.priority}</p>
              <p style="margin:6px 0;"><b>Location:</b> ${complaint.address}</p>
            </div>
            <div style="text-align:center;margin:25px 0;">
              <a href="${clientUrl}/admin" style="background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Open Officer Command Center</a>
            </div>
          </div>
        </div>
      </div>
    `,
  };
};

// 5. Accepted Email
export const acceptedEmail = (complaint) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return {
    subject: `🏛 Smart Civic - Complaint ${complaint.complaintId} Accepted`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">
          <div style="background:#2563eb;color:white;text-align:center;padding:24px;">
            <h1 style="margin:0;">🏛 Smart Civic</h1>
            <p style="margin-top:8px;">Municipal Officer Status Update</p>
          </div>
          <div style="padding:30px;color:#334155;">
            <h2 style="color:#2563eb;margin-top:0;">🎉 Complaint Accepted</h2>
            <p>Hello <b>${complaint.citizenName}</b>,</p>
            <p>Your grievance has been reviewed and officially <b>Accepted</b> by the <b>${complaint.department || "Municipal Officer Desk"}</b>.</p>
            <div style="background:#f8fafc;border-left:5px solid #2563eb;padding:18px;border-radius:8px;margin:25px 0;">
              <p style="margin:0;"><b>Complaint ID:</b> ${complaint.complaintId}</p>
              <p style="margin:6px 0;"><b>Category:</b> ${complaint.category}</p>
              <p style="margin:6px 0;"><b>Issue:</b> ${complaint.issue}</p>
              <p style="margin:6px 0;"><b>Status:</b> <span style="background:#2563eb;color:white;padding:3px 10px;border-radius:12px;font-weight:bold;">Accepted</span></p>
            </div>
            <p>Field repair personnel are scheduled to address the issue.</p>
            <div style="text-align:center;margin:25px 0;">
              <a href="${clientUrl}/track/${complaint.complaintId}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Track SLA Timeline</a>
            </div>
          </div>
        </div>
      </div>
    `,
  };
};

// 6. In Progress Email
export const inProgressEmail = (complaint) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return {
    subject: `👷 Smart Civic - Work In Progress for ${complaint.complaintId}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">
          <div style="background:#d97706;color:white;text-align:center;padding:24px;">
            <h1 style="margin:0;">👷 Work In Progress</h1>
            <p style="margin-top:8px;">Field Operations Underway</p>
          </div>
          <div style="padding:30px;color:#334155;">
            <h2 style="color:#d97706;margin-top:0;">Repair Team Dispatched</h2>
            <p>Hello <b>${complaint.citizenName}</b>,</p>
            <p>The municipal repair crew has commenced active work on your filed grievance.</p>
            <div style="background:#fffbeb;border-left:5px solid #d97706;padding:18px;border-radius:8px;margin:25px 0;">
              <p style="margin:0;"><b>Complaint ID:</b> ${complaint.complaintId}</p>
              <p style="margin:6px 0;"><b>Category:</b> ${complaint.category} &rsaquo; ${complaint.issue}</p>
              <p style="margin:6px 0;"><b>Status:</b> <span style="background:#d97706;color:white;padding:3px 10px;border-radius:12px;font-weight:bold;">In Progress</span></p>
            </div>
            <p>You will receive a notification upon completion.</p>
          </div>
        </div>
      </div>
    `,
  };
};

// 7. Completed Email
export const completedEmail = (complaint) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return {
    subject: `✅ Smart Civic - Complaint ${complaint.complaintId} Resolved`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">
          <div style="background:#16a34a;color:white;text-align:center;padding:24px;">
            <h1 style="margin:0;">🏛 Smart Civic</h1>
            <p style="margin-top:8px;">Complaint Resolution Update</p>
          </div>
          <div style="padding:30px;color:#334155;">
            <h2 style="color:#16a34a;margin-top:0;">🎉 Complaint Resolved</h2>
            <p>Hello <b>${complaint.citizenName}</b>,</p>
            <p>Your grievance has been marked as <b>Completed</b> by the municipal department.</p>
            <div style="background:#f0fdf4;border-left:5px solid #16a34a;padding:18px;border-radius:8px;margin:25px 0;">
              <p style="margin:0;"><b>Complaint ID:</b> ${complaint.complaintId}</p>
              <p style="margin:6px 0;"><b>Category:</b> ${complaint.category}</p>
              <p style="margin:6px 0;"><b>Status:</b> <span style="background:#16a34a;color:white;padding:3px 10px;border-radius:12px;font-weight:bold;">Completed</span></p>
            </div>
            <p>Please verify whether the repair has been executed satisfactorily.</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${clientUrl}/verify/${complaint.verificationToken || ''}" style="background:#16a34a;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;">✔ Verify Resolution</a>
            </div>
          </div>
        </div>
      </div>
    `,
  };
};

// 8. Citizen Feedback Verification Email Notification (To Admin/SuperAdmin)
export const citizenVerificationNoticeEmail = (complaint, decision) => {
  const isSatisfied = decision === "yes" || complaint.citizenVerified === "Yes";
  return {
    subject: `📢 Citizen Verification Notice: ${complaint.complaintId} - ${isSatisfied ? "Satisfied (Closed)" : "Reopened"}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
          <div style="background:${isSatisfied ? '#059669' : '#b91c1c'};color:white;text-align:center;padding:20px;">
            <h2 style="margin:0;">${isSatisfied ? "✅ Citizen Resolution Approved" : "⚠️ Citizen Reopened Grievance"}</h2>
            <p style="margin-top:4px;font-size:12px;">Verification Feedback Received</p>
          </div>
          <div style="padding:24px;color:#334155;font-size:14px;">
            <p>Citizen <b>${complaint.citizenName}</b> submitted resolution verification feedback for complaint <b>${complaint.complaintId}</b>.</p>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="margin:0;"><b>Citizen Response:</b> ${isSatisfied ? "Satisfied & Approved" : "Unsatisfied / Work Incomplete"}</p>
              <p style="margin:6px 0 0 0;"><b>Updated Status:</b> ${complaint.status}</p>
            </div>
          </div>
        </div>
      </div>
    `,
  };
};

// 9. SLA Policy Configuration Updated Email
export const serviceConfigNoticeEmail = (service) => {
  return {
    subject: `⚙️ SLA Policy Directive Updated: ${service.category} - ${service.subcategory}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
          <div style="background:#0f172a;color:white;text-align:center;padding:20px;">
            <h2 style="margin:0;">⚙️ Service SLA Rules Updated</h2>
          </div>
          <div style="padding:24px;color:#334155;font-size:14px;">
            <p>The municipal SLA governance rules for <b>${service.category} &rsaquo; ${service.subcategory}</b> have been updated.</p>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="margin:0;"><b>Department:</b> ${service.department}</p>
              <p style="margin:6px 0;"><b>Target SLA Hours:</b> ${service.slaHours} Hours</p>
              <p style="margin:6px 0;"><b>Priority:</b> ${service.priority}</p>
            </div>
          </div>
        </div>
      </div>
    `,
  };
};