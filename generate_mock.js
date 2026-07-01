import fs from 'fs';

const generateMockData = () => {
  const institutes = [
    { id: "inst-001", group: "Amity Education", name: "Amity Global School", location: "Noida Sector 44", clientId: "client_amity_noida", slug: "amity-noida", board: "CBSE", totalStudents: 1450, onboardingDate: "2025-09-12", totalGmv: 8524000, status: "Active" },
    { id: "inst-002", group: "Delhi Public School", name: "DPS Vasant Kunj", location: "South Delhi", clientId: "client_dps_vk", slug: "dps-vk", board: "ICSE", totalStudents: 2200, onboardingDate: "2025-10-05", totalGmv: 12450000, status: "Active" },
    { id: "inst-003", group: "Ryan International", name: "Ryan School", location: "Gurugram Sector 40", clientId: "client_ryan_ggn", slug: "ryan-gurugram", board: "CBSE", totalStudents: 1850, onboardingDate: "2025-11-20", totalGmv: 6120000, status: "Active" },
    { id: "inst-004", group: "Vibgyor High", name: "Vibgyor High School", location: "Pune Magarpatta", clientId: "client_vibgyor_pune", slug: "vibgyor-pune", board: "IGCSE", totalStudents: 950, onboardingDate: "2026-01-15", totalGmv: 3400000, status: "Active" },
    { id: "inst-005", group: "Podar Education", name: "Podar International", location: "Mumbai Santacruz", clientId: "client_podar_mumbai", slug: "podar-mumbai", board: "CBSE", totalStudents: 3100, onboardingDate: "2025-08-10", totalGmv: 18500000, status: "Active" },
    { id: "inst-006", group: "Narayana Schools", name: "Narayana e-Techno", location: "Bangalore HSR", clientId: "client_narayana_blr", slug: "narayana-hsr", board: "State Board", totalStudents: 1200, onboardingDate: "2026-03-05", totalGmv: 4200000, status: "Active" },
    { id: "inst-007", group: "EuroSchool", name: "EuroSchool North Campus", location: "Ahmedabad", clientId: "client_euro_ahmedabad", slug: "euro-ahmedabad", board: "ICSE", totalStudents: 850, onboardingDate: "2026-04-12", totalGmv: 2150000, status: "Inactive" },
    { id: "inst-008", group: "Chaitanya Group", name: "Sri Chaitanya", location: "Hyderabad Kukatpally", clientId: "client_chaitanya_hyd", slug: "chaitanya-hyd", board: "State Board", totalStudents: 4000, onboardingDate: "2025-06-20", totalGmv: 25000000, status: "Active" },
    { id: "inst-009", group: "Global Indian Int.", name: "GIIS", location: "Noida Sector 71", clientId: "client_giis_noida", slug: "giis-noida", board: "IB", totalStudents: 1100, onboardingDate: "2026-02-18", totalGmv: 9800000, status: "Active" },
    { id: "inst-010", group: "Oakridge", name: "Oakridge International", location: "Gachibowli", clientId: "client_oakridge_gachi", slug: "oakridge-gachi", board: "IB", totalStudents: 1600, onboardingDate: "2025-07-30", totalGmv: 14200000, status: "Active" },
  ].map(inst => ({
    ...inst,
    primaryContact: {
      name: ["Rajiv Menon", "Sonia Khanna", "Amit Desai", "Neha Sharma"][Math.floor(Math.random() * 4)],
      role: ["Finance Director", "Accounts Head", "Principal", "Admin Lead"][Math.floor(Math.random() * 4)],
      email: `admin@${inst.slug}.edu.in`,
      phone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000)
    },
    feeHeaders: [
      { id: "fh1", name: "Tuition Fee", mode: "All", status: "Active" },
      { id: "fh2", name: "Transport Fee", mode: "PG/Auto-Debit", status: Math.random() > 0.5 ? "Active" : "Inactive" },
      { id: "fh3", name: "Hostel Fee", mode: "PG/EMI", status: Math.random() > 0.5 ? "Active" : "Inactive" }
    ],
    enabledProducts: [
      { id: "ep1", variant: "6-Month No-Cost", category: "EMI Financing", status: "Active" },
      { id: "ep2", variant: "Credit Card / UPI", category: "Payment Gateway", status: "Active" },
      { id: "ep3", variant: "Monthly NACH", category: "Auto-Debit", status: Math.random() > 0.3 ? "Active" : "Inactive" }
    ],
    funnel: {
      applied: Math.floor(Math.random() * 500) + 200,
      kyc: Math.floor(Math.random() * 400) + 150,
      mandate: Math.floor(Math.random() * 350) + 100,
      approval: Math.floor(Math.random() * 300) + 80,
      disbursed: Math.floor(Math.random() * 250) + 50
    }
  }));

  // Helper arrays
  const firstNames = ["Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Advik", "Kabir", "Anika", "Navya", "Ojas", "Riya", "Kavya", "Ishaan", "Reyansh", "Ayaan", "Dhruv", "Rudra", "Arjun", "Neha", "Pooja"];
  const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Das", "Kaur", "Gupta", "Verma", "Jain", "Mehta", "Bose", "Nair", "Reddy", "Iyer", "Rao", "Joshi", "Kapoor", "Yadav", "Chauhan", "Sen"];
  const getStudent = () => firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
  const getAmount = () => Math.floor(Math.random() * 90 + 10) * 1000;
  
  const modes = ['PG', 'PG', 'PG', 'PG', 'Auto-Debit', 'Auto-Debit', 'EMI', 'EMI'];
  const pgStatuses = ['Success', 'Success', 'Success', 'Success', 'Success', 'Failed', 'Failed', 'Pending'];
  const adStatuses = ['Success', 'Success', 'Success', 'Failed', 'Pending'];
  
  const batches = [];
  const generateUtr = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const getBank = () => ['HDFC BANK', 'ICICI BANK', 'STATE BANK OF INDIA', 'AXIS BANK', 'KOTAK MAHINDRA BANK'][Math.floor(Math.random() * 5)];
  
  let batchCounter = 1;

  // Generate 35 batches
  for (let i = 0; i < 35; i++) {
    const d = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // last 30 days
    const mode = ['PG', 'Auto-Debit', 'EMI'][Math.floor(Math.random() * 3)];
    const inst = institutes[Math.floor(Math.random() * institutes.length)];
    
    let b = {
      id: `SETL-BATCH-${String(batchCounter++).padStart(3, '0')}`,
      date: d.toISOString(),
      mode: mode,
      amount: getAmount() * (Math.floor(Math.random() * 3) + 1), // larger amount for batches
      utr: generateUtr(),
      bankAccount: "XXXXXX" + Math.floor(1000 + Math.random() * 9000),
      bankName: getBank(),
      status: "Settled"
    };

    if (mode === 'EMI') {
      b.applicationId = `APP-GQ-${Math.floor(10000 + Math.random() * 90000)}`;
      b.studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      b.studentName = getStudent();
      b.disbursalType = Math.random() > 0.5 ? "Tranche" : "Retention";
      b.repaymentStatus = ["Ongoing", "Ongoing", "Completed", "Overdue"][Math.floor(Math.random() * 4)];
      b.class = `Grade ${Math.floor(Math.random() * 12) + 1}`;
      b.group = inst.group;
      b.institute = inst.name;
      b.location = inst.location;
      b.board = inst.board;
      b.applicationDate = new Date(d.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
      b.ifsc = b.bankName.substring(0, 4) + "000" + Math.floor(1000 + Math.random() * 9000);
      b.amount = getAmount() * 3; // Loans are bigger
    }

    batches.push(b);
  }

  // Sort batches desc
  batches.sort((a,b) => new Date(b.date) - new Date(a.date));

  // Generate Transactions
  const transactions = [];
  let txnCounter = 1001;
  
  // Link some transactions to batches
  for (let i = 0; i < 250; i++) {
    const inst = institutes[Math.floor(Math.random() * institutes.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const amount = getAmount();
    const d = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // last 30 days
    const student = getStudent();
    
    let status;
    if (mode === 'PG') status = pgStatuses[Math.floor(Math.random() * pgStatuses.length)];
    else status = adStatuses[Math.floor(Math.random() * adStatuses.length)];

    let txn = {
      id: `TXN-${String(txnCounter++)}`,
      paymentMode: mode,
      status: status,
      amount: amount,
      createdAt: d.toISOString(),
      studentName: student,
      studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      studentEmail: student.toLowerCase().replace(' ', '.') + "@example.com",
      studentPhone: "9" + Math.floor(100000000 + Math.random() * 900000000),
      studentClass: `Grade ${Math.floor(Math.random() * 12) + 1}`,
      parentName: "Mr. " + student.split(' ')[1],
      instituteId: inst.id,
      instituteName: inst.name,
      location: inst.location,
      board: inst.board,
      feeHeader: ['Tuition Fee', 'Admission Fee', 'Transport Fee', 'Activity Fee'][Math.floor(Math.random() * 4)],
      serviceCharge: Math.floor(amount * 0.01),
      serviceTax: Math.floor(amount * 0.0018),
      paymentPageSlug: inst.slug + "-fees",
      commissionRate: 1.5,
      commissionEarned: Math.floor(amount * 0.015),
      commissionPaid: Math.random() > 0.5
    };

    if (mode === 'PG') {
      txn.orderId = `ORD_${generateUtr().substring(0,8)}`;
      txn.paymentId = `pay_${generateUtr().substring(0,8)}`;
      txn.bankRefId = generateUtr().substring(0,10).toUpperCase();
      txn.paymentMethod = ['NET_BANKING', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD'][Math.floor(Math.random() * 4)];
      txn.vendor = "RAZORPAY";
    } else if (mode === 'Auto-Debit') {
      txn.paymentId = `ad_${generateUtr().substring(0,8)}`;
    }

    // Assign to batch if Success
    if (status === 'Success' && Math.random() > 0.3) {
      // Find a batch with same mode
      const validBatches = batches.filter(b => b.mode === mode && new Date(b.date) >= d);
      if (validBatches.length > 0) {
        const batch = validBatches[Math.floor(Math.random() * validBatches.length)];
        txn.settlementUtr = batch.utr;
        txn.batchSettlementId = batch.id;
        txn.settledAt = batch.date;
      }
    }

    transactions.push(txn);
  }

  // Ensure EMI batches have corresponding transactions
  batches.filter(b => b.mode === 'EMI').forEach(b => {
    transactions.push({
      id: `TXN-${String(txnCounter++)}`,
      paymentMode: 'EMI',
      status: 'Success',
      amount: b.amount,
      createdAt: b.applicationDate, // Created before settlement
      studentName: b.studentName,
      studentId: b.studentId,
      studentEmail: b.studentName.toLowerCase().replace(' ', '.') + "@example.com",
      studentPhone: "9" + Math.floor(100000000 + Math.random() * 900000000),
      studentClass: b.class,
      parentName: "Mr. " + b.studentName.split(' ')[1],
      instituteId: "inst-001", // random
      instituteName: b.institute,
      location: b.location,
      board: b.board,
      feeHeader: 'EMI Loan Disbursal',
      serviceCharge: 0,
      serviceTax: 0,
      commissionRate: 2,
      commissionEarned: Math.floor(b.amount * 0.02),
      commissionPaid: true,
      settlementUtr: b.utr,
      batchSettlementId: b.id,
      settledAt: b.date
    });
  });

  transactions.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Other fixed arrays to append
  const initialTeam = [
    { id: "team-1", name: "Rahul Deshmukh", email: "rahul@grayquest.com", role: "Admin", status: "Active" },
    { id: "team-2", name: "Priya Sundaram", email: "priya@grayquest.com", role: "Accountant", status: "Active" },
    { id: "team-3", name: "Neha Goel", email: "neha@grayquest.com", role: "Accountant", status: "Active" },
    { id: "team-4", name: "Karan Singh", email: "karan@grayquest.com", role: "Viewer", status: "Active" }
  ];

  const initialSystemLogs = [
    { id: "log-1", timestamp: new Date(Date.now() - 3600000).toISOString(), user: "rahul@grayquest.com", action: "Updated webhook URL for Amity Global School", type: "Security" },
    { id: "log-2", timestamp: new Date(Date.now() - 7200000).toISOString(), user: "priya@grayquest.com", action: "Exported Settlements CSV report (June)", type: "Export" },
    { id: "log-3", timestamp: new Date(Date.now() - 14400000).toISOString(), user: "rahul@grayquest.com", action: "Added new team member Karan Singh as Viewer", type: "RBAC" },
    { id: "log-4", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "neha@grayquest.com", action: "Enabled 12-Month Low-Interest EMI for Amity Global School", type: "Product" }
  ];

  const geographicDistribution = [
    { id: "geo-1", region: "Delhi NCR", activeInstitutes: 3, gmv: 27094000, share: "35.5%" },
    { id: "geo-2", region: "Maharashtra", activeInstitutes: 2, gmv: 21600000, share: "28.3%" },
    { id: "geo-3", region: "Karnataka", activeInstitutes: 1, gmv: 4200000, share: "5.5%" },
    { id: "geo-4", region: "Telangana", activeInstitutes: 2, gmv: 39200000, share: "51.4%" },
    { id: "geo-5", region: "Gujarat", activeInstitutes: 1, gmv: 2150000, share: "2.8%" },
  ];

  const adRegistrations = [
    { id: 'AD-REG-1001', applicationCode: 'GQAD-8921001', studentId: 'STU-1092', studentName: 'Aarav Sharma', instituteName: 'Ryan School', totalFees: 125000, registeredOn: '2026-05-12T10:30:00', status: 'Active' },
    { id: 'AD-REG-1002', applicationCode: 'GQAD-8921002', studentId: 'STU-1093', studentName: 'Vihaan Verma', instituteName: 'Amity Global School', totalFees: 85000, registeredOn: '2026-05-14T11:15:00', status: 'Active' },
    { id: 'AD-REG-1003', applicationCode: 'GQAD-8921003', studentId: 'STU-1094', studentName: 'Isha Singh', instituteName: 'Vibgyor High School', totalFees: 210000, registeredOn: '2026-05-20T09:45:00', status: 'Pending Mandate' }
  ];

  const emiApplications = batches.filter(b => b.mode === 'EMI').map((b, i) => ({
    id: b.applicationId,
    studentId: b.studentId,
    studentName: b.studentName,
    instituteName: b.institute,
    loanAmount: b.amount,
    tenure: [6, 9, 12][Math.floor(Math.random() * 3)],
    status: b.status === 'Settled' ? 'Disbursed' : 'Approved',
    appliedOn: b.applicationDate
  }));

  const initialSettlements = transactions.filter(t => t.settledAt).map((t, i) => {
    const b = batches.find(b => b.id === t.batchSettlementId);
    return {
      id: `SET-${String(1001 + i)}`,
      txnId: t.id,
      utr: t.settlementUtr,
      studentId: t.studentId,
      studentName: t.studentName,
      studentPhone: t.studentPhone,
      studentClass: t.studentClass,
      instituteId: t.instituteId,
      instituteName: t.instituteName,
      feeHeader: t.feeHeader,
      amount: t.amount,
      paymentMode: t.paymentMode,
      settlementDate: t.settledAt,
      disbursementDate: t.paymentMode === 'EMI' ? t.settledAt : null,
      bankName: b ? b.bankName : "HDFC BANK",
      accountNo: b ? b.bankAccount : "XXXX1190",
      ifsc: (b && b.ifsc) ? b.ifsc : "HDFC0001190",
      status: 'Settled'
    };
  });

  const output = 
    "export const initialInstitutes = " + JSON.stringify(institutes, null, 2) + ";\n" +
    "export const initialTransactions = " + JSON.stringify(transactions, null, 2) + ";\n" +
    "export const settlementBatches = " + JSON.stringify(batches, null, 2) + ";\n" +
    "export const initialSettlements = " + JSON.stringify(initialSettlements, null, 2) + ";\n" +
    "export const initialTeam = " + JSON.stringify(initialTeam, null, 2) + ";\n" +
    "export const initialSystemLogs = " + JSON.stringify(initialSystemLogs, null, 2) + ";\n" +
    "export const geographicDistribution = " + JSON.stringify(geographicDistribution, null, 2) + ";\n" +
    "export const adRegistrations = " + JSON.stringify(adRegistrations, null, 2) + ";\n" +
    "export const emiApplications = " + JSON.stringify(emiApplications, null, 2) + ";\n";

  fs.writeFileSync('src/mockData.js', output);
};

generateMockData();
