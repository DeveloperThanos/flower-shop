"use client";
import { useState, useRef } from "react";
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

export default function BillingClient({
  defaultUser,
}: {
  defaultUser: UserDetails;
}) {
  const [customer, setCustomer] = useState<UserDetails>({ ...defaultUser });
  const [items, setItems] = useState<FlowerItem[]>([
    { id: 1, name: "", pricePerKg: 0, quantity: 0, amount: 0 },
  ]);
  const [payment, setPayment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exported, setExported] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const nextId = useRef(2);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  function resetForm() {
    setCustomer({ ...defaultUser });
    setItems([{ id: 1, name: "", pricePerKg: 0, quantity: 0, amount: 0 }]);
    setPayment(false);
    setExported(false);
    setCountdown(0);
    nextId.current = 2;
    if (countdownRef.current) clearInterval(countdownRef.current);
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
      { id: nextId.current++, name: "", pricePerKg: 0, quantity: 0, amount: 0 },
    ]);
  }

  function removeItem(id: number) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  async function saveBill() {
    if (!customer.name || !customer.phone) {
      toast.error("Customer name and phone required");
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
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_address: customer.address,
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
      generatePDF(data);
      startAutoReset();
    } catch {
      toast.error("Failed to save bill");
    }
    setSaving(false);
  }

  function generatePDF(bill?: any) {
    const validItems = items.filter((i) => i.name && i.quantity > 0);
    const billData = bill || {
      id: "PREVIEW",
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      items: validItems,
      total_amount: total,
      payment_status: payment,
      created_at: new Date(),
    };

    import("jspdf").then(({ jsPDF }) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageW, 297, "F");

        doc.setFillColor(20, 20, 20);
        doc.rect(0, 0, pageW, 45, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("FlowerBill", 20, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(200, 200, 200);
        doc.text("INVOICE", pageW - 20, 15, { align: "right" });
        doc.text(`#${billData.id}`, pageW - 20, 22, { align: "right" });
        doc.text(
          `Date: ${new Date(billData.created_at).toLocaleDateString("en-IN")}`,
          pageW - 20,
          29,
          { align: "right" },
        );

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(customer.name, 20, 30);
        doc.text(customer.phone, 20, 36);
        if (customer.address)
          doc.text(customer.address.substring(0, 50), 20, 42);

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 20, 58);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(billData.customer_name || customer.name, 20, 65);
        doc.text(billData.customer_phone || customer.phone, 20, 71);
        if (billData.customer_address || customer.address) {
          doc.text(
            (billData.customer_address || customer.address).substring(0, 60),
            20,
            77,
          );
        }

        const tableItems = validItems.map((item, i) => [
          i + 1,
          item.name,
          `${item.quantity} kg`,
          `Rs.${Number(item.pricePerKg).toFixed(2)}/kg`,
          `Rs.${Number(item.amount).toFixed(2)}`,
        ]);

        (doc as any).autoTable({
          startY: 88,
          head: [["#", "Flower", "Quantity", "Rate", "Amount"]],
          body: tableItems,
          theme: "grid",
          headStyles: {
            fillColor: [20, 20, 20],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 10,
          },
          bodyStyles: { textColor: [40, 40, 40], fontSize: 9 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: { 0: { cellWidth: 12 }, 4: { halign: "right" } },
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setDrawColor(200, 200, 200);
        doc.line(20, finalY, pageW - 20, finalY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text("Total Amount:", pageW - 70, finalY + 10);
        doc.setFontSize(14);
        doc.text(
          `Rs.${Number(billData.total_amount || total).toFixed(2)}`,
          pageW - 20,
          finalY + 10,
          { align: "right" },
        );

        const statusY = finalY + 22;
        doc.setFontSize(11);
        const isPaid =
          billData.payment_status !== undefined
            ? billData.payment_status
            : payment;
        if (isPaid) {
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

        doc.save(`invoice-${billData.id || "new"}.pdf`);
        toast.success("Invoice downloaded!");
      });
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
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
          title="Clear form for new bill"
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

      {exported && (
        <div className="mb-4 p-4 rounded-xl border border-green-600/40 bg-green-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600/30 flex items-center justify-center text-green-400 font-bold text-sm">
              {countdown}
            </div>
            <div>
              <p className="text-green-400 font-semibold text-sm">
                Invoice exported successfully!
              </p>
              <p className="text-green-500/70 text-xs">
                Form will auto-clear in {countdown} seconds for next bill
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4 md:p-5">
          <h2 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wide">
            Seller Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-purple-400 mb-1 block">Name</label>
              <input
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                placeholder="Seller name"
              />
            </div>
            <div>
              <label className="text-xs text-purple-400 mb-1 block">
                Phone
              </label>
              <input
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="text-xs text-purple-400 mb-1 block">
                Address
              </label>
              <textarea
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
                placeholder="Address"
                rows={2}
                style={{ resize: "none" }}
              />
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-5">
          <h2 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wide">
            Bill Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-purple-900/20">
              <span className="text-purple-300 text-sm">Total Items</span>
              <span className="text-white font-bold">
                {items.filter((i) => i.name).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-purple-900/20">
              <span className="text-purple-300 text-sm">Total Amount</span>
              <span className="text-white font-bold text-lg">
                Rs.{total.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-900/20">
              <span className="text-purple-300 text-sm font-medium">
                Payment Status
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
                <span className="text-purple-400 text-xs">Item #{idx + 1}</span>
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
                      x
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

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={saveBill}
          disabled={saving}
          className="btn-primary flex-1 py-3 text-base"
        >
          {saving ? "Saving..." : "Save & Download Invoice"}
        </button>
        <button
          onClick={() => generatePDF()}
          className="btn-secondary flex-1 py-3 text-base rounded-lg"
        >
          Preview PDF
        </button>
      </div>
    </div>
  );
}
