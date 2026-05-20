import { useState, useEffect, useRef, useCallback } from "react";

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────────
const STORAGE_KEY = "tankish-ops-v2";
const defaultState = {
  currentUser: null,
  users: [
    {
      id: "u1",
      name: "Admin",
      email: "admin@tankish.in",
      phone: "9800000001",
      role: "admin",
      initials: "AD",
      color: "#1B3A6B",
    },
  ],
  projects: [
    {
      id: "proj1",
      name: "Sultaanpur Residency",
      location: "Sultanpur Road, Lucknow",
      type: "Residential Apartment",
      stage: "Under Construction",
      urgency: "Moderate",
      plotSize: "4500 sq ft",
      budgetLakh: 120,
      revenueLakh: 180,
      completionPct: 45,
      reraStatus: "Applied",
      ldaStatus: "Approved",
      keyRisk: "Monsoon delay possible in July",
      nextAction: "Complete 2nd floor column work",
      notes: "G+3 building, 12 units of 2BHK",
      createdAt: "2024-11-01",
      updates: [
        {
          id: "upd1",
          userId: "u1",
          workDone: "1st floor slab RCC completed",
          materials: "30 bags cement, 15 rods TMT 12mm",
          issues: "None",
          pct: 40,
          date: "2025-05-10",
        },
        {
          id: "upd2",
          userId: "u1",
          workDone: "2nd floor column shuttering started",
          materials: "20 bags cement",
          issues: "Mixer breakdown — 2hr delay",
          pct: 45,
          date: "2025-05-18",
        },
      ],
      documents: [],
      payments: [
        {
          id: "pay1",
          paidTo: "Sharma Contractor",
          amount: 85000,
          category: "RCC / Structure",
          desc: "1st floor slab work",
          date: "2025-05-12",
        },
        {
          id: "pay2",
          paidTo: "Ambuja Cement",
          amount: 28000,
          category: "Materials",
          desc: "50 bags cement supply",
          date: "2025-05-15",
        },
      ],
      teamIds: ["u1"],
    },
  ],
  staff: [
    {
      id: "s1",
      name: "Ramesh Kumar",
      role: "Mason",
      phone: "9812345678",
      dailyWage: 700,
      projectId: "proj1",
      advance: 2000,
      status: "Active",
      initials: "RK",
      color: "#E8A020",
    },
    {
      id: "s2",
      name: "Suresh Yadav",
      role: "Helper",
      phone: "9823456789",
      dailyWage: 500,
      projectId: "proj1",
      advance: 0,
      status: "Active",
      initials: "SY",
      color: "#2E7D32",
    },
    {
      id: "s3",
      name: "Mohan Lal",
      role: "Electrician",
      phone: "9834567890",
      dailyWage: 800,
      projectId: "proj1",
      advance: 1500,
      status: "Active",
      initials: "ML",
      color: "#1565C0",
    },
  ],
  attendance: [],
  advances: [],
  salaryRecords: [],
  tasks: [
    {
      id: "t1",
      title: "Check column shuttering quality",
      desc: "Inspect 2nd floor columns before RCC pour",
      staffId: "s1",
      projectId: "proj1",
      dueDate: "2025-05-22",
      priority: "High",
      status: "In Progress",
      createdBy: "u1",
      createdAt: "2025-05-19",
    },
  ],
  properties: [
    {
      id: "prop1",
      name: "Shop 3 — Hazratganj",
      type: "Shop",
      location: "Hazratganj, Lucknow",
      tenant: "Sharma Traders",
      tenantPhone: "9845678901",
      rent: 12000,
      water: 500,
      elec: "Tenant pays own bill",
      dueDay: 5,
      staff: "Suresh (caretaker)",
      createdAt: "2024-01-01",
    },
  ],
  rentRecords: [
    {
      id: "r1",
      propId: "prop1",
      amount: 12000,
      date: "2025-05-04",
      month: "2025-05",
      mode: "Online",
      notes: "",
    },
  ],
  chatHistory: [],
};

async function loadDB() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? { ...defaultState, ...JSON.parse(r) } : defaultState;
  } catch {
    return defaultState;
  }
}

async function saveDB(db: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
} // ─── UTILS ────────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const thisMonth = () => new Date().toISOString().slice(0, 7);
const fmt = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const uid = () => Math.random().toString(36).slice(2, 10);
const ROLES = [
  "Mason",
  "Helper",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Supervisor",
  "Security",
  "Driver",
  "Office Staff",
  "Manager",
];
const COLORS = [
  "#1B3A6B",
  "#E8A020",
  "#2E7D32",
  "#AD1457",
  "#4527A0",
  "#00695C",
  "#BF360C",
  "#283593",
];
const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const colorFor = (str) =>
  COLORS[
    str.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length
  ];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function TankishOps() {
  const [db, setDb] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    loadDB().then((data) => {
      setDb(data);
      setLoading(false);
      if (data.currentUser) setLoggedIn(true);
    });
  }, []);

  const update = useCallback(async (fn) => {
    setDb((prev) => {
      const next = fn({ ...prev });
      saveDB(next);
      return next;
    });
  }, []);

  if (loading) return <Splash />;
  if (!loggedIn)
    return (
      <Login
        db={db}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        error={loginError}
        onLogin={(user) => {
          update((d) => {
            d.currentUser = user;
            return d;
          });
          setLoggedIn(true);
          setLoginError("");
        }}
        setError={setLoginError}
      />
    );

  const user = db.currentUser;
  const isAdmin = user?.role === "admin";
  const tabs = [
    { id: "dashboard", icon: "⊞", label: "Home" },
    { id: "projects", icon: "🏗", label: "Projects" },
    { id: "staff", icon: "👷", label: "Staff" },
    { id: "attendance", icon: "✓", label: "Attend." },
    { id: "salary", icon: "₹", label: "Salary" },
    { id: "rent", icon: "🏠", label: "Rent" },
    { id: "ai", icon: "✦", label: "AI" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F2F5",
        fontFamily: "'Poppins', sans-serif",
        paddingBottom: 70,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B3A6B 0%, #0D2547 100%)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#E8A020",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#1B3A6B",
            }}
          >
            T
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                lineHeight: 1.1,
              }}
            >
              Tankish Ops
            </div>
            <div style={{ color: "#E8A020", fontSize: 10, fontWeight: 500 }}>
              Lucknow Real Estate
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: colorFor(user?.name || ""),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initials(user?.name || "?")}
          </div>
          <button
            onClick={() => {
              update((d) => {
                d.currentUser = null;
                return d;
              });
              setLoggedIn(false);
            }}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page */}
      <div style={{ padding: "12px 14px" }}>
        {tab === "dashboard" && (
          <Dashboard db={db} update={update} setTab={setTab} />
        )}
        {tab === "projects" && (
          <Projects db={db} update={update} isAdmin={isAdmin} user={user} />
        )}
        {tab === "staff" && <Staff db={db} update={update} isAdmin={isAdmin} />}
        {tab === "attendance" && (
          <Attendance db={db} update={update} isAdmin={isAdmin} />
        )}
        {tab === "salary" && (
          <Salary db={db} update={update} isAdmin={isAdmin} />
        )}
        {tab === "rent" && <Rent db={db} update={update} isAdmin={isAdmin} />}
        {tab === "ai" && <AIAssistant db={db} update={update} user={user} />}
      </div>

      {/* Bottom Nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #E0E0E0",
          display: "flex",
          zIndex: 100,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              border: "none",
              background: "none",
              padding: "8px 4px 6px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                fontSize: 18,
                filter: tab === t.id ? "none" : "grayscale(1) opacity(0.5)",
              }}
            >
              {t.icon}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? "#1B3A6B" : "#9E9E9E",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {t.label}
            </span>
            {tab === t.id && (
              <div
                style={{
                  width: 16,
                  height: 2,
                  background: "#E8A020",
                  borderRadius: 1,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1B3A6B 0%, #0D2547 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          width: 64,
          height: 64,
          background: "#E8A020",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          fontWeight: 700,
          color: "#1B3A6B",
          fontFamily: "'Poppins',sans-serif",
        }}
      >
        T
      </div>
      <div
        style={{
          color: "#fff",
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "'Poppins',sans-serif",
        }}
      >
        Tankish Ops
      </div>
      <div style={{ color: "#E8A020", fontSize: 13 }}>
        Loading your workspace...
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ db, loginForm, setLoginForm, error, onLogin, setError }) {
  const handle = () => {
    const user = db?.users?.find((u) => u.email === loginForm.email);
    if (!user) {
      setError("Email not found. Contact admin.");
      return;
    }
    if (
      loginForm.password !== "tankish123" &&
      loginForm.password !== user.password
    ) {
      setError("Wrong password. Default: tankish123");
      return;
    }
    onLogin(user);
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #1B3A6B 0%, #0D2547 60%, #071A35 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          width: "100%",
          maxWidth: 380,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: "#1B3A6B",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#E8A020",
              margin: "0 auto 12px",
            }}
          >
            T
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1B3A6B" }}>
            Tankish Ops
          </div>
          <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 2 }}>
            Lucknow Real Estate Operations
          </div>
        </div>
        <input
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm((p) => ({ ...p, email: e.target.value }))
          }
          placeholder="Email address"
          type="email"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1.5px solid #E0E0E0",
            fontSize: 14,
            marginBottom: 12,
            outline: "none",
            fontFamily: "Poppins",
          }}
        />
        <input
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm((p) => ({ ...p, password: e.target.value }))
          }
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="Password (default: tankish123)"
          type="password"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1.5px solid #E0E0E0",
            fontSize: 14,
            marginBottom: 4,
            outline: "none",
            fontFamily: "Poppins",
          }}
        />
        {error && (
          <div
            style={{
              color: "#C62828",
              fontSize: 12,
              marginBottom: 10,
              padding: "8px 12px",
              background: "#FFEBEE",
              borderRadius: 8,
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={handle}
          style={{
            width: "100%",
            padding: "13px",
            background: "#1B3A6B",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 8,
            fontFamily: "Poppins",
          }}
        >
          Sign In →
        </button>
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 11,
            color: "#BDBDBD",
          }}
        >
          Default password: tankish123 · Contact admin to change
        </div>
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function MetricCard({ label, value, color = "#1B3A6B", icon }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#9E9E9E",
          fontWeight: 500,
          marginBottom: 4,
        }}
      >
        {icon} {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
function Badge({ label, color = "#1B3A6B", bg }) {
  const bgColor = bg || color + "18";
  return (
    <span
      style={{
        background: bgColor,
        color,
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 6,
      }}
    >
      {label}
    </span>
  );
}
function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#1B3A6B",
        marginBottom: 10,
        marginTop: 4,
        borderLeft: "3px solid #E8A020",
        paddingLeft: 8,
      }}
    >
      {children}
    </div>
  );
}
function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#616161",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <input
        {...props}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1.5px solid #E0E0E0",
          fontSize: 13,
          outline: "none",
          fontFamily: "Poppins",
          background: "#FAFAFA",
          ...props.style,
        }}
      />
    </div>
  );
}
function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#616161",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <select
        {...props}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1.5px solid #E0E0E0",
          fontSize: 13,
          outline: "none",
          fontFamily: "Poppins",
          background: "#FAFAFA",
          ...props.style,
        }}
      >
        {children}
      </select>
    </div>
  );
}
function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#616161",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <textarea
        {...props}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1.5px solid #E0E0E0",
          fontSize: 13,
          outline: "none",
          fontFamily: "Poppins",
          background: "#FAFAFA",
          resize: "vertical",
          minHeight: 72,
          ...props.style,
        }}
      />
    </div>
  );
}
function Btn({
  children,
  onClick,
  color = "#1B3A6B",
  light,
  small,
  disabled,
  style = {},
}) {
  const bg = light ? color + "15" : color;
  const fg = light ? color : "#fff";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color: fg,
        border: "none",
        borderRadius: 8,
        padding: small ? "6px 12px" : "10px 18px",
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Poppins",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        transition: "opacity 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
function Avatar({ name, size = 36 }) {
  const bg = colorFor(name || "?");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {initials(name || "?")}
    </div>
  );
}
function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "20px 18px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1B3A6B" }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F5F5F5",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function urgencyColor(u) {
  return u === "Critical"
    ? "#C62828"
    : u === "Moderate"
    ? "#E65100"
    : "#2E7D32";
}
function stageColor(s) {
  const m = {
    "Pre-Deal": "#7B1FA2",
    "Pre-Construction": "#1565C0",
    "Under Construction": "#E65100",
    "Near Completion": "#2E7D32",
    Completed: "#424242",
  };
  return m[s] || "#616161";
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ db, update, setTab }) {
  const activeProjects = db.projects.filter(
    (p) => p.stage !== "Completed"
  ).length;
  const totalStaff = db.staff.filter((s) => s.status === "Active").length;
  const rentDue = db.properties.reduce((sum, p) => {
    const paid = db.rentRecords
      .filter((r) => r.propId === p.id && r.month === thisMonth())
      .reduce((a, r) => a + r.amount, 0);
    return sum + Math.max(0, p.rent - paid);
  }, 0);
  const overdueRent = db.properties.filter((p) => {
    const paid = db.rentRecords
      .filter((r) => r.propId === p.id && r.month === thisMonth())
      .reduce((a, r) => a + r.amount, 0);
    return paid < p.rent && new Date().getDate() > p.dueDay + 3;
  }).length;

  const todayStr = today();
  const markedToday = db.attendance.filter((a) => a.date === todayStr).length;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1B3A6B" }}>
          Good morning 🙏
        </div>
        <div style={{ fontSize: 12, color: "#9E9E9E" }}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <MetricCard label="Active Projects" value={activeProjects} icon="🏗" />
        <MetricCard label="Active Staff" value={totalStaff} icon="👷" />
        <MetricCard
          label="Rent Pending"
          value={fmt(rentDue)}
          color="#E65100"
          icon="🏠"
        />
        <MetricCard
          label="Rent Overdue"
          value={overdueRent}
          color={overdueRent > 0 ? "#C62828" : "#2E7D32"}
          icon="⚠️"
        />
      </div>

      {overdueRent > 0 && (
        <div
          style={{
            background: "#FFEBEE",
            border: "1px solid #EF9A9A",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>🔴</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#C62828" }}>
              Rent overdue on {overdueRent} propert
              {overdueRent > 1 ? "ies" : "y"}
            </div>
            <div style={{ fontSize: 11, color: "#E53935" }}>
              Follow up with tenants immediately
            </div>
          </div>
        </div>
      )}

      {markedToday === 0 && totalStaff > 0 && (
        <div
          style={{
            background: "#FFF3E0",
            border: "1px solid #FFCC80",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>📋</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#E65100" }}>
              Attendance not marked today
            </div>
            <div style={{ fontSize: 11, color: "#F57C00" }}>
              Mark attendance for your staff
            </div>
          </div>
          <Btn small onClick={() => setTab("attendance")}>
            Mark →
          </Btn>
        </div>
      )}

      <SectionTitle>Quick Actions</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          ["🏗", "Site Update", "projects"],
          ["📋", "Attendance", "attendance"],
          ["₹", "Log Payment", "salary"],
          ["🏠", "Rent Check", "rent"],
        ].map(([icon, label, t]) => (
          <button
            key={label}
            onClick={() => setTab(t)}
            style={{
              background: "#fff",
              border: "1.5px solid #E8E8E8",
              borderRadius: 12,
              padding: "14px 10px",
              cursor: "pointer",
              fontFamily: "Poppins",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1B3A6B" }}>
              {label}
            </div>
          </button>
        ))}
      </div>

      <SectionTitle>Projects Overview</SectionTitle>
      {db.projects.map((p) => (
        <Card key={p.id}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: "#9E9E9E" }}>{p.location}</div>
            </div>
            <Badge label={p.urgency} color={urgencyColor(p.urgency)} />
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <Badge label={p.stage} color={stageColor(p.stage)} />
          </div>
          <div
            style={{
              background: "#F5F5F5",
              borderRadius: 6,
              height: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: p.completionPct + "%",
                height: "100%",
                background:
                  p.completionPct > 70
                    ? "#2E7D32"
                    : p.completionPct > 40
                    ? "#E8A020"
                    : "#1B3A6B",
                borderRadius: 6,
                transition: "width 0.4s",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#9E9E9E", marginTop: 4 }}>
            {p.completionPct}% complete · Next: {p.nextAction}
          </div>
        </Card>
      ))}

      <SectionTitle>✦ Ask AI Assistant</SectionTitle>
      <button
        onClick={() => setTab("ai")}
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #1B3A6B, #0D2547)",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "16px",
          cursor: "pointer",
          fontFamily: "Poppins",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "#E8A020",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ✦
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            Tankish AI Assistant
          </div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            Ask anything about your projects, legal, finance...
          </div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 18, opacity: 0.7 }}>
          →
        </span>
      </button>
    </div>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function Projects({ db, update, isAdmin, user }) {
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [projTab, setProjTab] = useState("updates");
  const [form, setForm] = useState({
    name: "",
    location: "",
    type: "Residential Apartment",
    stage: "Pre-Construction",
    urgency: "Routine",
    plotSize: "",
    budgetLakh: "",
    revenueLakh: "",
    reraStatus: "Not Applied",
    ldaStatus: "Not Applied",
    notes: "",
  });
  const [updateForm, setUpdateForm] = useState({
    workDone: "",
    materials: "",
    issues: "",
    pct: "",
  });
  const [payForm, setPayForm] = useState({
    paidTo: "",
    amount: "",
    category: "Materials",
    desc: "",
    date: today(),
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);

  const proj = db.projects.find((p) => p.id === selectedId);

  const addProject = () => {
    if (!form.name) return;
    const p = {
      ...form,
      id: "proj" + uid(),
      budgetLakh: +form.budgetLakh || 0,
      revenueLakh: +form.revenueLakh || 0,
      completionPct: 0,
      teamIds: [user?.id],
      updates: [],
      documents: [],
      payments: [],
      createdAt: today(),
    };
    update((d) => {
      d.projects.push(p);
      return d;
    });
    setShowAdd(false);
    setForm({
      name: "",
      location: "",
      type: "Residential Apartment",
      stage: "Pre-Construction",
      urgency: "Routine",
      plotSize: "",
      budgetLakh: "",
      revenueLakh: "",
      reraStatus: "Not Applied",
      ldaStatus: "Not Applied",
      notes: "",
    });
  };

  const addUpdate = () => {
    if (!updateForm.workDone) return;
    const upd = {
      ...updateForm,
      id: "upd" + uid(),
      userId: user?.id,
      date: today(),
      pct: +updateForm.pct || proj.completionPct,
    };
    update((d) => {
      const p = d.projects.find((x) => x.id === selectedId);
      p.updates.unshift(upd);
      p.completionPct = upd.pct;
      return d;
    });
    setUpdateForm({ workDone: "", materials: "", issues: "", pct: "" });
    setShowUpdateForm(false);
  };

  const addPayment = () => {
    if (!payForm.paidTo || !payForm.amount) return;
    const pay = { ...payForm, id: "pay" + uid(), amount: +payForm.amount };
    update((d) => {
      d.projects.find((x) => x.id === selectedId).payments.unshift(pay);
      return d;
    });
    setPayForm({
      paidTo: "",
      amount: "",
      category: "Materials",
      desc: "",
      date: today(),
    });
    setShowPayForm(false);
  };

  if (view === "detail" && proj) {
    const totalPaid = proj.payments.reduce((s, p) => s + p.amount, 0);
    return (
      <div>
        <button
          onClick={() => setView("list")}
          style={{
            background: "none",
            border: "none",
            color: "#1B3A6B",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 12,
            padding: 0,
            fontFamily: "Poppins",
          }}
        >
          ← Back to Projects
        </button>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1B3A6B" }}>
                {proj.name}
              </div>
              <div style={{ fontSize: 12, color: "#9E9E9E" }}>
                {proj.location} · {proj.type}
              </div>
            </div>
            <Badge label={proj.stage} color={stageColor(proj.stage)} />
          </div>
          <div style={{ margin: "10px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#9E9E9E",
                marginBottom: 4,
              }}
            >
              <span>Completion</span>
              <span style={{ fontWeight: 600, color: "#1B3A6B" }}>
                {proj.completionPct}%
              </span>
            </div>
            <div style={{ background: "#F0F2F5", borderRadius: 6, height: 8 }}>
              <div
                style={{
                  width: proj.completionPct + "%",
                  height: "100%",
                  background: "#1B3A6B",
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <div
              style={{
                background: "#F0F2F5",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: 10, color: "#9E9E9E" }}>Budget</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1B3A6B" }}>
                ₹{proj.budgetLakh}L
              </div>
            </div>
            <div
              style={{
                background: "#F0F2F5",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: 10, color: "#9E9E9E" }}>Spent</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    totalPaid / 100000 > proj.budgetLakh * 0.9
                      ? "#C62828"
                      : "#2E7D32",
                }}
              >
                {fmt(totalPaid)}
              </div>
            </div>
            <div
              style={{
                background: "#F0F2F5",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: 10, color: "#9E9E9E" }}>Target</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1B3A6B" }}>
                ₹{proj.revenueLakh}L
              </div>
            </div>
          </div>
          {proj.keyRisk && (
            <div
              style={{
                marginTop: 10,
                background: "#FFF3E0",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#E65100",
              }}
            >
              ⚠️ Risk: {proj.keyRisk}
            </div>
          )}
          {proj.nextAction && (
            <div
              style={{
                marginTop: 6,
                background: "#E8F5E9",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#2E7D32",
              }}
            >
              → Next: {proj.nextAction}
            </div>
          )}
        </Card>

        {/* Sub-tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {["updates", "documents", "payments", "details"].map((t) => (
            <button
              key={t}
              onClick={() => setProjTab(t)}
              style={{
                background: projTab === t ? "#1B3A6B" : "#fff",
                color: projTab === t ? "#fff" : "#616161",
                border:
                  "1.5px solid " + (projTab === t ? "#1B3A6B" : "#E0E0E0"),
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Poppins",
                whiteSpace: "nowrap",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {projTab === "updates" && (
          <div>
            {isAdmin && (
              <Btn
                onClick={() => setShowUpdateForm(true)}
                style={{ marginBottom: 12 }}
              >
                + Add Update
              </Btn>
            )}
            {showUpdateForm && (
              <Card
                style={{ background: "#F0F4FF", border: "1.5px solid #1B3A6B" }}
              >
                <Textarea
                  label="Work done today"
                  value={updateForm.workDone}
                  onChange={(e) =>
                    setUpdateForm((p) => ({ ...p, workDone: e.target.value }))
                  }
                  placeholder="Describe what was done..."
                />
                <Textarea
                  label="Materials used"
                  value={updateForm.materials}
                  onChange={(e) =>
                    setUpdateForm((p) => ({ ...p, materials: e.target.value }))
                  }
                  placeholder="Cement, rods, bricks..."
                  style={{ minHeight: 50 }}
                />
                <Textarea
                  label="Issues / problems"
                  value={updateForm.issues}
                  onChange={(e) =>
                    setUpdateForm((p) => ({ ...p, issues: e.target.value }))
                  }
                  placeholder="Any problems on site..."
                  style={{ minHeight: 50 }}
                />
                <Input
                  label="Completion % after today"
                  type="number"
                  value={updateForm.pct}
                  onChange={(e) =>
                    setUpdateForm((p) => ({ ...p, pct: e.target.value }))
                  }
                  placeholder={proj.completionPct + ""}
                  style={{ width: 120 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={addUpdate}>Save Update</Btn>
                  <Btn light onClick={() => setShowUpdateForm(false)}>
                    Cancel
                  </Btn>
                </div>
              </Card>
            )}
            {proj.updates.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#9E9E9E",
                  fontSize: 13,
                  padding: 24,
                }}
              >
                No updates yet
              </div>
            )}
            {proj.updates.map((u) => (
              <Card key={u.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#1B3A6B",
                      background: "#E8F0FE",
                      padding: "3px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {u.date}
                  </div>
                  <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                    {u.pct}% complete
                  </div>
                </div>
                <div
                  style={{ fontSize: 13, color: "#212121", marginBottom: 4 }}
                >
                  {u.workDone}
                </div>
                {u.materials && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#616161",
                      background: "#F5F5F5",
                      borderRadius: 6,
                      padding: "5px 8px",
                      marginBottom: 4,
                    }}
                  >
                    📦 {u.materials}
                  </div>
                )}
                {u.issues && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#C62828",
                      background: "#FFEBEE",
                      borderRadius: 6,
                      padding: "5px 8px",
                    }}
                  >
                    ⚠️ {u.issues}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {projTab === "documents" && (
          <div>
            <Card
              style={{
                border: "2px dashed #E0E0E0",
                background: "#FAFAFA",
                textAlign: "center",
                padding: 24,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#616161",
                  marginBottom: 4,
                }}
              >
                Upload Documents
              </div>
              <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 12 }}>
                Floor plans, approvals, contracts, photos
              </div>
              <input
                type="file"
                id="doc-upload"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  files.forEach((f) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const doc = {
                        id: "doc" + uid(),
                        name: f.name,
                        url: ev.target.result,
                        category: "Other",
                        size: f.size,
                        date: today(),
                      };
                      update((d) => {
                        d.projects
                          .find((p) => p.id === selectedId)
                          .documents.push(doc);
                        return d;
                      });
                    };
                    reader.readAsDataURL(f);
                  });
                  e.target.value = "";
                }}
              />
              <label
                htmlFor="doc-upload"
                style={{
                  background: "#1B3A6B",
                  color: "#fff",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Choose Files
              </label>
            </Card>
            {proj.documents.map((doc) => (
              <Card
                key={doc.id}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ fontSize: 24 }}>
                  {doc.name.match(/\.(jpg|jpeg|png|gif)/i)
                    ? "🖼"
                    : doc.name.match(/\.pdf/i)
                    ? "📄"
                    : "📎"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#212121",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {doc.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                    {doc.date}
                  </div>
                </div>
                <a
                  href={doc.url}
                  download={doc.name}
                  style={{
                    background: "#E8F0FE",
                    color: "#1B3A6B",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "5px 10px",
                    borderRadius: 6,
                    textDecoration: "none",
                  }}
                >
                  ↓
                </a>
              </Card>
            ))}
          </div>
        )}

        {projTab === "payments" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <MetricCard
                label="Total paid"
                value={fmt(proj.payments.reduce((s, p) => s + p.amount, 0))}
                color="#1B3A6B"
                icon="💸"
              />
              <MetricCard
                label="Budget left"
                value={fmt(
                  proj.budgetLakh * 100000 -
                    proj.payments.reduce((s, p) => s + p.amount, 0)
                )}
                color="#2E7D32"
                icon="💰"
              />
            </div>
            {isAdmin && (
              <Btn
                onClick={() => setShowPayForm(true)}
                style={{ marginBottom: 12 }}
              >
                + Record Payment
              </Btn>
            )}
            {showPayForm && (
              <Card
                style={{ background: "#F0F4FF", border: "1.5px solid #1B3A6B" }}
              >
                <Input
                  label="Paid to"
                  value={payForm.paidTo}
                  onChange={(e) =>
                    setPayForm((p) => ({ ...p, paidTo: e.target.value }))
                  }
                  placeholder="Contractor / supplier name"
                />
                <Input
                  label="Amount (₹)"
                  type="number"
                  value={payForm.amount}
                  onChange={(e) =>
                    setPayForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="50000"
                />
                <Select
                  label="Category"
                  value={payForm.category}
                  onChange={(e) =>
                    setPayForm((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  {[
                    "RCC / Structure",
                    "Labour Wages",
                    "Materials",
                    "Electrical",
                    "Plumbing",
                    "Finishing",
                    "Contractor Milestone",
                    "Approval Fees",
                    "Misc",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
                <Input
                  label="Description"
                  value={payForm.desc}
                  onChange={(e) =>
                    setPayForm((p) => ({ ...p, desc: e.target.value }))
                  }
                  placeholder="Brief description"
                />
                <Input
                  label="Date"
                  type="date"
                  value={payForm.date}
                  onChange={(e) =>
                    setPayForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={addPayment}>Save Payment</Btn>
                  <Btn light onClick={() => setShowPayForm(false)}>
                    Cancel
                  </Btn>
                </div>
              </Card>
            )}
            {proj.payments.map((p) => (
              <Card
                key={p.id}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#212121" }}
                  >
                    {p.paidTo}
                  </div>
                  <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                    {p.date} · <Badge label={p.category} color="#616161" />
                  </div>
                  {p.desc && (
                    <div
                      style={{ fontSize: 11, color: "#616161", marginTop: 2 }}
                    >
                      {p.desc}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#C62828",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(p.amount)}
                </div>
              </Card>
            ))}
          </div>
        )}

        {projTab === "details" && (
          <Card>
            {[
              ["Plot size", proj.plotSize],
              ["RERA status", proj.reraStatus],
              ["LDA status", proj.ldaStatus],
              ["Key risk", proj.keyRisk],
              ["Next action", proj.nextAction],
              ["Notes", proj.notes],
              ["Created", proj.createdAt],
            ].map(([k, v]) =>
              v ? (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #F5F5F5",
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "#9E9E9E", fontWeight: 600 }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#212121",
                      textAlign: "right",
                      maxWidth: "60%",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ) : null
            )}
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <SectionTitle>Projects</SectionTitle>
        {isAdmin && (
          <Btn small onClick={() => setShowAdd(true)}>
            + New Project
          </Btn>
        )}
      </div>

      {showAdd && (
        <Modal title="Add New Project" onClose={() => setShowAdd(false)}>
          <Input
            label="Project name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Indira Nagar Block A"
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="Area, Lucknow"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            {[
              "Residential Apartment",
              "Villa",
              "Commercial",
              "Mixed Use",
              "Plot Development",
              "Farmhouse",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Select
            label="Stage"
            value={form.stage}
            onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
          >
            {[
              "Pre-Deal",
              "Pre-Construction",
              "Under Construction",
              "Near Completion",
              "Completed",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Select
            label="Urgency"
            value={form.urgency}
            onChange={(e) =>
              setForm((p) => ({ ...p, urgency: e.target.value }))
            }
          >
            {["Routine", "Moderate", "Critical"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <Input
              label="Budget (₹ lakh)"
              type="number"
              value={form.budgetLakh}
              onChange={(e) =>
                setForm((p) => ({ ...p, budgetLakh: e.target.value }))
              }
            />
            <Input
              label="Revenue target"
              type="number"
              value={form.revenueLakh}
              onChange={(e) =>
                setForm((p) => ({ ...p, revenueLakh: e.target.value }))
              }
            />
          </div>
          <Input
            label="Plot size"
            value={form.plotSize}
            onChange={(e) =>
              setForm((p) => ({ ...p, plotSize: e.target.value }))
            }
            placeholder="e.g. 2400 sq ft"
          />
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Any other details..."
          />
          <Btn onClick={addProject} style={{ width: "100%" }}>
            Create Project
          </Btn>
        </Modal>
      )}

      {db.projects.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#9E9E9E",
            padding: 40,
            fontSize: 14,
          }}
        >
          No projects yet. Add your first project!
        </div>
      )}
      {db.projects.map((p) => (
        <Card
          key={p.id}
          style={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedId(p.id);
            setView("detail");
            setProjTab("updates");
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>
              {p.name}
            </div>
            <Badge label={p.urgency} color={urgencyColor(p.urgency)} />
          </div>
          <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 8 }}>
            {p.location} · {p.type}
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <Badge label={p.stage} color={stageColor(p.stage)} />
            <Badge label={"₹" + p.budgetLakh + "L budget"} color="#616161" />
          </div>
          <div style={{ background: "#F0F2F5", borderRadius: 6, height: 6 }}>
            <div
              style={{
                width: p.completionPct + "%",
                height: "100%",
                background: "#1B3A6B",
                borderRadius: 6,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#9E9E9E",
              marginTop: 4,
            }}
          >
            <span>{p.completionPct}% complete</span>
            <span>
              {p.updates.length} updates · {p.payments.length} payments
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── STAFF ────────────────────────────────────────────────────────────────────
function Staff({ db, update, isAdmin }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showTask, setShowTask] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "Mason",
    phone: "",
    email: "",
    dailyWage: "",
    projectId: "",
    status: "Active",
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    desc: "",
    priority: "Medium",
    dueDate: "",
  });

  const addStaff = () => {
    if (!form.name) return;
    const s = {
      ...form,
      id: "s" + uid(),
      dailyWage: +form.dailyWage || 0,
      advance: 0,
      initials: initials(form.name),
      color: colorFor(form.name),
    };
    update((d) => {
      d.staff.push(s);
      return d;
    });
    setShowAdd(false);
    setForm({
      name: "",
      role: "Mason",
      phone: "",
      email: "",
      dailyWage: "",
      projectId: "",
      status: "Active",
    });
  };

  const addTask = () => {
    if (!taskForm.title || !selected) return;
    const t = {
      ...taskForm,
      id: "t" + uid(),
      staffId: selected.id,
      projectId: selected.projectId,
      status: "To Do",
      createdBy: "u1",
      createdAt: today(),
    };
    update((d) => {
      d.tasks.push(t);
      return d;
    });
    setTaskForm({ title: "", desc: "", priority: "Medium", dueDate: "" });
    setShowTask(false);
  };

  const staffMember = db.staff.find((s) => s.id === selected?.id);
  const staffTasks = staffMember
    ? db.tasks.filter((t) => t.staffId === staffMember.id)
    : [];
  const staffAdvances = staffMember
    ? (db.advances || []).filter((a) => a.staffId === staffMember.id)
    : [];
  const staffAttendance = staffMember
    ? db.attendance.filter((a) => a.staffId === staffMember.id).slice(-30)
    : [];
  const presentDays = staffAttendance.filter(
    (a) => a.status === "present"
  ).length;
  const halfDays = staffAttendance.filter((a) => a.status === "half").length;

  if (selected && staffMember) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          style={{
            background: "none",
            border: "none",
            color: "#1B3A6B",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 12,
            padding: 0,
            fontFamily: "Poppins",
          }}
        >
          ← Back to Staff
        </button>
        <Card>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Avatar name={staffMember.name} size={52} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1B3A6B" }}>
                {staffMember.name}
              </div>
              <div style={{ fontSize: 12, color: "#9E9E9E" }}>
                {staffMember.role}
              </div>
              <div style={{ fontSize: 12, color: "#1B3A6B", marginTop: 2 }}>
                📞 {staffMember.phone}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginTop: 14,
            }}
          >
            <div
              style={{
                background: "#F0F2F5",
                borderRadius: 8,
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: "#9E9E9E" }}>Daily wage</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1B3A6B" }}>
                {fmt(staffMember.dailyWage)}
              </div>
            </div>
            <div
              style={{
                background: "#FFF3E0",
                borderRadius: 8,
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: "#E65100" }}>Advance</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E65100" }}>
                {fmt(staffMember.advance)}
              </div>
            </div>
            <div
              style={{
                background: "#E8F5E9",
                borderRadius: 8,
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: "#2E7D32" }}>Present/30d</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2E7D32" }}>
                {presentDays}d
              </div>
            </div>
          </div>
        </Card>

        <SectionTitle>Assigned Tasks</SectionTitle>
        {isAdmin && (
          <Btn
            small
            onClick={() => setShowTask(true)}
            style={{ marginBottom: 10 }}
          >
            + Assign Task
          </Btn>
        )}
        {showTask && (
          <Card
            style={{ background: "#F0F4FF", border: "1.5px solid #1B3A6B" }}
          >
            <Input
              label="Task title *"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Check shuttering quality"
            />
            <Textarea
              label="Details"
              value={taskForm.desc}
              onChange={(e) =>
                setTaskForm((p) => ({ ...p, desc: e.target.value }))
              }
              placeholder="What exactly needs to be done..."
              style={{ minHeight: 50 }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <Select
                label="Priority"
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm((p) => ({ ...p, priority: e.target.value }))
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </Select>
              <Input
                label="Due date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={addTask}>Assign</Btn>
              <Btn light onClick={() => setShowTask(false)}>
                Cancel
              </Btn>
            </div>
          </Card>
        )}
        {staffTasks.map((t) => (
          <Card
            key={t.id}
            style={{
              borderLeft:
                "3px solid " +
                (t.priority === "High"
                  ? "#C62828"
                  : t.priority === "Medium"
                  ? "#E8A020"
                  : "#2E7D32"),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
              <select
                value={t.status}
                onChange={(e) =>
                  update((d) => {
                    d.tasks.find((x) => x.id === t.id).status = e.target.value;
                    return d;
                  })
                }
                style={{
                  fontSize: 11,
                  border: "1px solid #E0E0E0",
                  borderRadius: 6,
                  padding: "3px 6px",
                  fontFamily: "Poppins",
                }}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
                <option>Blocked</option>
              </select>
            </div>
            {t.desc && (
              <div style={{ fontSize: 12, color: "#616161", marginTop: 4 }}>
                {t.desc}
              </div>
            )}
            {t.dueDate && (
              <div style={{ fontSize: 11, color: "#9E9E9E", marginTop: 4 }}>
                Due: {t.dueDate}
              </div>
            )}
          </Card>
        ))}
        {staffTasks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#9E9E9E",
              fontSize: 13,
              padding: 16,
            }}
          >
            No tasks assigned
          </div>
        )}

        <SectionTitle>Recent Attendance (Last 30 days)</SectionTitle>
        <Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {staffAttendance.length === 0 && (
              <div style={{ color: "#9E9E9E", fontSize: 12 }}>
                No attendance records
              </div>
            )}
            {staffAttendance.map((a) => (
              <div
                key={a.id}
                title={a.date}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background:
                    a.status === "present"
                      ? "#2E7D32"
                      : a.status === "half"
                      ? "#E8A020"
                      : a.status === "leave"
                      ? "#1565C0"
                      : "#E0E0E0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {a.status === "present"
                  ? "P"
                  : a.status === "half"
                  ? "H"
                  : a.status === "leave"
                  ? "L"
                  : "A"}
              </div>
            ))}
          </div>
          <div
            style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11 }}
          >
            {[
              ["#2E7D32", "P", "Present"],
              ["#E8A020", "H", "Half day"],
              ["#E0E0E0", "A", "Absent"],
            ].map(([c, l, label]) => (
              <div
                key={l}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: c,
                    borderRadius: 3,
                  }}
                />
                <span style={{ color: "#616161" }}>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <SectionTitle>Staff Roster</SectionTitle>
        {isAdmin && (
          <Btn small onClick={() => setShowAdd(true)}>
            + Add Staff
          </Btn>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Staff Member" onClose={() => setShowAdd(false)}>
          <Input
            label="Full name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="98XXXXXXXX"
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Input
            label="Daily wage (₹)"
            type="number"
            value={form.dailyWage}
            onChange={(e) =>
              setForm((p) => ({ ...p, dailyWage: e.target.value }))
            }
            placeholder="700"
          />
          <Select
            label="Assign to project"
            value={form.projectId}
            onChange={(e) =>
              setForm((p) => ({ ...p, projectId: e.target.value }))
            }
          >
            <option value="">-- No project --</option>
            {db.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Btn onClick={addStaff} style={{ width: "100%" }}>
            Add to Roster
          </Btn>
        </Modal>
      )}

      {db.staff.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#9E9E9E",
            padding: 40,
            fontSize: 14,
          }}
        >
          No staff added yet
        </div>
      )}
      {db.staff.map((s) => {
        const proj = db.projects.find((p) => p.id === s.projectId);
        const pendingTasks = db.tasks.filter(
          (t) => t.staffId === s.id && t.status !== "Done"
        ).length;
        return (
          <Card
            key={s.id}
            style={{ cursor: "pointer" }}
            onClick={() => setSelected(s)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={s.name} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}
                >
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                  {s.role} {proj ? "· " + proj.name : ""}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <Badge label={fmt(s.dailyWage) + "/day"} color="#616161" />
                  {s.advance > 0 && (
                    <Badge label={"Adv: " + fmt(s.advance)} color="#E65100" />
                  )}
                  {pendingTasks > 0 && (
                    <Badge
                      label={
                        pendingTasks + " task" + (pendingTasks > 1 ? "s" : "")
                      }
                      color="#1565C0"
                    />
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <Badge
                  label={s.status}
                  color={s.status === "Active" ? "#2E7D32" : "#9E9E9E"}
                />
                <span style={{ fontSize: 18, color: "#9E9E9E" }}>→</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
function Attendance({ db, update, isAdmin }) {
  const [date, setDate] = useState(today());
  const [saved, setSaved] = useState(false);
  const existing = db.attendance.filter((a) => a.date === date);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    const m = {};
    db.staff.forEach((s) => {
      const rec = existing.find((a) => a.staffId === s.id);
      m[s.id] = rec?.status || "present";
    });
    setMarks(m);
    setSaved(existing.length > 0);
  }, [date, db.staff.length]);

  const statusOptions = ["present", "half", "absent", "leave"];
  const statusLabel = {
    present: "Present ✓",
    half: "Half Day",
    absent: "Absent",
    leave: "Leave",
  };
  const statusColor = {
    present: "#2E7D32",
    half: "#E8A020",
    absent: "#C62828",
    leave: "#1565C0",
  };

  const save = () => {
    const newRecords = db.staff.map((s) => ({
      id: "att" + uid(),
      staffId: s.id,
      date,
      status: marks[s.id] || "present",
      markedAt: new Date().toISOString(),
    }));
    update((d) => {
      d.attendance = d.attendance
        .filter((a) => a.date !== date)
        .concat(newRecords);
      return d;
    });
    setSaved(true);
  };

  const totalPresent = Object.values(marks).filter(
    (v) => v === "present"
  ).length;
  const totalAbsent = Object.values(marks).filter((v) => v === "absent").length;
  const totalWages = db.staff.reduce(
    (sum, s) =>
      sum +
      (marks[s.id] === "present"
        ? s.dailyWage
        : marks[s.id] === "half"
        ? s.dailyWage * 0.5
        : 0),
    0
  );

  return (
    <div>
      <SectionTitle>Attendance / उपस्थिति</SectionTitle>
      <Card>
        <Input
          label="Date / तारीख"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSaved(false);
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              background: "#E8F5E9",
              borderRadius: 8,
              padding: "8px 12px",
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#2E7D32" }}>Present</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2E7D32" }}>
              {totalPresent}
            </div>
          </div>
          <div
            style={{
              background: "#FFEBEE",
              borderRadius: 8,
              padding: "8px 12px",
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#C62828" }}>Absent</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#C62828" }}>
              {totalAbsent}
            </div>
          </div>
          <div
            style={{
              background: "#FFF3E0",
              borderRadius: 8,
              padding: "8px 12px",
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#E65100" }}>Wages today</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#E65100" }}>
              {fmt(totalWages)}
            </div>
          </div>
        </div>
      </Card>

      {db.staff.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#9E9E9E",
            padding: 40,
            fontSize: 14,
          }}
        >
          Add staff first to mark attendance
        </div>
      )}

      {db.staff.map((s) => (
        <Card key={s.id} style={{ padding: "12px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <Avatar name={s.name} size={36} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                {s.role} · {fmt(s.dailyWage)}/day
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 5,
            }}
          >
            {statusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setMarks((m) => ({ ...m, [s.id]: opt }))}
                style={{
                  padding: "7px 4px",
                  borderRadius: 8,
                  border:
                    marks[s.id] === opt
                      ? "2px solid " + statusColor[opt]
                      : "1.5px solid #E0E0E0",
                  background:
                    marks[s.id] === opt ? statusColor[opt] + "15" : "#FAFAFA",
                  color: marks[s.id] === opt ? statusColor[opt] : "#616161",
                  fontSize: 10,
                  fontWeight: marks[s.id] === opt ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "Poppins",
                }}
              >
                {statusLabel[opt]}
              </button>
            ))}
          </div>
        </Card>
      ))}

      {db.staff.length > 0 && (
        <div style={{ position: "sticky", bottom: 72, padding: "8px 0" }}>
          <button
            onClick={save}
            style={{
              width: "100%",
              background: saved ? "#2E7D32" : "#1B3A6B",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Poppins",
            }}
          >
            {saved ? "✓ Attendance Saved" : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SALARY ───────────────────────────────────────────────────────────────────
function Salary({ db, update, isAdmin }) {
  const [month, setMonth] = useState(thisMonth());
  const [showAdvForm, setShowAdvForm] = useState(false);
  const [advForm, setAdvForm] = useState({
    staffId: "",
    amount: "",
    reason: "",
  });
  const [tab, setTab] = useState("wages");

  const addAdvance = () => {
    if (!advForm.staffId || !advForm.amount) return;
    const amt = +advForm.amount;
    update((d) => {
      const s = d.staff.find((x) => x.id === advForm.staffId);
      if (s) s.advance = (s.advance || 0) + amt;
      d.advances = d.advances || [];
      d.advances.push({
        id: "adv" + uid(),
        staffId: advForm.staffId,
        staffName: s?.name,
        amount: amt,
        reason: advForm.reason,
        date: today(),
      });
      return d;
    });
    setAdvForm({ staffId: "", amount: "", reason: "" });
    setShowAdvForm(false);
  };

  const wageData = db.staff.map((s) => {
    const att = db.attendance.filter(
      (a) => a.staffId === s.id && a.date.startsWith(month)
    );
    const present = att.filter((a) => a.status === "present").length;
    const half = att.filter((a) => a.status === "half").length;
    const gross = present * s.dailyWage + half * s.dailyWage * 0.5;
    const net = Math.max(0, gross - (s.advance || 0));
    return {
      ...s,
      present,
      half,
      absent: att.filter((a) => a.status === "absent").length,
      gross,
      net,
    };
  });

  const totalGross = wageData.reduce((s, w) => s + w.gross, 0);
  const totalNet = wageData.reduce((s, w) => s + w.net, 0);

  return (
    <div>
      <SectionTitle>Salary & Payments</SectionTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["wages", "advances", "project"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "#1B3A6B" : "#fff",
              color: tab === t ? "#fff" : "#616161",
              border: "1.5px solid " + (tab === t ? "#1B3A6B" : "#E0E0E0"),
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Poppins",
            }}
          >
            {t === "wages"
              ? "Wages"
              : t === "advances"
              ? "Advances"
              : "Project Payments"}
          </button>
        ))}
      </div>

      {tab === "wages" && (
        <div>
          <Input
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: 160 }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <MetricCard label="Total gross" value={fmt(totalGross)} icon="💰" />
            <MetricCard
              label="Total net payable"
              value={fmt(totalNet)}
              color="#2E7D32"
              icon="✓"
            />
          </div>
          {wageData.map((w) => (
            <Card key={w.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <Avatar name={w.name} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                    {w.role} · {fmt(w.dailyWage)}/day
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}
                  >
                    {fmt(w.net)}
                  </div>
                  <div style={{ fontSize: 10, color: "#9E9E9E" }}>
                    net payable
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 4,
                  fontSize: 11,
                }}
              >
                {[
                  ["Present", w.present, "#2E7D32"],
                  ["Half", w.half, "#E8A020"],
                  ["Absent", w.absent, "#C62828"],
                  ["Advance", fmt(w.advance || 0), "#E65100"],
                ].map(([l, v, c]) => (
                  <div
                    key={l}
                    style={{
                      background: "#F5F5F5",
                      borderRadius: 6,
                      padding: "5px 6px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ color: "#9E9E9E", fontSize: 10 }}>{l}</div>
                    <div style={{ fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {wageData.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#9E9E9E",
                padding: 32,
                fontSize: 14,
              }}
            >
              No staff added yet
            </div>
          )}
        </div>
      )}

      {tab === "advances" && (
        <div>
          {isAdmin && (
            <Btn
              onClick={() => setShowAdvForm(true)}
              style={{ marginBottom: 12 }}
            >
              + Record Advance
            </Btn>
          )}
          {showAdvForm && (
            <Card
              style={{ background: "#FFF8E1", border: "1.5px solid #E8A020" }}
            >
              <Select
                label="Staff member"
                value={advForm.staffId}
                onChange={(e) =>
                  setAdvForm((p) => ({ ...p, staffId: e.target.value }))
                }
              >
                <option value="">-- select --</option>
                {db.staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Amount (₹)"
                type="number"
                value={advForm.amount}
                onChange={(e) =>
                  setAdvForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
              <Input
                label="Reason"
                value={advForm.reason}
                onChange={(e) =>
                  setAdvForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="e.g. medical emergency"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={addAdvance} color="#E8A020">
                  Save
                </Btn>
                <Btn light onClick={() => setShowAdvForm(false)}>
                  Cancel
                </Btn>
              </div>
            </Card>
          )}
          {(db.advances || [])
            .slice()
            .reverse()
            .map((a) => (
              <Card
                key={a.id}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "#FFF3E0",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  💵
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {a.staffName}
                  </div>
                  <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                    {a.date} {a.reason ? "· " + a.reason : ""}
                  </div>
                </div>
                <div
                  style={{ fontWeight: 700, fontSize: 15, color: "#E65100" }}
                >
                  {fmt(a.amount)}
                </div>
              </Card>
            ))}
          {(db.advances || []).length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#9E9E9E",
                padding: 32,
                fontSize: 14,
              }}
            >
              No advances recorded
            </div>
          )}
        </div>
      )}

      {tab === "project" && (
        <div>
          {db.projects.map((p) => {
            const payments = p.payments || [];
            const total = payments.reduce((s, x) => s + x.amount, 0);
            return (
              <Card key={p.id}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#1B3A6B",
                    marginBottom: 4,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8 }}
                >
                  Budget: ₹{p.budgetLakh}L · Spent: {fmt(total)}
                </div>
                <div
                  style={{
                    background: "#F0F2F5",
                    borderRadius: 6,
                    height: 6,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width:
                        Math.min(100, (total / (p.budgetLakh * 100000)) * 100) +
                        "%",
                      height: "100%",
                      background:
                        total > p.budgetLakh * 100000 * 0.9
                          ? "#C62828"
                          : "#1B3A6B",
                      borderRadius: 6,
                    }}
                  />
                </div>
                {payments.slice(0, 3).map((pay) => (
                  <div
                    key={pay.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: "1px solid #F5F5F5",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#616161" }}>
                      {pay.paidTo} · {pay.category}
                    </span>
                    <span style={{ fontWeight: 600, color: "#C62828" }}>
                      {fmt(pay.amount)}
                    </span>
                  </div>
                ))}
                {payments.length > 3 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9E9E9E",
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    +{payments.length - 3} more payments
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── RENT ─────────────────────────────────────────────────────────────────────
function Rent({ db, update, isAdmin }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showReceive, setShowReceive] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "Shop",
    location: "",
    tenant: "",
    tenantPhone: "",
    rent: "",
    water: "0",
    elec: "Tenant pays own bill",
    dueDay: "5",
    staff: "",
  });
  const [recForm, setRecForm] = useState({
    amount: "",
    date: today(),
    month: thisMonth(),
    mode: "Cash",
    notes: "",
  });

  const addProp = () => {
    if (!form.name || !form.tenant) return;
    update((d) => {
      d.properties.push({
        ...form,
        id: "prop" + uid(),
        rent: +form.rent || 0,
        water: +form.water || 0,
        dueDay: +form.dueDay || 5,
        createdAt: today(),
      });
      return d;
    });
    setShowAdd(false);
    setForm({
      name: "",
      type: "Shop",
      location: "",
      tenant: "",
      tenantPhone: "",
      rent: "",
      water: "0",
      elec: "Tenant pays own bill",
      dueDay: "5",
      staff: "",
    });
  };

  const recordRent = (propId) => {
    if (!recForm.amount) return;
    update((d) => {
      d.rentRecords.push({
        ...recForm,
        id: "r" + uid(),
        propId,
        amount: +recForm.amount,
      });
      return d;
    });
    setRecForm({
      amount: "",
      date: today(),
      month: thisMonth(),
      mode: "Cash",
      notes: "",
    });
    setShowReceive(null);
  };

  const totalMonthlyRent = db.properties.reduce((s, p) => s + p.rent, 0);
  const totalReceived = db.properties.reduce((s, p) => {
    const paid = db.rentRecords
      .filter((r) => r.propId === p.id && r.month === thisMonth())
      .reduce((a, r) => a + r.amount, 0);
    return s + paid;
  }, 0);

  return (
    <div>
      <SectionTitle>Rent & Properties</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <MetricCard
          label="Expected this month"
          value={fmt(totalMonthlyRent)}
          icon="🏠"
        />
        <MetricCard
          label="Received this month"
          value={fmt(totalReceived)}
          color={totalReceived >= totalMonthlyRent ? "#2E7D32" : "#E65100"}
          icon="✓"
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1B3A6B" }}>
          {db.properties.length} Properties
        </div>
        {isAdmin && (
          <Btn small onClick={() => setShowAdd(true)}>
            + Add Property
          </Btn>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Property / Shop" onClose={() => setShowAdd(false)}>
          <Input
            label="Property name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Shop 3 — Hazratganj"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            {["Shop", "Flat", "Plot", "Office", "Godown"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Input
            label="Location"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="Area, Lucknow"
          />
          <Input
            label="Tenant name *"
            value={form.tenant}
            onChange={(e) => setForm((p) => ({ ...p, tenant: e.target.value }))}
          />
          <Input
            label="Tenant phone"
            type="tel"
            value={form.tenantPhone}
            onChange={(e) =>
              setForm((p) => ({ ...p, tenantPhone: e.target.value }))
            }
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <Input
              label="Monthly rent (₹)"
              type="number"
              value={form.rent}
              onChange={(e) => setForm((p) => ({ ...p, rent: e.target.value }))}
            />
            <Input
              label="Water charges (₹)"
              type="number"
              value={form.water}
              onChange={(e) =>
                setForm((p) => ({ ...p, water: e.target.value }))
              }
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <Input
              label="Rent due day"
              type="number"
              value={form.dueDay}
              onChange={(e) =>
                setForm((p) => ({ ...p, dueDay: e.target.value }))
              }
              placeholder="5"
            />
            <Select
              label="Electricity"
              value={form.elec}
              onChange={(e) => setForm((p) => ({ ...p, elec: e.target.value }))}
            >
              <option>Tenant pays own bill</option>
              <option>Fixed monthly</option>
              <option>Owner pays, recover from tenant</option>
            </Select>
          </div>
          <Input
            label="Assigned caretaker / staff"
            value={form.staff}
            onChange={(e) => setForm((p) => ({ ...p, staff: e.target.value }))}
            placeholder="Staff name"
          />
          <Btn onClick={addProp} style={{ width: "100%" }}>
            Add Property
          </Btn>
        </Modal>
      )}

      {showReceive && (
        <Modal
          title={
            "Record Rent — " +
            db.properties.find((p) => p.id === showReceive)?.name
          }
          onClose={() => setShowReceive(null)}
        >
          <Input
            label="Amount received (₹)"
            type="number"
            value={recForm.amount}
            onChange={(e) =>
              setRecForm((p) => ({ ...p, amount: e.target.value }))
            }
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <Input
              label="Date"
              type="date"
              value={recForm.date}
              onChange={(e) =>
                setRecForm((p) => ({ ...p, date: e.target.value }))
              }
            />
            <Input
              label="For month"
              type="month"
              value={recForm.month}
              onChange={(e) =>
                setRecForm((p) => ({ ...p, month: e.target.value }))
              }
            />
          </div>
          <Select
            label="Payment mode"
            value={recForm.mode}
            onChange={(e) =>
              setRecForm((p) => ({ ...p, mode: e.target.value }))
            }
          >
            {["Cash", "Online Transfer", "UPI", "Cheque"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
          <Input
            label="Notes"
            value={recForm.notes}
            onChange={(e) =>
              setRecForm((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Optional notes"
          />
          <Btn
            onClick={() => recordRent(showReceive)}
            color="#2E7D32"
            style={{ width: "100%" }}
          >
            ✓ Mark as Received
          </Btn>
        </Modal>
      )}

      {db.properties.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#9E9E9E",
            padding: 40,
            fontSize: 14,
          }}
        >
          No properties added yet
        </div>
      )}
      {db.properties.map((p) => {
        const paid = db.rentRecords
          .filter((r) => r.propId === p.id && r.month === thisMonth())
          .reduce((a, r) => a + r.amount, 0);
        const isPaid = paid >= p.rent;
        const isOverdue = !isPaid && new Date().getDate() > p.dueDay + 3;
        const lastRec = db.rentRecords
          .filter((r) => r.propId === p.id)
          .slice(-1)[0];
        const nextDue = new Date();
        nextDue.setDate(p.dueDay);
        if (nextDue < new Date()) nextDue.setMonth(nextDue.getMonth() + 1);
        return (
          <Card
            key={p.id}
            style={{
              borderLeft:
                "4px solid " +
                (isPaid ? "#2E7D32" : isOverdue ? "#C62828" : "#E8A020"),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: "#9E9E9E" }}>
                  {p.type} · {p.location}
                </div>
              </div>
              <Badge
                label={isPaid ? "✓ Paid" : isOverdue ? "Overdue" : "Pending"}
                color={isPaid ? "#2E7D32" : isOverdue ? "#C62828" : "#E8A020"}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 12, color: "#616161" }}>
                👤 {p.tenant}
              </div>
              {p.tenantPhone && (
                <a
                  href={"tel:" + p.tenantPhone}
                  style={{
                    fontSize: 12,
                    color: "#1565C0",
                    textDecoration: "none",
                  }}
                >
                  📞 {p.tenantPhone}
                </a>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  background: "#F0F2F5",
                  borderRadius: 8,
                  padding: "7px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: "#9E9E9E" }}>Rent</div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#1B3A6B" }}
                >
                  {fmt(p.rent)}
                </div>
              </div>
              <div
                style={{
                  background: "#F0F2F5",
                  borderRadius: 8,
                  padding: "7px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: "#9E9E9E" }}>Received</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isPaid ? "#2E7D32" : "#C62828",
                  }}
                >
                  {fmt(paid)}
                </div>
              </div>
              <div
                style={{
                  background: "#F0F2F5",
                  borderRadius: 8,
                  padding: "7px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: "#9E9E9E" }}>Due day</div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#1B3A6B" }}
                >
                  {p.dueDay}th
                </div>
              </div>
            </div>
            {lastRec && (
              <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 6 }}>
                Last payment: {lastRec.date} · Next due:{" "}
                {nextDue.toLocaleDateString("en-IN")}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {!isPaid && (
                <Btn small color="#2E7D32" onClick={() => setShowReceive(p.id)}>
                  ✓ Record Rent
                </Btn>
              )}
              <Btn
                small
                light
                onClick={() => {
                  const msg = `Dear ${p.tenant},\n\nYour rent of ${fmt(
                    p.rent
                  )} for ${p.name} is due on ${
                    p.dueDay
                  }th of this month.\n\nPlease arrange payment at your earliest convenience.\n\nRegards,\nTankish`;
                  navigator.clipboard
                    .writeText(msg)
                    .then(() =>
                      alert(
                        "Reminder message copied!\n\nPaste it in WhatsApp to send."
                      )
                    );
                }}
              >
                📋 Copy Reminder
              </Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── AI ASSISTANT ─────────────────────────────────────────────────────────────
function AIAssistant({ db, update, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const saved = localStorage.getItem("tankish-claude-key");
    if (saved) setApiKey(saved);
    else setShowKeyInput(true);
    if (db.chatHistory?.length) setMessages(db.chatHistory.slice(-30));
  }, []);

  const systemPrompt = `You are the AI assistant for Tankish, a real estate development firm in Lucknow, Uttar Pradesh. You help the owner and staff run the business.

Current data snapshot:
- Active projects: ${
    db.projects
      .map((p) => `${p.name} (${p.stage}, ${p.completionPct}% done)`)
      .join(", ") || "none"
  }
- Staff count: ${db.staff.length}
- Properties: ${db.properties.map((p) => p.name).join(", ") || "none"}

You are an expert in: project management, Lucknow real estate market, LDA/RERA compliance, construction execution, legal (UP jurisdiction), financial analysis (ROI, P&L, IRR), contractor management, and rent collection.

Always: be direct and action-oriented. Use ₹ for money. Keep answers concise for mobile reading. Give Lucknow-specific advice. Flag risks clearly with 🔴/🟡/🟢.`;

  const suggested = [
    "What are my biggest risks right now?",
    "I have a plot in Gomti Nagar, what should I build?",
    "Draft a rent reminder for my tenants",
    "How do I get RERA approval in Lucknow?",
    "Which project needs most attention today?",
  ];

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: newMessages.slice(-10),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply =
        data.content?.[0]?.text || "Sorry, I couldn't process that.";
      const updated = [...newMessages, { role: "assistant", content: reply }];
      setMessages(updated);
      update((d) => {
        d.chatHistory = updated.slice(-50);
        return d;
      });
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Error: " + e.message + "\n\nCheck your API key in settings.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 140px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <SectionTitle>✦ Tankish AI Assistant</SectionTitle>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small light onClick={() => setShowKeyInput(true)}>
            API Key
          </Btn>
          <Btn
            small
            light
            color="#C62828"
            onClick={() => {
              setMessages([]);
              update((d) => {
                d.chatHistory = [];
                return d;
              });
            }}
          >
            Clear
          </Btn>
        </div>
      </div>

      {showKeyInput && (
        <Card
          style={{
            background: "#E8F0FE",
            border: "1.5px solid #1B3A6B",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1B3A6B",
              marginBottom: 8,
            }}
          >
            Enter your Anthropic API Key
          </div>
          <div style={{ fontSize: 11, color: "#616161", marginBottom: 8 }}>
            Get it from console.anthropic.com — starts with "sk-ant-"
          </div>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            type="password"
          />
          <Btn
            onClick={() => {
              localStorage.setItem("tankish-claude-key", apiKey);
              setShowKeyInput(false);
            }}
            style={{ width: "100%" }}
          >
            Save Key
          </Btn>
        </Card>
      )}

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {messages.length === 0 && (
          <div>
            <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: "linear-gradient(135deg,#1B3A6B,#0D2547)",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  margin: "0 auto 10px",
                }}
              >
                ✦
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}>
                Tankish AI
              </div>
              <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 4 }}>
                Ask anything about your projects, staff, rent, legal, finance...
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {suggested.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#1B3A6B",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "Poppins",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            {m.role === "assistant" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "#1B3A6B",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#E8A020",
                  marginRight: 8,
                  flexShrink: 0,
                  alignSelf: "flex-end",
                }}
              >
                ✦
              </div>
            )}
            <div
              style={{
                maxWidth: "82%",
                background: m.role === "user" ? "#1B3A6B" : "#fff",
                color: m.role === "user" ? "#fff" : "#212121",
                borderRadius:
                  m.role === "user"
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                padding: "10px 14px",
                fontSize: 13,
                lineHeight: 1.6,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: "#1B3A6B",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#E8A020",
              }}
            >
              ✦
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "14px 14px 14px 4px",
                padding: "12px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#1B3A6B",
                    animation: "bounce 1.2s infinite",
                    animationDelay: i * 0.2 + "s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>

      <div
        style={{
          display: "flex",
          gap: 8,
          paddingTop: 8,
          borderTop: "1px solid #E0E0E0",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask anything about Tankish..."
          style={{
            flex: 1,
            padding: "11px 14px",
            borderRadius: 10,
            border: "1.5px solid #E0E0E0",
            fontSize: 13,
            outline: "none",
            fontFamily: "Poppins",
            background: "#FAFAFA",
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            width: 44,
            height: 44,
            background: "#1B3A6B",
            border: "none",
            borderRadius: 10,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: 18,
            color: "#fff",
            opacity: loading || !input.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
