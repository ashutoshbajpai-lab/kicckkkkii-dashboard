// Mock Database for B2B Partner Portal & ERP Portal

export const initialInstitutes = [
  {
    id: "inst-001",
    group: "Amity Education",
    name: "Amity Global School",
    location: "Noida Sector 44",
    clientId: "client_amity_noida_99x2",
    secretKey: "hidden_key",
    apiKey: "hidden_key",
    slug: "amity-global-noida",
    webhookUrl: "https://api.amity.edu/webhooks/grayquest",
    events: ["payment.success", "student.onboarded", "payout.settled"],
    board: "CBSE",
    totalStudents: 1450,
    onboardingDate: "2025-09-12",
    totalGmv: 8524000,
    status: "Active",
    primaryContact: {
      name: "Dr. Sandeep Sharma",
      role: "Finance Director",
      email: "sandeep.sharma@amity.edu",
      phone: "+91 98112 34567"
    },
    feeHeaders: [
      { id: "fee-01", name: "Tuition Fee", mode: "EMI Only", status: "Active", limit: 250000 },
      { id: "fee-02", name: "Admission Fee", mode: "PG Only", status: "Active", limit: 50000 },
      { id: "fee-03", name: "Hostel & Mess Fee", mode: "Both EMI & Auto-Debit", status: "Active", limit: 120000 },
      { id: "fee-04", name: "Examination Fee", mode: "PG Only", status: "Active", limit: 15000 },
      { id: "fee-05", name: "Transport Fee", mode: "Auto-Debit Only", status: "Inactive", limit: 45000 }
    ],
    enabledProducts: [
      { id: "prod-01", category: "EMI Financing", variant: "6-Month No-Cost EMI", status: "Active" },
      { id: "prod-02", category: "EMI Financing", variant: "12-Month Low-Interest EMI", status: "Active" },
      { id: "prod-03", category: "Payment Gateway", variant: "Standard PG Credit Card / UPI", status: "Active" },
      { id: "prod-04", category: "Auto-Debit", variant: "Monthly NACH Mandate Setup", status: "Inactive" }
    ],
    funnel: { applied: 120, kyc: 85, mandate: 64, approval: 52, disbursed: 45 }
  },
  {
    id: "inst-002",
    group: "Delhi Public School",
    name: "DPS Vasant Kunj",
    location: "South Delhi",
    clientId: "client_dps_vk_88b1",
    secretKey: "hidden_key",
    apiKey: "ak_live_19bb84cda49e",
    slug: "dps-vasant-kunj",
    webhookUrl: "https://dpsvk.school/api/gq-receiver",
    events: ["payment.success", "payment.failed"],
    board: "ICSE",
    totalStudents: 2200,
    onboardingDate: "2025-10-05",
    totalGmv: 12450000,
    status: "Active",
    primaryContact: {
      name: "Ritu Verma",
      role: "Chief Accountant",
      email: "finance@dpsvk.in",
      phone: "+91 99100 88221"
    },
    feeHeaders: [
      { id: "fee-01", name: "Tuition Fee", mode: "Both EMI & Auto-Debit", status: "Active", limit: 180000 },
      { id: "fee-02", name: "Registration Fee", mode: "PG Only", status: "Active", limit: 10000 },
      { id: "fee-03", name: "Lab & Library Fee", mode: "PG Only", status: "Active", limit: 20000 }
    ],
    enabledProducts: [
      { id: "prod-01", category: "EMI Financing", variant: "6-Month No-Cost EMI", status: "Active" },
      { id: "prod-03", category: "Payment Gateway", variant: "Standard PG Credit Card / UPI", status: "Active" },
      { id: "prod-04", category: "Auto-Debit", variant: "Monthly NACH Mandate Setup", status: "Active" }
    ],
    funnel: { applied: 210, kyc: 160, mandate: 145, approval: 130, disbursed: 124 }
  },
  {
    id: "inst-003",
    group: "Ryan International",
    name: "Ryan School",
    location: "Gurugram Sector 40",
    clientId: "client_ryan_ggn_33t5",
    secretKey: "hidden_key",
    apiKey: "ak_live_33ee884b2c11",
    slug: "ryan-gurugram",
    webhookUrl: "https://webhooks.ryanportal.com/gq-payouts",
    events: ["payment.success", "payout.settled", "payout.failed"],
    board: "CBSE",
    totalStudents: 1850,
    onboardingDate: "2025-11-20",
    totalGmv: 6120000,
    status: "Active",
    primaryContact: {
      name: "Amit Singhal",
      role: "Operations Head",
      email: "amit.singhal@ryaninstitutions.com",
      phone: "+91 95600 12345"
    },
    feeHeaders: [
      { id: "fee-01", name: "Tuition Fee", mode: "EMI Only", status: "Active", limit: 300000 },
      { id: "fee-02", name: "Activity Fee", mode: "PG Only", status: "Active", limit: 35000 }
    ],
    enabledProducts: [
      { id: "prod-01", category: "EMI Financing", variant: "6-Month No-Cost EMI", status: "Active" },
      { id: "prod-02", category: "EMI Financing", variant: "12-Month Low-Interest EMI", status: "Active" }
    ],
    funnel: { applied: 95, kyc: 62, mandate: 51, approval: 45, disbursed: 40 }
  },
  {
    id: "inst-004",
    group: "Ryan International",
    name: "Ryan International School",
    location: "Mumbai Malad",
    clientId: "client_ryan_mumbai_11z9",
    secretKey: "hidden_key",
    apiKey: "ak_live_22ff994c2c88",
    slug: "ryan-mumbai",
    webhookUrl: "",
    events: ["student.onboarded"],
    board: "IB",
    totalStudents: 920,
    onboardingDate: "2026-02-10",
    totalGmv: 3100000,
    status: "Inactive",
    primaryContact: {
      name: "Suresh Prabhu",
      role: "Branch Manager",
      email: "suresh.prabhu@ryanmumbai.edu",
      phone: "+91 91223 34455"
    },
    feeHeaders: [
      { id: "fee-01", name: "Annual Tuition", mode: "Both EMI & Auto-Debit", status: "Active", limit: 250000 }
    ],
    enabledProducts: [
      { id: "prod-03", category: "Payment Gateway", variant: "Standard PG Credit Card / UPI", status: "Active" }
    ],
    funnel: { applied: 40, kyc: 20, mandate: 10, approval: 5, disbursed: 2 }
  }
];

// Transactions — disbursementDate only exists for EMI mode
export const initialTransactions = [
  {
    id: "TXN-1001", orderId: "ORD-99281", paymentId: "PAY-8829102",
    studentId: "STU-88912", studentName: "Aditya Malhotra",
    studentEmail: "adityam@yahoo.com", studentPhone: "9812238421",
    instituteId: "inst-001", instituteName: "Amity Global School",
    feeHeader: "Tuition Fee", amount: 125000,
    paymentMode: "EMI", vendor: "GrayQuest EMI Finance",
    status: "Success",
    createdAt: "2026-06-15T11:20:00",
    disbursementDate: "2026-06-16",  // EMI ONLY
    settledAt: "2026-06-16T17:00:00",
    commissionRate: 2.5, commissionEarned: 3125, commissionPaid: true
  },
  {
    id: "TXN-1002", orderId: "ORD-99282", paymentId: "PAY-8829103",
    studentId: "STU-88915", studentName: "Chiranjeevi Rao",
    studentEmail: "chiranjeevi.r@gmail.com", studentPhone: "9560099112",
    instituteId: "inst-001", instituteName: "Amity Global School",
    feeHeader: "Hostel & Mess Fee", amount: 60000,
    paymentMode: "Auto-Debit", vendor: "NACH Mandate",
    status: "Success",
    createdAt: "2026-06-15T12:45:00",
    disbursementDate: null, // Auto-Debit — NO disbursement
    settledAt: "2026-06-17T17:00:00",
    commissionRate: 1.0, commissionEarned: 600, commissionPaid: true
  },
  {
    id: "TXN-1003", orderId: "ORD-99283", paymentId: "PAY-8829104",
    studentId: "STU-88920", studentName: "Priyanka Sen",
    studentEmail: "priyanka.sen@outlook.com", studentPhone: "8820011223",
    instituteId: "inst-001", instituteName: "Amity Global School",
    feeHeader: "Admission Fee", amount: 50000,
    paymentMode: "PG", vendor: "Razorpay PG",
    status: "Success",
    createdAt: "2026-06-15T16:10:00",
    disbursementDate: null, // PG — NO disbursement
    settledAt: "2026-06-16T10:00:00",
    commissionRate: 1.8, commissionEarned: 900, commissionPaid: false
  },
  {
    id: "TXN-1004", orderId: "ORD-99284", paymentId: "PAY-8829105",
    studentId: "STU-88925", studentName: "Karan Johar",
    studentEmail: "kjohar@dharmaprod.com", studentPhone: "9001100223",
    instituteId: "inst-001", instituteName: "Amity Global School",
    feeHeader: "Tuition Fee", amount: 125000,
    paymentMode: "EMI", vendor: "GrayQuest EMI Finance",
    status: "Pending",
    createdAt: "2026-06-28T09:30:00",
    disbursementDate: null,
    settledAt: null,
    commissionRate: 2.5, commissionEarned: 3125, commissionPaid: false
  },
  {
    id: "TXN-1005", orderId: "ORD-99285", paymentId: "PAY-8829106",
    studentId: "STU-88930", studentName: "Simran Kaur",
    studentEmail: "simran.k@yahoo.com", studentPhone: "7042299881",
    instituteId: "inst-001", instituteName: "Amity Global School",
    feeHeader: "Transport Fee", amount: 15000,
    paymentMode: "PG", vendor: "Razorpay PG",
    status: "Failed",
    createdAt: "2026-06-29T10:15:00",
    disbursementDate: null,
    settledAt: null,
    commissionRate: 1.8, commissionEarned: 0, commissionPaid: false
  },
  {
    id: "TXN-2001", orderId: "ORD-88711", paymentId: "PAY-7711221",
    studentId: "STU-77610", studentName: "Rohan Khanna",
    studentEmail: "rohan.khanna@gmail.com", studentPhone: "9818812345",
    instituteId: "inst-002", instituteName: "DPS Vasant Kunj",
    feeHeader: "Tuition Fee", amount: 90000,
    paymentMode: "EMI", vendor: "GrayQuest EMI Finance",
    status: "Success",
    createdAt: "2026-06-15T10:00:00",
    disbursementDate: "2026-06-16",  // EMI ONLY
    settledAt: "2026-06-16T17:00:00",
    commissionRate: 2.0, commissionEarned: 1800, commissionPaid: true
  },
  {
    id: "TXN-2002", orderId: "ORD-88712", paymentId: "PAY-7711222",
    studentId: "STU-77614", studentName: "Meher Gill",
    studentEmail: "meherg@hotmail.com", studentPhone: "9910022334",
    instituteId: "inst-002", instituteName: "DPS Vasant Kunj",
    feeHeader: "Tuition Fee", amount: 90000,
    paymentMode: "Auto-Debit", vendor: "NACH Mandate",
    status: "Success",
    createdAt: "2026-06-15T15:20:00",
    disbursementDate: null,
    settledAt: "2026-06-17T17:00:00",
    commissionRate: 0.8, commissionEarned: 720, commissionPaid: true
  },
  {
    id: "TXN-2003", orderId: "ORD-88713", paymentId: "PAY-7711223",
    studentId: "STU-77619", studentName: "Kabir Mehta",
    studentEmail: "kabir.mehta@yahoo.in", studentPhone: "8447766551",
    instituteId: "inst-002", instituteName: "DPS Vasant Kunj",
    feeHeader: "Registration Fee", amount: 10000,
    paymentMode: "PG", vendor: "BillDesk PG",
    status: "Success",
    createdAt: "2026-06-15T17:45:00",
    disbursementDate: null,
    settledAt: "2026-06-16T10:00:00",
    commissionRate: 1.5, commissionEarned: 150, commissionPaid: false
  },
  {
    id: "TXN-3001", orderId: "ORD-77111", paymentId: "PAY-6655112",
    studentId: "STU-55410", studentName: "Ananya Panday",
    studentEmail: "ananya.p@campus.in", studentPhone: "9810010099",
    instituteId: "inst-003", instituteName: "Ryan School",
    feeHeader: "Tuition Fee", amount: 150000,
    paymentMode: "EMI", vendor: "GrayQuest EMI Finance",
    status: "Success",
    createdAt: "2026-05-10T09:00:00",
    disbursementDate: "2026-05-11",  // EMI ONLY
    settledAt: "2026-05-11T17:00:00",
    commissionRate: 2.2, commissionEarned: 3300, commissionPaid: true
  },
  {
    id: "TXN-3002", orderId: "ORD-77112", paymentId: "PAY-6655113",
    studentId: "STU-55415", studentName: "Ishaan Khattar",
    studentEmail: "ishaan.k@khattar.com", studentPhone: "9123456789",
    instituteId: "inst-003", instituteName: "Ryan School",
    feeHeader: "Activity Fee", amount: 35000,
    paymentMode: "PG", vendor: "Razorpay PG",
    status: "Success",
    createdAt: "2026-06-15T11:00:00",
    disbursementDate: null,
    settledAt: "2026-06-16T10:00:00",
    commissionRate: 1.5, commissionEarned: 525, commissionPaid: true
  }
];

// Settlement records — disbursementDate only for EMI, PG/AutoDebit have only settlementDate
export const initialSettlements = [
  {
    id: "SET-001",
    txnId: "TXN-1001",
    utr: "UTR-9988123-EMI",
    studentId: "STU-88912",
    studentName: "Aditya Malhotra",
    studentPhone: "9812238421",
    instituteId: "inst-001",
    instituteName: "Amity Global School",
    feeHeader: "Tuition Fee",
    amount: 125000,
    paymentMode: "EMI",
    settlementDate: "2026-06-16",
    disbursementDate: "2026-06-16",  // EMI ONLY
    bankName: "HDFC Bank",
    accountNo: "XXXXXX8829",
    ifsc: "HDFC0000102",
    status: "Settled"
  },
  {
    id: "SET-002",
    txnId: "TXN-1002",
    utr: "UTR-7711221-AD",
    studentId: "STU-88915",
    studentName: "Chiranjeevi Rao",
    studentPhone: "9560099112",
    instituteId: "inst-001",
    instituteName: "Amity Global School",
    feeHeader: "Hostel & Mess Fee",
    amount: 60000,
    paymentMode: "Auto-Debit",
    settlementDate: "2026-06-17",
    disbursementDate: null,  // Auto-Debit — no disbursement
    bankName: "HDFC Bank",
    accountNo: "XXXXXX8829",
    ifsc: "HDFC0000102",
    status: "Settled"
  },
  {
    id: "SET-003",
    txnId: "TXN-1003",
    utr: "UTR-9988125-PG",
    studentId: "STU-88920",
    studentName: "Priyanka Sen",
    studentPhone: "8820011223",
    instituteId: "inst-001",
    instituteName: "Amity Global School",
    feeHeader: "Admission Fee",
    amount: 50000,
    paymentMode: "PG",
    settlementDate: "2026-06-16",
    disbursementDate: null,  // PG — no disbursement
    bankName: "ICICI Bank",
    accountNo: "XXXXXX1190",
    ifsc: "ICIC0000332",
    status: "Settled"
  },
  {
    id: "SET-004",
    txnId: "TXN-2001",
    utr: "UTR-9988126-EMI",
    studentId: "STU-77610",
    studentName: "Rohan Khanna",
    studentPhone: "9818812345",
    instituteId: "inst-002",
    instituteName: "DPS Vasant Kunj",
    feeHeader: "Tuition Fee",
    amount: 90000,
    paymentMode: "EMI",
    settlementDate: "2026-06-16",
    disbursementDate: "2026-06-16",  // EMI ONLY
    bankName: "State Bank of India",
    accountNo: "XXXXXX4431",
    ifsc: "SBIN0001092",
    status: "Settled"
  },
  {
    id: "SET-005",
    txnId: "TXN-2002",
    utr: "UTR-7711222-AD",
    studentId: "STU-77614",
    studentName: "Meher Gill",
    studentPhone: "9910022334",
    instituteId: "inst-002",
    instituteName: "DPS Vasant Kunj",
    feeHeader: "Tuition Fee",
    amount: 90000,
    paymentMode: "Auto-Debit",
    settlementDate: "2026-06-17",
    disbursementDate: null,
    bankName: "State Bank of India",
    accountNo: "XXXXXX4431",
    ifsc: "SBIN0001092",
    status: "Settled"
  },
  {
    id: "SET-006",
    txnId: "TXN-2003",
    utr: "UTR-9988127-PG",
    studentId: "STU-77619",
    studentName: "Kabir Mehta",
    studentPhone: "8447766551",
    instituteId: "inst-002",
    instituteName: "DPS Vasant Kunj",
    feeHeader: "Registration Fee",
    amount: 10000,
    paymentMode: "PG",
    settlementDate: "2026-06-16",
    disbursementDate: null,
    bankName: "Axis Bank",
    accountNo: "XXXXXX2011",
    ifsc: "UTIB0000082",
    status: "Settled"
  },
  {
    id: "SET-007",
    txnId: "TXN-3001",
    utr: "UTR-8822901-EMI",
    studentId: "STU-55410",
    studentName: "Ananya Panday",
    studentPhone: "9810010099",
    instituteId: "inst-003",
    instituteName: "Ryan School",
    feeHeader: "Tuition Fee",
    amount: 150000,
    paymentMode: "EMI",
    settlementDate: "2026-05-11",
    disbursementDate: "2026-05-11",  // EMI ONLY
    bankName: "Yes Bank",
    accountNo: "XXXXXX9012",
    ifsc: "YESB0000112",
    status: "Settled"
  },
  {
    id: "SET-008",
    txnId: "TXN-3002",
    utr: "UTR-9988128-PG",
    studentId: "STU-55415",
    studentName: "Ishaan Khattar",
    studentPhone: "9123456789",
    instituteId: "inst-003",
    instituteName: "Ryan School",
    feeHeader: "Activity Fee",
    amount: 35000,
    paymentMode: "PG",
    settlementDate: "2026-06-16",
    disbursementDate: null,
    bankName: "Yes Bank",
    accountNo: "XXXXXX9012",
    ifsc: "YESB0000112",
    status: "Settled"
  }
];

export const initialTeam = [
  { id: "team-1", name: "Rahul Deshmukh", email: "rahul@grayquest.com", role: "Admin", status: "Active" },
  { id: "team-2", name: "Priya Sundaram", email: "priya@grayquest.com", role: "Accountant", status: "Active" },
  { id: "team-3", name: "Neha Goel", email: "neha@grayquest.com", role: "Accountant", status: "Active" }
];

export const initialSystemLogs = [
  { id: "log-1", timestamp: "2026-06-30T10:15:30", user: "rahul@grayquest.com", action: "Updated webhook URL for Amity Global School", type: "Security" },
  { id: "log-2", timestamp: "2026-06-30T09:22:11", user: "priya@grayquest.com", action: "Exported Settlements CSV report (June)", type: "Export" },
  { id: "log-3", timestamp: "2026-06-29T18:40:02", user: "rahul@grayquest.com", action: "Added new team member Priya Sundaram as Accountant", type: "RBAC" },
  { id: "log-4", timestamp: "2026-06-29T14:12:55", user: "neha@grayquest.com", action: "Enabled 12-Month Low-Interest EMI for Amity Global School", type: "Product" }
];

export const geographicDistribution = [
  { id: "geo-1", region: "Delhi NCR", activeInstitutes: 3, gmv: 27094000, share: "66.5%" },
  { id: "geo-2", region: "Maharashtra", activeInstitutes: 1, gmv: 3100000, share: "7.6%" },
  { id: "geo-3", region: "Other Regions", activeInstitutes: 0, gmv: 0, share: "0%" }
];
