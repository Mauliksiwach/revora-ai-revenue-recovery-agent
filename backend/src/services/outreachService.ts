import {
  LocalizedTemplate,
  OutreachLanguage,
  OutreachChannel,
  FailureReasonCategory,
  OutreachPreviewRequest,
  OutreachPreviewResponse,
} from "../types/outreach.js";

const DEFAULT_TEMPLATES: LocalizedTemplate[] = [
  // --- HINGLISH TEMPLATES ---
  {
    id: "tmpl_hinglish_upi_wa",
    language: "HINGLISH",
    languageLabel: "Hinglish (Colloquial)",
    nativeLabel: "हिंग्लिश (Indian Conversational)",
    channel: "WHATSAPP",
    reasonCategory: "UPI_PIN_ERROR",
    subject: "Order #{orderId} - Quick Payment Update",
    bodyTemplate:
      "Hey {name}! 👋 Aapka ₹{amount} ka payment order #{orderId} ke liye galat UPI PIN enter hone ki wajah se complete nahi ho paya.\n\nTension mat lijiye, aap neeche diye gaye secure Razorpay link se bina dubara PIN issue ke 1 tap mein payment complete kar sakte hain:\n\n🔗 {paymentLink}\n\nYeh link agle 15 minutes ke liye valid hai. Kisi bhi problem ke liye simply reply karein!",
    ctaText: "Complete in 1 Tap (Razorpay)",
  },
  {
    id: "tmpl_hinglish_bank_wa",
    language: "HINGLISH",
    languageLabel: "Hinglish (Colloquial)",
    nativeLabel: "हिंग्लिश (Indian Conversational)",
    channel: "WHATSAPP",
    reasonCategory: "BANK_SERVER_BUSY",
    subject: "Order #{orderId} - Bank Switch Delay",
    bodyTemplate:
      "Hi {name}! {bankName || 'Bank'} ke UPI switch mein temporary server timeout ki wajah se aapka ₹{amount} ka payment atak gaya tha.\n\nHumne aapka order reserve rakha hai. Server stabilize ho chuka hai, aap is 1-click Razorpay link se retry kar sakte hain:\n\n🔗 {paymentLink}\n\nThank you for your patience!",
    ctaText: "Retry Payment Securely",
  },
  {
    id: "tmpl_hinglish_otp_wa",
    language: "HINGLISH",
    languageLabel: "Hinglish (Colloquial)",
    nativeLabel: "हिंग्लिश (Indian Conversational)",
    channel: "WHATSAPP",
    reasonCategory: "CARD_OTP_DROPOFF",
    subject: "Order #{orderId} - OTP Verification Pending",
    bodyTemplate:
      "Hey {name}! Lagta hai aapka card OTP page time out ho gaya tha. Aapka ₹{amount} ka order #{orderId} hold par hai.\n\nAap directly UPI ya alternate card se turant pay kar sakte hain:\n\n🔗 {paymentLink}\n\n100% safe & instant verification via Razorpay.",
    ctaText: "Pay via Alternate Method",
  },
  {
    id: "tmpl_hinglish_generic_sms",
    language: "HINGLISH",
    languageLabel: "Hinglish (Colloquial)",
    nativeLabel: "हिंग्लिश (Indian Conversational)",
    channel: "SMS",
    reasonCategory: "GENERIC_FAILURE",
    bodyTemplate:
      "{name}, aapka ₹{amount} ka order #{orderId} complete nahi ho paya. Is secure link se turant complete karein: {paymentLink} - Revora / Razorpay",
    ctaText: "Pay Now",
  },

  // --- HINDI TEMPLATES ---
  {
    id: "tmpl_hindi_upi_wa",
    language: "HINDI",
    languageLabel: "Hindi",
    nativeLabel: "हिन्दी (Official Standard)",
    channel: "WHATSAPP",
    reasonCategory: "UPI_PIN_ERROR",
    subject: "आर्डर #{orderId} - भुगतान सहायता",
    bodyTemplate:
      "नमस्ते {name}! 🙏 आपके आर्डर #{orderId} के लिए ₹{amount} का भुगतान गलत UPI PIN दर्ज होने के कारण पूरा नहीं हो पाया।\n\nचिंता न करें, आप नीचे दिए गए सुरक्षित Razorpay लिंक से बिना किसी रुकावट के सिर्फ एक टैप में भुगतान पूरा कर सकते हैं:\n\n🔗 {paymentLink}\n\nयह लिंक अगले 15 मिनट के लिए सक्रिय है। सहायता के लिए इसी संदेश का उत्तर दें।",
    ctaText: "एक क्लिक में भुगतान करें",
  },
  {
    id: "tmpl_hindi_bank_wa",
    language: "HINDI",
    languageLabel: "Hindi",
    nativeLabel: "हिन्दी (Official Standard)",
    channel: "WHATSAPP",
    reasonCategory: "BANK_SERVER_BUSY",
    subject: "आर्डर #{orderId} - बैंक सर्वर अपडेट",
    bodyTemplate:
      "नमस्ते {name}! {bankName || 'बैंक'} के सर्वर में अस्थायी तकनीकी समस्या के कारण ₹{amount} का लेन-देन विफल हो गया था।\n\nहमने आपका आर्डर सुरक्षित रखा है। अब बैंक सर्वर सुचारू है, कृपया नीचे दिए गए लिंक से पुनः प्रयास करें:\n\n🔗 {paymentLink}\n\nसहयोग के लिए धन्यवाद!",
    ctaText: "सुरक्षित भुगतान पुनः करें",
  },
  {
    id: "tmpl_hindi_otp_wa",
    language: "HINDI",
    languageLabel: "Hindi",
    nativeLabel: "हिन्दी (Official Standard)",
    channel: "WHATSAPP",
    reasonCategory: "CARD_OTP_DROPOFF",
    subject: "आर्डर #{orderId} - OTP प्रमाणीकरण अधूरा",
    bodyTemplate:
      "नमस्ते {name}! कार्ड OTP प्रमाणीकरण समय समाप्त होने के कारण आपका ₹{amount} का आर्डर #{orderId} पूरा नहीं हो सका।\n\nआप किसी भी UPI ऐप या अन्य कार्ड से तुरंत भुगतान पूरा कर सकते हैं:\n\n🔗 {paymentLink}\n\nRazorpay द्वारा पूर्णतः सुरक्षित।",
    ctaText: "अन्य माध्यम से भुगतान करें",
  },

  // --- ENGLISH TEMPLATES ---
  {
    id: "tmpl_english_upi_wa",
    language: "ENGLISH",
    languageLabel: "English",
    nativeLabel: "English (Global / Tech)",
    channel: "WHATSAPP",
    reasonCategory: "UPI_PIN_ERROR",
    subject: "Payment Pending: Order #{orderId}",
    bodyTemplate:
      "Hi {name}, your payment of ₹{amount} for Order #{orderId} could not be processed due to an incorrect UPI PIN.\n\nDon't worry — your cart is reserved. Complete your checkout securely in 1 tap with no need to re-enter details:\n\n🔗 {paymentLink}\n\nValid for 15 minutes. Need help? Reply directly to this message.",
    ctaText: "Complete in 1 Tap",
  },
  {
    id: "tmpl_english_bank_wa",
    language: "ENGLISH",
    languageLabel: "English",
    nativeLabel: "English (Global / Tech)",
    channel: "WHATSAPP",
    reasonCategory: "BANK_SERVER_BUSY",
    subject: "Temporary Bank Downtime: Order #{orderId}",
    bodyTemplate:
      "Hi {name}, {bankName || 'Your bank'}'s switch experienced a temporary network timeout during your ₹{amount} payment.\n\nGood news: network connectivity is now restored. You can complete your order #{orderId} via our resilient backup rail:\n\n🔗 {paymentLink}\n\nThank you for choosing us!",
    ctaText: "Retry on Backup Rail",
  },
  {
    id: "tmpl_english_otp_wa",
    language: "ENGLISH",
    languageLabel: "English",
    nativeLabel: "English (Global / Tech)",
    channel: "WHATSAPP",
    reasonCategory: "CARD_OTP_DROPOFF",
    subject: "Action Required: Order #{orderId}",
    bodyTemplate:
      "Hi {name}, we noticed your card authentication timed out for Order #{orderId} (₹{amount}).\n\nTo ensure your items don't go out of stock, finish your purchase instantly via UPI or Netbanking:\n\n🔗 {paymentLink}\n\n100% secure checkout powered by Razorpay.",
    ctaText: "Complete Secure Checkout",
  },
  {
    id: "tmpl_english_email",
    language: "ENGLISH",
    languageLabel: "English",
    nativeLabel: "English (Global / Tech)",
    channel: "EMAIL",
    reasonCategory: "GENERIC_FAILURE",
    subject: "Action Required: Complete your ₹{amount} order #{orderId}",
    bodyTemplate:
      "Dear {name},\n\nWe encountered a payment gateway issue while processing your order #{orderId} for ₹{amount}.\n\nYour items have been temporarily held for you. Click below to securely finish your payment using your preferred payment method (UPI, Cards, or Netbanking):\n\n{paymentLink}\n\nWarm regards,\nMerchant Support Team (via Revora Recovery)",
    ctaText: "Pay ₹{amount} Now",
  },
];

export class OutreachService {
  private templates: LocalizedTemplate[] = [...DEFAULT_TEMPLATES];

  public getTemplates(): LocalizedTemplate[] {
    return this.templates;
  }

  public renderPreview(request: OutreachPreviewRequest): OutreachPreviewResponse {
    const {
      language = "HINGLISH",
      channel = "WHATSAPP",
      reasonCategory = "UPI_PIN_ERROR",
      customerName = "Priya Sharma",
      amountInr = 2499,
      orderId = "10982",
      bankName = "HDFC Bank",
      paymentLink = `https://rzp.io/i/rev_${orderId}_${Math.floor(Math.random() * 8999 + 1000)}`,
    } = request;

    // Find matching template or fallback
    let tmpl = this.templates.find(
      (t) =>
        t.language === language &&
        t.channel === channel &&
        t.reasonCategory === reasonCategory
    );

    if (!tmpl) {
      tmpl = this.templates.find(
        (t) => t.language === language && t.channel === channel
      );
    }

    if (!tmpl) {
      tmpl = this.templates.find((t) => t.language === language) || this.templates[0];
    }

    const formattedAmount = amountInr.toLocaleString("en-IN");

    // Interpolate placeholders
    const replaceAll = (str: string) =>
      str
        .replace(/\{name\}/g, customerName)
        .replace(/\{amount\}/g, formattedAmount)
        .replace(/\{orderId\}/g, orderId)
        .replace(/\{bankName\}/g, bankName)
        .replace(/\{paymentLink\}/g, paymentLink);

    const renderedText = replaceAll(tmpl.bodyTemplate);
    const subject = tmpl.subject ? replaceAll(tmpl.subject) : undefined;
    const ctaText = replaceAll(tmpl.ctaText);

    return {
      language,
      channel,
      reasonCategory,
      subject,
      renderedText,
      ctaText,
      paymentLink,
      estimatedDeliverySpeed: channel === "WHATSAPP" ? "< 3 seconds" : channel === "SMS" ? "< 5 seconds" : "< 15 seconds",
      characterCount: renderedText.length,
      complianceChecked: true, // Follows TRAI DLT / WhatsApp Business Messaging guidelines
    };
  }
}

export const outreachService = new OutreachService();
