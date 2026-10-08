import {
  Transaction,
  Customer,
  PaymentStatus,
  PaymentMethod,
  IssuerBank,
  FailureCategory,
} from "../types/transaction.js";

const INDIAN_FIRST_NAMES = [
  "Aarav", "Priya", "Maulik", "Ananya", "Rahul", "Rohan", "Sneha", "Vikram",
  "Pooja", "Aditya", "Neha", "Arjun", "Deepak", "Meera", "Kavita", "Siddharth",
  "Nisha", "Gaurav", "Divya", "Karan", "Tanvi", "Sanjay", "Anil", "Ritu"
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Patel", "Siwach", "Iyer", "Verma", "Gupta", "Mukherjee", "Malhotra",
  "Reddy", "Nair", "Mehta", "Singh", "Joshi", "Chopra", "Deshmukh", "Bose",
  "Kumar", "Aggarwal", "Rao", "Kapoor", "Mishra", "Shah"
];

const FAILURE_CODES: Record<FailureCategory, Array<{ code: string; reason: string }>> = {
  ISSUER_OUTAGE: [
    { code: "GATEWAY_ERROR_ISSUER_DOWN", reason: "Issuer bank servers unreachable or returning 503 HTTP status" },
    { code: "NPCI_UPI_DEGRADED", reason: "NPCI switch timeout during UPI transaction authorization" },
    { code: "BAD_REQUEST_PAYMENT_TIMED_OUT", reason: "Bank core banking system (CBS) timed out after 30 seconds" }
  ],
  CUSTOMER_AUTHENTICATION: [
    { code: "INCORRECT_OTP", reason: "Customer entered incorrect 2-factor OTP code" },
    { code: "INCORRECT_MPIN", reason: "Incorrect UPI MPIN entered on UPI PSP app" },
    { code: "AUTHENTICATION_FAILED_3DS", reason: "3D Secure 2.0 biometric or password challenge failed" }
  ],
  INSUFFICIENT_FUNDS: [
    { code: "INSUFFICIENT_ACCOUNT_BALANCE", reason: "Account balance lower than transaction authorization amount" },
    { code: "CREDIT_LIMIT_EXCEEDED", reason: "Credit card spending limit exceeded for current billing cycle" }
  ],
  TECHNICAL_TIMEOUT: [
    { code: "GATEWAY_TIMED_OUT", reason: "Acquiring bank network socket timed out before ACK" },
    { code: "NETWORK_ERROR_CLIENT_DISCONNECTED", reason: "Customer app closed before gateway response receipt" }
  ],
  CHECKOUT_ABANDONMENT: [
    { code: "PAYMENT_ABANDONED_STEP_OTP", reason: "Customer abandoned checkout screen during OTP delivery stage" },
    { code: "PAYMENT_ABANDONED_METHOD_SELECT", reason: "Session expired on payment method selector modal" }
  ],
  MANDATE_SUBSCRIPTION_ERROR: [
    { code: "MANDATE_EXECUTION_FAILED", reason: "E-mandate auto-debit rejected by issuer bank mandate switch" },
    { code: "RECURRING_TOKEN_EXPIRED", reason: "Card tokenization registration inactive or expired" }
  ],
  CARD_LIMIT_EXCEEDED: [
    { code: "DOMESTIC_ECOM_DISABLED", reason: "Domestic online e-commerce transactions disabled on card" },
    { code: "PER_TRANSACTION_LIMIT_BREACHED", reason: "Transaction exceeds merchant category per-txn limit" }
  ],
  NETWORK_DROP: [
    { code: "SOCKET_TIMEOUT_NPCI", reason: "Packet drop between PSP routing switch and merchant webhook" }
  ]
};

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSyntheticCustomers(count = 150): Customer[] {
  const customers: Customer[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = randomChoice(INDIAN_FIRST_NAMES);
    const lastName = randomChoice(INDIAN_LAST_NAMES);
    const id = `cust_${String(i).padStart(4, "0")}`;
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(10, 99)}@gmail.com`;
    const phone = `+91 98${randomInt(10000000, 99999999)}`;
    const totalOrders = randomInt(1, 24);
    const successfulOrders = Math.max(0, totalOrders - randomInt(0, 3));
    const avgOrder = randomChoice([499, 999, 1499, 2499, 4999, 8999, 14999]);
    const lifetimeValueInr = successfulOrders * avgOrder;
    const preferredMethod = randomChoice<PaymentMethod>(["UPI", "UPI", "UPI", "CREDIT_CARD", "DEBIT_CARD"]);
    const preferredLanguage = randomChoice<"en" | "hi" | "hinglish">(["en", "en", "hinglish", "hi"]);

    customers.push({
      id,
      name,
      email,
      phone,
      totalOrders,
      successfulOrders,
      lifetimeValueInr,
      preferredMethod,
      preferredLanguage,
      createdAt: new Date(Date.now() - randomInt(10, 180) * 86400000).toISOString(),
    });
  }
  return customers;
}

export function generateSyntheticTransactions(
  count = 1200,
  customers?: Customer[],
  includeSpikeAnomaly = true
): { transactions: Transaction[]; customers: Customer[] } {
  const custList = customers && customers.length > 0 ? customers : generateSyntheticCustomers(150);
  const transactions: Transaction[] = [];

  const now = Date.now();
  const timeSpanHours = 48; // span over last 48 hours

  // Define an anomaly spike time window within the last 25 minutes
  // so it falls inside the 30-minute rolling detection window used by Revora Intelligence
  const spikeStart = now - (25 * 60 * 1000); // 25 mins ago
  const spikeEnd = now - (5 * 60 * 1000);    // 5 mins ago

  for (let i = 1; i <= count; i++) {
    const cust = randomChoice(custList);
    const id = `tx_rev_${Date.now().toString(36)}_${String(i).padStart(5, "0")}`;
    const orderId = `order_in_${randomInt(100000, 999999)}`;

    // Timestamp generation
    let txTime: number;
    // 15% of transactions injected during the spike anomaly window if enabled
    const isInSpike = includeSpikeAnomaly && Math.random() < 0.15;
    if (isInSpike) {
      txTime = randomInt(spikeStart, spikeEnd);
    } else {
      txTime = now - randomInt(0, timeSpanHours * 3600 * 1000);
    }

    // Payment Method selection
    let method: PaymentMethod;
    const randMethod = Math.random();
    if (randMethod < 0.55) method = "UPI";
    else if (randMethod < 0.75) method = "CREDIT_CARD";
    else if (randMethod < 0.90) method = "DEBIT_CARD";
    else if (randMethod < 0.96) method = "NETBANKING";
    else if (randMethod < 0.99) method = "WALLET";
    else method = "EMI";

    // Issuer Bank selection
    let bank: IssuerBank;
    if (isInSpike) {
      // High concentration on HDFC during the spike to simulate issuer degradation
      bank = Math.random() < 0.88 ? "HDFC" : randomChoice<IssuerBank>(["ICICI", "SBI", "AXIS"]);
    } else {
      bank = randomChoice<IssuerBank>(["HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "YES_BANK", "PNB", "BOB"]);
    }

    // Amount generation (weighted realistically for Indian commerce)
    let amountInr: number;
    const randAmountTier = Math.random();
    if (randAmountTier < 0.40) {
      // Micro / regular orders
      amountInr = randomChoice([199, 299, 499, 799, 999, 1299]);
    } else if (randAmountTier < 0.75) {
      // Mid-tier retail / fashion / tech
      amountInr = randomChoice([1999, 2499, 3499, 4999, 6499]);
    } else if (randAmountTier < 0.92) {
      // High-ticket consumer
      amountInr = randomChoice([8999, 12499, 15999, 24999, 34999]);
    } else {
      // B2B / Luxury / Annual subscriptions (occasional high-value amounts up to ₹2L)
      amountInr = randomChoice([54000, 85000, 120000, 185000, 200000]);
    }

    // Determine status
    let status: PaymentStatus;
    let failureCategory: FailureCategory | undefined;
    let failureCode: string | undefined;
    let failureReason: string | undefined;
    let retryCount = 0;

    if (isInSpike && bank === "HDFC" && method === "UPI") {
      // Spike failure
      status = "FAILED";
      failureCategory = "ISSUER_OUTAGE";
      const failureObj = randomChoice(FAILURE_CODES.ISSUER_OUTAGE);
      failureCode = failureObj.code;
      failureReason = `[HDFC UPI Outage] ${failureObj.reason}`;
      retryCount = randomChoice([0, 1, 2, 3]);
    } else {
      const randStatus = Math.random();
      if (randStatus < 0.72) {
        status = "SUCCESS";
      } else if (randStatus < 0.92) {
        status = "FAILED";
        failureCategory = randomChoice<FailureCategory>([
          "CUSTOMER_AUTHENTICATION",
          "INSUFFICIENT_FUNDS",
          "ISSUER_OUTAGE",
          "TECHNICAL_TIMEOUT",
          "CARD_LIMIT_EXCEEDED",
          "MANDATE_SUBSCRIPTION_ERROR",
          "NETWORK_DROP"
        ]);
        const failureObj = randomChoice(FAILURE_CODES[failureCategory]);
        failureCode = failureObj.code;
        failureReason = failureObj.reason;
        retryCount = randomChoice([0, 1, 1, 2]);
      } else if (randStatus < 0.97) {
        status = "ABANDONED";
        failureCategory = "CHECKOUT_ABANDONMENT";
        const failureObj = randomChoice(FAILURE_CODES.CHECKOUT_ABANDONMENT);
        failureCode = failureObj.code;
        failureReason = failureObj.reason;
        retryCount = 0;
      } else {
        status = "PENDING";
      }
    }

    const isSubscription = Math.random() < 0.18;

    transactions.push({
      id,
      orderId,
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      amountInr,
      currency: "INR",
      status,
      paymentMethod: method,
      issuerBank: bank,
      failureCategory,
      failureCode,
      failureReason,
      retryCount,
      isSubscription,
      isSynthetic: true,
      errorPayload: failureCode
        ? {
            gateway_code: failureCode,
            internal_error_description: failureReason,
            source: "SIMULATED_RAZORPAY_GATEWAY",
            gateway_http_code: failureCategory === "ISSUER_OUTAGE" ? 503 : 400,
          }
        : undefined,
      metadata: {
        device: randomChoice(["MOBILE_ANDROID", "MOBILE_IOS", "DESKTOP_CHROME", "DESKTOP_MAC"]),
        checkout_version: "v3_razorpay_hosted",
        app_env: "SIMULATION_MODE",
      },
      createdAt: new Date(txTime).toISOString(),
      updatedAt: new Date(txTime + 15000).toISOString(),
    });
  }

  // Sort descending by createdAt
  transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { transactions, customers: custList };
}
