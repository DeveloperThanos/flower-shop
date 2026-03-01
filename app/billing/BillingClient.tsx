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

interface UserDetails {
  name: string;
  phone: string;
  address: string;
}

interface DeliveryDetails {
  name: string;
  phone: string;
}

// ─── PDF Preview Modal ────────────────────────────────────────────────────────
function PDFPreviewModal({
  pdfUrl,
  onClose,
  onDownload,
  onWhatsApp,
}: {
  pdfUrl: string;
  onClose: () => void;
  onDownload: () => void;
  onWhatsApp: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: "min(96vw, 680px)",
          height: "min(92vh, 880px)",
          background: "#0d0b1a",
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow: "0 30px 90px rgba(80,20,160,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            background: "linear-gradient(135deg, #16072e 0%, #200f50 100%)",
            borderBottom: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              <svg
                className="w-4 h-4 text-purple-400"
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
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                Invoice Preview
              </p>
              <p className="text-purple-400/70 text-xs">
                Review • Download • Share
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* iframe viewer */}
        <div
          className="flex-1 overflow-hidden"
          style={{ background: "#e5e5e5" }}
        >
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Invoice Preview"
          />
        </div>

        {/* Footer actions */}
        <div
          className="shrink-0 px-6 py-4"
          style={{
            background: "linear-gradient(135deg, #16072e 0%, #200f50 100%)",
            borderTop: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Close
            </button>
            <div className="flex-1" />
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
                boxShadow: "0 4px 18px rgba(124,58,237,0.4)",
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
              Download PDF
            </button>
            <button
              onClick={onWhatsApp}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow: "0 4px 18px rgba(37,211,102,0.3)",
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BillingClient({
  defaultUser,
}: {
  defaultUser: UserDetails;
}) {
  const [seller, setSeller] = useState<UserDetails>({ ...defaultUser });
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    name: "",
    phone: "",
  });
  const [items, setItems] = useState<FlowerItem[]>([
    { id: 1, name: "", pricePerKg: 0, quantity: 0, amount: 0 },
  ]);
  const [payment, setPayment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exported, setExported] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewPdfBlob, setPreviewPdfBlob] = useState<Blob | null>(null);

  const nextId = useRef(2);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        if (d.name)
          setSeller({ name: d.name, phone: d.phone, address: d.address || "" });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewPdfBlob(null);
  }

  function resetDelivery() {
    setDelivery({ name: "", phone: "" });
  }

  function resetForm() {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        if (d.name)
          setSeller({ name: d.name, phone: d.phone, address: d.address || "" });
      })
      .catch(() => {});
    resetDelivery();
    setItems([{ id: 1, name: "", pricePerKg: 0, quantity: 0, amount: 0 }]);
    setPayment(false);
    setExported(false);
    setCountdown(0);
    nextId.current = 2;
    if (countdownRef.current) clearInterval(countdownRef.current);
    closePreview();
  }

  function startAutoReset() {
    setExported(true);
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          resetForm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function updateItem(
    id: number,
    field: keyof FlowerItem,
    value: string | number,
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
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
      {
        id: nextId.current++,
        name: "",
        pricePerKg: 0,
        quantity: 0,
        amount: 0,
      },
    ]);
  }

  function removeItem(id: number) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  // ─── Build PDF — Amazon-standard invoice layout ────────────────────────────
  function buildPDF(
    bill: any,
    doc: any,
    currentItems: FlowerItem[],
    currentSeller: UserDetails,
    currentDelivery: DeliveryDetails,
    currentTotal: number,
    currentPayment: boolean,
  ) {
    const validItems = currentItems.filter((i) => i.name && i.quantity > 0);
    const pageW = doc.internal.pageSize.getWidth(); // 210mm
    const pageH = 297;
    const marginL = 14;
    const marginR = 14;
    const contentW = pageW - marginL - marginR;

    // ── Pure white background ──────────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageW, pageH, "F");

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 1 — HEADER  (y: 0–42)
    // Left: shop name + tagline | Right: "TAX INVOICE" label + invoice meta
    // ═══════════════════════════════════════════════════════════════════════════

    // Very light grey top band
    doc.setFillColor(248, 248, 248);
    doc.rect(0, 0, pageW, 42, "F");

    // Bottom border of header band
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(0, 42, pageW, 42);

    // Shop name — large, bold, dark
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 15, 15);
    doc.text("FLOWER SHOP", marginL, 16);

    // Tagline below shop name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text(
      "Fresh Flowers  |  Quality Guaranteed  |  Same Day Delivery",
      marginL,
      23,
    );

    // Seller contact below tagline
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    doc.text(currentSeller.phone, marginL, 30);
    if (currentSeller.address) {
      doc.text(currentSeller.address.substring(0, 55), marginL, 37);
    }

    // Right side — "TAX INVOICE" in large muted text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(200, 200, 200);
    doc.text("TAX INVOICE", pageW - marginR, 16, { align: "right" });

    // Invoice number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(`Invoice No: #${bill.id}`, pageW - marginR, 25, {
      align: "right",
    });

    // Invoice date
    const dateStr = new Date(bill.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Date: ${dateStr}`, pageW - marginR, 33, { align: "right" });

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 2 — SOLD BY / SHIP TO / PAYMENT  (y: 48–90)
    // Three columns: Sold By | Ship To | Payment
    // ═══════════════════════════════════════════════════════════════════════════

    const sec2Y = 48;
    const colW = contentW / 3;

    // Column headers
    const colLabels = ["SOLD BY", "SHIP TO", "PAYMENT"];
    colLabels.forEach((label, i) => {
      const x = marginL + i * colW;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(130, 130, 130);
      doc.text(label, x, sec2Y + 5);

      // Small underline beneath label
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(x, sec2Y + 7, x + colW - 4, sec2Y + 7);
    });

    // Col 0: Sold By (seller)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 15);
    doc.text(currentSeller.name, marginL, sec2Y + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(currentSeller.phone, marginL, sec2Y + 22);
    if (currentSeller.address) {
      const lines = doc.splitTextToSize(
        currentSeller.address,
        colW - 6,
      ) as string[];
      lines.slice(0, 3).forEach((line: string, li: number) => {
        doc.text(line, marginL, sec2Y + 29 + li * 6);
      });
    }

    // Col 1: Ship To (customer)
    const col1X = marginL + colW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 15);
    doc.text(bill.customer_name || currentDelivery.name, col1X, sec2Y + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(bill.customer_phone || currentDelivery.phone, col1X, sec2Y + 22);

    // Col 2: Payment Status
    const col2X = marginL + colW * 2;
    const isPaid =
      bill.payment_status !== undefined ? bill.payment_status : currentPayment;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 15);
    doc.text("Status", col2X, sec2Y + 15);

    // Status badge pill
    const badgeW = 28;
    const badgeH = 8;
    const badgeX = col2X;
    const badgeY = sec2Y + 19;
    if (isPaid) {
      doc.setFillColor(220, 252, 231); // green-100
      doc.setDrawColor(134, 239, 172); // green-300
    } else {
      doc.setFillColor(255, 237, 213); // orange-100
      doc.setDrawColor(253, 186, 116); // orange-300
    }
    doc.setLineWidth(0.4);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(isPaid ? 22 : 154, isPaid ? 101 : 52, isPaid ? 52 : 18);
    doc.text(isPaid ? "PAID" : "PENDING", badgeX + badgeW / 2, badgeY + 5.5, {
      align: "center",
    });

    // Payment method note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text("Cash on Delivery", col2X, sec2Y + 34);

    // ── Horizontal rule between sections ─────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(marginL, sec2Y + 42, pageW - marginR, sec2Y + 42);

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 3 — ITEMS TABLE  (starts y: ~96)
    // ═══════════════════════════════════════════════════════════════════════════

    const tableStartY = sec2Y + 46;

    (doc as any).autoTable({
      startY: tableStartY,
      head: [["#", "Description", "Unit Price", "Qty", "Total"]],
      body: validItems.map((item, i) => [
        i + 1,
        item.name,
        `Rs.${Number(item.pricePerKg).toFixed(2)}/kg`,
        `${item.quantity} kg`,
        `Rs.${Number(item.amount).toFixed(2)}`,
      ]),
      theme: "plain",
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [60, 60, 60],
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        lineColor: [220, 220, 220],
        lineWidth: { bottom: 0.5 },
      },
      bodyStyles: {
        textColor: [35, 35, 35],
        fontSize: 8.5,
        cellPadding: { top: 4.5, bottom: 4.5, left: 5, right: 5 },
        lineColor: [235, 235, 235],
        lineWidth: { bottom: 0.3 },
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center", textColor: [140, 140, 140] },
        1: { cellWidth: "auto", fontStyle: "normal" },
        2: { cellWidth: 34, halign: "right" },
        3: { cellWidth: 22, halign: "center" },
        4: {
          cellWidth: 34,
          halign: "right",
          fontStyle: "bold",
          textColor: [15, 15, 15],
        },
      },
      tableLineColor: [230, 230, 230],
      tableLineWidth: 0.3,
      margin: { left: marginL, right: marginR },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 4 — ORDER SUMMARY  (right-aligned like Amazon)
    // ═══════════════════════════════════════════════════════════════════════════

    const sumStartY = finalY + 6;
    const sumInnerPadR = 8; // right inner padding inside box
    const sumColLeft = pageW - marginR - 106; // label col starts here (box wider now)
    const sumColRight = pageW - marginR - sumInnerPadR; // value text keeps 8mm from right edge

    // Helper to draw a summary row
    function summaryRow(
      label: string,
      value: string,
      y: number,
      bold = false,
      textColorRGB = [60, 60, 60],
    ) {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 9.5 : 8.5);
      doc.setTextColor(textColorRGB[0], textColorRGB[1], textColorRGB[2]);
      doc.text(label, sumColLeft, y);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(value, sumColRight, y, { align: "right" });
    }

    // Subtle background for summary block
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(sumColLeft - 6, sumStartY - 4, 114, 38, 2, 2, "FD");

    let sy = sumStartY + 4;
    summaryRow("Item(s) Subtotal:", `Rs.${currentTotal.toFixed(2)}`, sy);
    sy += 7;
    summaryRow("Delivery:", "FREE", sy, false, [22, 163, 74]);
    sy += 7;

    // Divider above total
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.4);
    doc.line(sumColLeft - 3, sy - 1, sumColRight, sy - 1);

    sy += 5;
    summaryRow(
      "Order Total:",
      `Rs.${Number(bill.total_amount || currentTotal).toFixed(2)}`,
      sy,
      true,
      [15, 15, 15],
    );

    // ── Item count (left side, same row as subtotal) ──────────────────────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `${validItems.length} item${validItems.length !== 1 ? "s" : ""} ordered`,
      marginL,
      sumStartY + 4,
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 5 — FOOTER
    // ═══════════════════════════════════════════════════════════════════════════

    // Light grey footer band at bottom
    const footerBandY = pageH - 22;
    doc.setFillColor(248, 248, 248);
    doc.rect(0, footerBandY, pageW, 22, "F");

    // Top border of footer band
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(0, footerBandY, pageW, footerBandY);

    // Thank you message — centred
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    doc.text("Thank you for your order!", pageW / 2, footerBandY + 8, {
      align: "center",
    });

    // Contact line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text(
      `${currentSeller.name}  |  ${currentSeller.phone}${currentSeller.address ? "  |  " + currentSeller.address.substring(0, 40) : ""}`,
      pageW / 2,
      footerBandY + 16,
      { align: "center" },
    );
  }

  // ─── Build PDF Blob ────────────────────────────────────────────────────────
  function buildPDFBlob(bill: any): Promise<{ blob: Blob; fileName: string }> {
    return new Promise((resolve, reject) => {
      const fileName = delivery.name
        ? `${delivery.name.replace(/\s+/g, "-").toLowerCase()}-invoice.pdf`
        : `invoice-${bill.id}.pdf`;

      import("jspdf")
        .then(({ jsPDF }) => {
          import("jspdf-autotable")
            .then(() => {
              const doc = new jsPDF({ unit: "mm", format: "a4" });
              buildPDF(bill, doc, items, seller, delivery, total, payment);
              resolve({ blob: doc.output("blob"), fileName });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  // ─── Share PDF via Web Share API ──────────────────────────────────────────
  async function sharePDFViaWhatsApp(
    blob: Blob,
    fileName: string,
    billId: string | number,
  ) {
    const pdfFile = new File([blob], fileName, { type: "application/pdf" });

    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      try {
        await navigator.share({
          title: `Invoice - ${delivery.name}`,
          text: `Invoice #${billId} from ${seller.name}`,
          files: [pdfFile],
        });
        toast.success("PDF shared!");
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // Desktop fallback — download + open WhatsApp
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);

    const validItems = items.filter((i) => i.name && i.quantity > 0);
    const itemLines = validItems
      .map(
        (i) =>
          `  • ${i.name}: ${i.quantity}kg x Rs.${Number(i.pricePerKg).toFixed(2)} = *Rs.${Number(i.amount).toFixed(2)}*`,
      )
      .join("\n");
    const message =
      `*FLOWER SHOP - Invoice #${billId}*\n\n` +
      `*From:* ${seller.name}  |  ${seller.phone}\n` +
      `\n*Bill To:* ${delivery.name}  |  ${delivery.phone}\n` +
      `\n*Order:*\n${itemLines}\n\n` +
      `━━━━━━━━━━━━━\n` +
      `*Total: Rs.${total.toFixed(2)}*\n` +
      `*Status:* ${payment ? "PAID" : "PAYMENT PENDING"}\n\n` +
      `_PDF invoice downloaded — please attach it to this chat._`;

    const phone = delivery.phone.replace(/\D/g, "");
    setTimeout(() => {
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    }, 700);
    toast.success("PDF saved — attach it in WhatsApp chat!");
  }

  // ─── Open Preview ──────────────────────────────────────────────────────────
  async function openPreview(bill?: any) {
    const billData = bill || {
      id: "PREVIEW",
      customer_name: delivery.name,
      customer_phone: delivery.phone,
      total_amount: total,
      payment_status: payment,
      created_at: new Date(),
    };
    try {
      const { blob, fileName } = await buildPDFBlob(billData);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setPreviewPdfBlob(blob);
      setPreviewFileName(fileName);
    } catch {
      toast.error("Failed to generate preview");
    }
  }

  // ─── Download from Preview ─────────────────────────────────────────────────
  function handleDownload() {
    if (!previewPdfBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(previewPdfBlob);
    a.download = previewFileName;
    a.click();
    toast.success("Invoice downloaded!");
  }

  // ─── WhatsApp from Preview ─────────────────────────────────────────────────
  async function handleWhatsAppShare() {
    if (!delivery.phone) {
      toast.error("Enter delivery person phone first");
      return;
    }
    if (!previewPdfBlob) return;
    await sharePDFViaWhatsApp(previewPdfBlob, previewFileName, "PREVIEW");
  }

  // ─── Save + Download + Share ───────────────────────────────────────────────
  async function saveAndShare() {
    if (!delivery.name || !delivery.phone) {
      toast.error("Delivery person name and phone required");
      return;
    }
    const validItems = items.filter((i) => i.name && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Add at least one flower item");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: delivery.name,
          customer_phone: delivery.phone,
          customer_address: "",
          items: validItems.map((i) => ({
            name: i.name,
            pricePerKg: i.pricePerKg,
            quantity: i.quantity,
            amount: i.amount,
          })),
          total_amount: total,
          payment_status: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        setSaving(false);
        return;
      }
      toast.success("Bill saved!");
      const { blob, fileName } = await buildPDFBlob(data);
      await sharePDFViaWhatsApp(blob, fileName, data.id);
      startAutoReset();
    } catch {
      toast.error("Failed to save bill");
    }
    setSaving(false);
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {previewUrl && (
        <PDFPreviewModal
          pdfUrl={previewUrl}
          onClose={closePreview}
          onDownload={handleDownload}
          onWhatsApp={handleWhatsAppShare}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              New Bill
            </h1>
            <p className="text-purple-400 text-sm mt-1">
              Create and export flower invoice
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
            New Bill
          </button>
        </div>

        {/* Auto-reset banner */}
        {exported && (
          <div className="mb-4 p-4 rounded-xl border border-green-600/40 bg-green-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600/30 flex items-center justify-center text-green-400 font-bold text-sm">
                {countdown}
              </div>
              <div>
                <p className="text-green-400 font-semibold text-sm">
                  Bill saved, downloaded & shared!
                </p>
                <p className="text-green-500/70 text-xs">
                  Auto-clearing in {countdown}s for next bill
                </p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
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
              New Bill Now
            </button>
          </div>
        )}

        {/* Seller + Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                Seller (From)
              </h2>
              <a
                href="/user-details"
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Edit
              </a>
            </div>
            <div className="space-y-2">
              {(["Name", "Phone", "Address"] as const).map((label) => (
                <div key={label} className="p-3 rounded-xl bg-purple-900/20">
                  <p className="text-xs text-purple-400 mb-0.5">{label}</p>
                  <p className="text-white font-medium text-sm">
                    {label === "Name"
                      ? seller.name
                      : label === "Phone"
                        ? seller.phone
                        : seller.address || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                Deliver To
              </h2>
              <button
                onClick={resetDelivery}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Clear
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-purple-400 mb-1 block">
                  Delivery Person Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={delivery.name}
                  onChange={(e) =>
                    setDelivery({ ...delivery, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-purple-400 mb-1 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={delivery.phone}
                  onChange={(e) =>
                    setDelivery({ ...delivery, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center p-3 rounded-xl bg-purple-900/20">
                <span className="text-purple-300 text-sm">Total Amount</span>
                <span className="text-white font-bold text-lg">
                  Rs.{total.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-900/20">
                <span className="text-purple-300 text-sm font-medium">
                  Payment
                </span>
                <button
                  onClick={() => setPayment(!payment)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${payment ? "bg-green-600" : "bg-gray-600"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${payment ? "translate-x-8" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <div className="text-center">
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${payment ? "bg-green-900/40 text-green-400" : "bg-orange-900/40 text-orange-400"}`}
                >
                  {payment ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Flower Items */}
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
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-purple-400 mb-2 px-1">
            <div className="col-span-4">Flower Name</div>
            <div className="col-span-3">Price/Kg (Rs.)</div>
            <div className="col-span-2">Qty (kg)</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-1"></div>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-purple-900/40 bg-purple-900/10"
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
                      placeholder="Rose, Jasmine, Lotus..."
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="md:hidden text-xs text-purple-400 mb-1 block">
                      Price per Kg (Rs.)
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
                      Quantity (kg)
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
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-700/40 flex justify-between items-center">
            <span className="text-purple-300 font-medium">Total</span>
            <span className="text-white font-bold text-xl">
              Rs.{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── 2 Buttons ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={saveAndShare}
            disabled={saving}
            className="btn-primary py-4 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl"
          >
            {saving ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                Processing...
              </>
            ) : (
              <>
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save, Download &amp; Share
              </>
            )}
          </button>

          <button
            onClick={() => openPreview()}
            className="btn-secondary py-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview Invoice
          </button>
        </div>

        <p className="text-center text-xs text-purple-500/40 mt-3">
          On mobile — PDF shared directly to WhatsApp &nbsp;·&nbsp; On desktop —
          PDF downloaded, then WhatsApp opens
        </p>
      </div>
    </>
  );
}
