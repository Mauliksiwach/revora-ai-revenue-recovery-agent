import React, { useState, useEffect } from "react";
import {
  OutreachLanguage,
  OutreachChannel,
  FailureReasonCategory,
  OutreachPreviewResponse,
} from "../../types/outreach";
import { previewOutreach } from "../../services/api";
import {
  Languages,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";

export const MultiLingualOutreachSandbox: React.FC = () => {
  const [language, setLanguage] = useState<OutreachLanguage>("HINGLISH");
  const [channel, setChannel] = useState<OutreachChannel>("WHATSAPP");
  const [reasonCategory, setReasonCategory] = useState<FailureReasonCategory>("UPI_PIN_ERROR");
  const [customerName, setCustomerName] = useState<string>("Priya Sharma");
  const [amountInr, setAmountInr] = useState<number>(2499);
  const [preview, setPreview] = useState<OutreachPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const res = await previewOutreach({
        language,
        channel,
        reasonCategory,
        customerName,
        amountInr,
        orderId: "ORD-10982",
        bankName: "HDFC Bank",
      });
      setPreview(res);
    } catch (err) {
      console.error("Failed to load outreach preview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [language, channel, reasonCategory, customerName, amountInr]);

  const handleCopy = () => {
    if (preview?.renderedText) {
      navigator.clipboard.writeText(preview.renderedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#111622] border border-gray-800 rounded-xl p-5 mb-6 text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <Languages className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="font-bold text-white text-sm">
              Multi-Lingual Outreach Engine &amp; Indian Language Sandbox
            </h3>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Personalized payment recovery messaging in English, Hindi, and Hinglish with Razorpay 1-click links.
            </p>
          </div>
        </div>

        {/* Language selector tabs */}
        <div className="flex items-center bg-gray-900 p-1 rounded-lg border border-gray-800 shrink-0">
          <button
            onClick={() => setLanguage("HINGLISH")}
            className={`px-3 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
              language === "HINGLISH"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            हिंग्लिश (Hinglish)
          </button>
          <button
            onClick={() => setLanguage("HINDI")}
            className={`px-3 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
              language === "HINDI"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            onClick={() => setLanguage("ENGLISH")}
            className={`px-3 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
              language === "ENGLISH"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Grid: Controls on Left, Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Channel Selector */}
            <div>
              <label className="text-gray-400 font-medium block mb-1 text-[11px]">
                Outreach Channel
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-gray-900 p-1 rounded-lg border border-gray-800">
                {(["WHATSAPP", "SMS", "EMAIL"] as OutreachChannel[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannel(c)}
                    className={`py-1 text-center font-medium rounded text-[11px] transition cursor-pointer ${
                      channel === c
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Failure Reason */}
            <div>
              <label className="text-gray-400 font-medium block mb-1 text-[11px]">
                Failure Context
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value as FailureReasonCategory)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="UPI_PIN_ERROR">Incorrect UPI PIN (High Recovery)</option>
                <option value="BANK_SERVER_BUSY">Bank CBS Server Timeout</option>
                <option value="CARD_OTP_DROPOFF">Card OTP Page Timeout</option>
                <option value="INSUFFICIENT_FUNDS">Insufficient Balance</option>
                <option value="GENERIC_FAILURE">Generic Failure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 font-medium block mb-1 text-[11px]">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-400 font-medium block mb-1 text-[11px]">
                Order Amount (₹)
              </label>
              <input
                type="number"
                value={amountInr}
                onChange={(e) => setAmountInr(Number(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Delivery & Compliance Specs */}
          {preview && (
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-3 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-gray-400">
                <span>Estimated Delivery Speed:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {preview.estimatedDeliverySpeed}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Message Length:</span>
                <span className="font-mono text-white">
                  {preview.characterCount} characters
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>TRAI DLT &amp; WhatsApp Business Compliance:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Template
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Visual Message Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 shadow-inner flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {channel} • {language}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition cursor-pointer"
                  title="Copy Rendered Message"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Message Bubble */}
              {loading ? (
                <div className="py-8 text-center text-gray-500 animate-pulse">
                  Rendering localized message...
                </div>
              ) : preview ? (
                <div className="bg-[#1A2234] border border-blue-900/40 rounded-xl p-3.5 text-gray-100 text-xs shadow-md">
                  {preview.subject && (
                    <div className="font-bold text-blue-300 mb-2 pb-1.5 border-b border-blue-900/40">
                      Subject: {preview.subject}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-[11px]">
                    {preview.renderedText}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Quick 1-Tap CTA Preview */}
            {preview && (
              <div className="mt-3 pt-2">
                <a
                  href={preview.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition cursor-pointer"
                >
                  <span>{preview.ctaText}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
