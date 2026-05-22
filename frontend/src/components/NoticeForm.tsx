import { useState, useEffect, useRef } from "react";
import { createDraft, getPdfDownloadUrl } from "../api";

interface NoticeFormProps {
  situationId: string;
}

interface FormData {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  recipientName: string;
  recipientAddress: string;
  noticeType: string;
  // demand_notice
  amountDue: string;
  periodFrom: string;
  periodTo: string;
  // rti_application
  informationSought: string;
  // consumer_complaint
  productDescription: string;
  purchaseDate: string;
  defectDescription: string;
  remedySought: string;
  // cheque_bounce_notice
  chequeNumber: string;
  chequeDate: string;
  chequeAmount: string;
  bankName: string;
  dishonourDate: string;
  dishonourReason: string;
  memoReceivedDate: string;
  noticeDeadline: string;
}

const NOTICE_TYPES = [
  { value: "demand_notice", label: "Demand Notice (Unpaid Wages)" },
  { value: "rti_application", label: "RTI Application" },
  { value: "consumer_complaint", label: "Consumer Complaint Notice" },
  { value: "cheque_bounce_notice", label: "Cheque Bounce Notice" },
];

const inputClass =
  "w-full border border-border rounded-lg px-3 py-2 text-sm text-ink bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all";
const labelClass = "block text-xs font-medium text-ink-3 mb-1";

const EMPTY_FORM: FormData = {
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
  informationSought: "",
  productDescription: "",
  purchaseDate: "",
  defectDescription: "",
  remedySought: "",
  chequeNumber: "",
  chequeDate: "",
  chequeAmount: "",
  bankName: "",
  dishonourDate: "",
  dishonourReason: "",
  memoReceivedDate: "",
  noticeDeadline: "",
};

export default function NoticeForm({ situationId }: NoticeFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    if (!form.senderName || !form.senderAddress || !form.recipientName || !form.recipientAddress) {
      setErrorMsg("Please fill in all required fields.");
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
      } else if (form.noticeType === "rti_application") {
        extra.information_sought = form.informationSought;
      } else if (form.noticeType === "consumer_complaint") {
        extra.product_description = form.productDescription;
        extra.purchase_date = form.purchaseDate;
        extra.defect_description = form.defectDescription;
        extra.remedy_sought = form.remedySought;
      } else if (form.noticeType === "cheque_bounce_notice") {
        extra.cheque_number = form.chequeNumber;
        extra.cheque_date = form.chequeDate;
        extra.cheque_amount = form.chequeAmount;
        extra.bank_name = form.bankName;
        extra.dishonour_date = form.dishonourDate;
        extra.dishonour_reason = form.dishonourReason || "Funds Insufficient";
        extra.memo_received_date = form.memoReceivedDate;
        extra.notice_deadline = form.noticeDeadline;
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
        recipient: { name: form.recipientName, address: form.recipientAddress },
        extra,
      });

      const noticeId = draft.notice_id;
      let attempts = 0;

      const poll = async () => {
        if (!mountedRef.current) return;
        attempts++;
        try {
          const url = getPdfDownloadUrl(noticeId);
          const res = await fetch(url);
          if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
            if (!mountedRef.current) return;
            setDownloadUrl(url);
            setStatus("done");
            return;
          }
          const data = await res.json();
          if (data.status === "failed") {
            if (!mountedRef.current) return;
            setStatus("error");
            setErrorMsg(data.error || "PDF generation failed.");
            return;
          }
          if (attempts < 15) setTimeout(poll, 2000);
          else {
            if (!mountedRef.current) return;
            setStatus("error");
            setErrorMsg("PDF generation timed out.");
          }
        } catch {
          if (!mountedRef.current) return;
          setStatus("error");
          setErrorMsg("Something went wrong.");
        }
      };

      setTimeout(poll, 2000);
    } catch {
      setStatus("error");
      setErrorMsg("Failed to create notice.");
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3 pl-3 border-l-2 border-accent/30">
        Draft Your Legal Notice
      </h2>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full text-left border border-border rounded-xl p-4 bg-surface-2 hover:border-accent/40 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                Generate Legal Notice PDF
              </p>
              <p className="text-xs text-ink-3 mt-0.5">
                Free · Takes 30 seconds · Ready to send
              </p>
            </div>
            <span className="text-accent shrink-0 ml-4">→</span>
          </div>
        </button>
      ) : (
        <div className="border border-border rounded-xl p-5 bg-surface-2 space-y-4">
          <div>
            <label className={labelClass}>Notice Type</label>
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
              <label className={labelClass}>Your Name *</label>
              <input
                type="text"
                value={form.senderName}
                onChange={(e) => update("senderName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Your Address *</label>
              <input
                type="text"
                value={form.senderAddress}
                onChange={(e) => update("senderAddress", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Your Phone</label>
              <input
                type="text"
                value={form.senderPhone}
                onChange={(e) => update("senderPhone", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Your Email</label>
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
              <label className={labelClass}>Recipient Name *</label>
              <input
                type="text"
                value={form.recipientName}
                onChange={(e) => update("recipientName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Recipient Address *</label>
              <input
                type="text"
                value={form.recipientAddress}
                onChange={(e) => update("recipientAddress", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Demand notice fields */}
          {form.noticeType === "demand_notice" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Amount Due (Rs.)</label>
                <input
                  type="text"
                  value={form.amountDue}
                  onChange={(e) => update("amountDue", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 45,000"
                />
              </div>
              <div>
                <label className={labelClass}>Period From</label>
                <input
                  type="text"
                  value={form.periodFrom}
                  onChange={(e) => update("periodFrom", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. January 2026"
                />
              </div>
              <div>
                <label className={labelClass}>Period To</label>
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

          {/* RTI fields */}
          {form.noticeType === "rti_application" && (
            <div>
              <label className={labelClass}>Information Sought *</label>
              <textarea
                value={form.informationSought}
                onChange={(e) => update("informationSought", e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Describe the information you are requesting from the public authority..."
              />
            </div>
          )}

          {/* Consumer complaint fields */}
          {form.noticeType === "consumer_complaint" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Product / Service *</label>
                  <input
                    type="text"
                    value={form.productDescription}
                    onChange={(e) => update("productDescription", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Samsung TV 55 inch"
                  />
                </div>
                <div>
                  <label className={labelClass}>Purchase Date *</label>
                  <input
                    type="text"
                    value={form.purchaseDate}
                    onChange={(e) => update("purchaseDate", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 15 January 2026"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Defect / Issue *</label>
                <textarea
                  value={form.defectDescription}
                  onChange={(e) => update("defectDescription", e.target.value)}
                  rows={2}
                  className={inputClass}
                  placeholder="Describe the defect or deficiency..."
                />
              </div>
              <div>
                <label className={labelClass}>Remedy Sought *</label>
                <input
                  type="text"
                  value={form.remedySought}
                  onChange={(e) => update("remedySought", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. replace the product or refund Rs. 45,000"
                />
              </div>
            </div>
          )}

          {/* Cheque bounce fields */}
          {form.noticeType === "cheque_bounce_notice" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Cheque Number *</label>
                  <input
                    type="text"
                    value={form.chequeNumber}
                    onChange={(e) => update("chequeNumber", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 001234"
                  />
                </div>
                <div>
                  <label className={labelClass}>Cheque Date *</label>
                  <input
                    type="text"
                    value={form.chequeDate}
                    onChange={(e) => update("chequeDate", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 01 March 2026"
                  />
                </div>
                <div>
                  <label className={labelClass}>Cheque Amount (Rs.) *</label>
                  <input
                    type="text"
                    value={form.chequeAmount}
                    onChange={(e) => update("chequeAmount", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 2,00,000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Bank Name *</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => update("bankName", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. HDFC Bank"
                  />
                </div>
                <div>
                  <label className={labelClass}>Dishonour Reason</label>
                  <input
                    type="text"
                    value={form.dishonourReason}
                    onChange={(e) => update("dishonourReason", e.target.value)}
                    className={inputClass}
                    placeholder="Funds Insufficient"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Date of Dishonour *</label>
                  <input
                    type="text"
                    value={form.dishonourDate}
                    onChange={(e) => update("dishonourDate", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 10 April 2026"
                  />
                </div>
                <div>
                  <label className={labelClass}>Memo Received Date *</label>
                  <input
                    type="text"
                    value={form.memoReceivedDate}
                    onChange={(e) => update("memoReceivedDate", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 12 April 2026"
                  />
                </div>
                <div>
                  <label className={labelClass}>Notice Deadline *</label>
                  <input
                    type="text"
                    value={form.noticeDeadline}
                    onChange={(e) => update("noticeDeadline", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 12 May 2026"
                  />
                </div>
              </div>
            </div>
          )}

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          {status === "done" && downloadUrl ? (
            <a
              href={downloadUrl}
              download
              className="inline-block bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dark transition-colors"
            >
              Download PDF
            </a>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={status === "generating"}
              className="bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "generating" ? "Generating PDF..." : "Generate Notice PDF"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
