"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UserDetails {
  name: string;
  phone: string;
  address: string;
}

export default function UserDetailsClient() {
  const [form, setForm] = useState<UserDetails>({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        setForm({
          name: d.name || "",
          phone: d.phone || "",
          address: d.address || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        setSaving(false);
        return;
      }
      toast.success("Details updated!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400 animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Shop Details
        </h1>
        <p className="text-purple-400 text-sm mt-1">
          Your details appear as the seller on every invoice
        </p>
      </div>

      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-900/40">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-xl font-bold text-white">
            {form.name ? form.name[0].toUpperCase() : "S"}
          </div>
          <div>
            <p className="text-white font-semibold">
              {form.name || "Your Shop Name"}
            </p>
            <p className="text-purple-400 text-sm">
              {form.phone || "Phone number"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Shop / Owner Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Sowraj Flower Shop"
              required
            />
            <p className="text-purple-500 text-xs mt-1">
              This appears as seller name on all invoices
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Your contact number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Shop Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Your shop full address"
              rows={3}
              style={{ resize: "none" }}
            />
            <p className="text-purple-500 text-xs mt-1">
              Printed on invoices as seller address
            </p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-3">
            {saving ? "Saving..." : saved ? "Saved!" : "Save Details"}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-purple-900/20 border border-purple-900/40">
          <p className="text-xs text-purple-400 font-medium mb-1">Note</p>
          <p className="text-xs text-purple-500">
            Changes here will reflect immediately on all new invoices generated
            from the billing page.
          </p>
        </div>
      </div>
    </div>
  );
}
