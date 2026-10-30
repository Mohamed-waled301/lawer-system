const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const employeePassword = await bcrypt.hash("emp123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPassword,
      name: "مدير النظام / الأستاذ المستشار",
      role: "ADMIN",
      isActive: true,
    },
  });

  const employee = await prisma.user.upsert({
    where: { username: "employee" },
    update: {},
    create: {
      username: "employee",
      passwordHash: employeePassword,
      name: "سارة محمود - سكرتارية",
      role: "EMPLOYEE",
      isActive: true,
    },
  });

  // 2. Treasuries (خزائن طرق الدفع)
  const cashTreasury = await prisma.treasury.upsert({
    where: { paymentMethod: "CASH" },
    update: {},
    create: {
      name: "خزينة النقدية الرئيسية (خزنة المكتب)",
      paymentMethod: "CASH",
      balance: 16500, // Initial sample balance
      accountNumber: "خزينة المقر الرئيسي - وسط البلد",
      description: "المقبوضات النقدية الورقية الموردة باليد لخزينة المكتب",
    },
  });

  const walletTreasury = await prisma.treasury.upsert({
    where: { paymentMethod: "WALLET" },
    update: {},
    create: {
      name: "خزينة المحافظ الإلكترونية (Vodafone Cash / Orange / Etisalat)",
      paymentMethod: "WALLET",
      balance: 0,
      accountNumber: "01001234567",
      description: "حسابات المحافظ الذكية المعتمدة لاستلام التحويلات",
    },
  });

  const instapayTreasury = await prisma.treasury.upsert({
    where: { paymentMethod: "INSTAPAY" },
    update: {},
    create: {
      name: "خزينة إنستاباي والتحويلات البنكية (InstaPay)",
      paymentMethod: "INSTAPAY",
      balance: 0,
      accountNumber: "office@instapay / QNB 10928374",
      description: "حساب الشبكة القومية للمدفوعات اللحظية إنستاباي والتحويلات البنكية",
    },
  });

  console.log("Created treasuries:", cashTreasury.name, walletTreasury.name, instapayTreasury.name);

  // 3. Settings
  const defaultSettings = [
    { key: "office_name", value: "مجموعة المستشار للمحاماة والاستشارات القانونية" },
    { key: "office_owner", value: "المستشار / أحمد فهمي" },
    { key: "office_title", value: "محام بالنقض والدستورية العليا" },
    { key: "office_address", value: "٤٥ شارع قصر العيني، وسط البلد، القاهرة" },
    { key: "office_phones", value: "01001234567 - 0227954321" },
    { key: "office_email", value: "contact@mostashar-law.com" },
    { key: "tax_number", value: "102-394-885" },
    { key: "receipt_prefix", value: "REC-" },
    { key: "client_prefix", value: "C-" },
    { key: "letterhead_notes", value: "إيصال سداد رسمي معتمد من الإدارة المالية للمكتب" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 4. Case Categories with custom number codes
  const categories = [
    { code: "1", name: "جنح", description: "قضايا الجنح والمخالفات" },
    { code: "2", name: "جنايات", description: "قضايا محكمة الجنايات" },
    { code: "3", name: "أحوال شخصية", description: "قضايا الأسرة، النفقات، والطلاق" },
    { code: "4", name: "مدني", description: "المنازعات المدنية والتعويضات والعقود" },
    { code: "5", name: "عمالي", description: "قضايا العمل ومستحقات العاملين" },
    { code: "6", name: "تجاري وشركات", description: "النزاعات التجارية، الإفلاس وتأسيس الشركات" },
    { code: "7", name: "مجلس دولة / إداري", description: "دعاوى القضاء الإداري والطعون" },
    { code: "8", name: "تنفيذ وأوامر أداء", description: "إجراءات الحجز والتنفيذ الجبري" },
  ];

  for (const cat of categories) {
    await prisma.caseCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }

  // 5. Case Statuses
  const statuses = [
    { name: "تحقيق بالنيابة", isClosed: false, color: "blue", sortOrder: 1 },
    { name: "جلسات أول درجة", isClosed: false, color: "blue", sortOrder: 2 },
    { name: "استئناف متداول", isClosed: false, color: "amber", sortOrder: 3 },
    { name: "طعن بالنقض", isClosed: false, color: "purple", sortOrder: 4 },
    { name: "قيد الخبراء / التحكيم", isClosed: false, color: "orange", sortOrder: 5 },
    { name: "محكوم فيها - قيد التنفيذ", isClosed: false, color: "emerald", sortOrder: 6 },
    { name: "منتهية ومغلقة", isClosed: true, color: "slate", sortOrder: 7 },
    { name: "مشطوبة / تنازل", isClosed: true, color: "rose", sortOrder: 8 },
  ];

  for (const st of statuses) {
    await prisma.caseStatus.upsert({
      where: { name: st.name },
      update: { isClosed: st.isClosed, color: st.color, sortOrder: st.sortOrder },
      create: st,
    });
  }

  // 6. Staff & Lawyers
  const lawyer1 = await prisma.staff.upsert({
    where: { id: "staff-1" },
    update: {},
    create: {
      id: "staff-1",
      name: "أ. طارق عبد الرحمن",
      role: "LAWYER",
      phone: "01098765432",
      email: "tarek@lawfirm.com",
      hireDate: new Date("2021-03-01"),
      barAssociationNumber: "452109",
      isActive: true,
      notes: "محام استئناف متخصص في القضايا الجنائية والمدنية",
    },
  });

  const lawyer2 = await prisma.staff.upsert({
    where: { id: "staff-2" },
    update: {},
    create: {
      id: "staff-2",
      name: "أ. منى فاروق",
      role: "LAWYER",
      phone: "01123456789",
      email: "mona@lawfirm.com",
      hireDate: new Date("2022-07-15"),
      barAssociationNumber: "518742",
      isActive: true,
      notes: "محامية متخصصة في قضايا الأسرة والأحوال الشخصية ومجلس الدولة",
    },
  });

  // 7. Clients
  const client1 = await prisma.client.upsert({
    where: { clientCode: "C-0001" },
    update: {},
    create: {
      clientCode: "C-0001",
      name: "محمود سيد عبد الفتاح",
      nationalId: "28804151201934",
      phone: "01011223344",
      address: "١٢ شارع فيصل، الجيزة",
      notes: "عميل دائم، شركة مقاولات واستثمار عقاري",
    },
  });

  // 8. Sample Case
  const catCivil = await prisma.caseCategory.findFirst({ where: { code: "4" } });
  const statusActive = await prisma.caseStatus.findFirst({ where: { name: "جلسات أول درجة" } });

  const existingCase = await prisma.case.findFirst({
    where: { caseNumber: "1452", caseYear: 2024 },
  });

  if (!existingCase && catCivil && statusActive) {
    const sampleCase = await prisma.case.create({
      data: {
        caseNumber: "1452",
        caseYear: 2024,
        court: "محكمة جنوب الجيزة الابتدائية",
        circuit: "الدائرة ٥ مدني تعويضات",
        clientId: client1.id,
        lawyerId: lawyer1.id,
        categoryId: catCivil.id,
        statusId: statusActive.id,
        totalFees: 35000,
        paidAmount: 15000,
        remainingAmount: 20000,
        nextHearingDate: new Date("2026-11-15T09:00:00Z"),
        notes: "دعوى تعويض عن إخلال بالتزام عقدي مع شركة المقاولات",
      },
    });

    // Hearing
    await prisma.hearing.create({
      data: {
        caseId: sampleCase.id,
        hearingDate: new Date("2026-11-15T09:00:00Z"),
        court: "محكمة جنوب الجيزة الابتدائية",
        circuit: "الدائرة ٥ مدني تعويضات",
        decision: "تأجيل للإعلان بأصل صحيفة الدعوى وتقديم المذكرات",
        requirements: "استخراج شهادة من السجل التجاري وإعلان المدعى عليه",
        attendedBy: lawyer1.name,
      },
    });

    // Payment linked to Treasury
    await prisma.payment.create({
      data: {
        receiptNumber: "REC-0001",
        amount: 15000,
        paymentDate: new Date(),
        paymentMethod: "CASH",
        purpose: "مقدم أتعاب القضية رقم 1452 لسنة 2024 مدني",
        recordedByName: "مدير النظام",
        caseId: sampleCase.id,
        clientId: client1.id,
        treasuryId: cashTreasury.id,
      },
    });

    // Treasury Transaction
    await prisma.treasuryTransaction.create({
      data: {
        treasuryId: cashTreasury.id,
        type: "DEPOSIT",
        amount: 15000,
        balanceAfter: 15000,
        description: "تحصيل مقدم أتعاب القضية 1452/2024 (REC-0001)",
        recordedBy: "مدير النظام",
      },
    });
  }

  // 9. Sample Consultation
  const existingConsultation = await prisma.consultation.findFirst({
    where: { personName: "خالد سعيد منصور" },
  });

  if (!existingConsultation) {
    const consultation = await prisma.consultation.create({
      data: {
        personName: "خالد سعيد منصور",
        phone: "01288990011",
        date: new Date(),
        subject: "استشارة بشأن نزاع ملكية قطعة أرض زراعية وبطلان عقد بيع",
        amountPaid: 1500,
        paymentMethod: "CASH",
        lawyerId: lawyer1.id,
        notes: "تم تقديم الرأي القانوني وأبدى رغبته في إقامة دعوى تثبيت ملكية",
      },
    });

    await prisma.payment.create({
      data: {
        receiptNumber: "REC-0002",
        amount: 1500,
        paymentDate: new Date(),
        paymentMethod: "CASH",
        purpose: "رسوم استشارة قانونية: نزاع ملكية أرض زراعية",
        recordedByName: "مدير النظام",
        consultationId: consultation.id,
        treasuryId: cashTreasury.id,
      },
    });

    await prisma.treasuryTransaction.create({
      data: {
        treasuryId: cashTreasury.id,
        type: "DEPOSIT",
        amount: 1500,
        balanceAfter: 16500,
        description: "رسوم استشارة الأستاذ/ خالد سعيد منصور (REC-0002)",
        recordedBy: "مدير النظام",
      },
    });
  }

  console.log("Database seeded successfully with Treasuries!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
