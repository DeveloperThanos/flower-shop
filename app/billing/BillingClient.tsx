"use client";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface FlowerItem {
  id: number;
  name: string;
  pricePerKg: number;
  quantity: number;
  amount: number;
}

interface SellerDetails {
  name: string;
  phone: string;
  address: string;
  logo_url: string;
}

interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
}

type PaymentMode = "cash" | "upi" | "card";
const UPI_ID = "sowraj@upi";

// ─── Invoice filename: 02MAR#16-CustomerName.pdf ──────────────────────────────
function buildInvoiceFilename(bill: any) {
  const now = new Date(bill.created_at || Date.now());
  const day = String(now.getDate()).padStart(2, "0");
  const mon = now.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  const customerSlug = bill.customer_name.replace(/\s+/g, "-");
  return `${day}${mon}#${bill.id}-${customerSlug}.pdf`;
}

// ─── GST Totals Widget (reused in both form and modal) ───────────────────────
function TotalsSection({
  subtotal,
  gstPercent,
  onGstChange,
}: {
  subtotal: number;
  gstPercent: number;
  onGstChange: (val: number) => void;
}) {
  const gstAmount = parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
  const total = subtotal + gstAmount;
  return (
    <div
      className="mt-4 p-3 rounded-xl space-y-2"
      style={{
        background: "rgba(139,92,246,0.04)",
        border: "1px solid rgba(139,92,246,0.12)",
      }}
    >
      <div className="flex justify-between items-center text-sm text-purple-400">
        <span>Subtotal</span>
        <span>Rs.{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-purple-400">GST</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={gstPercent}
              onChange={(e) => onGstChange(parseFloat(e.target.value) || 0)}
              className="w-14 text-xs text-center py-1 px-1"
              style={{
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 6,
                color: "#c084fc",
              }}
            />
            <span className="text-purple-500 text-xs">%</span>
          </div>
        </div>
        <span className="text-purple-400">Rs.{gstAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-white font-bold text-base border-t border-purple-800/40 pt-2">
        <span>Total</span>
        <span>Rs.{total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── PDF Builder ──────────────────────────────────────────────────────────────
async function buildInvoicePDF(
  doc: any,
  bill: any,
  seller: SellerDetails,
  gstPercent: number = 0,
) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = 297;
  const mL = 14,
    mR = 14;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");

  // Header band
  doc.setFillColor(248, 248, 248);
  doc.rect(0, 0, pageW, 48, "F");
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(0, 48, pageW, 48);

  // Logo
  let textStartX = mL;
  if (seller.logo_url) {
    try {
      const ext = seller.logo_url.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(seller.logo_url, ext, mL, 4, 20, 20);
      textStartX = mL + 24;
    } catch {}
  }

  // Shop brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 15, 15);
  doc.text("FLOWER SHOP", textStartX, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(
    "Fresh Flowers  ·  Quality Guaranteed  ·  Same Day Delivery",
    textStartX,
    19,
  );

  // ✅ Owner/Seller name ABOVE phone number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(seller.name, textStartX, 27);

  // Phone below name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  doc.text(seller.phone, textStartX, 34);

  // Address below phone
  if (seller.address) {
    doc.text(seller.address.substring(0, 65), textStartX, 41);
  }

  // Top right — INVOICE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(210, 210, 210);
  doc.text("INVOICE", pageW - mR, 14, { align: "right" });

  // ✅ Invoice ref: 02MAR#16-CustomerName
  const now = new Date(bill.created_at || Date.now());
  const day = String(now.getDate()).padStart(2, "0");
  const mon = now.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  const invoiceRef = `${day}${mon}#${bill.id}-${bill.customer_name}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(invoiceRef, pageW - mR, 25, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Date: ${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
    pageW - mR,
    33,
    { align: "right" },
  );

  // Bill To + Payment
  const sec2Y = 54;
  const halfW = (pageW - mL - mR) / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("BILL TO", mL, sec2Y);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(mL, sec2Y + 2, mL + halfW - 4, sec2Y + 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 15, 15);
  doc.text(bill.customer_name, mL, sec2Y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text(bill.customer_phone, mL, sec2Y + 17);
  if (bill.customer_address) {
    const lines = doc.splitTextToSize(
      bill.customer_address,
      halfW - 4,
    ) as string[];
    lines
      .slice(0, 2)
      .forEach((line: string, li: number) =>
        doc.text(line, mL, sec2Y + 24 + li * 6),
      );
  }

  const col2X = mL + halfW + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("PAYMENT", col2X, sec2Y);
  doc.line(col2X, sec2Y + 2, pageW - mR, sec2Y + 2);

  const isPaid = bill.payment_status;
  doc.setFillColor(
    ...((isPaid ? [220, 252, 231] : [255, 237, 213]) as [
      number,
      number,
      number,
    ]),
  );
  doc.setDrawColor(
    ...((isPaid ? [134, 239, 172] : [253, 186, 116]) as [
      number,
      number,
      number,
    ]),
  );
  doc.setLineWidth(0.4);
  doc.roundedRect(col2X, sec2Y + 5, 32, 9, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(isPaid ? 22 : 154, isPaid ? 101 : 52, isPaid ? 52 : 18);
  doc.text(isPaid ? "PAID" : "UNPAID", col2X + 16, sec2Y + 11, {
    align: "center",
  });

  if (isPaid && bill.payment_mode) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(`Mode: ${bill.payment_mode.toUpperCase()}`, col2X, sec2Y + 20);
    if (bill.payment_mode === "upi")
      doc.text(`UPI: ${UPI_ID}`, col2X, sec2Y + 27);
  }

  const divY = sec2Y + 38;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(mL, divY, pageW - mR, divY);

  // Items table
  const validItems = (bill.items || []).filter(
    (i: any) => i.name && i.quantity > 0,
  );
  const subtotal = validItems.reduce(
    (s: number, i: any) => s + Number(i.amount),
    0,
  );
  const gstAmount = parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
  const totalAmount = subtotal + gstAmount;

  (doc as any).autoTable({
    startY: divY + 4,
    head: [
      ["#", "Flower / Description", "Rate (Rs/kg)", "Qty (kg)", "Amount (Rs)"],
    ],
    body: validItems.map((item: any, i: number) => [
      i + 1,
      item.name,
      Number(item.pricePerKg).toFixed(2),
      item.quantity,
      Number(item.amount).toFixed(2),
    ]),
    theme: "plain",
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [60, 60, 60],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
      lineColor: [215, 215, 215],
      lineWidth: { bottom: 0.5 },
    },
    bodyStyles: {
      textColor: [35, 35, 35],
      fontSize: 8.5,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      lineColor: [235, 235, 235],
      lineWidth: { bottom: 0.3 },
    },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", textColor: [150, 150, 150] },
      1: { cellWidth: "auto" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
    },
    tableLineColor: [228, 228, 228],
    tableLineWidth: 0.3,
    margin: { left: mL, right: mR },
  });

  const finalY = (doc as any).lastAutoTable.finalY;
  const sumR = pageW - mR;
  const sumL = sumR - 90;
  let sy = finalY + 8;

  const boxH = gstPercent > 0 ? 44 : 36;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(228, 228, 228);
  doc.setLineWidth(0.3);
  doc.roundedRect(sumL - 4, sy - 5, 98, boxH, 2, 2, "FD");

  const row = (
    label: string,
    val: string,
    y: number,
    bold = false,
    c = [70, 70, 70],
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 9.5 : 8.5);
    doc.setTextColor(c[0], c[1], c[2]);
    doc.text(label, sumL, y);
    doc.text(val, sumR, y, { align: "right" });
  };

  row("Subtotal:", `Rs.${subtotal.toFixed(2)}`, sy + 4);
  if (gstPercent > 0) {
    row(`GST (${gstPercent}%):`, `Rs.${gstAmount.toFixed(2)}`, sy + 13);
    doc.setDrawColor(210, 210, 210);
    doc.line(sumL - 2, sy + 17, sumR, sy + 17);
    row("TOTAL:", `Rs.${totalAmount.toFixed(2)}`, sy + 25, true, [15, 15, 15]);
  } else {
    row("GST:", "Rs.0.00", sy + 13, false, [100, 100, 100]);
    doc.setDrawColor(210, 210, 210);
    doc.line(sumL - 2, sy + 17, sumR, sy + 17);
    row("TOTAL:", `Rs.${totalAmount.toFixed(2)}`, sy + 25, true, [15, 15, 15]);
  }

  // Footer
  doc.setFillColor(248, 248, 248);
  doc.rect(0, pageH - 20, pageW, 20, "F");
  doc.setDrawColor(220, 220, 220);
  doc.line(0, pageH - 20, pageW, pageH - 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text("Thank you for your order!", pageW / 2, pageH - 12, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `${seller.name}  ·  ${seller.phone}${seller.address ? "  ·  " + seller.address.slice(0, 40) : ""}`,
    pageW / 2,
    pageH - 6,
    { align: "center" },
  );
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModal({
  bill,
  seller,
  onClose,
  onSaved,
}: {
  bill: any;
  seller: SellerDetails;
  onClose: () => void;
  onSaved?: (updated: any) => void;
}) {
  const [localBill, setLocalBill] = useState<any>({ ...bill });
  const [gstPercent, setGstPercent] = useState<number>(bill._gstPercent ?? 0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPaymentMode, setShowPaymentMode] = useState(false);

  useEffect(() => {
    generatePdf(localBill, gstPercent);
  }, []);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );

  function markDirty() {
    setDirty(true);
    setPdfBlob(null);
    setPdfUrl(null);
  }

  function updateItem(
    id: number,
    field: keyof FlowerItem,
    val: string | number,
  ) {
    setLocalBill((prev: any) => ({
      ...prev,
      items: prev.items.map((item: FlowerItem) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "pricePerKg" || field === "quantity") {
          updated.amount =
            Number(updated.pricePerKg) * Number(updated.quantity);
        }
        return updated;
      }),
    }));
    markDirty();
  }

  function addItem() {
    const newId =
      Math.max(...localBill.items.map((i: FlowerItem) => i.id), 0) + 1;
    setLocalBill((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, name: "", pricePerKg: 0, quantity: 0, amount: 0 },
      ],
    }));
    markDirty();
  }

  function removeItem(id: number) {
    if (localBill.items.length === 1) return;
    setLocalBill((prev: any) => ({
      ...prev,
      items: prev.items.filter((i: FlowerItem) => i.id !== id),
    }));
    markDirty();
  }

  const subtotal = localBill.items.reduce(
    (s: number, i: FlowerItem) => s + Number(i.amount),
    0,
  );
  const gstAmount = parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
  const total = subtotal + gstAmount;

  function handlePaymentToggle() {
    if (!localBill.payment_status) {
      setShowPaymentMode(true);
    } else {
      setLocalBill((p: any) => ({
        ...p,
        payment_status: false,
        payment_mode: null,
      }));
      markDirty();
    }
  }

  function confirmPaymentMode(mode: PaymentMode) {
    setLocalBill((p: any) => ({
      ...p,
      payment_status: true,
      payment_mode: mode,
    }));
    setShowPaymentMode(false);
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const validItems = localBill.items.filter(
        (i: FlowerItem) => i.name && i.quantity > 0,
      );
      const res = await fetch(`/api/bills/${localBill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: localBill.customer_name,
          customer_phone: localBill.customer_phone,
          customer_address: localBill.customer_address || "",
          items: validItems,
          total_amount: total,
          payment_status: localBill.payment_status,
          payment_mode: localBill.payment_mode || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setLocalBill(updated);
      setDirty(false);
      toast.success("Invoice updated!");
      onSaved?.(updated);
      await generatePdf(updated, gstPercent);
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  async function generatePdf(billData: any, gst: number) {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      await import("jspdf-autotable");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      await buildInvoicePDF(doc, billData, seller, gst);
      const blob = doc.output("blob");
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfBlob(blob);
      setPdfUrl(URL.createObjectURL(blob));
    } catch {
      toast.error("PDF generation failed");
    }
    setGenerating(false);
  }

  function handleDownload() {
    if (!pdfBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(pdfBlob);
    a.download = buildInvoiceFilename(localBill);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast.success("Downloaded!");
  }

  async function handleShare() {
    if (!pdfBlob) return;
    const filename = buildInvoiceFilename(localBill);
    const file = new File([pdfBlob], filename, { type: "application/pdf" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Invoice #${localBill.id}`,
          files: [file],
        });
        return;
      } catch {}
    }
    handleDownload();
    const phone = localBill.customer_phone.replace(/\D/g, "");
    setTimeout(
      () =>
        window.open(
          `https://wa.me/${phone}?text=${encodeURIComponent(`Invoice #${localBill.id} from ${seller.name} — Rs.${total.toFixed(2)}`)}`,
          "_blank",
        ),
      800,
    );
  }

  const canAct = !dirty && !!pdfBlob;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full sm:rounded-2xl overflow-hidden"
        style={{
          maxWidth: 720,
          maxHeight: "96vh",
          background: "#0c0618",
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow: "0 30px 80px rgba(80,20,160,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{
            borderBottom: "1px solid rgba(139,92,246,0.2)",
            background: "rgba(139,92,246,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🧾</span>
            <div>
              <p className="text-white font-semibold text-sm">
                Invoice #{localBill.id}
              </p>
              <p className="text-purple-400 text-xs">
                {localBill.customer_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* PDF Preview */}
          <div
            style={{
              height: 320,
              background: "#1a1030",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
            }}
            className="relative"
          >
            {generating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-purple-400 animate-pulse text-sm">
                  Generating preview...
                </div>
              </div>
            )}
            {pdfUrl && !generating && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Invoice Preview"
              />
            )}
            {!pdfUrl && !generating && dirty && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-purple-400 text-sm">
                  Save changes to update preview
                </p>
              </div>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Customer */}
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                Deliver To
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-purple-500 mb-1 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={localBill.customer_name}
                    onChange={(e) => {
                      setLocalBill((p: any) => ({
                        ...p,
                        customer_name: e.target.value,
                      }));
                      markDirty();
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-purple-500 mb-1 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={localBill.customer_phone}
                    onChange={(e) => {
                      setLocalBill((p: any) => ({
                        ...p,
                        customer_phone: e.target.value,
                      }));
                      markDirty();
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-purple-500 mb-1 block">
                    Address
                  </label>
                  <input
                    type="text"
                    value={localBill.customer_address || ""}
                    onChange={(e) => {
                      setLocalBill((p: any) => ({
                        ...p,
                        customer_address: e.target.value,
                      }));
                      markDirty();
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  Products
                </p>
                <button
                  onClick={addItem}
                  className="text-xs text-purple-400 hover:text-purple-200 px-2 py-1 rounded-lg border border-purple-800/40 hover:border-purple-600/60 transition-all"
                >
                  + Add Flower
                </button>
              </div>
              <div className="space-y-2">
                {localBill.items.map((item: FlowerItem) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl"
                    style={{
                      background: "rgba(139,92,246,0.06)",
                      border: "1px solid rgba(139,92,246,0.15)",
                    }}
                  >
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Flower"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Rs/kg"
                        value={item.pricePerKg || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "pricePerKg",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="kg"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full text-sm"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-white text-sm font-semibold">
                        Rs.{Number(item.amount).toFixed(0)}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {localBill.items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400/60 hover:text-red-400 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals with editable GST */}
              <TotalsSection
                subtotal={subtotal}
                gstPercent={gstPercent}
                onGstChange={(val) => {
                  setGstPercent(val);
                  markDirty();
                }}
              />
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                Payment
              </p>
              <div
                className="flex items-center gap-4 p-3 rounded-xl"
                style={{
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.15)",
                }}
              >
                <button
                  onClick={handlePaymentToggle}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${localBill.payment_status ? "bg-green-600" : "bg-gray-600"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${localBill.payment_status ? "translate-x-8" : "translate-x-1"}`}
                  />
                </button>
                <div>
                  <span
                    className={`text-sm font-semibold ${localBill.payment_status ? "text-green-400" : "text-orange-400"}`}
                  >
                    {localBill.payment_status ? "Paid" : "Unpaid"}
                  </span>
                  {localBill.payment_status && localBill.payment_mode && (
                    <span className="text-purple-400 text-xs ml-2">
                      via {localBill.payment_mode.toUpperCase()}
                    </span>
                  )}
                  {localBill.payment_status &&
                    localBill.payment_mode === "upi" && (
                      <span className="text-purple-500 text-xs ml-2">
                        ({UPI_ID})
                      </span>
                    )}
                </div>
              </div>

              {showPaymentMode && (
                <div
                  className="mt-2 p-3 rounded-xl space-y-2"
                  style={{
                    background: "rgba(22,7,46,0.95)",
                    border: "1px solid rgba(139,92,246,0.4)",
                  }}
                >
                  <p className="text-white text-xs font-semibold mb-2">
                    Select payment mode
                  </p>
                  {(["cash", "upi", "card"] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => confirmPaymentMode(mode)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white hover:bg-purple-900/40 transition-colors text-left"
                      style={{ border: "1px solid rgba(139,92,246,0.2)" }}
                    >
                      <span>
                        {mode === "cash" ? "💵" : mode === "upi" ? "📱" : "💳"}
                      </span>
                      <div>
                        <span className="font-medium capitalize">{mode}</span>
                        {mode === "upi" && (
                          <span className="text-purple-400 text-xs ml-2">
                            {UPI_ID}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowPaymentMode(false)}
                    className="text-xs text-purple-500 hover:text-purple-300 w-full text-center pt-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-5 py-4 flex items-center gap-3"
          style={{
            borderTop: "1px solid rgba(139,92,246,0.2)",
            background: "rgba(139,92,246,0.04)",
          }}
        >
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${dirty ? "text-white" : "text-purple-600 cursor-not-allowed"}`}
            style={{
              background: dirty
                ? "linear-gradient(135deg,#7c3aed,#4c1d95)"
                : "rgba(124,58,237,0.1)",
              border: "1px solid rgba(139,92,246,0.3)",
              boxShadow: dirty ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <div className="flex-1" />
          <button
            onClick={handleDownload}
            disabled={!canAct}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${canAct ? "text-white hover:opacity-90" : "text-purple-700 cursor-not-allowed"}`}
            style={{
              background: canAct
                ? "linear-gradient(135deg,#7c3aed,#4c1d95)"
                : "rgba(124,58,237,0.08)",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: canAct ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
          <button
            onClick={handleShare}
            disabled={!canAct}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${canAct ? "text-white hover:opacity-90" : "text-green-900 cursor-not-allowed"}`}
            style={{
              background: canAct
                ? "linear-gradient(135deg,#25D366,#128C7E)"
                : "rgba(37,211,102,0.07)",
              border: "1px solid rgba(37,211,102,0.2)",
              boxShadow: canAct ? "0 4px 16px rgba(37,211,102,0.25)" : "none",
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main BillingClient ───────────────────────────────────────────────────────
export default function BillingClient({ defaultUser }: { defaultUser: any }) {
  const [seller, setSeller] = useState<SellerDetails>({
    name: defaultUser.name || "",
    phone: defaultUser.phone || "",
    address: defaultUser.address || "",
    logo_url: defaultUser.logo_url || "",
  });
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    name: "",
    phone: "",
    address: "",
  });
  const [items, setItems] = useState<FlowerItem[]>([
    { id: 1, name: "", pricePerKg: 0, quantity: 0, amount: 0 },
  ]);
  const [gstPercent, setGstPercent] = useState<number>(0);
  const [generating, setGenerating] = useState(false);
  const [activeBill, setActiveBill] = useState<any | null>(null);
  const nextId = useRef(2);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        if (d.name)
          setSeller({
            name: d.name,
            phone: d.phone,
            address: d.address || "",
            logo_url: d.logo_url || "",
          });
      })
      .catch(() => {});
  }, []);

  function updateItem(
    id: number,
    field: keyof FlowerItem,
    val: string | number,
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "pricePerKg" || field === "quantity") {
          updated.amount =
            Number(updated.pricePerKg) * Number(updated.quantity);
        }
        return updated;
      }),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: nextId.current++, name: "", pricePerKg: 0, quantity: 0, amount: 0 },
    ]);
  }

  function removeItem(id: number) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const gstAmount = parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
  const total = subtotal + gstAmount;

  async function handleGenerate() {
    if (!delivery.name || !delivery.phone) {
      toast.error("Delivery name and phone required");
      return;
    }
    const validItems = items.filter((i) => i.name && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Add at least one flower item");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: delivery.name,
          customer_phone: delivery.phone,
          customer_address: delivery.address,
          items: validItems,
          total_amount: total,
          payment_status: false,
        }),
      });
      const bill = await res.json();
      if (!res.ok) {
        toast.error(bill.error);
        return;
      }
      toast.success("Invoice generated!");
      // Pass gstPercent into the modal via a temporary field
      setActiveBill({ ...bill, _gstPercent: gstPercent });
    } catch {
      toast.error("Failed to generate");
    }
    setGenerating(false);
  }

  function resetForm() {
    setDelivery({ name: "", phone: "", address: "" });
    setItems([{ id: 1, name: "", pricePerKg: 0, quantity: 0, amount: 0 }]);
    setGstPercent(0);
    nextId.current = 2;
  }

  return (
    <>
      {activeBill && (
        <InvoiceModal
          bill={activeBill}
          seller={seller}
          onClose={() => {
            setActiveBill(null);
            resetForm();
          }}
        />
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              New Bill
            </h1>
            <p className="text-purple-400 text-sm mt-1">
              Create flower invoice
            </p>
          </div>
          <button
            onClick={resetForm}
            className="btn-secondary text-sm px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Clear
          </button>
        </div>

        {/* From (Seller) */}
        <div className="card p-4 md:p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
              From (Seller)
            </h2>
            <a
              href="/user-details"
              className="text-xs text-purple-400 hover:text-purple-200 underline"
            >
              Edit
            </a>
          </div>
          <div className="flex items-center gap-3">
            {seller.logo_url ? (
              <img
                src={seller.logo_url}
                alt="logo"
                className="w-12 h-12 rounded-xl object-contain border border-purple-700/40"
                onError={() => setSeller((p) => ({ ...p, logo_url: "" }))}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-lg font-bold text-white">
                {seller.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{seller.name}</p>
              <p className="text-purple-400 text-sm">{seller.phone}</p>
              {seller.address && (
                <p className="text-purple-500 text-xs">{seller.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* To (Delivery) */}
        <div className="card p-4 md:p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
              To (Deliver To)
            </h2>
            <button
              onClick={() => setDelivery({ name: "", phone: "", address: "" })}
              className="text-xs text-purple-400 hover:text-purple-200"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-purple-400 mb-1 block">
                Name *
              </label>
              <input
                type="text"
                placeholder="Customer name"
                value={delivery.name}
                onChange={(e) =>
                  setDelivery((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs text-purple-400 mb-1 block">
                Phone *
              </label>
              <input
                type="tel"
                placeholder="Phone number"
                value={delivery.phone}
                onChange={(e) =>
                  setDelivery((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs text-purple-400 mb-1 block">
                Address
              </label>
              <input
                type="text"
                placeholder="Delivery address"
                value={delivery.address}
                onChange={(e) =>
                  setDelivery((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="card p-4 md:p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
              Flower Items
            </h2>
            <button
              onClick={addItem}
              className="btn-secondary text-xs px-3 py-2 rounded-lg"
            >
              + Add Flower
            </button>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-purple-500 mb-2 px-1">
            <div className="col-span-4">Flower Name</div>
            <div className="col-span-3">Rs. / kg</div>
            <div className="col-span-2">Qty (kg)</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.15)",
                }}
              >
                <div className="flex items-center gap-1 mb-2 md:hidden">
                  <span className="text-purple-400 text-xs">
                    Item #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-red-400 text-xs px-2 py-1 rounded-lg bg-red-900/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-4">
                    <label className="md:hidden text-xs text-purple-400 mb-1 block">
                      Flower Name
                    </label>
                    <input
                      type="text"
                      placeholder="Rose, Jasmine..."
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="md:hidden text-xs text-purple-400 mb-1 block">
                      Price / kg (Rs.)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={item.pricePerKg || ""}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "pricePerKg",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-xs text-purple-400 mb-1 block">
                      Qty (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    <div className="w-full p-2.5 rounded-lg bg-purple-900/30 border border-purple-900/40 text-white text-sm font-semibold">
                      Rs.{item.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="hidden md:flex md:col-span-1 items-center justify-center">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals with editable GST */}
          <TotalsSection
            subtotal={subtotal}
            gstPercent={gstPercent}
            onGstChange={setGstPercent}
          />
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary w-full py-4 text-base font-semibold rounded-xl flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Generate Invoice
            </>
          )}
        </button>
      </div>
    </>
  );
}
