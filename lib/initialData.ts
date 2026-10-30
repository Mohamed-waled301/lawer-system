export interface StoredUser {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE";
}

export interface StoredStaff {
  id: string;
  name: string;
  role: "LAWYER" | "SECRETARY" | "ACCOUNTANT" | "OTHER";
  phone: string;
  email?: string;
  hireDate?: string;
  barAssociationNumber?: string;
  isActive: boolean;
  notes?: string;
}

export interface StoredDocument {
  id: string;
  title: string;
  originalName: string;
  filePath: string; // Base64 data URL or relative path
  fileSize: number;
  mimeType: string;
  category: string;
  caseId?: string;
  clientId?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface StoredHearing {
  id: string;
  caseId: string;
  hearingDate: string;
  decision?: string;
  notes?: string;
  judgeName?: string;
  courtCircuit?: string;
  createdAt: string;
}

export interface StoredCaseStatusHistory {
  id: string;
  caseId: string;
  fromStatus: string;
  toStatus: string;
  changeDate: string;
  changedBy: string;
  notes?: string;
}

export interface StoredCase {
  id: string;
  caseNumber: string;
  caseYear: number;
  court: string;
  circuit?: string;
  clientId: string;
  lawyerId?: string;
  categoryId: string;
  statusId: string;
  subject?: string;
  opponentName?: string;
  opponentLawyer?: string;
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  isClosed?: boolean;
  nextHearingDate?: string;
  isDeleted: boolean;
  createdAt: string;
  hearings: StoredHearing[];
  documents: StoredDocument[];
  statusHistory: StoredCaseStatusHistory[];
}

export interface StoredClient {
  id: string;
  clientCode: string;
  name: string;
  nationalId?: string;
  phone: string;
  address?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  documents: StoredDocument[];
}

export interface StoredConsultation {
  id: string;
  personName: string;
  phone: string;
  date: string;
  lawyerId?: string;
  subject: string;
  amountPaid: number;
  paymentMethod: string;
  transferProofPath?: string;
  notes?: string;
  isConvertedToCase: boolean;
  convertedCaseId?: string;
  clientId?: string;
  createdAt: string;
}

export interface StoredPayment {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  treasuryId?: string;
  transferProofPath?: string;
  purpose?: string;
  notes?: string;
  recordedByName: string;
  caseId?: string;
  clientId?: string;
  consultationId?: string;
  createdAt: string;
}

export interface StoredTreasury {
  id: string;
  name: string;
  paymentMethod: "CASH" | "WALLET" | "INSTAPAY";
  balance: number;
  description?: string;
  accountNumber?: string;
}

export interface StoredTreasuryTransaction {
  id: string;
  treasuryId: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_IN" | "TRANSFER_OUT";
  amount: number;
  previousBalance: number;
  newBalance: number;
  relatedPaymentId?: string;
  relatedTreasuryId?: string;
  description: string;
  recordedBy: string;
  createdAt: string;
}

export interface StoredCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface StoredStatus {
  id: string;
  name: string;
  isClosed: boolean;
  color?: string;
  sortOrder: number;
}

export interface StoredActivity {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface StoredSettings {
  office_name: string;
  lawyer_name?: string;
  office_owner?: string;
  office_title?: string;
  office_address: string;
  office_phones: string;
  office_email: string;
  tax_number: string;
  letterhead_notes: string;
  [key: string]: any;
}

export const INITIAL_DATA = {
  users: [
    {
      id: "u-1",
      username: "admin",
      name: "الأستاذ / محمد وليد (مدير النظام)",
      role: "ADMIN" as const,
    },
    {
      id: "u-2",
      username: "employee",
      name: "الأستاذة / ميار أحمد (سكرتارية)",
      role: "EMPLOYEE" as const,
    },
  ],
  settings: {
    office_name: "مجموعة العدالة للمحاماة والاستشارات القانونية",
    lawyer_name: "الأستاذ / محمد وليد - المحامي بالنقض والدستورية العليا",
    office_address: "ميدان التحرير، برج الأطباء الإداري، الدور الرابع، القاهرة",
    office_phones: "01001234567 - 01198765432 - 0227954321",
    office_email: "contact@mohamedwaled-law.com",
    tax_number: "452-896-123",
    letterhead_notes: "الاستشارات مدفوعة مقدماً ولا ترد نهائياً في أي حال طبقاً للائحة المكتب",
  },
  treasuries: [
    {
      id: "tr-cash",
      name: "خزينة النقدية الرئيسية (خزنة المكتب)",
      paymentMethod: "CASH" as const,
      balance: 38500,
      description: "الخزينة الحديدية بمقر المكتب لاستلام المقبوضات النقدية والمصروفات القضائية",
      accountNumber: "SAFE-MAIN-01",
    },
    {
      id: "tr-wallet",
      name: "خزينة المحافظ الإلكترونية (فودافون كاش / اتصالات)",
      paymentMethod: "WALLET" as const,
      balance: 14200,
      description: "محفظة فودافون كاش الرسمية لاستلام أتعاب الاستشارات ورسوم القضايا",
      accountNumber: "01001234567",
    },
    {
      id: "tr-instapay",
      name: "خزينة إنستاباي والتحويلات البنكية (البنك الأهلي / CIB)",
      paymentMethod: "INSTAPAY" as const,
      balance: 62000,
      description: "حساب إنستاباي البنكي الفوري والتحويلات المباشرة بين البنوك",
      accountNumber: "waled.law@instapay",
    },
  ],
  categories: [
    { id: "cat-1", code: "1", name: "قضايا الجنايات والجرائم الكبرى", description: "جنايات الأموال العامة، الجنايات الاقتصادية، قضايا أمن الدولة" },
    { id: "cat-2", code: "2", name: "قضايا الجنح والمخالفات", description: "جنح الشيكات بدون رصيد، خيانة الأمانة، والنصب، والتعدي" },
    { id: "cat-3", code: "3", name: "محاكم الأسرة والأحوال الشخصية", description: "قضايا الطلاق للضرر، الخلع، النفقات، الحضانة، والمواريث" },
    { id: "cat-4", code: "4", name: "القضاء المدني والتعويضات", description: "صحة ونفاذ العقود، دعاوى التعويض عن حوادث السير، الإيجارات" },
    { id: "cat-5", code: "5", name: "القضاء الإداري ومجلس الدولة", description: "الطعن على القرارات الإدارية، شؤون موظفي الدولة والجهات الحكومية" },
    { id: "cat-6", code: "6", name: "المحاكم الاقتصادية وقضايا الشركات", description: "نزاعات الشركات والشركاء، الإفلاس وتصفية الحسابات التجارية" },
  ],
  statuses: [
    { id: "st-1", name: "تحقيق بالنيابة العامة / قيد التحريات", isClosed: false, sortOrder: 1 },
    { id: "st-2", name: "متداولة بالجلسات - محكمة أول درجة", isClosed: false, sortOrder: 2 },
    { id: "st-3", name: "محكمة الاستئناف العالي", isClosed: false, sortOrder: 3 },
    { id: "st-4", name: "طعن أمام محكمة النقض", isClosed: false, sortOrder: 4 },
    { id: "st-5", name: "محكومة ومنتهية بصدور حكم بات", isClosed: true, sortOrder: 5 },
    { id: "st-6", name: "مشطوبة / تم الصلح والتنازل", isClosed: true, sortOrder: 6 },
  ],
  staff: [
    {
      id: "stf-1",
      name: "الأستاذ / محمد وليد",
      role: "LAWYER" as const,
      phone: "01001234567",
      email: "m.waled@lawfirm.com",
      hireDate: "2018-01-15",
      barAssociationNumber: "142850 - نقض",
      isActive: true,
      notes: "رئيس المجموعة والمستشار المسؤول عن قضايا النقض والشركات الكبرى",
    },
    {
      id: "stf-2",
      name: "الأستاذ / أحمد عبد الرحمن",
      role: "LAWYER" as const,
      phone: "01123456789",
      email: "a.abdelrahman@lawfirm.com",
      hireDate: "2021-03-01",
      barAssociationNumber: "285910 - استئناف",
      isActive: true,
      notes: "محامٍ متخصص في قضايا الجنايات والدوائر الجنائية بمحاكم الاستئناف",
    },
    {
      id: "stf-3",
      name: "الأستاذة / سارة محمود",
      role: "SECRETARY" as const,
      phone: "01234567890",
      email: "sara.m@lawfirm.com",
      hireDate: "2022-06-15",
      isActive: true,
      notes: "مسؤولة تنظيم الأجندة، استقبال الموكلين وجدول المواعيد والجلسات",
    },
    {
      id: "stf-4",
      name: "الأستاذ / إبراهيم كمال",
      role: "ACCOUNTANT" as const,
      phone: "01555566778",
      email: "ibrahim.k@lawfirm.com",
      hireDate: "2023-01-10",
      isActive: true,
      notes: "المسؤول المالي عن حركة الخزائن الثلاث وسندات القبض وإيصالات السداد",
    },
  ],
  clients: [
    {
      id: "cl-1",
      clientCode: "C-0001",
      name: "الحاج / عبد الله محمود التميمي",
      nationalId: "28504121401234",
      phone: "01011223344",
      address: "المهندسين، شارع سوريا، عمارة 14، الجيزة",
      notes: "موكل دائم بالمكتب، رجل أعمال ومالك مجموعة شركات تجارية",
      isDeleted: false,
      createdAt: "2026-01-10T10:00:00Z",
      documents: [],
    },
    {
      id: "cl-2",
      clientCode: "C-0002",
      name: "المهندسة / هدى سليمان البشري",
      nationalId: "29007180102568",
      phone: "01155443322",
      address: "مدينة نصر، الحي السابع، شارع الطيران، القاهرة",
      notes: "نزاع حول عقار تجاري وميراث شرعي",
      isDeleted: false,
      createdAt: "2026-02-14T11:30:00Z",
      documents: [],
    },
    {
      id: "cl-3",
      clientCode: "C-0003",
      name: "الدكتور / طارق فهمي النجار",
      nationalId: "27811051603412",
      phone: "01222334455",
      address: "مصر الجديدة، ميدان الكوربة، القاهرة",
      notes: "قضية تعويض ومطالبة مدنية عن نزاع تجاري",
      isDeleted: false,
      createdAt: "2026-03-05T09:15:00Z",
      documents: [],
    },
  ],
  cases: [
    {
      id: "cs-1",
      caseNumber: "1452",
      caseYear: 2026,
      court: "محكمة استئناف القاهرة - الدائرة 8 جنايات",
      circuit: "الدائرة 8 جنايات شمال القاهرة",
      clientId: "cl-1",
      lawyerId: "stf-1",
      categoryId: "cat-1",
      statusId: "st-3",
      subject: "طعن بالاستئناف في جنحة اقتصادية وشيك بدون رصيد",
      opponentName: "شركة الوفاق للاستثمار التجاري",
      opponentLawyer: "الأستاذ / عادل منصور المحامي",
      totalFees: 50000,
      paidAmount: 30000,
      remainingAmount: 20000,
      notes: "تم الاتفاق على سداد باقي الأتعاب عقب صدور قرار الخبراء الحسابيين",
      isDeleted: false,
      createdAt: "2026-01-15T12:00:00Z",
      hearings: [
        {
          id: "hr-1",
          caseId: "cs-1",
          hearingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          decision: "سماع مرافعة الدفاع وتقديم تقرير الخبير الحسابي المندوب",
          notes: "تحضير حافظة المستندات الأصلية وإيصالات الإيداع البنكي",
          judgeName: "المستشار / رأفت الشافعي",
          courtCircuit: "الدائرة 8 جنايات",
          createdAt: "2026-01-20T10:00:00Z",
        },
        {
          id: "hr-2",
          caseId: "cs-1",
          hearingDate: "2026-02-10T09:00:00Z",
          decision: "تأجيل للإعلان وإيداع تقرير مكتب خبراء وزارة العدل",
          notes: "تم الحضور وإثبات صفة الحاضر بموجب التوكيل الرسمي رقم 458/ب",
          judgeName: "المستشار / رأفت الشافعي",
          courtCircuit: "الدائرة 8 جنايات",
          createdAt: "2026-02-10T14:00:00Z",
        },
      ],
      documents: [],
      statusHistory: [
        {
          id: "sh-1",
          caseId: "cs-1",
          fromStatus: "متداولة بالجلسات - محكمة أول درجة",
          toStatus: "محكمة الاستئناف العالي",
          changeDate: "2026-02-15T10:00:00Z",
          changedBy: "الأستاذ / محمد وليد",
          notes: "صدور حكم أول درجة وتم إيداع عريضة الاستئناف وقيدت برقم 1452",
        },
      ],
    },
    {
      id: "cs-2",
      caseNumber: "892",
      caseYear: 2026,
      court: "محكمة الأسرة بمدينة نصر",
      circuit: "الدائرة 3 أحوال شخصية",
      clientId: "cl-2",
      lawyerId: "stf-2",
      categoryId: "cat-3",
      statusId: "st-2",
      subject: "دعوى إثبات وراثة وحصر تركة ونزاع ريع عقار موروث",
      opponentName: "ورثة المرحوم / كمال البشري",
      opponentLawyer: "الأستاذ / سعيد القاضي",
      totalFees: 35000,
      paidAmount: 20000,
      remainingAmount: 15000,
      notes: "تم استخراج إعلام الوراثة وجاري تحديد موعد فرز وتجنيب",
      isDeleted: false,
      createdAt: "2026-02-20T10:00:00Z",
      hearings: [
        {
          id: "hr-3",
          caseId: "cs-2",
          hearingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          decision: "إلزام الخصوم بتقديم مستندات ملكية العقار الكائن بمصر الجديدة",
          notes: "إحضار كشف رسمي من الضرائب العقارية وشهادة تصرفات عقارية",
          createdAt: "2026-02-25T11:00:00Z",
        },
      ],
      documents: [],
      statusHistory: [],
    },
    {
      id: "cs-3",
      caseNumber: "3104",
      caseYear: 2025,
      court: "محكمة جنوب القاهرة الابتدائية - باب الخلق",
      circuit: "الدائرة 12 تعويضات مدني",
      clientId: "cl-3",
      lawyerId: "stf-1",
      categoryId: "cat-4",
      statusId: "st-2",
      subject: "دعوى إلزام بتعويض مادي وأدبي قدره 2,000,000 ج.م ناتج عن إخلال تعاقدي",
      opponentName: "شركة الإنشاءات الحديثة للمقاولات",
      opponentLawyer: "الأستاذ / حازم غانم",
      totalFees: 70000,
      paidAmount: 50000,
      remainingAmount: 20000,
      notes: "قضية هامة، تم إثبات الضرر المادي والمعنوي أمام المحكمة",
      isDeleted: false,
      createdAt: "2025-11-10T10:00:00Z",
      hearings: [
        {
          id: "hr-4",
          caseId: "cs-3",
          hearingDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          decision: "حجز الدعوى للحكم مع التصريح بمذكرات في أسبوعين",
          notes: "تقديم مذكرة ختامية بأوجه الدفاع والطلبات الختامية الجازمة",
          createdAt: "2026-03-01T12:00:00Z",
        },
      ],
      documents: [],
      statusHistory: [],
    },
  ],
  consultations: [
    {
      id: "con-1",
      personName: "الأستاذ / وائل صبري عبد الجواد",
      phone: "01099887766",
      date: new Date().toISOString(),
      lawyerId: "stf-1",
      subject: "استشارة بخصوص تأسيس شركة ذات مسؤولية محدودة وتقسيم الحصص مع شركاء أجانب",
      amountPaid: 3000,
      paymentMethod: "INSTAPAY",
      transferProofPath: "receipts/instapay_sample_proof_con1.png",
      notes: "تمت الاستشارة بمقر المكتب والاتفاق على تحرير عقود التأسيس لاحقاً",
      isConvertedToCase: false,
      createdAt: "2026-03-10T14:00:00Z",
    },
    {
      id: "con-2",
      personName: "السيدة / نيفين فاروق شكري",
      phone: "01122334488",
      date: "2026-03-01T11:00:00Z",
      lawyerId: "stf-2",
      subject: "استشارة قانونية في نزاع عمالي وفصل تعسفي ومستحقات مكافأة نهاية الخدمة",
      amountPaid: 2000,
      paymentMethod: "WALLET",
      transferProofPath: "receipts/wallet_sample_proof_con2.png",
      notes: "تم تحويل الاستشارة بنجاح إلى ملف قضية عمالية للمطالبة بالتعويض",
      isConvertedToCase: true,
      convertedCaseId: "cs-2",
      clientId: "cl-2",
      createdAt: "2026-03-01T11:00:00Z",
    },
    {
      id: "con-3",
      personName: "المهندس / كريم أشرف مروان",
      phone: "01288776655",
      date: "2026-02-20T16:30:00Z",
      lawyerId: "stf-1",
      subject: "فحص قانوني لعقد شراء قطعة أرض استثمارية بالساحل الشمالي والتأكد من الملكية",
      amountPaid: 4500,
      paymentMethod: "CASH",
      notes: "تمت مراجعة العقود والتأكد من خلو الأرض من أي قيود أو رهون عينية",
      isConvertedToCase: false,
      createdAt: "2026-02-20T16:30:00Z",
    },
  ],
  payments: [
    {
      id: "pay-1",
      receiptNumber: "REC-0001",
      amount: 30000,
      paymentDate: "2026-01-16T10:00:00Z",
      paymentMethod: "INSTAPAY",
      treasuryId: "tr-instapay",
      transferProofPath: "receipts/instapay_receipt_rec0001.png",
      purpose: "دفعة مقدمة من أتعاب الطعن بالاستئناف رقم 1452 لسنة 2026",
      recordedByName: "الأستاذ / إبراهيم كمال",
      caseId: "cs-1",
      clientId: "cl-1",
      createdAt: "2026-01-16T10:00:00Z",
    },
    {
      id: "pay-2",
      receiptNumber: "REC-0002",
      amount: 20000,
      paymentDate: "2026-02-21T11:30:00Z",
      paymentMethod: "WALLET",
      treasuryId: "tr-wallet",
      transferProofPath: "receipts/wallet_receipt_rec0002.png",
      purpose: "مقدم أتعاب دعوى إثبات الوراثة وحصر التركة رقم 892 لسنة 2026",
      recordedByName: "الأستاذ / إبراهيم كمال",
      caseId: "cs-2",
      clientId: "cl-2",
      createdAt: "2026-02-21T11:30:00Z",
    },
    {
      id: "pay-3",
      receiptNumber: "REC-0003",
      amount: 50000,
      paymentDate: "2026-02-25T14:00:00Z",
      paymentMethod: "CASH",
      treasuryId: "tr-cash",
      purpose: "الدفعة الثانية من أتعاب دعوى التعويض المدني رقم 3104",
      recordedByName: "الأستاذ / إبراهيم كمال",
      caseId: "cs-3",
      clientId: "cl-3",
      createdAt: "2026-02-25T14:00:00Z",
    },
    {
      id: "pay-4",
      receiptNumber: "REC-0004",
      amount: 3000,
      paymentDate: "2026-03-10T14:00:00Z",
      paymentMethod: "INSTAPAY",
      treasuryId: "tr-instapay",
      transferProofPath: "receipts/instapay_sample_proof_con1.png",
      purpose: "رسوم استشارة قانونية تجارية - أ. وائل صبري",
      recordedByName: "الأستاذ / إبراهيم كمال",
      consultationId: "con-1",
      createdAt: "2026-03-10T14:00:00Z",
    },
  ],
  treasuryTransactions: [
    {
      id: "tx-1",
      treasuryId: "tr-instapay",
      type: "DEPOSIT" as const,
      amount: 30000,
      previousBalance: 32000,
      newBalance: 62000,
      relatedPaymentId: "pay-1",
      description: "إيداع أتعاب قضية 1452 تحويل إنستاباي - REC-0001",
      recordedBy: "الأستاذ / إبراهيم كمال",
      createdAt: "2026-01-16T10:00:00Z",
    },
    {
      id: "tx-2",
      treasuryId: "tr-wallet",
      type: "DEPOSIT" as const,
      amount: 20000,
      previousBalance: 0,
      newBalance: 20000,
      relatedPaymentId: "pay-2",
      description: "إيداع أتعاب قضية 892 محفظة فودافون كاش - REC-0002",
      recordedBy: "الأستاذ / إبراهيم كمال",
      createdAt: "2026-02-21T11:30:00Z",
    },
    {
      id: "tx-3",
      treasuryId: "tr-cash",
      type: "DEPOSIT" as const,
      amount: 50000,
      previousBalance: 15000,
      newBalance: 65000,
      relatedPaymentId: "pay-3",
      description: "إيداع نقدي بالخزينة عن قضية 3104 - REC-0003",
      recordedBy: "الأستاذ / إبراهيم كمال",
      createdAt: "2026-02-25T14:00:00Z",
    },
    {
      id: "tx-4",
      treasuryId: "tr-cash",
      type: "WITHDRAWAL" as const,
      amount: 26500,
      previousBalance: 65000,
      newBalance: 38500,
      description: "صرف أمانة خبراء ورسوم قضائية مقيدة بالمحكمة",
      recordedBy: "الأستاذ / إبراهيم كمال",
      createdAt: "2026-03-02T12:00:00Z",
    },
    {
      id: "tx-5",
      treasuryId: "tr-wallet",
      type: "TRANSFER_OUT" as const,
      amount: 5800,
      previousBalance: 20000,
      newBalance: 14200,
      description: "سحب سيولة من المحفظة وتوريدها للمكتب",
      recordedBy: "الأستاذ / إبراهيم كمال",
      createdAt: "2026-03-05T15:00:00Z",
    },
  ],
  activities: [
    {
      id: "act-1",
      action: "CREATE",
      entityType: "PAYMENT",
      details: "تسجيل إيصال سداد REC-0004 بقيمة 3,000 ج.م بخزينة إنستاباي بواسطة إبراهيم كمال",
      createdAt: "2026-03-10T14:05:00Z",
    },
    {
      id: "act-2",
      action: "CONVERT",
      entityType: "CONSULTATION",
      details: "تحويل استشارة السيدة / نيفين فاروق إلى ملف قضية وموكل رسمي برقم 892",
      createdAt: "2026-03-01T11:15:00Z",
    },
    {
      id: "act-3",
      action: "UPDATE",
      entityType: "CASE_STATUS",
      details: "تعديل مرحلة القضية رقم 1452 لسنة 2026 إلى محكمة الاستئناف العالي",
      createdAt: "2026-02-15T10:05:00Z",
    },
    {
      id: "act-4",
      action: "CREATE",
      entityType: "CASE",
      details: "قيد ملف قضية جديدة رقم 892 لسنة 2026 بمحكمة الأسرة بمدينة نصر",
      createdAt: "2026-02-20T10:15:00Z",
    },
    {
      id: "act-5",
      action: "CREATE",
      entityType: "CLIENT",
      details: "تسجيل الموكل الجديد: الحاج / عبد الله محمود التميمي (كود: C-0001)",
      createdAt: "2026-01-10T10:05:00Z",
    },
  ],
};

