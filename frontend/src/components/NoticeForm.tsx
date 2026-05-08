import { useState } from "react";
import type { Language } from "../App";
import { createDraft, getPdfDownloadUrl } from "../api";

interface NoticeFormProps {
  situationId: string;
  language: Language;
}

interface FormData {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  recipientName: string;
  recipientAddress: string;
  noticeType: string;
  amountDue: string;
  periodFrom: string;
  periodTo: string;
}

const NOTICE_TYPES = [
  { value: "demand_notice", label: "Demand Notice (Unpaid Wages)" },
  { value: "rti_application", label: "RTI Application" },
  { value: "consumer_complaint", label: "Consumer Complaint Notice" },
  { value: "cheque_bounce_notice", label: "Cheque Bounce Notice" },
];

export default function NoticeForm({ situationId, language }: NoticeFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>({
    senderName: "",
    senderAddress: "",
    senderPhone: "",
    senderEmail: "",
    recipientName: "",
    recipientAddress: "",
    noticeType: "demand_notice",
    amountDue: "",
    periodFrom: "",
    periodTo: "",
  });
  const [status, setStatus] = useState<
    "idle" | "generating" | "done" | "error"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (
      !form.senderName ||
      !form.senderAddress ||
      !form.recipientName ||
      !form.recipientAddress
    ) {
      setErrorMsg(
        language === "en"
          ? "Please fill in all required fields."
          : "कृपया सभी आवश्यक फील्ड भरें।",
      );
      return;
    }

    setStatus("generating");
    setErrorMsg(null);

    try {
      const extra: Record<string, string> = {};
      if (form.noticeType === "demand_notice") {
        extra.amount_due = form.amountDue;
        extra.period_from = form.periodFrom;
        extra.period_to = form.periodTo;
      }

      const draft = await createDraft({
        situation_id: situationId,
        notice_type: form.noticeType,
        sender: {
          name: form.senderName,
          address: form.senderAddress,
          phone: form.senderPhone || undefined,
          email: form.senderEmail || undefined,
        },
        recipient: {
          name: form.recipientName,
          address: form.recipientAddress,
        },
        extra,
      });

      const noticeId = draft.notice_id;
      const maxAttempts = 15;
      let attempts = 0;

      const poll = async () => {
        attempts++;
        try {
          const url = getPdfDownloadUrl(noticeId);
          const res = await fetch(url);

          if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
            setDownloadUrl(url);
            setStatus("done");
            return;
          }

          const data = await res.json();
          if (data.status === "failed") {
            setStatus("error");
            setErrorMsg(data.error || "PDF generation failed.");
            return;
          }

          if (attempts < maxAttempts) {
            setTimeout(poll, 2000);
          } else {
            setStatus("error");
            setErrorMsg(
              language === "en"
                ? "PDF generation timed out. Please try again."
                : "PDF तैयार होने में समय लग रहा है। पुनः प्रयास करें।",
            );
          }
        } catch {
          setStatus("error");
          setErrorMsg(
            language === "en" ? "Something went wrong." : "कुछ गलत हो गया।",
          );
        }
      };

      setTimeout(poll, 2000);
    } catch {
      setStatus("error");
      setErrorMsg(
        language === "en"
          ? "Failed to create notice. Please try again."
          : "नोटिस बनाने में विफल। पुनः प्रयास करें।",
      );
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-gray-900 mb-3 uppercase tracking-wide text-xs">
        {language === "en"
          ? "Draft Your Legal Notice"
          : "कानूनी नोटिस तैयार करें"}
      </h2>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm border border-gray-300 rounded px-4 py-2 text-gray-700 hover:border-primary hover:text-primary transition-colors"
        >
          {language === "en" ? "Generate Notice PDF" : "नोटिस PDF बनाएं"}
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div>
            <label className={labelClass}>
              {language === "en" ? "Notice Type" : "नोटिस प्रकार"}
            </label>
            <select
              value={form.noticeType}
              onChange={(e) => update("noticeType", e.target.value)}
              className={inputClass}
            >
              {NOTICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                {language === "en" ? "Your Name *" : "आपका नाम *"}
              </label>
              <input
                type="text"
                value={form.senderName}
                onChange={(e) => update("senderName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {language === "en" ? "Your Address *" : "आपका पता *"}
              </label>
              <input
                type="text"
                value={form.senderAddress}
                onChange={(e) => update("senderAddress", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {language === "en" ? "Your Phone" : "फोन नंबर"}
              </label>
              <input
                type="text"
                value={form.senderPhone}
                onChange={(e) => update("senderPhone", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {language === "en" ? "Your Email" : "ईमेल"}
              </label>
              <input
                type="email"
                value={form.senderEmail}
                onChange={(e) => update("senderEmail", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                {language === "en"
                  ? "Recipient Name *"
                  : "प्राप्तकर्ता का नाम *"}
              </label>
              <input
                type="text"
                value={form.recipientName}
                onChange={(e) => update("recipientName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {language === "en"
                  ? "Recipient Address *"
                  : "प्राप्तकर्ता का पता *"}
              </label>
              <input
                type="text"
                value={form.recipientAddress}
                onChange={(e) => update("recipientAddress", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {form.noticeType === "demand_notice" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>
                  {language === "en" ? "Amount Due (Rs.)" : "बकाया राशि"}
                </label>
                <input
                  type="text"
                  value={form.amountDue}
                  onChange={(e) => update("amountDue", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 45,000"
                />
              </div>
              <div>
                <label className={labelClass}>
                  {language === "en" ? "Period From" : "अवधि से"}
                </label>
                <input
                  type="text"
                  value={form.periodFrom}
                  onChange={(e) => update("periodFrom", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. January 2026"
                />
              </div>
              <div>
                <label className={labelClass}>
                  {language === "en" ? "Period To" : "अवधि तक"}
                </label>
                <input
                  type="text"
                  value={form.periodTo}
                  onChange={(e) => update("periodTo", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. March 2026"
                />
              </div>
            </div>
          )}

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          {status === "done" && downloadUrl ? (
            <a
              href={downloadUrl}
              download
              className="inline-block bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              {language === "en" ? "Download PDF" : "PDF डाउनलोड करें"}
            </a>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={status === "generating"}
              className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "generating"
                ? language === "en"
                  ? "Generating PDF..."
                  : "PDF बन रहा है..."
                : language === "en"
                  ? "Generate Notice PDF"
                  : "नोटिस PDF बनाएं"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
