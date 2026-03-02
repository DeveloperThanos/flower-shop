"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface MonthlyData {
  month: string;
  month_key: string;
  revenue: string;
  count: string;
  paid_count: string;
}

interface Bill {
  id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: string;
  payment_status: boolean;
  created_at: string;
  items: any[];
}

interface DashboardData {
  totalBills: { count: string; total: string };
  todayBills: { count: string; total: string };
  paidBills: { count: string; total: string };
  pendingBills: { count: string; total: string };
  thisMonthBills: { count: string; total: string };
  lastMonthBills: { count: string; total: string };
  monthlyRevenue: MonthlyData[];
  recentBills: Bill[];
  flowerStats: { flower: string; count: string; total_revenue: string }[];
  seller: { name: string; phone: string; address: string };
}

function IGSendIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 9-18 9V3z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <path
        d="M3 12h9"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

function RevenueChart({ data }: { data: MonthlyData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!data.length)
    return (
      <div className="flex items-center justify-center h-20 text-purple-600 text-xs">
        No revenue data yet
      </div>
    );

  const maxRev = Math.max(...data.map((d) => Number(d.revenue)), 1);

  return (
    <div className="flex flex-col" style={{ minHeight: "180px" }}>
      {/* Tooltip */}
      <div className="h-11 flex items-center justify-center mb-3 shrink-0">
        {hovered !== null && data[hovered] ? (
          <div
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-[11px] flex-wrap justify-center"
            style={{
              background: "rgba(18,5,40,0.98)",
              border: "1px solid rgba(139,92,246,0.35)",
            }}
          >
            <span className="text-purple-200 font-bold">
              {data[hovered].month}
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-white font-bold">
              Rs.
              {Number(data[hovered].revenue).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-purple-400">{data[hovered].count} inv</span>
            <span className="text-green-400">
              {data[hovered].paid_count} paid
            </span>
            <span className="text-orange-400">
              {Number(data[hovered].count) - Number(data[hovered].paid_count)}{" "}
              pend
            </span>
          </div>
        ) : (
          <span className="text-purple-700 text-[10px]">
           
          </span>
        )}
      </div>

      {/* Bars — flex-1 so they fill remaining card height */}
      <div
        className="flex items-end justify-center px-2"
        style={{ height: "100px", gap: "6px" }}
      >
        {data.map((d, i) => {
          const h = Math.max(6, (Number(d.revenue) / maxRev) * 115);
          const isHov = hovered === i;
          return (
            <div
              key={d.month_key}
              className="rounded-t cursor-pointer transition-all duration-150"
              style={{
                height: `${h}px`,
                width: "92px",
                minWidth: "40px",
                maxWidth: "96px",
                flexShrink: 0,
                background: isHov
                  ? "linear-gradient(180deg,#ddd6fe,#8b5cf6)"
                  : "linear-gradient(180deg,#7c3aed,#3b0764)",
                opacity: hovered !== null && !isHov ? 0.28 : 0.92,
                boxShadow: isHov ? "0 0 10px rgba(167,139,250,0.65)" : "none",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </div>

      {/* Month labels */}
      <div
        className="flex justify-center px-2 mt-1.5 shrink-0"
        style={{ gap: "6px" }}
      >
        {data.map((d) => (
          <div
            key={d.month_key}
            className="text-center text-purple-700 text-[8px] truncate"
            style={{
              width: "92px",
              minWidth: "40px",
              maxWidth: "96px",
              flexShrink: 0,
            }}
          >
            {d.month.slice(0, 3)}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  subColor,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 md:p-5"
      style={{
        background: "rgba(12,3,25,0.7)",
        border: `1px solid ${accent}28`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-[9px] text-white/25 font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-xl md:text-2xl font-bold text-white leading-tight">
        {value}
      </p>
      <p
        className={`text-xs mt-1.5 font-medium ${subColor || "text-white/30"}`}
      >
        {sub}
      </p>
    </div>
  );
}

function FlowerRow({
  name,
  count,
  revenue,
  pct,
  color,
  bar,
}: {
  name: string;
  count: string;
  revenue: string;
  pct: number;
  color: string;
  bar: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background =
          "rgba(139,92,246,0.08)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.02)")
      }
    >
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white text-sm font-semibold truncate">
            {name}
          </span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-white/40 text-xs">{count} inv</span>
            <span className="text-xs font-bold" style={{ color }}>
              {pct.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: bar }}
          />
        </div>
        <p className="text-white/25 text-[10px] mt-1 text-right">
          Rs.
          {Number(revenue).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
          })}
        </p>
      </div>
    </div>
  );
}

async function shareBillPDF(
  bill: Bill,
  seller: DashboardData["seller"],
  onDone: () => void,
) {
  if (!bill.customer_phone) {
    alert("No phone for this invoice");
    onDone();
    return;
  }
  const { jsPDF } = (await import("jspdf")) as any;
  await import("jspdf-autotable");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(),
    pageH = 297;
  const its: any[] = Array.isArray(bill.items) ? bill.items : [];
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, pageW, 44, "F");
  doc.setFillColor(109, 40, 217);
  doc.rect(0, 0, pageW, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FLOWER SHOP", 15, 18);
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(0.7);
  doc.line(15, 21, 80, 21);
  doc.setLineWidth(0.2);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    "Fresh Flowers  •  Quality Guaranteed  •  Same Day Delivery",
    15,
    28,
  );
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 220, 220);
  doc.text(seller.name, pageW - 15, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(seller.phone, pageW - 15, 20, { align: "right" });
  if (seller.address)
    doc.text(seller.address.substring(0, 45), pageW - 15, 26, {
      align: "right",
    });
  doc.setFillColor(246, 246, 246);
  doc.rect(0, 44, pageW, 15, "F");
  doc.setDrawColor(228, 228, 228);
  doc.line(0, 59, pageW, 59);
  doc.setTextColor(18, 18, 18);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 15, 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`No: #${bill.id}`, 55, 54);
  doc.text(
    `Date: ${new Date(bill.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageW - 15,
    54,
    { align: "right" },
  );
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(15, 65, 88, 28, 2, 2, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(130, 130, 130);
  doc.text("DELIVER TO", 20, 72);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(18, 18, 18);
  doc.text(bill.customer_name, 20, 80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(bill.customer_phone, 20, 87);
  const isPaid = bill.payment_status;
  if (isPaid) {
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(134, 239, 172);
  } else {
    doc.setFillColor(255, 237, 213);
    doc.setDrawColor(253, 186, 116);
  }
  doc.roundedRect(pageW - 58, 65, 43, 28, 2, 2, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(isPaid ? 21 : 120, isPaid ? 100 : 60, isPaid ? 50 : 18);
  doc.text("PAYMENT STATUS", pageW - 36.5, 72, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(isPaid ? 22 : 154, isPaid ? 101 : 52, isPaid ? 52 : 18);
  doc.text(isPaid ? "PAID" : "PENDING", pageW - 36.5, 83, { align: "center" });
  doc.autoTable({
    startY: 100,
    head: [["#", "Item / Flower", "Qty", "Rate / kg", "Amount"]],
    body: its.map((item: any, i: number) => [
      i + 1,
      item.name,
      `${item.quantity} kg`,
      `Rs. ${Number(item.pricePerKg).toFixed(2)}`,
      `Rs. ${Number(item.amount).toFixed(2)}`,
    ]),
    theme: "plain",
    headStyles: {
      fillColor: [18, 18, 18],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
    },
    bodyStyles: {
      textColor: [30, 30, 30],
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      2: { halign: "center", cellWidth: 25 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "right", fontStyle: "bold", cellWidth: 38 },
    },
    tableLineColor: [225, 225, 225],
    tableLineWidth: 0.25,
  });
  const fY = doc.lastAutoTable.finalY + 6,
    bt = Number(bill.total_amount);
  doc.setFillColor(18, 18, 18);
  doc.roundedRect(pageW - 80, fY, 65, 36, 3, 3, "F");
  doc.setFillColor(109, 40, 217);
  doc.roundedRect(pageW - 80, fY, 65, 3, 1, 1, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 170, 170);
  doc.text("Subtotal", pageW - 75, fY + 12);
  doc.text(`Rs. ${bt.toFixed(2)}`, pageW - 18, fY + 12, { align: "right" });
  doc.setDrawColor(55, 55, 55);
  doc.line(pageW - 75, fY + 16, pageW - 18, fY + 16);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", pageW - 75, fY + 27);
  doc.text(`Rs. ${bt.toFixed(2)}`, pageW - 18, fY + 27, { align: "right" });
  const footerY = pageH - 22;
  doc.setFillColor(246, 246, 246);
  doc.rect(0, footerY - 3, pageW, 25, "F");
  doc.setDrawColor(225, 225, 225);
  doc.line(0, footerY - 3, pageW, footerY - 3);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Thank you for your business!", pageW / 2, footerY + 5, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  doc.text(`${seller.name}  |  ${seller.phone}`, pageW / 2, footerY + 12, {
    align: "center",
  });
  const fileName = `${bill.customer_name.replace(/\s+/g, "-").toLowerCase()}-invoice-${bill.id}.pdf`;
  doc.save(fileName);
  const itemLines = its
    .map(
      (i: any) =>
        `  - ${i.name}: ${i.quantity}kg x Rs.${Number(i.pricePerKg).toFixed(2)} = Rs.${Number(i.amount).toFixed(2)}`,
    )
    .join("\n");
  const message = `*FLOWER SHOP - Invoice #${bill.id}*\n\n*From:* ${seller.name}\n*Phone:* ${seller.phone}\n\n*Deliver To:* ${bill.customer_name}\n*Phone:* ${bill.customer_phone}\n\n*Items:*\n${itemLines}\n\n*Total: Rs.${bt.toFixed(2)}*\n*Status:* ${bill.payment_status ? "PAID" : "PAYMENT PENDING"}\n\n_Invoice PDF attached. Thank you!_`;
  const pdfBlob = doc.output("blob");
  const file = new File([pdfBlob], fileName, { type: "application/pdf" });
  const phone = bill.customer_phone.replace(/\D/g, "");
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Flower Shop Invoice",
        text: message,
      });
      onDone();
      return;
    } catch (e: any) {
      if (e.name === "AbortError") {
        onDone();
        return;
      }
    }
  }
  setTimeout(() => {
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    onDone();
  }, 500);
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharingId, setSharingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
        <p className="text-purple-500 text-sm animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );

  const totalRev = Number(data?.totalBills.total || 0);
  const thisMonRev = Number(data?.thisMonthBills?.total || 0);
  const lastMonRev = Number(data?.lastMonthBills?.total || 0);
  const growthPct =
    lastMonRev > 0
      ? (((thisMonRev - lastMonRev) / lastMonRev) * 100).toFixed(1)
      : null;
  const totalCount = Number(data?.totalBills.count || 0);
  const paidCount = Number(data?.paidBills.count || 0);
  const pendCount = totalCount - paidCount;
  const colRate =
    totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
  const todayRev = Number(data?.todayBills.total || 0);
  const todayCount = Number(data?.todayBills.count || 0);

  const flowerPalette = [
    { color: "#a78bfa", bar: "linear-gradient(90deg,#a78bfa,#7c3aed)" },
    { color: "#34d399", bar: "linear-gradient(90deg,#34d399,#059669)" },
    { color: "#38bdf8", bar: "linear-gradient(90deg,#38bdf8,#0284c7)" },
    { color: "#fb923c", bar: "linear-gradient(90deg,#fb923c,#ea580c)" },
    { color: "#f472b6", bar: "linear-gradient(90deg,#f472b6,#db2777)" },
    { color: "#facc15", bar: "linear-gradient(90deg,#facc15,#ca8a04)" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-purple-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/billing"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
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
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Invoice
        </Link>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon="💰"
          label="Total Revenue"
          value={`Rs.${totalRev >= 1000 ? (totalRev / 1000).toFixed(1) + "k" : totalRev.toFixed(0)}`}
          sub={`${totalCount} invoices total`}
          accent="#8b5cf6"
        />
        <StatCard
          icon="📅"
          label="This Month"
          value={`Rs.${thisMonRev >= 1000 ? (thisMonRev / 1000).toFixed(1) + "k" : thisMonRev.toFixed(0)}`}
          sub={
            growthPct
              ? `${Number(growthPct) >= 0 ? "↑" : "↓"} ${Math.abs(Number(growthPct))}% vs last month`
              : `${data?.thisMonthBills?.count || 0} invoices`
          }
          subColor={
            growthPct
              ? Number(growthPct) >= 0
                ? "text-green-400"
                : "text-red-400"
              : undefined
          }
          accent="#7c3aed"
        />
        <StatCard
          icon="✅"
          label="Paid"
          value={`Rs.${Number(data?.paidBills.total || 0) >= 1000 ? (Number(data?.paidBills.total || 0) / 1000).toFixed(1) + "k" : Number(data?.paidBills.total || 0).toFixed(0)}`}
          sub={`${paidCount} invoices · ${colRate}% rate`}
          subColor="text-green-400"
          accent="#22c55e"
        />
        <StatCard
          icon="⏳"
          label="Pending"
          value={`Rs.${Number(data?.pendingBills.total || 0) >= 1000 ? (Number(data?.pendingBills.total || 0) / 1000).toFixed(1) + "k" : Number(data?.pendingBills.total || 0).toFixed(0)}`}
          sub={`${pendCount} invoices unpaid`}
          subColor="text-orange-400"
          accent="#f97316"
        />
      </div>

      {/* Today 3-card row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div
          className="rounded-2xl p-4 md:p-5"
          style={{
            background:
              "linear-gradient(135deg,rgba(109,40,217,0.25),rgba(76,29,149,0.15))",
            border: "1px solid rgba(139,92,246,0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "rgba(139,92,246,0.2)" }}
            >
              🌅
            </div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
              Today's Sales
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">
            Rs.{todayRev.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-purple-400 text-sm mt-1">
            {todayCount} invoice{todayCount !== 1 ? "s" : ""} today
          </p>
        </div>

        <div
          className="rounded-2xl p-4 md:p-5"
          style={{
            background:
              "linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.07))",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              📊
            </div>
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">
              Collection Rate
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl md:text-3xl font-bold text-white">
              {colRate}%
            </p>
            <p className="text-green-400 text-sm mb-1">collected</p>
          </div>
          <div className="mt-2 h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${colRate}%`,
                background: "linear-gradient(90deg,#22c55e,#10b981)",
              }}
            />
          </div>
        </div>

        <div
          className="rounded-2xl p-4 md:p-5"
          style={{
            background:
              "linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.06))",
            border: "1px solid rgba(251,191,36,0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "rgba(251,191,36,0.12)" }}
            >
              💎
            </div>
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">
              Avg Invoice
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">
            Rs.
            {totalCount > 0
              ? (totalRev / totalCount).toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                })
              : "0"}
          </p>
          <p className="text-yellow-500/60 text-sm mt-1">per invoice avg</p>
        </div>
      </div>

      {/* Revenue Chart + Top Flowers — items-start prevents height coupling */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4 items-start">
        {/* Chart card — fixed height so bars are always proportional */}
        <div
          className="lg:col-span-3 rounded-2xl p-5 flex flex-col"
          style={{
            background: "rgba(12,3,25,0.7)",
            border: "1px solid rgba(139,92,246,0.15)",
            height: "340px",
          }}
        >
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-white">
                Monthly Revenue
              </h2>
              <p className="text-purple-600 text-xs mt-0.5">
                Last 12 months — hover bars for details
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-purple-500 uppercase tracking-wider">
                This month
              </p>
              <p className="text-white font-bold">
                Rs.
                {thisMonRev.toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
          {/* Chart fills remaining card height */}
          <div className="flex-1 min-h-0">
            <RevenueChart data={data?.monthlyRevenue || []} />
          </div>
        </div>

        {/* Top Flowers card — fixed height with scroll */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 flex flex-col"
          style={{
            background: "rgba(12,3,25,0.7)",
            border: "1px solid rgba(139,92,246,0.15)",
            height: "340px",
          }}
        >
          <div className="mb-3 shrink-0">
            <h2 className="text-base font-semibold text-white">Top Flowers</h2>
            <p className="text-purple-600 text-xs mt-0.5">
              By invoice frequency
            </p>
          </div>

          {!data?.flowerStats.length ? (
            <div className="flex items-center justify-center flex-1 text-purple-700 text-sm">
              No data yet
            </div>
          ) : (
            (() => {
              const maxC = Math.max(
                ...data.flowerStats.map((f) => Number(f.count)),
              );
              return (
                /* Scrollable flower list */
                <div
                  className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(139,92,246,0.4) transparent",
                  }}
                >
                  {data.flowerStats.map((f, i) => {
                    const pct = Math.min(100, (Number(f.count) / maxC) * 100);
                    const p = flowerPalette[i % flowerPalette.length];
                    return (
                      <FlowerRow
                        key={i}
                        name={f.flower}
                        count={f.count}
                        revenue={f.total_revenue}
                        pct={pct}
                        color={p.color}
                        bar={p.bar}
                      />
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12,3,25,0.7)",
          border: "1px solid rgba(139,92,246,0.15)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/30">
          <div>
            <h2 className="text-base font-semibold text-white">
              Recent Invoices
            </h2>
            <p className="text-purple-600 text-xs mt-0.5">
              Latest 10 transactions
            </p>
          </div>
          <Link
            href="/bills"
            className="text-xs text-purple-500 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            View all
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {!data?.recentBills.length ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🌸</p>
            <p className="text-purple-500 text-sm mb-1">No invoices yet.</p>
            <Link href="/billing" className="text-purple-400 underline text-sm">
              Create your first invoice!
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-2.5 text-[10px] font-bold text-white/20 uppercase tracking-widest border-b border-purple-900/20">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-center">Share</div>
            </div>

            <div>
              {data.recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="px-5 py-3 border-b border-purple-900/10 last:border-0 transition-colors"
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(139,92,246,0.07)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
                >
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-purple-700 text-xs font-mono">
                      #{bill.id}
                    </div>
                    <div className="col-span-3 text-white text-sm font-semibold truncate">
                      {bill.customer_name}
                    </div>
                    <div className="col-span-2 text-white/40 text-sm">
                      {bill.customer_phone}
                    </div>
                    <div className="col-span-2 text-white/30 text-xs">
                      {new Date(bill.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </div>
                    <div className="col-span-2 text-right text-white text-sm font-bold">
                      Rs.
                      {Number(bill.total_amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-bold ${bill.payment_status ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"}`}
                      >
                        {bill.payment_status ? "Paid" : "Pending"}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        disabled={sharingId === bill.id}
                        onClick={() => {
                          if (!data?.seller) return;
                          setSharingId(bill.id);
                          shareBillPDF(bill, data.seller, () =>
                            setSharingId(null),
                          );
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-purple-600/30 disabled:opacity-30 group"
                        style={{
                          background: "rgba(139,92,246,0.12)",
                          border: "1px solid rgba(139,92,246,0.22)",
                        }}
                        title="Share Invoice PDF"
                      >
                        {sharingId === bill.id ? (
                          <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <IGSendIcon className="w-3.5 h-3.5 text-purple-400 group-hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-semibold truncate">
                          {bill.customer_name}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {bill.customer_phone}
                        </p>
                        <p className="text-white/25 text-xs">
                          {new Date(bill.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "2-digit" },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">
                            Rs.
                            {Number(bill.total_amount).toLocaleString("en-IN", {
                              minimumFractionDigits: 0,
                            })}
                          </p>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${bill.payment_status ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"}`}
                          >
                            {bill.payment_status ? "Paid" : "Pending"}
                          </span>
                        </div>
                        <button
                          disabled={sharingId === bill.id}
                          onClick={() => {
                            if (!data?.seller) return;
                            setSharingId(bill.id);
                            shareBillPDF(bill, data.seller, () =>
                              setSharingId(null),
                            );
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 active:scale-95"
                          style={{
                            background: "rgba(139,92,246,0.15)",
                            border: "1px solid rgba(139,92,246,0.3)",
                          }}
                        >
                          {sharingId === bill.id ? (
                            <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <IGSendIcon className="w-4 h-4 text-purple-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
