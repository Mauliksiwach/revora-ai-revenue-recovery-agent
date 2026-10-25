export type OutreachLanguage = "ENGLISH" | "HINDI" | "HINGLISH";

export type OutreachChannel = "WHATSAPP" | "SMS" | "EMAIL";

export type FailureReasonCategory =
  | "UPI_PIN_ERROR"
  | "BANK_SERVER_BUSY"
  | "CARD_OTP_DROPOFF"
  | "INSUFFICIENT_FUNDS"
  | "MANDATE_EXECUTION"
  | "GENERIC_FAILURE";

export interface LocalizedTemplate {
  id: string;
  language: OutreachLanguage;
  languageLabel: string;
  nativeLabel: string;
  channel: OutreachChannel;
  reasonCategory: FailureReasonCategory;
  subject?: string;
  bodyTemplate: string;
  ctaText: string;
}

export interface OutreachPreviewRequest {
  language: OutreachLanguage;
  channel: OutreachChannel;
  reasonCategory: FailureReasonCategory;
  customerName: string;
  amountInr: number;
  orderId: string;
  bankName?: string;
  paymentLink?: string;
}

export interface OutreachPreviewResponse {
  language: OutreachLanguage;
  channel: OutreachChannel;
  reasonCategory: FailureReasonCategory;
  subject?: string;
  renderedText: string;
  ctaText: string;
  paymentLink: string;
  estimatedDeliverySpeed: string;
  characterCount: number;
  complianceChecked: boolean;
}
