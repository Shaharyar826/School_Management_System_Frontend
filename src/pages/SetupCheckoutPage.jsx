import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import axios from "../config/axios";
import { toast } from "react-toastify";

const GRAD = "linear-gradient(135deg, #E91E8C, #FF6B35)";
const PINK = "#E91E8C";
const MID = "#6B7280";
const BORDER = "#E5E7EB";

const money = (n) => {
  const num = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(num)) return "—";
  return Math.round(num).toLocaleString();
};

const SetupCheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plan = searchParams.get("plan") || "basic";
  const studentCount =
    searchParams.get("studentCount") || searchParams.get("students") || "50";
  const currency = searchParams.get("currency") || "pkr";

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");

  // For consistent UI without dumping backend payloads.
  const clearError = () => setErrorMsg("");

  const tenantHeader = () => {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && !hostname.startsWith("127.")) {
      const parts = hostname.split(".");
      if (parts.length >= 3) return parts[0];
    }
    return (
      new URLSearchParams(window.location.search).get("tenant") ||
      localStorage.getItem("tenant") ||
      "demo"
    );
  };

  // Calculate trial + post-trial payment (frontend estimate).
  // IMPORTANT: backend is source of truth, but we show a clear estimate here.
  const estimate = useMemo(() => {
    const count = Math.max(1, parseInt(studentCount) || 1);

    // These mirror frontend plan ids in SchoolSetupDashboard.
    const PLAN_CONFIG = {
      basic: { pricePerStudentPKR: 25 },
      pro: { pricePerStudentPKR: 50 },
      premium: { pricePerStudentPKR: 75 },
    };

    const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.basic;
    const monthlyPKR = cfg.pricePerStudentPKR * count;

    // Trial is always 14 days => show the amount after trial (monthly).
    return {
      count,
      trialDays: 14,
      afterTrialAmountPKR: monthlyPKR,
    };
  }, [plan, studentCount]);

  useEffect(() => {
    // const loadPaymentMethods = async () => {
    //   try {
    //     clearError();
    //     const res = await axios.get('/api/stripe/payment-methods', {
    //       headers: { 'X-Tenant': tenantHeader() },
    //     });
    //     const methods = res.data?.data || [];
    //     setPaymentMethods(methods);
    //     if (methods.length) {
    //       const def = methods.find((m) => m.isDefault) || methods[0];
    //       setSelectedMethodId(def.id);
    //     }
    //   } catch (e) {
    //     // Do not dump payloads
    //     const msg = e?.response?.data?.message || 'Unable to load payment methods.';
    //     setErrorMsg(msg);
    //   }
    // };

    // loadPaymentMethods();
    const loadPaymentMethods = async () => {
      try {
        const res = await axios.get("/api/payment-methods");
        const methods = res.data?.data || [];
        setPaymentMethods(methods);
      } catch (e) {
        console.error("Failed to load payment methods:", e);
      }
    };
    loadPaymentMethods();
  }, []);

  // const onProceed = async () => {
  //   setLoading(true);
  //   clearError();

  //   try {
  //     if (!selectedMethodId) {
  //       setErrorMsg("Please select a payment method.");
  //       return;
  //     }

  //     // Create checkout session
  //     // NOTE: payment method is handled server-side via default payment settings / Stripe customer.
  //     // If your API expects explicit paymentMethodId, we can extend this payload.
  //     const successUrl = `${window.location.origin}/subscription/success?setup=1`;
  //     const cancelUrl = `${window.location.origin}/setup`;

  //     const res = await axios.post(
  //       "/api/stripe/create-checkout-session",
  //       {
  //         plan,
  //         studentCount: estimate.count,
  //         currency,
  //         successUrl,
  //         cancelUrl,
  //       },
  //       { headers: { "X-Tenant": tenantHeader() } },
  //     );

  //     if (res.data?.url) {
  //       window.location.href = res.data.url;
  //       return;
  //     }

  //     toast.error("Unable to start checkout. Please try again.");
  //   } catch (e) {
  //     const msg =
  //       e?.response?.data?.message ||
  //       "Something went wrong while starting checkout.";
  //     setErrorMsg(msg);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onProceed = async () => {
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fdf2f8 0%, #fef3f2 50%, #f9fafb 100%)",
        padding: "2.5rem 1rem",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              color: "#111827",
              margin: 0,
            }}
          >
            Checkout
          </h1>
          <p style={{ marginTop: 8, color: MID, fontSize: "1rem" }}>
            Review your plan and confirm after the 14-day trial.
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: `1.5px solid ${BORDER}`,
              padding: 18,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Your trial
            </h2>
            <div
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 14,
                background: "rgba(233,30,140,0.05)",
                border: "1px solid rgba(233,30,140,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span style={{ color: MID }}>Trial length</span>
                <span style={{ fontWeight: 800 }}>
                  {estimate.trialDays} days
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <span style={{ color: MID }}>Plan</span>
                <span style={{ fontWeight: 800, textTransform: "capitalize" }}>
                  {plan}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <span style={{ color: MID }}>Students</span>
                <span style={{ fontWeight: 800 }}>{estimate.count}</span>
              </div>
            </div>

            <h2
              style={{
                margin: "16px 0 0 0",
                fontSize: 16,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Payment after trial
            </h2>
            <div
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 14,
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span style={{ color: MID }}>Monthly amount</span>
                <span style={{ fontWeight: 900, color: PINK }}>
                  Rs. {money(estimate.afterTrialAmountPKR)}/month
                </span>
              </div>
              <div style={{ marginTop: 10, color: MID, fontSize: 13 }}>
                You won’t be charged during the 14-day trial. Billing starts
                after the trial ends.
              </div>
            </div>

            <button
              onClick={() => navigate("/setup")}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "0.8rem",
                borderRadius: 9999,
                background: "#fff",
                border: `1.5px solid ${BORDER}`,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Change plan
            </button>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: `1.5px solid ${BORDER}`,
              padding: 18,
            }}
          >
            {/* <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Payment method
            </h2> */}
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Payment methods
            </h2>
            <p style={{ color: MID, fontSize: 13, marginTop: 8 }}>
              After your trial ends, you can pay via the following methods:
            </p>

            {paymentMethods.length > 0 ? (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {paymentMethods.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: `1.5px solid ${BORDER}`,
                      background: "#FAFAFA",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#111827",
                        fontSize: 14,
                      }}
                    >
                      {m.methodName}
                    </div>
                    <div style={{ color: MID, fontSize: 13, marginTop: 4 }}>
                      <span style={{ fontWeight: 600 }}>Account title:</span>{" "}
                      {m.accountTitle}
                    </div>
                    <div style={{ color: MID, fontSize: 13, marginTop: 2 }}>
                      <span style={{ fontWeight: 600 }}>Account / IBAN:</span>{" "}
                      {m.accountNumberOrIban}
                    </div>
                    <div
                      style={{
                        color: MID,
                        fontSize: 13,
                        marginTop: 4,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.instructions}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 12, color: MID, fontSize: 14 }}>
                No payment methods configured yet. Contact support for payment
                details.
              </div>
            )}



            <div style={{ marginTop: 12, color: MID, fontSize: 13 }}>
              No payment is taken during the 14-day trial. You can pay after the
              trial ends.
            </div>

            {errorMsg ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: "#FEF2F2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                  fontWeight: 700,
                }}
              >
                {errorMsg}
              </div>
            ) : null}



            <button
              onClick={onProceed}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "0.9rem",
                borderRadius: 9999,
                border: "none",
                background: GRAD,
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 10px 28px rgba(233,30,140,0.28)",
              }}
            >
              Start 14-Days Trial
            </button>

            <div style={{ marginTop: 12, color: MID, fontSize: 13 }}>
              Secure payment via Stripe. No payment is taken during the trial.
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 18,
            color: MID,
            fontSize: 12,
          }}
        >
          Need help? Contact support.
        </div>
      </div>
    </div>
  );
};

export default SetupCheckoutPage;
