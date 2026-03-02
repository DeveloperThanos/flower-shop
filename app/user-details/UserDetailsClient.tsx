"use client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

interface UserDetails {
  name: string;
  phone: string;
  address: string;
  logo_url: string;
}

export default function UserDetailsClient() {
  const [form, setForm] = useState<UserDetails>({
    name: "",
    phone: "",
    address: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoMode, setLogoMode] = useState<"url" | "upload">("url");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        setForm({
          name: d.name || "",
          phone: d.phone || "",
          address: d.address || "",
          logo_url: d.logo_url || "",
        });
        if (d.logo_url) {
          setLogoPreview(d.logo_url);
          setLogoUrlInput(d.logo_url.startsWith("data:") ? "" : d.logo_url);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("Image must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setForm((prev) => ({ ...prev, logo_url: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function handleUrlApply() {
    if (!logoUrlInput.trim()) return;
    setLogoPreview(logoUrlInput.trim());
    setForm((prev) => ({ ...prev, logo_url: logoUrlInput.trim() }));
  }

  function handleRemoveLogo() {
    setLogoPreview("");
    setLogoUrlInput("");
    setForm((prev) => ({ ...prev, logo_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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

  const initials = form.name ? form.name[0].toUpperCase() : "S";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <p className="text-purple-400 text-sm mt-1">
          Manage your profile and invoice details
        </p>
      </div>

      {/* ── PROFILE SECTION ── */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <h2 className="text-white font-semibold text-base">Your Profile</h2>
          <span className="text-xs text-purple-500 ml-1">
            · visible only to you
          </span>
        </div>

        {/* Profile card preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/20 border border-purple-900/40 mb-6">
          {/* Avatar / Logo */}
          <div className="relative flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Shop Logo"
                className="w-14 h-14 rounded-xl object-cover border-2 border-purple-700/60"
                onError={() => setLogoPreview("")}
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-2xl font-bold text-white border-2 border-purple-700/40">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">
              {form.name || "Your Shop Name"}
            </p>
            <p className="text-purple-400 text-sm truncate">
              {form.phone || "Phone number"}
            </p>
            {form.address && (
              <p className="text-purple-500 text-xs truncate">{form.address}</p>
            )}
          </div>
        </div>

        {/* Logo upload section */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Shop Logo
          </label>

          {/* Mode toggle */}
          <div className="flex gap-1 mb-3 bg-purple-900/30 rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setLogoMode("url")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                logoMode === "url"
                  ? "bg-purple-700 text-white"
                  : "text-purple-400 hover:text-purple-200"
              }`}
            >
              Paste URL
            </button>
            <button
              type="button"
              onClick={() => setLogoMode("upload")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                logoMode === "upload"
                  ? "bg-purple-700 text-white"
                  : "text-purple-400 hover:text-purple-200"
              }`}
            >
              Upload File
            </button>
          </div>

          {logoMode === "url" ? (
            <div className="flex gap-2">
              <input
                type="url"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                Apply
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-700/50 rounded-xl p-5 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-900/10 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="text-2xl mb-1">🖼️</div>
              <p className="text-purple-300 text-sm font-medium">
                Click to upload logo
              </p>
              <p className="text-purple-500 text-xs mt-1">
                PNG, JPG, WEBP · max 500KB
              </p>
            </div>
          )}

          {logoPreview && (
            <div className="flex items-center gap-3 mt-3 p-2 rounded-lg bg-purple-900/20 border border-purple-900/40">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-8 h-8 rounded-lg object-cover border border-purple-700/40"
                onError={() => setLogoPreview("")}
              />
              <span className="text-purple-300 text-xs flex-1">
                Logo ready ✓
              </span>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-purple-500 hover:text-red-400 text-xs transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── INVOICE DETAILS SECTION ── */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h2 className="text-white font-semibold text-base">
            Invoice Details
          </h2>
        </div>
        <p className="text-purple-500 text-xs mb-5 pl-4">
          These details appear on every invoice you generate
        </p>

        {/* Invoice preview card */}
        <div className="mb-6 p-4 rounded-xl border border-purple-900/40 bg-purple-950/30">
          <p className="text-purple-500 text-xs mb-3 uppercase tracking-wider font-medium">
            Preview on Invoice
          </p>
          <div className="flex items-start gap-3">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Invoice logo"
                className="w-9 h-9 rounded-lg object-cover border border-purple-800/40 flex-shrink-0"
                onError={() => setLogoPreview("")}
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {initials}
              </div>
            )}
            <div>
              <p className="text-white text-sm font-semibold">
                {form.name || "Shop Name"}
              </p>
              <p className="text-purple-400 text-xs">{form.phone || "—"}</p>
              {form.address && (
                <p className="text-purple-500 text-xs mt-0.5">{form.address}</p>
              )}
            </div>
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
              Appears as seller name on all invoices
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
            {saving ? "Saving..." : saved ? "Saved! ✓" : "Save Details"}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-purple-900/20 border border-purple-900/40">
          <p className="text-xs text-purple-400 font-medium mb-1">Note</p>
          <p className="text-xs text-purple-500">
            Changes here reflect immediately on all new invoices. The logo will
            also appear on every invoice.
          </p>
        </div>
      </div>
    </div>
  );
}
