"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Bill {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  payment_status: boolean;
  created_at: string;
}

interface ConfirmPopup {
  bill: Bill;
  newStatus: boolean;
}

export default function BillsClient() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmPopup, setConfirmPopup] = useState<ConfirmPopup | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch("/api/bills")
      .then((r) => r.json())
      .then((d) => {
        setBills(d);
        setLoading(false);
      });
  }, []);

  function handleToggleClick(bill: Bill) {
    setConfirmPopup({ bill, newStatus: !bill.payment_status });
  }

  async function confirmToggle() {
    if (!confirmPopup) return;
    setConfirming(true);
    const res = await fetch(`/api/bills/${confirmPopup.bill.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: confirmPopup.newStatus }),
    });
    if (res.ok) {
      setBills((prev) =>
        prev.map((b) =>
          b.id === confirmPopup.bill.id
            ? { ...b, payment_status: confirmPopup.newStatus }
            : b,
        ),
      );
      toast.success(
        `Payment marked as ${confirmPopup.newStatus ? "Paid" : "Unpaid"}`,
      );
    } else {
      toast.error("Failed to update payment status");
    }
    setConfirming(false);
    setConfirmPopup(null);
  }

  function downloadPDF(bill: Bill) {
    import("jspdf").then(({ jsPDF }) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageW, 297, "F");
        doc.setFillColor(20, 20, 20);
        doc.rect(0, 0, pageW, 45, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("FlowerBill", 20, 20);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(180, 180, 180);
        doc.text("Flower Shop Invoice", 20, 28);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(`Invoice #${bill.id}`, pageW - 20, 18, { align: "right" });
        doc.text(
          `Date: ${new Date(bill.created_at).toLocaleDateString("en-IN")}`,
          pageW - 20,
          25,
          { align: "right" },
        );

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 20, 58);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(bill.customer_name, 20, 65);
        doc.text(bill.customer_phone, 20, 71);
        if (bill.customer_address) {
          const addr = doc.splitTextToSize(bill.customer_address, 80);
          doc.text(addr, 20, 77);
        }

        const tableRows = bill.items.map((item, i) => [
          i + 1,
          item.name,
          `${item.quantity} kg`,
          `Rs.${Number(item.pricePerKg).toFixed(2)}/kg`,
          `Rs.${Number(item.amount).toFixed(2)}`,
        ]);

        (doc as any).autoTable({
          startY: 90,
          head: [["#", "Flower", "Qty", "Rate", "Amount"]],
          body: tableRows,
          theme: "grid",
          headStyles: {
            fillColor: [20, 20, 20],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          bodyStyles: { textColor: [40, 40, 40] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: { 4: { halign: "right" } },
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, finalY, pageW - 20, finalY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text("Total:", pageW - 70, finalY + 10);
        doc.text(
          `Rs.${Number(bill.total_amount).toFixed(2)}`,
          pageW - 20,
          finalY + 10,
          { align: "right" },
        );

        const statusY = finalY + 22;
        if (bill.payment_status) {
          doc.setFillColor(34, 197, 94);
          doc.roundedRect(20, statusY - 5, 40, 10, 2, 2, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("PAID", 40, statusY + 2, { align: "center" });
        } else {
          doc.setFillColor(249, 115, 22);
          doc.roundedRect(20, statusY - 5, 50, 10, 2, 2, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("PENDING", 45, statusY + 2, { align: "center" });
        }

        doc.setFillColor(20, 20, 20);
        doc.rect(0, 275, pageW, 22, "F");
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(
          "Thank you for your business! | FlowerBill Billing System",
          pageW / 2,
          285,
          { align: "center" },
        );

        doc.save(`invoice-${bill.id}.pdf`);
        toast.success("Invoice downloaded!");
      });
    });
  }

  const filtered = bills.filter(
    (b) =>
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_phone.includes(search),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400 animate-pulse">Loading bills...</div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Confirmation Popup */}
      {confirmPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm card p-6 relative"
            style={{
              background: "linear-gradient(135deg, #1a0533, #0a0010)",
              border: "1px solid rgba(139,92,246,0.4)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setConfirmPopup(null)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-purple-900/40"
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

            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmPopup.newStatus ? "bg-green-900/40 border border-green-600/40" : "bg-orange-900/40 border border-orange-600/40"}`}
            >
              {confirmPopup.newStatus ? (
                <svg
                  className="w-7 h-7 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>

            {/* Title */}
            <h3 className="text-white text-lg font-bold text-center mb-1">
              {confirmPopup.newStatus
                ? "Confirm Payment Received"
                : "Mark as Unpaid?"}
            </h3>

            {/* Customer name */}
            <p className="text-purple-300 text-sm text-center mb-4">
              Bill for{" "}
              <span className="text-white font-semibold">
                {confirmPopup.bill.customer_name}
              </span>
              <br />
              <span className="text-purple-400 text-xs">
                Rs.{Number(confirmPopup.bill.total_amount).toFixed(2)}
              </span>
            </p>

            {/* Message */}
            <div
              className={`p-3 rounded-xl mb-5 text-sm text-center ${confirmPopup.newStatus ? "bg-green-900/20 border border-green-800/40 text-green-300" : "bg-orange-900/20 border border-orange-800/40 text-orange-300"}`}
            >
              {confirmPopup.newStatus
                ? "Are you sure the payment has been received for this bill?"
                : "Are you sure you want to mark this bill as unpaid? This will move it back to pending."}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPopup(null)}
                className="flex-1 py-2.5 rounded-xl border border-purple-700/40 text-purple-300 hover:bg-purple-900/30 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                disabled={confirming}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors ${confirmPopup.newStatus ? "bg-green-600 hover:bg-green-500" : "bg-orange-600 hover:bg-orange-500"} disabled:opacity-60`}
              >
                {confirming
                  ? "Updating..."
                  : confirmPopup.newStatus
                    ? "Yes, Payment Done"
                    : "Yes, Mark Unpaid"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            All Bills
          </h1>
          <p className="text-purple-400 text-sm mt-1">
            {bills.length} total bills
          </p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🌸</div>
          <p className="text-purple-300 text-lg">No bills found</p>
          <a
            href="/billing"
            className="mt-4 inline-block btn-primary px-6 py-2 rounded-xl text-sm"
          >
            Create First Bill
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => (
            <div key={bill.id} className="card card-hover p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold">
                      {bill.customer_name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${bill.payment_status ? "bg-green-900/40 text-green-400" : "bg-orange-900/40 text-orange-400"}`}
                    >
                      {bill.payment_status ? "Paid" : "Pending"}
                    </span>
                  </div>
                  <p className="text-purple-400 text-sm">
                    {bill.customer_phone}
                  </p>
                  <p className="text-purple-500 text-xs mt-0.5">
                    {new Date(bill.created_at).toLocaleString("en-IN")} •{" "}
                    {bill.items.length} items
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">
                      Rs.{Number(bill.total_amount).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleClick(bill)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${bill.payment_status ? "bg-green-600" : "bg-gray-600"}`}
                    title="Change payment status"
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${bill.payment_status ? "translate-x-8" : "translate-x-1"}`}
                    />
                  </button>
                  <button
                    onClick={() => downloadPDF(bill)}
                    className="btn-secondary text-xs px-3 py-2 rounded-lg"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {bill.items.slice(0, 4).map((item, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded-full border border-purple-900/50"
                  >
                    {item.name} ({item.quantity}kg)
                  </span>
                ))}
                {bill.items.length > 4 && (
                  <span className="text-xs text-purple-500">
                    +{bill.items.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
