import { useState, useContext, useEffect } from "react";
import SuperAdminContext from '../../context/SuperAdminContext';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../config/axios";
import SuperAdminLayout from "./SuperAdminLayout";


const DARK = "#111827";
const MID = "#6B7280";
const BORDER = "#E5E7EB";
const GRAD = "linear-gradient(135deg,#E91E8C,#FF6B35)";
const CARD = {
  background: "#fff",
  borderRadius: 12,
  border: `1px solid ${BORDER}`,
  padding: "1.25rem",
  marginBottom: "1rem",
};
const INP = {
  padding: "0.4rem 0.75rem",
  border: `1.5px solid ${BORDER}`,
  borderRadius: 8,
  fontSize: "0.8125rem",
  width: 80,
};

// ── Status badge — matches Dashboard's statusBadge() classes ─────────────────
const STATUS_MAP = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  trialing: "bg-amber-50 text-amber-700 border-amber-200",
  trial: "bg-amber-50 text-amber-700 border-amber-200",
  past_due: "bg-orange-50 text-orange-700 border-orange-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_MAP[status] || STATUS_MAP.inactive}`}
  >
    {status}
  </span>
);

// ── Small icon-in-box, same treatment as Dashboard's StatCard icons ──────────
const IconBox = ({ children, bg }) => (
  <div
    style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: bg,
    }}
  >
    {children}
  </div>
);

const Btn = ({ label, color = GRAD, onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      padding: "0.45rem 1rem",
      borderRadius: 8,
      border: "none",
      background: loading ? "#E5E7EB" : color,
      color: loading ? "#9CA3AF" : "#fff",
      fontWeight: 600,
      fontSize: "0.8125rem",
      cursor: loading ? "not-allowed" : "pointer",
      whiteSpace: "nowrap",
      transition: "opacity 150ms",
    }}
  >
    {loading ? "…" : label}
  </button>
);

// ── Gateway Toggle Panel ──────────────────────────────────────────────────────
export const GatewayTogglePanel = () => {
  const {token} = useContext(SuperAdminContext);
  const headers = {Authorization: `Bearer ${token}`};
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["gatewaySettings"],
    queryFn: () =>
      axios.get("/api/super-admin/billing/gateway", {headers}).then((r) => r.data.data),
  });

  const setGateway = useMutation({
    mutationFn: (gw) =>
      axios.post("/api/super-admin/billing/gateway", { gateway: gw }, { headers }),
    onSuccess: (_, gw) => {
      queryClient.invalidateQueries(["gatewaySettings"]);
      setMsg(`Active gateway: ${gw}`);
      setTimeout(() => setMsg(""), 3000);
    },
    onError: (e) => setMsg(e.response?.data?.message || e.message),
  });

  const GWS = [
    {
      id: "manual",
      label: "Manual / Disabled",
      color: "#6B7280",
      bg: "rgba(107,114,128,0.1)",
      desc: "No gateway active. Accounts activated manually by super admin.",
      icon: (
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="#6B7280"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2" />
        </svg>
      ),
    },
    {
      id: "safepay",
      label: "SafePay (PKR)",
      color: "#0EA5E9",
      bg: "rgba(14,165,233,0.1)",
      desc: "Hosted checkout redirect. One-time PKR payments only. No auto-renewal.",
      warn: "One-time payments only. Auto-renewal not supported.",
      icon: (
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="#0EA5E9"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 14l2 2 4-4m-1.5-7.5L21 7v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V7l7.5-2.5z" />
        </svg>
      ),
    },
    {
      id: "stripe",
      label: "Stripe (USD/PKR)",
      color: "#635BFF",
      bg: "rgba(99,91,255,0.1)",
      desc: "Full auto-billing with off-session charges. Requires live Stripe account.",
      warn: "Requires live Stripe credentials before enabling.",
      icon: (
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="#635BFF"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  const active = data?.activeGateway || "manual";

  return (
    <div style={{ ...CARD, marginBottom: "1.5rem" }}>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: DARK,
          margin: "0 0 0.25rem",
        }}
      >
        Payment Gateway
      </h3>
      <p style={{ color: MID, fontSize: 12, margin: "0 0 1.25rem" }}>
        Controls how subscription payments are processed platform-wide.
      </p>

      {msg && (
        <div
          style={{
            padding: "0.5rem 0.875rem",
            borderRadius: 8,
            marginBottom: "1rem",
            fontSize: 12,
            background: "rgba(233,30,140,0.06)",
            color: "#E91E8C",
            border: "1px solid rgba(233,30,140,0.2)",
          }}
        >
          {msg}
        </div>
      )}

      {isLoading ? (
        <p style={{ color: MID, fontSize: 13 }}>Loading…</p>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
        >
          {GWS.map((gw) => {
            const on = active === gw.id;
            return (
              <div
                key={gw.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  padding: "0.875rem 1rem",
                  borderRadius: 10,
                  border: on
                    ? "1px solid rgba(233,30,140,0.3)"
                    : `1px solid ${BORDER}`,
                  background: on
                    ? "linear-gradient(135deg, rgba(233,30,140,0.06), rgba(255,107,53,0.04))"
                    : "#fff",
                  transition: "all 150ms ease",
                }}
              >
                <div
                  style={{ display: "flex", gap: 12, flex: 1, minWidth: 220 }}
                >
                  <IconBox bg={gw.bg}>{gw.icon}</IconBox>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{ fontWeight: 600, color: DARK, fontSize: 13.5 }}
                      >
                        {gw.label}
                      </span>
                      {on && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "1px 8px",
                            borderRadius: 6,
                            background: GRAD,
                            color: "#fff",
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p style={{ color: MID, fontSize: 12, margin: "0 0 2px" }}>
                      {gw.desc}
                    </p>
                    {gw.warn && (
                      <p
                        style={{
                          color: "#FF6B35",
                          fontSize: 11.5,
                          margin: 0,
                          fontWeight: 500,
                        }}
                      >
                        {gw.warn}
                      </p>
                    )}
                  </div>
                </div>
                {!on && (
                  <button
                    onClick={() => setGateway.mutate(gw.id)}
                    disabled={setGateway.isPending}
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: 8,
                      border: "none",
                      background: setGateway.isPending ? "#E5E7EB" : GRAD,
                      color: setGateway.isPending ? "#9CA3AF" : "#fff",
                      fontWeight: 600,
                      fontSize: 12.5,
                      cursor: setGateway.isPending ? "not-allowed" : "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {setGateway.isPending ? "…" : "Enable"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Manual Payment CRUD ──────────────────────────────────────────────────────
const ManualPaymentMethodsCRUD = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    methodName: "",
    accountTitle: "",
    accountNumberOrIban: "",
    instructions: "",
    isActive: true,
  });
  const { token } = useContext(SuperAdminContext);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/payment-methods", {headers});
      setMethods(res.data?.data || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const resetForm = () => {
    setForm({
      methodName: "",
      accountTitle: "",
      accountNumberOrIban: "",
      instructions: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`/api/payment-methods/${editingId}`, form, { headers });
        setMsg("Payment method updated");
      } else {
        await axios.post("/api/payment-methods", form, { headers });
        setMsg("Payment method created");
      }
      resetForm();
      fetchMethods();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    setForm({
      methodName: m.methodName,
      accountTitle: m.accountTitle,
      accountNumberOrIban: m.accountNumberOrIban,
      instructions: m.instructions,
      isActive: m.isActive,
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this payment method?")) return;
    try {
      await axios.delete(`/api/payment-methods/${id}`, { headers });
      setMsg("Deleted");
      fetchMethods();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (m) => {
    try {
      await axios.put(
        `/api/payment-methods/${m.id}`,
        { isActive: !m.isActive },
        { headers },
      );
      fetchMethods();
    } catch (e) {
      setMsg("Failed to update");
    }
  };

  const INP_STYLE = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{ ...CARD, marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: DARK, margin: 0 }}>
            Manual Payment Methods
          </h3>
          <p style={{ color: MID, fontSize: 12, margin: "2px 0 0" }}>
            Add JazzCash, EasyPaisa, bank transfer details shown to tenants on
            checkout.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: "0.45rem 1rem",
            borderRadius: 8,
            border: "none",
            background: GRAD,
            color: "#fff",
            fontWeight: 600,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          + Add Method
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: "0.5rem 0.875rem",
            borderRadius: 8,
            marginBottom: "1rem",
            fontSize: 12,
            background: "rgba(233,30,140,0.06)",
            color: "#E91E8C",
            border: "1px solid rgba(233,30,140,0.2)",
          }}
        >
          {msg}
        </div>
      )}

      {showForm && (
        <div
          style={{
            background: "#FAFAFA",
            borderRadius: 10,
            padding: "1rem",
            marginBottom: "1rem",
            border: `1px solid ${BORDER}`,
          }}
        >
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: DARK,
              margin: "0 0 0.75rem",
            }}
          >
            {editingId ? "Edit" : "Add"} Payment Method
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: DARK,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Method Name (e.g. JazzCash, EasyPaisa)
              </label>
              <input
                style={INP_STYLE}
                value={form.methodName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, methodName: e.target.value }))
                }
                placeholder="JazzCash"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: DARK,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Account Title
              </label>
              <input
                style={INP_STYLE}
                value={form.accountTitle}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accountTitle: e.target.value }))
                }
                placeholder="Muhammad Ali"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: DARK,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Account Number / IBAN
              </label>
              <input
                style={INP_STYLE}
                value={form.accountNumberOrIban}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    accountNumberOrIban: e.target.value,
                  }))
                }
                placeholder="03001234567 or PK36SCBL..."
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: DARK,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Instructions
              </label>
              <textarea
                style={{ ...INP_STYLE, minHeight: 80, resize: "vertical" }}
                value={form.instructions}
                onChange={(e) =>
                  setForm((p) => ({ ...p, instructions: e.target.value }))
                }
                placeholder="Send payment to this number and upload receipt..."
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                id="isActive"
              />
              <label
                htmlFor="isActive"
                style={{ fontSize: 12, fontWeight: 600, color: DARK }}
              >
                Active (visible to tenants)
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  background: GRAD,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {loading ? "…" : editingId ? "Update" : "Create"}
              </button>
              <button
                onClick={resetForm}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  background: "#fff",
                  color: MID,
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !showForm ? (
        <p style={{ color: MID, fontSize: 13 }}>Loading…</p>
      ) : methods.length === 0 ? (
        <p style={{ color: MID, fontSize: 13 }}>
          No payment methods added yet. Click "+ Add Method" to add JazzCash,
          EasyPaisa, or bank details.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {methods.map((m) => (
            <div
              key={m.id}
              style={{
                padding: "0.875rem 1rem",
                borderRadius: 10,
                border: `1px solid ${m.isActive ? "rgba(16,185,129,0.3)" : BORDER}`,
                background: m.isActive ? "rgba(16,185,129,0.03)" : "#FAFAFA",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontWeight: 700, color: DARK, fontSize: 13.5 }}
                  >
                    {m.methodName}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "1px 8px",
                      borderRadius: 6,
                      background: m.isActive
                        ? "rgba(16,185,129,0.1)"
                        : "rgba(107,114,128,0.1)",
                      color: m.isActive ? "#10B981" : MID,
                    }}
                  >
                    {m.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p style={{ color: MID, fontSize: 12, margin: "0 0 2px" }}>
                  <span style={{ fontWeight: 600 }}>Title:</span>{" "}
                  {m.accountTitle}
                </p>
                <p style={{ color: MID, fontSize: 12, margin: "0 0 2px" }}>
                  <span style={{ fontWeight: 600 }}>Account:</span>{" "}
                  {m.accountNumberOrIban}
                </p>
                <p style={{ color: MID, fontSize: 12, margin: 0 }}>
                  {m.instructions}
                </p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => handleToggleActive(m)}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: "#fff",
                    color: MID,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {m.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handleEdit(m)}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: "#fff",
                    color: "#E91E8C",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid #FECACA",
                    background: "#FEF2F2",
                    color: "#EF4444",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Tenant Billing Controls (reusable sub-component) ─────────────────────────
const TenantBillingControls = ({ tenantId, tenantName }) => {
  const {token} = useContext(SuperAdminContext);
  const headers = { Authorization: `Bearer ${token}`};
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("actions");
  const [msg, setMsg] = useState("");
  const [inp, setInp] = useState({
    days: 7,
    credits: 500,
    plan: "basic",
    studentCount: 50,
  });

  const key = ["sa-billing", tenantId];

  const { data: sub } = useQuery({
    queryKey: [...key, "sub"],
    queryFn: () =>
      axios
        .get(`/api/super-admin/tenants/${tenantId}`, {headers})
        .then((r) => r.data.data?.subscription),
    enabled: !!tenantId,
  });
  const { data: logs = [] } = useQuery({
    queryKey: [...key, "log"],
    queryFn: () =>
      axios
        .get(`/api/super-admin/tenants/${tenantId}/billing/log`, {headers})
        .then((r) => r.data.data),
    enabled: !!tenantId && tab === "log",
  });
  const { data: invoices = [] } = useQuery({
    queryKey: [...key, "invoices"],
    queryFn: () =>
      axios
        .get(`/api/super-admin/tenants/${tenantId}/billing/invoices`, {headers})
        .then((r) => r.data.data),
    enabled: !!tenantId && tab === "invoices",
  });

  const post = (path, body = {}) =>
    axios.post(`/api/super-admin/tenants/${tenantId}/billing/${path}`, body, {headers});
  const act = (path, body, label) => ({
    mutationFn: () => post(path, body),
    onSuccess: (r) => {
      setMsg(`${label}: ${r.data.message || "Done"}`);
      queryClient.invalidateQueries(key);
    },
    onError: (e) => setMsg(e.response?.data?.message || e.message),
  });

  const extendTrialMut = useMutation(
    act("extend-trial", { days: inp.days }, "Trial extended"),
  );
  const extendGraceMut = useMutation(
    act("extend-grace", { days: inp.days }, "Grace extended"),
  );
  const activateMut = useMutation(act("activate", {}, "Account activated"));
  const suspendMut = useMutation(act("suspend", {}, "Account suspended"));
  const changePlanMut = useMutation(
    act(
      "change-plan",
      { plan: inp.plan, studentCount: inp.studentCount },
      "Plan changed",
    ),
  );
  const creditsMut = useMutation(
    act("apply-credits", { credits: inp.credits * 100 }, "Credits applied"),
  );
  const retryMut = useMutation(act("force-retry", {}, "Payment retried"));

  return (
    <div>
      <p
        style={{
          fontWeight: 700,
          color: DARK,
          fontSize: 14,
          margin: "0 0 0.75rem",
        }}
      >
        {tenantName}
      </p>

      {msg && (
        <div
          style={{
            padding: "0.5rem 0.875rem",
            borderRadius: 8,
            marginBottom: "1rem",
            fontSize: 12,
            background: "rgba(233,30,140,0.06)",
            color: "#E91E8C",
            border: "1px solid rgba(233,30,140,0.2)",
          }}
        >
          {msg}
        </div>
      )}

      {sub && (
        <div style={{ ...CARD, background: "#FAFAFA" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.625rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 600, color: DARK, fontSize: 13 }}>
              Plan:{" "}
              <span style={{ textTransform: "capitalize" }}>{sub.plan}</span>
            </span>
            <StatusBadge status={sub.status} />
            {sub.cancelAtPeriodEnd && (
              <span
                style={{ fontSize: 11.5, color: "#FF6B35", fontWeight: 500 }}
              >
                Cancels at period end
              </span>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: "0.5rem",
              fontSize: 12,
              color: MID,
            }}
          >
            {sub.trialEnd && (
              <span>
                Trial ends: {new Date(sub.trialEnd).toLocaleDateString()}
              </span>
            )}
            {sub.currentPeriodEnd && (
              <span>
                Period ends:{" "}
                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
            {sub.gracePeriodEnd && (
              <span style={{ color: "#FF6B35", fontWeight: 500 }}>
                Grace ends: {new Date(sub.gracePeriodEnd).toLocaleDateString()}
              </span>
            )}
            {sub.promoCredits > 0 && (
              <span style={{ color: "#10B981", fontWeight: 500 }}>
                Credits: ${(sub.promoCredits / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs — styled like sidebar active state */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        {["actions", "log", "invoices"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: 8,
              border: `1px solid ${tab === t ? "rgba(233,30,140,0.3)" : BORDER}`,
              background:
                tab === t
                  ? "linear-gradient(135deg, rgba(233,30,140,0.1), rgba(255,107,53,0.06))"
                  : "#fff",
              color: tab === t ? "#E91E8C" : MID,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "actions" && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div style={CARD}>
            <p
              style={{
                fontWeight: 600,
                color: DARK,
                fontSize: 13,
                marginBottom: "0.625rem",
              }}
            >
              Extend Trial
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
              }}
            >
              <label style={{ color: MID, fontSize: 12.5 }}>Days:</label>
              <input
                type="number"
                min={1}
                max={90}
                value={inp.days}
                onChange={(e) =>
                  setInp((p) => ({ ...p, days: e.target.value }))
                }
                style={INP}
              />
              <Btn
                label="Extend Trial"
                onClick={() => extendTrialMut.mutate()}
                loading={extendTrialMut.isPending}
              />
            </div>
          </div>
          <div style={CARD}>
            <p
              style={{
                fontWeight: 600,
                color: DARK,
                fontSize: 13,
                marginBottom: "0.625rem",
              }}
            >
              Extend Grace Period
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
              }}
            >
              <label style={{ color: MID, fontSize: 12.5 }}>Days:</label>
              <input
                type="number"
                min={1}
                max={30}
                value={inp.days}
                onChange={(e) =>
                  setInp((p) => ({ ...p, days: e.target.value }))
                }
                style={INP}
              />
              <Btn
                label="Extend Grace"
                color="#FF6B35"
                onClick={() => extendGraceMut.mutate()}
                loading={extendGraceMut.isPending}
              />
            </div>
          </div>
          <div style={CARD}>
            <p
              style={{
                fontWeight: 600,
                color: DARK,
                fontSize: 13,
                marginBottom: "0.625rem",
              }}
            >
              Account Status
            </p>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              <Btn
                label="Activate"
                color="#10B981"
                onClick={() => activateMut.mutate()}
                loading={activateMut.isPending}
              />
              <Btn
                label="Suspend"
                color="#EF4444"
                onClick={() => suspendMut.mutate()}
                loading={suspendMut.isPending}
              />
              <Btn
                label="Force Retry Payment"
                color="#6B7280"
                onClick={() => retryMut.mutate()}
                loading={retryMut.isPending}
              />
            </div>
          </div>
          <div style={CARD}>
            <p
              style={{
                fontWeight: 600,
                color: DARK,
                fontSize: 13,
                marginBottom: "0.625rem",
              }}
            >
              Change Plan
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
              }}
            >
              <select
                value={inp.plan}
                onChange={(e) =>
                  setInp((p) => ({ ...p, plan: e.target.value }))
                }
                style={{ ...INP, width: "auto" }}
              >
                {["basic", "pro", "premium", "custom"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <label style={{ color: MID, fontSize: 12.5 }}>Students:</label>
              <input
                type="number"
                min={1}
                value={inp.studentCount}
                onChange={(e) =>
                  setInp((p) => ({ ...p, studentCount: e.target.value }))
                }
                style={INP}
              />
              <Btn
                label="Change Plan"
                onClick={() => changePlanMut.mutate()}
                loading={changePlanMut.isPending}
              />
            </div>
          </div>
          <div style={CARD}>
            <p
              style={{
                fontWeight: 600,
                color: DARK,
                fontSize: 13,
                marginBottom: "0.625rem",
              }}
            >
              Apply Promotional Credits
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
              }}
            >
              <label style={{ color: MID, fontSize: 12.5 }}>
                Amount (USD):
              </label>
              <input
                type="number"
                min={1}
                value={inp.credits}
                onChange={(e) =>
                  setInp((p) => ({ ...p, credits: e.target.value }))
                }
                style={INP}
              />
              <Btn
                label="Apply Credits"
                color="#10B981"
                onClick={() => creditsMut.mutate()}
                loading={creditsMut.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {tab === "log" && (
        <div style={CARD}>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: DARK,
              margin: "0 0 1rem",
            }}
          >
            Billing Audit Log
          </h3>
          {logs.length === 0 ? (
            <p style={{ color: MID, fontSize: 13 }}>No log entries.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {logs.map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "0.5rem 0",
                    borderBottom: `1px solid #F9FAFB`,
                    fontSize: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ color: MID, whiteSpace: "nowrap", minWidth: 130 }}
                  >
                    {new Date(l.createdAt).toLocaleString()}
                  </span>
                  <span style={{ fontWeight: 600, color: DARK, minWidth: 160 }}>
                    {l.action}
                  </span>
                  <span style={{ color: MID }}>by {l.performedBy}</span>
                  {l.details && Object.keys(l.details).length > 0 && (
                    <span
                      style={{
                        color: "#9CA3AF",
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {JSON.stringify(l.details)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "invoices" && (
        <div style={CARD}>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: DARK,
              margin: "0 0 1rem",
            }}
          >
            Invoices
          </h3>
          {invoices.length === 0 ? (
            <p style={{ color: MID, fontSize: 13 }}>No invoices.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12.5,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                    {["Date", "Plan", "Amount", "Status", "Retries"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "0.5rem 0.75rem",
                            color: MID,
                            fontWeight: 600,
                            fontSize: 11,
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: `1px solid #F9FAFB` }}
                    >
                      <td style={{ padding: "0.625rem 0.75rem", color: DARK }}>
                        {new Date(inv.billingDate).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          padding: "0.625rem 0.75rem",
                          color: DARK,
                          textTransform: "capitalize",
                        }}
                      >
                        {inv.planName}
                      </td>
                      <td
                        style={{
                          padding: "0.625rem 0.75rem",
                          fontWeight: 600,
                          color: DARK,
                        }}
                      >
                        {inv.currency?.toUpperCase()}{" "}
                        {parseFloat(inv.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem" }}>
                        <StatusBadge
                          status={
                            inv.status === "paid"
                              ? "active"
                              : inv.status === "failed"
                                ? "suspended"
                                : "past_due"
                          }
                        />
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem", color: MID }}>
                        {inv.retryCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Standalone page at /super-admin/billing ───────────────────────────────────
const SuperAdminBilling = () => {
  const {token} = useContext(SuperAdminContext);
  const headers = {Authorization: `Bearer ${token}`};
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const { data: tenants = [] } = useQuery({
    queryKey: ["sa-tenants-search", search],
    queryFn: () =>
      axios
        .get(
          `/api/super-admin/tenants?limit=20&search=${encodeURIComponent(search)}`,{headers}
        )
        .then((r) => r.data.data || []),
  });

  return (
    <SuperAdminLayout>
      <div
        style={{ padding: "1.5rem", maxWidth: 1280, margin: "0 auto" }}
        className="space-y-6"
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: DARK,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Billing Management
          </h1>
          <p style={{ fontSize: 13, color: MID, margin: "4px 0 0" }}>
            Manage payment gateways and tenant subscription controls.
          </p>
        </div>

        {/* Gateway toggle — always visible */}
        <GatewayTogglePanel />
        <ManualPaymentMethodsCRUD />

        {/* Tenant controls */}
        <div style={{ ...CARD, marginBottom: 0 }}>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: DARK,
              margin: "0 0 1rem",
            }}
          >
            Tenant Billing Controls
          </h3>

          {!selected ? (
            <>
              <input
                type="text"
                placeholder="Search school name or subdomain…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem 1rem",
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  marginBottom: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {tenants.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {tenants.slice(0, 12).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelected(t)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        cursor: "pointer",
                        background: "#FAFAFA",
                        transition: "border-color 150ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#E91E8C")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = BORDER)
                      }
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: DARK,
                            fontSize: 13.5,
                            margin: 0,
                          }}
                        >
                          {t.schoolName || t.name}
                        </p>
                        <p
                          style={{
                            color: MID,
                            fontSize: 12,
                            margin: "2px 0 0",
                          }}
                        >
                          {t.slug} · {t.status}
                        </p>
                      </div>
                      <span
                        style={{
                          color: "#E91E8C",
                          fontWeight: 600,
                          fontSize: 12.5,
                        }}
                      >
                        Manage →
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: MID,
                    textAlign: "center",
                    padding: "1.5rem",
                    fontSize: 13,
                  }}
                >
                  {search
                    ? `No schools found for "${search}"`
                    : "Type a school name to search."}
                </p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: MID,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: 0,
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                ← Back to list
              </button>
              <TenantBillingControls
                tenantId={selected.id}
                tenantName={selected.schoolName || selected.name}
              />
            </>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBilling;
