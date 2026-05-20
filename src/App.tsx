import { useState, useEffect, useRef, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import { supabase } from "./supabase-client";
import type { Profile, Project, ProjectUpdate, ProjectDocument, ProjectPayment, StaffMember, AttendanceRecord, Advance, Task, Property, RentRecord } from "./supabase-client";
import type { User, Session } from "@supabase/supabase-js";

// ─── UTILS ────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];
const MONTH = new Date().toISOString().slice(0, 7);
const fmt = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const inits = (n: string) => (n || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
const CLRS = ["#1B3A6B","#C0392B","#16A085","#8E44AD","#D35400","#27AE60","#2980B9","#E8A020"];
const clr = (s: string) => CLRS[(s || "").split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % CLRS.length];
const ROLES = ["Mason","Helper","Electrician","Plumber","Carpenter","Supervisor","Security","Driver","Office Staff","Manager"];
const urgClr = (u: string) => u === "Critical" ? "#C62828" : u === "Moderate" ? "#E65100" : "#2E7D32";
const stgClr = (s: string) => ({"Pre-Deal":"#7B1FA2","Pre-Construction":"#1565C0","Under Construction":"#E65100","Near Completion":"#2E7D32","Completed":"#424242"} as Record<string,string>)[s] || "#616161";

// ─── SHARED UI ────────────────────────────────────────────────
const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", ...style }}>{children}</div>
);
const Metric = ({ label, val, color = "#1B3A6B", icon }: { label: string; val: string | number; color?: string; icon: string }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flex: 1 }}>
    <div style={{ fontSize: 10, color: "#9E9E9E", marginBottom: 3 }}>{icon} {label}</div>
    <div style={{ fontSize: 19, fontWeight: 700, color }}>{val}</div>
  </div>
);
const Bdg = ({ label, color = "#1B3A6B" }: { label: string; color?: string }) => (
  <span style={{ background: color + "18", color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" as const }}>{label}</span>
);
const Ttl = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 14, fontWeight: 700, color: "#1B3A6B", marginBottom: 10, marginTop: 4, borderLeft: "3px solid #E8A020", paddingLeft: 8 }}>{children}</div>
);
const Inp = ({ label, ...p }: { label?: string; [key: string]: any }) => (
  <div style={{ marginBottom: 10 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 600, color: "#616161", marginBottom: 4 }}>{label}</div>}
    <input {...p} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E0E0E0", fontSize: 13, outline: "none", background: "#FAFAFA", fontFamily: "Poppins, sans-serif", ...(p.style || {}) }} />
  </div>
);
const Sel = ({ label, children, ...p }: { label?: string; children: React.ReactNode; [key: string]: any }) => (
  <div style={{ marginBottom: 10 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 600, color: "#616161", marginBottom: 4 }}>{label}</div>}
    <select {...p} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E0E0E0", fontSize: 13, outline: "none", background: "#FAFAFA", fontFamily: "Poppins, sans-serif" }}>{children}</select>
  </div>
);
const Txta = ({ label, ...p }: { label?: string; [key: string]: any }) => (
  <div style={{ marginBottom: 10 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 600, color: "#616161", marginBottom: 4 }}>{label}</div>}
    <textarea {...p} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E0E0E0", fontSize: 13, outline: "none", background: "#FAFAFA", resize: "vertical" as const, minHeight: 70, fontFamily: "Poppins, sans-serif", ...(p.style || {}) }} />
  </div>
);
const Btn = ({ children, onClick, color = "#1B3A6B", light, sm, disabled, style = {} }: { children: React.ReactNode; onClick?: () => void; color?: string; light?: boolean; sm?: boolean; disabled?: boolean; style?: React.CSSProperties }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: light ? color + "15" : color, color: light ? color : "#fff", border: "none", borderRadius: 8, padding: sm ? "6px 12px" : "10px 18px", fontSize: sm ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "Poppins, sans-serif", ...style }}>
    {children}
  </button>
);
const Ava = ({ name, size = 36 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: clr(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{inits(name)}</div>
);
const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 18px", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1B3A6B" }}>{title}</div>
        <button onClick={onClose} style={{ background: "#F5F5F5", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);
const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #E0E0E0", borderTopColor: "#1B3A6B", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── AUTH / LOGIN ─────────────────────────────────────────────
function Login() {
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Enter email and password"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password || !name) { setError("Name, email and password are required"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, phone, role: "staff" } }
    });
    if (error) setError(error.message);
    else setMsg("Account created! You can now sign in.");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1B3A6B 0%,#0D2547 65%,#071A35 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Poppins, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, background: "#1B3A6B", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#E8A020", margin: "0 auto 12px" }}>T</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1B3A6B" }}>Tankish Ops</div>
          <div style={{ fontSize: 12, color: "#9E9E9E" }}>Lucknow Real Estate · Staff App</div>
        </div>
        <div style={{ display: "flex", background: "#F0F2F5", borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m as any); setError(""); setMsg(""); }} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, background: mode === m ? "#fff" : "transparent", fontWeight: mode === m ? 700 : 500, color: mode === m ? "#1B3A6B" : "#9E9E9E", cursor: "pointer", fontSize: 13, fontFamily: "Poppins, sans-serif", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>
        {mode === "signup" && (
          <>
            <Inp label="Full name *" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Your name" />
            <Inp label="Phone" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="98XXXXXXXX" />
          </>
        )}
        <Inp label="Email *" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="your@email.com" />
        <Inp label="Password *" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder={mode === "login" ? "Your password" : "Min 6 characters"} onKeyDown={(e: any) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
        {error && <div style={{ color: "#C62828", fontSize: 12, background: "#FFEBEE", padding: "8px 12px", borderRadius: 8, marginBottom: 10 }}>{error}</div>}
        {msg && <div style={{ color: "#2E7D32", fontSize: 12, background: "#E8F5E9", padding: "8px 12px", borderRadius: 8, marginBottom: 10 }}>{msg}</div>}
        <Btn onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </Btn>
        {mode === "login" && <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#BDBDBD" }}>Ask admin to create your account if you don't have one</div>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard({ profile, projects, staff, properties, rentRecords, setTab }: { profile: Profile; projects: Project[]; staff: StaffMember[]; properties: Property[]; rentRecords: RentRecord[]; setTab: (t: string) => void }) {
  const active = projects.filter(p => p.stage !== "Completed").length;
  const activeStaff = staff.filter(s => s.status === "Active").length;
  const rentDue = properties.reduce((sum, p) => {
    const paid = rentRecords.filter(r => r.property_id === p.id && r.month === MONTH).reduce((a, r) => a + r.amount, 0);
    return sum + Math.max(0, p.monthly_rent - paid);
  }, 0);
  const overdue = properties.filter(p => {
    const paid = rentRecords.filter(r => r.property_id === p.id && r.month === MONTH).reduce((a, r) => a + r.amount, 0);
    return paid < p.monthly_rent && new Date().getDate() > p.due_day + 3;
  }).length;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1B3A6B" }}>नमस्ते {profile.name.split(" ")[0]} 🙏</div>
        <div style={{ fontSize: 12, color: "#9E9E9E" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Metric label="Active Projects" val={active} icon="🏗" />
        <Metric label="Active Staff" val={activeStaff} icon="👷" />
        <Metric label="Rent Pending" val={fmt(rentDue)} color={rentDue > 0 ? "#E65100" : "#2E7D32"} icon="🏠" />
        <Metric label="Overdue Rent" val={overdue} color={overdue > 0 ? "#C62828" : "#2E7D32"} icon="⚠️" />
      </div>
      {overdue > 0 && (
        <div style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", gap: 10, alignItems: "center" }}>
          <span>🔴</span>
          <div><div style={{ fontSize: 13, fontWeight: 600, color: "#C62828" }}>Rent overdue on {overdue} propert{overdue > 1 ? "ies" : "y"}</div><div style={{ fontSize: 11, color: "#E53935" }}>Follow up immediately</div></div>
        </div>
      )}
      <Ttl>Quick Actions</Ttl>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {([["🏗","Site Update","proj"],["📋","Attendance","att"],["₹","Salary","sal"],["🏠","Rent","rent"]] as [string,string,string][]).map(([icon, label, t]) => (
          <button key={label} onClick={() => setTab(t)} style={{ background: "#fff", border: "1.5px solid #E8E8E8", borderRadius: 12, padding: "14px 10px", cursor: "pointer", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", fontFamily: "Poppins, sans-serif" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1B3A6B" }}>{label}</div>
          </button>
        ))}
      </div>
      <Ttl>Projects Overview</Ttl>
      {projects.map(p => (
        <div key={p.id} onClick={() => setTab("proj")} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>{p.name}</div>
            <Bdg label={p.urgency} color={urgClr(p.urgency)} />
          </div>
          <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 8 }}>{p.location}</div>
          <div style={{ background: "#F0F2F5", borderRadius: 6, height: 7 }}><div style={{ width: p.completion_pct + "%", height: "100%", background: "#1B3A6B", borderRadius: 6 }} /></div>
          <div style={{ fontSize: 11, color: "#9E9E9E", marginTop: 4 }}>{p.completion_pct}% · {p.next_action}</div>
        </div>
      ))}
      <button onClick={() => setTab("ai")} style={{ width: "100%", background: "linear-gradient(135deg,#1B3A6B,#0D2547)", color: "#fff", border: "none", borderRadius: 14, padding: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontFamily: "Poppins, sans-serif" }}>
        <div style={{ width: 38, height: 38, background: "#E8A020", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✦</div>
        <div style={{ textAlign: "left" as const, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Tankish AI Assistant</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Projects, legal, finance, rent — ask anything</div>
        </div>
        <span style={{ fontSize: 18, opacity: 0.7 }}>→</span>
      </button>
    </div>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────
function Projects({ profile }: { profile: Profile }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState<string | null>(null);
  const [pTab, setPTab] = useState("updates");
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpd, setShowUpd] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const isAdmin = profile.role === "admin";
  const isAdminOrManager = ["admin","manager"].includes(profile.role);

  const [pf, setPf] = useState({ name:"", location:"", type:"Residential Apartment", stage:"Pre-Construction", urgency:"Routine", plot_size:"", budget_lakh:"", revenue_lakh:"", rera_status:"Not Applied", lda_status:"Not Applied", notes:"", key_risk:"", next_action:"" });
  const [uf, setUf] = useState({ work_done:"", materials:"", issues:"", completion_pct:"" });
  const [payf, setPayf] = useState({ paid_to:"", amount:"", category:"Materials", description:"", date:TODAY });

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false }).then(({ data }) => { if (data) setProjects(data); setLoading(false); });
  }, []);

  const loadProjectData = async (id: string) => {
    const [u, d, p] = await Promise.all([
      supabase.from("project_updates").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_documents").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_payments").select("*").eq("project_id", id).order("date", { ascending: false })
    ]);
    if (u.data) setUpdates(u.data);
    if (d.data) setDocuments(d.data);
    if (p.data) setPayments(p.data);
  };

  const addProject = async () => {
    if (!pf.name) return;
    const { data } = await supabase.from("projects").insert({ ...pf, budget_lakh: +pf.budget_lakh||0, revenue_lakh: +pf.revenue_lakh||0, completion_pct: 0 }).select().single();
    if (data) setProjects(prev => [data, ...prev]);
    setShowAdd(false); setPf({ name:"", location:"", type:"Residential Apartment", stage:"Pre-Construction", urgency:"Routine", plot_size:"", budget_lakh:"", revenue_lakh:"", rera_status:"Not Applied", lda_status:"Not Applied", notes:"", key_risk:"", next_action:"" });
  };

  const addUpdate = async () => {
    if (!uf.work_done || !selId) return;
    const pct = +uf.completion_pct || proj!.completion_pct;
    const { data } = await supabase.from("project_updates").insert({ project_id: selId, user_id: profile.id, work_done: uf.work_done, materials: uf.materials, issues: uf.issues, completion_pct: pct, date: TODAY }).select().single();
    if (data) { setUpdates(prev => [data, ...prev]); await supabase.from("projects").update({ completion_pct: pct }).eq("id", selId); setProjects(prev => prev.map(p => p.id === selId ? { ...p, completion_pct: pct } : p)); }
    setUf({ work_done:"", materials:"", issues:"", completion_pct:"" }); setShowUpd(false);
  };

  const addPayment = async () => {
    if (!payf.paid_to || !payf.amount || !selId) return;
    const { data } = await supabase.from("project_payments").insert({ project_id: selId, ...payf, amount: +payf.amount }).select().single();
    if (data) setPayments(prev => [data, ...prev]);
    setPayf({ paid_to:"", amount:"", category:"Materials", description:"", date:TODAY }); setShowPay(false);
  };

  const uploadDoc = async (file: File) => {
    if (!selId) return;
    const path = `${profile.id}/${selId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("project-docs").upload(path, file);
    if (error) { alert("Upload failed: " + error.message); return; }
    const { data: urlData } = supabase.storage.from("project-docs").getPublicUrl(path);
    const { data } = await supabase.from("project_documents").insert({ project_id: selId, user_id: profile.id, name: file.name, file_url: urlData.publicUrl, file_path: path, category: "Other", size: file.size, date: TODAY }).select().single();
    if (data) setDocuments(prev => [...prev, data]);
  };

  const proj = projects.find(p => p.id === selId);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  if (loading) return <Spinner />;

  if (selId && proj) return (
    <div>
      <button onClick={() => setSelId(null)} style={{ background: "none", border: "none", color: "#1B3A6B", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 12, padding: 0, fontFamily: "Poppins, sans-serif" }}>← Back</button>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div><div style={{ fontWeight: 700, fontSize: 16, color: "#1B3A6B" }}>{proj.name}</div><div style={{ fontSize: 11, color: "#9E9E9E" }}>{proj.location}</div></div>
          <Bdg label={proj.stage} color={stgClr(proj.stage)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9E9E9E", marginBottom: 4 }}><span>Completion</span><span style={{ fontWeight: 700, color: "#1B3A6B" }}>{proj.completion_pct}%</span></div>
        <div style={{ background: "#F0F2F5", borderRadius: 6, height: 8, marginBottom: 10 }}><div style={{ width: proj.completion_pct + "%", height: "100%", background: "#1B3A6B", borderRadius: 6 }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {([["Budget","₹"+proj.budget_lakh+"L","#1B3A6B"],["Spent",fmt(totalPaid),totalPaid>proj.budget_lakh*90000?"#C62828":"#2E7D32"],["Target","₹"+proj.revenue_lakh+"L","#1B3A6B"]] as [string,string,string][]).map(([l,v,c])=>(
            <div key={l} style={{ background:"#F0F2F5",borderRadius:8,padding:"8px",textAlign:"center" as const }}><div style={{ fontSize:10,color:"#9E9E9E"}}>{l}</div><div style={{ fontSize:13,fontWeight:700,color:c}}>{v}</div></div>
          ))}
        </div>
        {proj.key_risk && <div style={{ marginTop: 8, background: "#FFF3E0", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#E65100" }}>⚠️ {proj.key_risk}</div>}
        {proj.next_action && <div style={{ marginTop: 6, background: "#E8F5E9", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#2E7D32" }}>→ {proj.next_action}</div>}
      </Card>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {["updates","documents","payments","info"].map(t => (
          <button key={t} onClick={() => setPTab(t)} style={{ background: pTab===t?"#1B3A6B":"#fff", color: pTab===t?"#fff":"#616161", border: "1.5px solid "+(pTab===t?"#1B3A6B":"#E0E0E0"), borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Poppins, sans-serif" }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      {pTab === "updates" && (
        <div>
          {isAdminOrManager && <Btn onClick={() => setShowUpd(true)} style={{ marginBottom: 12 }}>+ Add Update</Btn>}
          {showUpd && (
            <div style={{ background: "#F0F4FF", border: "1.5px solid #1B3A6B", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
              <Txta label="Work done today *" value={uf.work_done} onChange={(e: any) => setUf(p => ({ ...p, work_done: e.target.value }))} placeholder="What was completed..." />
              <Txta label="Materials used" value={uf.materials} onChange={(e: any) => setUf(p => ({ ...p, materials: e.target.value }))} style={{ minHeight: 50 }} />
              <Txta label="Issues / problems" value={uf.issues} onChange={(e: any) => setUf(p => ({ ...p, issues: e.target.value }))} style={{ minHeight: 50 }} />
              <Inp label="Completion % after today" type="number" value={uf.completion_pct} onChange={(e: any) => setUf(p => ({ ...p, completion_pct: e.target.value }))} placeholder={proj.completion_pct+""} style={{ width: 130 }} />
              <div style={{ display: "flex", gap: 8 }}><Btn onClick={addUpdate}>Save Update</Btn><Btn light onClick={() => setShowUpd(false)}>Cancel</Btn></div>
            </div>
          )}
          {updates.length === 0 && <div style={{ textAlign: "center", color: "#9E9E9E", padding: 28, fontSize: 13 }}>No updates yet</div>}
          {updates.map(u => (
            <div key={u.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1B3A6B", background: "#E8F0FE", padding: "3px 8px", borderRadius: 6 }}>{u.date}</span>
                <span style={{ fontSize: 11, color: "#9E9E9E" }}>{u.completion_pct}%</span>
              </div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>{u.work_done}</div>
              {u.materials && <div style={{ fontSize: 12, color: "#616161", background: "#F5F5F5", borderRadius: 6, padding: "5px 8px", marginBottom: 4 }}>📦 {u.materials}</div>}
              {u.issues && <div style={{ fontSize: 12, color: "#C62828", background: "#FFEBEE", borderRadius: 6, padding: "5px 8px" }}>⚠️ {u.issues}</div>}
            </div>
          ))}
        </div>
      )}
      {pTab === "documents" && (
        <div>
          <div style={{ border: "2px dashed #E0E0E0", borderRadius: 14, padding: 28, textAlign: "center", marginBottom: 12, background: "#FAFAFA" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#616161", marginBottom: 4 }}>Upload Documents</div>
            <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 12 }}>Stored securely in Supabase · Floor plans, approvals, contracts</div>
            <input type="file" id="docup" multiple style={{ display: "none" }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { Array.from(e.target.files || []).forEach(f => uploadDoc(f)); e.target.value = ""; }} />
            <label htmlFor="docup" style={{ background: "#1B3A6B", color: "#fff", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Choose Files</label>
          </div>
          {documents.map(doc => (
            <div key={doc.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>{doc.name.match(/\.(jpg|png|gif|jpeg)/i) ? "🖼" : doc.name.match(/\.pdf/i) ? "📄" : "📎"}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div><div style={{ fontSize: 11, color: "#9E9E9E" }}>{doc.date}</div></div>
              <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ background: "#E8F0FE", color: "#1B3A6B", fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 6, textDecoration: "none" }}>↓</a>
            </div>
          ))}
        </div>
      )}
      {pTab === "payments" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <Metric label="Total paid" val={fmt(totalPaid)} icon="💸" />
            <Metric label="Budget left" val={fmt(proj.budget_lakh * 100000 - totalPaid)} color="#2E7D32" icon="💰" />
          </div>
          {isAdmin && <Btn onClick={() => setShowPay(true)} style={{ marginBottom: 12 }}>+ Record Payment</Btn>}
          {showPay && (
            <div style={{ background: "#F0F4FF", border: "1.5px solid #1B3A6B", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
              <Inp label="Paid to *" value={payf.paid_to} onChange={(e: any) => setPayf(p => ({ ...p, paid_to: e.target.value }))} />
              <Inp label="Amount (₹) *" type="number" value={payf.amount} onChange={(e: any) => setPayf(p => ({ ...p, amount: e.target.value }))} />
              <Sel label="Category" value={payf.category} onChange={(e: any) => setPayf(p => ({ ...p, category: e.target.value }))}>
                {["RCC / Structure","Labour Wages","Materials","Electrical","Plumbing","Finishing","Contractor Milestone","Approval Fees","Misc"].map(c => <option key={c}>{c}</option>)}
              </Sel>
              <Inp label="Description" value={payf.description} onChange={(e: any) => setPayf(p => ({ ...p, description: e.target.value }))} />
              <Inp label="Date" type="date" value={payf.date} onChange={(e: any) => setPayf(p => ({ ...p, date: e.target.value }))} />
              <div style={{ display: "flex", gap: 8 }}><Btn onClick={addPayment}>Save</Btn><Btn light onClick={() => setShowPay(false)}>Cancel</Btn></div>
            </div>
          )}
          {payments.map(p => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{p.paid_to}</div><div style={{ fontSize: 11, color: "#9E9E9E" }}>{p.date} · <Bdg label={p.category} color="#616161" /></div>{p.description && <div style={{ fontSize: 11, color: "#616161", marginTop: 2 }}>{p.description}</div>}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#C62828", whiteSpace: "nowrap" }}>{fmt(p.amount)}</div>
            </div>
          ))}
        </div>
      )}
      {pTab === "info" && (
        <Card>
          {([["Plot size", proj.plot_size], ["RERA", proj.rera_status], ["LDA", proj.lda_status], ["Type", proj.type], ["Notes", proj.notes], ["Created", proj.created_at?.split("T")[0]]] as [string,string][]).map(([k,v]) => v ? (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F5F5F5", fontSize: 13 }}>
              <span style={{ color: "#9E9E9E", fontWeight: 600 }}>{k}</span>
              <span style={{ color: "#212121", textAlign: "right", maxWidth: "60%" }}>{v}</span>
            </div>
          ) : null)}
        </Card>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Ttl>Projects</Ttl>
        {isAdminOrManager && <Btn sm onClick={() => setShowAdd(true)}>+ New</Btn>}
      </div>
      {showAdd && (
        <Modal title="New Project" onClose={() => setShowAdd(false)}>
          <Inp label="Project name *" value={pf.name} onChange={(e: any) => setPf(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Indira Nagar Phase 2" />
          <Inp label="Location" value={pf.location} onChange={(e: any) => setPf(p => ({ ...p, location: e.target.value }))} placeholder="Area, Lucknow" />
          <Sel label="Type" value={pf.type} onChange={(e: any) => setPf(p => ({ ...p, type: e.target.value }))}>{["Residential Apartment","Villa","Commercial","Mixed Use","Plot Development","Farmhouse"].map(t => <option key={t}>{t}</option>)}</Sel>
          <Sel label="Stage" value={pf.stage} onChange={(e: any) => setPf(p => ({ ...p, stage: e.target.value }))}>{["Pre-Deal","Pre-Construction","Under Construction","Near Completion","Completed"].map(t => <option key={t}>{t}</option>)}</Sel>
          <Sel label="Urgency" value={pf.urgency} onChange={(e: any) => setPf(p => ({ ...p, urgency: e.target.value }))}>{["Routine","Moderate","Critical"].map(t => <option key={t}>{t}</option>)}</Sel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Inp label="Budget (₹ lakh)" type="number" value={pf.budget_lakh} onChange={(e: any) => setPf(p => ({ ...p, budget_lakh: e.target.value }))} />
            <Inp label="Revenue target" type="number" value={pf.revenue_lakh} onChange={(e: any) => setPf(p => ({ ...p, revenue_lakh: e.target.value }))} />
          </div>
          <Inp label="Plot size" value={pf.plot_size} onChange={(e: any) => setPf(p => ({ ...p, plot_size: e.target.value }))} placeholder="e.g. 2400 sq ft" />
          <Inp label="Key risk" value={pf.key_risk} onChange={(e: any) => setPf(p => ({ ...p, key_risk: e.target.value }))} placeholder="e.g. Monsoon delay" />
          <Inp label="Next action" value={pf.next_action} onChange={(e: any) => setPf(p => ({ ...p, next_action: e.target.value }))} />
          <Txta label="Notes" value={pf.notes} onChange={(e: any) => setPf(p => ({ ...p, notes: e.target.value }))} />
          <Btn onClick={addProject} style={{ width: "100%", justifyContent: "center" }}>Create Project</Btn>
        </Modal>
      )}
      {projects.length === 0 && <div style={{ textAlign: "center", color: "#9E9E9E", padding: 40, fontSize: 14 }}>No projects yet</div>}
      {projects.map(p => (
        <div key={p.id} onClick={() => { setSelId(p.id); setPTab("updates"); loadProjectData(p.id); }} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>{p.name}</div><Bdg label={p.urgency} color={urgClr(p.urgency)} /></div>
          <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 8 }}>{p.location} · {p.type}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" as const }}><Bdg label={p.stage} color={stgClr(p.stage)} /><Bdg label={"₹"+p.budget_lakh+"L"} color="#616161" /></div>
          <div style={{ background: "#F0F2F5", borderRadius: 6, height: 7 }}><div style={{ width: p.completion_pct+"%", height: "100%", background: "#1B3A6B", borderRadius: 6 }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9E9E9E", marginTop: 4 }}><span>{p.completion_pct}% complete</span></div>
        </div>
      ))}
    </div>
  );
}

// ─── STAFF ────────────────────────────────────────────────────
function Staff({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<StaffMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [sf, setSf] = useState({ name:"", role:"Mason", phone:"", daily_wage:"", project_id:"", status:"Active" });
  const [tf, setTf] = useState({ title:"", description:"", priority:"Medium", due_date:"" });
  const isAdminOrManager = ["admin","manager"].includes(profile.role);

  useEffect(() => {
    Promise.all([
      supabase.from("staff").select("*").order("name"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false })
    ]).then(([s, t]) => { if (s.data) setStaff(s.data); if (t.data) setTasks(t.data); setLoading(false); });
  }, []);

  const addStaff = async () => {
    if (!sf.name) return;
    const { data } = await supabase.from("staff").insert({ ...sf, daily_wage: +sf.daily_wage||0, advance: 0, project_id: sf.project_id||null }).select().single();
    if (data) setStaff(prev => [...prev, data]);
    setShowAdd(false); setSf({ name:"", role:"Mason", phone:"", daily_wage:"", project_id:"", status:"Active" });
  };

  const addTask = async () => {
    if (!tf.title || !sel) return;
    const { data } = await supabase.from("tasks").insert({ ...tf, assigned_to: sel.id, project_id: sel.project_id||null, created_by: profile.id, status: "To Do" }).select().single();
    if (data) setTasks(prev => [data, ...prev]);
    setTf({ title:"", description:"", priority:"Medium", due_date:"" }); setShowTask(false);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: status as any } : t));
  };

  if (loading) return <Spinner />;

  const s = staff.find(x => x.id === sel?.id);
  if (sel && s) {
    const myTasks = tasks.filter(t => t.assigned_to === s.id);
    return (
      <div>
        <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: "#1B3A6B", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 12, padding: 0, fontFamily: "Poppins, sans-serif" }}>← Back to Staff</button>
        <Card>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
            <Ava name={s.name} size={52} />
            <div><div style={{ fontWeight: 700, fontSize: 16, color: "#1B3A6B" }}>{s.name}</div><div style={{ fontSize: 12, color: "#9E9E9E" }}>{s.role}</div><div style={{ fontSize: 12, color: "#1B3A6B" }}>📞 {s.phone}</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "#F0F2F5", borderRadius: 8, padding: 10, textAlign: "center" as const }}><div style={{ fontSize: 10, color: "#9E9E9E" }}>Daily wage</div><div style={{ fontSize: 15, fontWeight: 700, color: "#1B3A6B" }}>{fmt(s.daily_wage)}</div></div>
            <div style={{ background: "#FFF3E0", borderRadius: 8, padding: 10, textAlign: "center" as const }}><div style={{ fontSize: 10, color: "#E65100" }}>Advance</div><div style={{ fontSize: 15, fontWeight: 700, color: "#E65100" }}>{fmt(s.advance)}</div></div>
          </div>
        </Card>
        <Ttl>Assigned Tasks</Ttl>
        {isAdminOrManager && <Btn sm onClick={() => setShowTask(true)} style={{ marginBottom: 10 }}>+ Assign Task</Btn>}
        {showTask && (
          <div style={{ background: "#F0F4FF", border: "1.5px solid #1B3A6B", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            <Inp label="Task title *" value={tf.title} onChange={(e: any) => setTf(p => ({ ...p, title: e.target.value }))} />
            <Txta label="Details" value={tf.description} onChange={(e: any) => setTf(p => ({ ...p, description: e.target.value }))} style={{ minHeight: 50 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Sel label="Priority" value={tf.priority} onChange={(e: any) => setTf(p => ({ ...p, priority: e.target.value }))}>{["High","Medium","Low"].map(x => <option key={x}>{x}</option>)}</Sel>
              <Inp label="Due date" type="date" value={tf.due_date} onChange={(e: any) => setTf(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 8 }}><Btn onClick={addTask}>Assign</Btn><Btn light onClick={() => setShowTask(false)}>Cancel</Btn></div>
          </div>
        )}
        {myTasks.map(t => (
          <div key={t.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid "+(t.priority==="High"?"#C62828":t.priority==="Medium"?"#E8A020":"#2E7D32") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
              <select value={t.status} onChange={(e) => updateTaskStatus(t.id, e.target.value)} style={{ fontSize: 11, border: "1px solid #E0E0E0", borderRadius: 6, padding: "3px 6px", fontFamily: "Poppins, sans-serif" }}>
                {["To Do","In Progress","Done","Blocked"].map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
            {t.description && <div style={{ fontSize: 12, color: "#616161" }}>{t.description}</div>}
            {t.due_date && <div style={{ fontSize: 11, color: "#9E9E9E", marginTop: 4 }}>Due: {t.due_date}</div>}
          </div>
        ))}
        {myTasks.length === 0 && <div style={{ textAlign: "center", color: "#9E9E9E", fontSize: 13, padding: 16 }}>No tasks assigned</div>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Ttl>Staff Roster</Ttl>
        {isAdminOrManager && <Btn sm onClick={() => setShowAdd(true)}>+ Add Staff</Btn>}
      </div>
      {showAdd && (
        <Modal title="Add Staff Member" onClose={() => setShowAdd(false)}>
          <Inp label="Full name *" value={sf.name} onChange={(e: any) => setSf(p => ({ ...p, name: e.target.value }))} />
          <Sel label="Role" value={sf.role} onChange={(e: any) => setSf(p => ({ ...p, role: e.target.value }))}>{ROLES.map(r => <option key={r}>{r}</option>)}</Sel>
          <Inp label="Phone" type="tel" value={sf.phone} onChange={(e: any) => setSf(p => ({ ...p, phone: e.target.value }))} placeholder="98XXXXXXXX" />
          <Inp label="Daily wage (₹)" type="number" value={sf.daily_wage} onChange={(e: any) => setSf(p => ({ ...p, daily_wage: e.target.value }))} />
          <Sel label="Assign to project" value={sf.project_id} onChange={(e: any) => setSf(p => ({ ...p, project_id: e.target.value }))}>
            <option value="">-- No project --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Sel>
          <Btn onClick={addStaff} style={{ width: "100%", justifyContent: "center" }}>Add to Roster</Btn>
        </Modal>
      )}
      {staff.length === 0 && <div style={{ textAlign: "center", color: "#9E9E9E", padding: 40, fontSize: 14 }}>No staff added yet</div>}
      {staff.map(s => {
        const proj = projects.find(p => p.id === s.project_id);
        const pending = tasks.filter(t => t.assigned_to === s.id && t.status !== "Done").length;
        return (
          <div key={s.id} onClick={() => setSel(s)} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <Ava name={s.name} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "#9E9E9E" }}>{s.role}{proj ? " · "+proj.name : ""}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" as const }}>
                <Bdg label={fmt(s.daily_wage)+"/day"} color="#616161" />
                {s.advance > 0 && <Bdg label={"Adv: "+fmt(s.advance)} color="#E65100" />}
                {pending > 0 && <Bdg label={pending+" task"+(pending>1?"s":"")} color="#1565C0" />}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 4 }}>
              <Bdg label={s.status} color={s.status==="Active"?"#2E7D32":"#9E9E9E"} />
              <span style={{ fontSize: 16, color: "#BDBDBD" }}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────
function Attendance({ profile }: { profile: Profile }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [date, setDate] = useState(TODAY);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isAdminOrManager = ["admin","manager"].includes(profile.role);

  useEffect(() => { supabase.from("staff").select("*").eq("status","Active").order("name").then(({ data }) => { if (data) setStaff(data); }); }, []);

  useEffect(() => {
    if (!staff.length) return;
    supabase.from("attendance").select("*").eq("date", date).then(({ data }) => {
      const m: Record<string, string> = {};
      staff.forEach(s => { const r = data?.find(a => a.staff_id === s.id); m[s.id] = r?.status || "present"; });
      setMarks(m); setSaved(!!data?.length);
    });
  }, [date, staff.length]);

  const opts = ["present","half","absent","leave"];
  const lbl: Record<string, string> = { present:"Present ✓", half:"Half Day", absent:"Absent", leave:"Leave" };
  const clrMap: Record<string, string> = { present:"#2E7D32", half:"#E8A020", absent:"#C62828", leave:"#1565C0" };
  const wages = staff.reduce((s, st) => s + (marks[st.id]==="present" ? st.daily_wage : marks[st.id]==="half" ? st.daily_wage*0.5 : 0), 0);

  const save = async () => {
    setSaving(true);
    const records = staff.map(s => ({ staff_id: s.id, date, status: marks[s.id]||"present", marked_by: profile.id }));
    await supabase.from("attendance").upsert(records, { onConflict: "staff_id,date" });
    setSaved(true); setSaving(false);
  };

  return (
    <div>
      <Ttl>Attendance / उपस्थिति</Ttl>
      <Card>
        <Inp label="Date" type="date" value={date} onChange={(e: any) => { setDate(e.target.value); setSaved(false); }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div style={{ background:"#E8F5E9",borderRadius:8,padding:8,textAlign:"center" as const }}><div style={{ fontSize:10,color:"#2E7D32"}}>Present</div><div style={{ fontSize:18,fontWeight:700,color:"#2E7D32"}}>{Object.values(marks).filter(v=>v==="present").length}</div></div>
          <div style={{ background:"#FFEBEE",borderRadius:8,padding:8,textAlign:"center" as const }}><div style={{ fontSize:10,color:"#C62828"}}>Absent</div><div style={{ fontSize:18,fontWeight:700,color:"#C62828"}}>{Object.values(marks).filter(v=>v==="absent").length}</div></div>
          <div style={{ background:"#FFF3E0",borderRadius:8,padding:8,textAlign:"center" as const }}><div style={{ fontSize:10,color:"#E65100"}}>Wages</div><div style={{ fontSize:14,fontWeight:700,color:"#E65100"}}>{fmt(wages)}</div></div>
        </div>
      </Card>
      {staff.length === 0 && <div style={{ textAlign: "center", color: "#9E9E9E", padding: 40, fontSize: 14 }}>No active staff found</div>}
      {staff.map(s => (
        <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Ava name={s.name} size={36} />
            <div><div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div><div style={{ fontSize: 11, color: "#9E9E9E" }}>{s.role} · {fmt(s.daily_wage)}/day</div></div>
          </div>
          {isAdminOrManager ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 }}>
              {opts.map(opt => (
                <button key={opt} onClick={() => setMarks(m => ({ ...m, [s.id]: opt }))} style={{ padding: "8px 4px", borderRadius: 8, border: marks[s.id]===opt?"2px solid "+clrMap[opt]:"1.5px solid #E0E0E0", background: marks[s.id]===opt?clrMap[opt]+"18":"#FAFAFA", color: marks[s.id]===opt?clrMap[opt]:"#616161", fontSize: 10, fontWeight: marks[s.id]===opt?700:500, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
                  {lbl[opt]}
                </button>
              ))}
            </div>
          ) : (
            <Bdg label={lbl[marks[s.id]||"present"]} color={clrMap[marks[s.id]||"present"]} />
          )}
        </div>
      ))}
      {staff.length > 0 && isAdminOrManager && (
        <div style={{ position: "sticky", bottom: 76, paddingTop: 8 }}>
          <button onClick={save} disabled={saving} style={{ width: "100%", background: saved?"#2E7D32":"#1B3A6B", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Poppins, sans-serif", opacity: saving?0.7:1 }}>
            {saving ? "Saving..." : saved ? "✓ Saved — Tap to Update" : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SALARY ───────────────────────────────────────────────────
function Salary({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [month, setMonth] = useState(MONTH);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stab, setStab] = useState("wages");
  const [showAdv, setShowAdv] = useState(false);
  const [af, setAf] = useState({ staffId:"", amount:"", reason:"" });
  const isAdmin = profile.role === "admin";

  useEffect(() => {
    Promise.all([
      supabase.from("staff").select("*").order("name"),
      supabase.from("advances").select("*, staff(name)").order("date", { ascending: false })
    ]).then(([s, a]) => { if (s.data) setStaff(s.data); if (a.data) setAdvances(a.data as any); });
  }, []);

  useEffect(() => {
    supabase.from("attendance").select("*").gte("date", month+"-01").lte("date", month+"-31").then(({ data }) => { if (data) setAttendance(data); });
  }, [month]);

  const addAdvance = async () => {
    if (!af.staffId || !af.amount) return;
    const amt = +af.amount;
    const { data } = await supabase.from("advances").insert({ staff_id: af.staffId, amount: amt, reason: af.reason, date: TODAY, given_by: profile.id }).select("*, staff(name)").single();
    if (data) { setAdvances(prev => [data as any, ...prev]); await supabase.from("staff").update({ advance: supabase.rpc as any }).eq("id", af.staffId); }
    setAf({ staffId:"", amount:"", reason:"" }); setShowAdv(false);
  };

  const wages = staff.map(s => {
    const att = attendance.filter(a => a.staff_id === s.id);
    const p = att.filter(a => a.status === "present").length;
    const h = att.filter(a => a.status === "half").length;
    const gross = p*s.daily_wage + h*s.daily_wage*0.5;
    return { ...s, p, h, abs: att.filter(a => a.status==="absent").length, gross, net: Math.max(0, gross-(s.advance||0)) };
  });

  return (
    <div>
      <Ttl>Salary & Payments</Ttl>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" as const }}>
        {["wages","advances","project"].map(t => (
          <button key={t} onClick={() => setStab(t)} style={{ background: stab===t?"#1B3A6B":"#fff", color: stab===t?"#fff":"#616161", border: "1.5px solid "+(stab===t?"#1B3A6B":"#E0E0E0"), borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
            {t==="wages"?"Wages":t==="advances"?"Advances":"Project Payments"}
          </button>
        ))}
      </div>
      {stab === "wages" && (
        <div>
          <Inp label="Month" type="month" value={month} onChange={(e: any) => setMonth(e.target.value)} style={{ width: 180 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <Metric label="Total gross" val={fmt(wages.reduce((s,w)=>s+w.gross,0))} icon="💰" />
            <Metric label="Net payable" val={fmt(wages.reduce((s,w)=>s+w.net,0))} color="#2E7D32" icon="✓" />
          </div>
          {wages.map(w => (
            <Card key={w.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Ava name={w.name} size={38} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{w.name}</div><div style={{ fontSize: 11, color: "#9E9E9E" }}>{w.role} · {fmt(w.daily_wage)}/day</div></div>
                <div style={{ textAlign: "right" as const }}><div style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}>{fmt(w.net)}</div><div style={{ fontSize: 10, color: "#9E9E9E" }}>net</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, fontSize: 11 }}>
                {([["Present",w.p,"#2E7D32"],["Half",w.h,"#E8A020"],["Absent",w.abs,"#C62828"],["Advance",fmt(w.advance||0),"#E65100"]] as [string,string|number,string][]).map(([l,v,c])=>(
                  <div key={l} style={{ background:"#F5F5F5",borderRadius:6,padding:"5px 6px",textAlign:"center" as const }}><div style={{ color:"#9E9E9E",fontSize:10}}>{l}</div><div style={{ fontWeight:700,color:c}}>{v}</div></div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      {stab === "advances" && (
        <div>
          {isAdmin && <Btn onClick={() => setShowAdv(true)} style={{ marginBottom: 12 }}>+ Record Advance</Btn>}
          {showAdv && (
            <Modal title="Record Advance" onClose={() => setShowAdv(false)}>
              <Sel label="Staff member" value={af.staffId} onChange={(e: any) => setAf(p => ({ ...p, staffId: e.target.value }))}>
                <option value="">-- select --</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Sel>
              <Inp label="Amount (₹)" type="number" value={af.amount} onChange={(e: any) => setAf(p => ({ ...p, amount: e.target.value }))} />
              <Inp label="Reason" value={af.reason} onChange={(e: any) => setAf(p => ({ ...p, reason: e.target.value }))} />
              <Btn onClick={addAdvance} style={{ width: "100%", justifyContent: "center" }}>Save Advance</Btn>
            </Modal>
          )}
          {advances.map((a: any) => (
            <div key={a.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "#FFF3E0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💵</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{a.staff?.name}</div><div style={{ fontSize: 11, color: "#9E9E9E" }}>{a.date}{a.reason?" · "+a.reason:""}</div></div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#E65100" }}>{fmt(a.amount)}</div>
            </div>
          ))}
          {advances.length === 0 && <div style={{ textAlign: "center", color: "#9E9E9E", padding: 32, fontSize: 13 }}>No advances recorded</div>}
        </div>
      )}
      {stab === "project" && projects.map(p => {
        return (
          <Card key={p.id}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B", marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "#9E9E9E" }}>Budget ₹{p.budget_lakh}L · See Payments tab inside project</div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── RENT ─────────────────────────────────────────────────────
function Rent({ profile }: { profile: Profile }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showRec, setShowRec] = useState<string | null>(null);
  const [pf, setPf] = useState({ name:"", type:"Shop", location:"", tenant:"", tenant_phone:"", monthly_rent:"", water_charges:"0", electricity_type:"Tenant pays own bill", due_day:"5", assigned_staff:"" });
  const [rf, setRf] = useState({ amount:"", date:TODAY, month:MONTH, payment_mode:"Cash", notes:"" });
  const isAdmin = profile.role === "admin";

  useEffect(() => {
    Promise.all([
      supabase.from("properties").select("*").order("name"),
      supabase.from("rent_records").select("*").order("date", { ascending: false })
    ]).then(([p, r]) => { if (p.data) setProperties(p.data); if (r.data) setRentRecords(r.data); setLoading(false); });
  }, []);

  const addProp = async () => {
    if (!pf.name || !pf.tenant) return;
    const { data } = await supabase.from("properties").insert({ ...pf, monthly_rent:+pf.monthly_rent||0, water_charges:+pf.water_charges||0, due_day:+pf.due_day||5 }).select().single();
    if (data) setProperties(prev => [...prev, data]);
    setShowAdd(false); setPf({ name:"", type:"Shop", location:"", tenant:"", tenant_phone:"", monthly_rent:"", water_charges:"0", electricity_type:"Tenant pays own bill", due_day:"5", assigned_staff:"" });
  };

  const recordRent = async (id: string) => {
    if (!rf.amount) return;
    const { data } = await supabase.from("rent_records").insert({ property_id: id, ...rf, amount:+rf.amount, recorded_by: profile.id }).select().single();
    if (data) setRentRecords(prev => [data, ...prev]);
    setRf({ amount:"", date:TODAY, month:MONTH, payment_mode:"Cash", notes:"" }); setShowRec(null);
  };

  if (loading) return <Spinner />;

  const totalExp = properties.reduce((s, p) => s + p.monthly_rent, 0);
  const totalRec = properties.reduce((s, p) => s + rentRecords.filter(r => r.property_id === p.id && r.month === MONTH).reduce((a, r) => a + r.amount, 0), 0);

  return (
    <div>
      <Ttl>Rent & Properties</Ttl>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <Metric label="Expected this month" val={fmt(totalExp)} icon="🏠" />
        <Metric label="Received" val={fmt(totalRec)} color={totalRec>=totalExp?"#2E7D32":"#E65100"} icon="✓" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1B3A6B" }}>{properties.length} Properties</div>
        {isAdmin && <Btn sm onClick={() => setShowAdd(true)}>+ Add Property</Btn>}
      </div>
      {showAdd && (
        <Modal title="Add Property / Shop" onClose={() => setShowAdd(false)}>
          <Inp label="Property name *" value={pf.name} onChange={(e: any) => setPf(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Shop 3 — Hazratganj" />
          <Sel label="Type" value={pf.type} onChange={(e: any) => setPf(p => ({ ...p, type: e.target.value }))}>{["Shop","Flat","Plot","Office","Godown"].map(t => <option key={t}>{t}</option>)}</Sel>
          <Inp label="Location" value={pf.location} onChange={(e: any) => setPf(p => ({ ...p, location: e.target.value }))} placeholder="Area, Lucknow" />
          <Inp label="Tenant name *" value={pf.tenant} onChange={(e: any) => setPf(p => ({ ...p, tenant: e.target.value }))} />
          <Inp label="Tenant phone" type="tel" value={pf.tenant_phone} onChange={(e: any) => setPf(p => ({ ...p, tenant_phone: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Inp label="Monthly rent (₹)" type="number" value={pf.monthly_rent} onChange={(e: any) => setPf(p => ({ ...p, monthly_rent: e.target.value }))} />
            <Inp label="Due day" type="number" value={pf.due_day} onChange={(e: any) => setPf(p => ({ ...p, due_day: e.target.value }))} placeholder="5" />
          </div>
          <Inp label="Water charges (₹/mo)" type="number" value={pf.water_charges} onChange={(e: any) => setPf(p => ({ ...p, water_charges: e.target.value }))} />
          <Inp label="Assigned staff" value={pf.assigned_staff} onChange={(e: any) => setPf(p => ({ ...p, assigned_staff: e.target.value }))} placeholder="Caretaker name" />
          <Btn onClick={addProp} style={{ width: "100%", justifyContent: "center" }}>Add Property</Btn>
        </Modal>
      )}
      {showRec && (
        <Modal title={"Record Rent — "+(properties.find(p => p.id === showRec)?.name||"")} onClose={() => setShowRec(null)}>
          <Inp label="Amount received (₹)" type="number" value={rf.amount} onChange={(e: any) => setRf(p => ({ ...p, amount: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Inp label="Date" type="date" value={rf.date} onChange={(e: any) => setRf(p => ({ ...p, date: e.target.value }))} />
            <Inp label="For month" type="month" value={rf.month} onChange={(e: any) => setRf(p => ({ ...p, month: e.target.value }))} />
          </div>
          <Sel label="Payment mode" value={rf.payment_mode} onChange={(e: any) => setRf(p => ({ ...p, payment_mode: e.target.value }))}>{["Cash","Online Transfer","UPI","Cheque"].map(m => <option key={m}>{m}</option>)}</Sel>
          <Inp label="Notes" value={rf.notes} onChange={(e: any) => setRf(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" />
          <Btn onClick={() => recordRent(showRec!)} color="#2E7D32" style={{ width: "100%", justifyContent: "center" }}>✓ Mark as Received</Btn>
        </Modal>
      )}
      {properties.length === 0 && <div style={{ textAlign: "center", color: "#9E9E9E", padding: 40, fontSize: 14 }}>No properties added yet</div>}
      {properties.map(p => {
        const paid = rentRecords.filter(r => r.property_id === p.id && r.month === MONTH).reduce((a, r) => a + r.amount, 0);
        const isPaid = paid >= p.monthly_rent;
        const isOverdue = !isPaid && new Date().getDate() > p.due_day + 3;
        const last = rentRecords.filter(r => r.property_id === p.id).slice(-1)[0];
        const nd = new Date(); nd.setDate(p.due_day); if (nd < new Date()) nd.setMonth(nd.getMonth()+1);
        return (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", borderLeft: "4px solid "+(isPaid?"#2E7D32":isOverdue?"#C62828":"#E8A020") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>{p.name}</div><div style={{ fontSize: 11, color: "#9E9E9E" }}>{p.type} · {p.location}</div></div>
              <Bdg label={isPaid?"✓ Paid":isOverdue?"Overdue":"Pending"} color={isPaid?"#2E7D32":isOverdue?"#C62828":"#E8A020"} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" as const, fontSize: 12 }}>
              <span style={{ color: "#616161" }}>👤 {p.tenant}</span>
              {p.tenant_phone && <a href={"tel:"+p.tenant_phone} style={{ color: "#1565C0", textDecoration: "none" }}>📞 {p.tenant_phone}</a>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
              {([["Rent",fmt(p.monthly_rent),"#1B3A6B"],["Received",fmt(paid),isPaid?"#2E7D32":"#C62828"],["Due day",p.due_day+"th","#1B3A6B"]] as [string,string,string][]).map(([l,v,c])=>(
                <div key={l} style={{ background:"#F0F2F5",borderRadius:8,padding:"7px 8px",textAlign:"center" as const }}>
                  <div style={{ fontSize:10,color:"#9E9E9E"}}>{l}</div><div style={{ fontSize:13,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            {last && <div style={{ fontSize: 11, color: "#9E9E9E", marginBottom: 8 }}>Last: {last.date} · Next due: {nd.toLocaleDateString("en-IN")}</div>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {!isPaid && <Btn sm color="#2E7D32" onClick={() => setShowRec(p.id)}>✓ Record Rent</Btn>}
              <Btn sm light onClick={() => { const msg = `Dear ${p.tenant},\n\nYour rent of ${fmt(p.monthly_rent)} for ${p.name} is due on ${p.due_day}th of this month.\n\nPlease arrange payment at your earliest.\n\nTankish`; navigator.clipboard.writeText(msg).then(()=>alert("Reminder copied! Paste in WhatsApp.")).catch(()=>alert("Copy this:\n\n"+msg)); }}>📋 Copy Reminder</Btn>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI ASSISTANT ─────────────────────────────────────────────
function AIAssistant({ profile, projects, properties }: { profile: Profile; projects: Project[]; properties: Property[] }) {
  const [msgs, setMsgs] = useState<{role:string;content:string}[]>([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("t-ckey") || "");
  const [showKey, setShowKey] = useState(!localStorage.getItem("t-ckey"));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  useEffect(() => {
    supabase.from("chat_history").select("role,content").eq("user_id", profile.id).order("created_at").limit(20)
      .then(({ data }) => { if (data) setMsgs(data); });
  }, [profile.id]);

  const sys = `You are the AI assistant for Tankish, a real estate development firm in Lucknow, Uttar Pradesh. You help ${profile.name} (${profile.role}) with operations.

Active projects: ${projects.map(p => `${p.name} (${p.stage}, ${p.completion_pct}% complete, ₹${p.budget_lakh}L budget)`).join("; ") || "none"}
Properties: ${properties.map(p => p.name).join(", ") || "none"}

Your expertise: project management, Lucknow real estate market, LDA/RERA/NAGAR NIGAM approvals, construction execution, legal (UP jurisdiction), financial analysis (ROI/IRR/P&L), contractor management, rent collection.

Always: use ₹ for money, be direct and action-oriented, give Lucknow-specific advice, flag risks with 🔴🟡🟢, keep answers concise for mobile reading.`;

  const sugg = ["What are my biggest risks right now?","I have a plot in Gomti Nagar, what should I build?","Draft a rent reminder for my tenant","How do I get RERA approval in Lucknow?","Which project needs most attention today?"];

  const send = async (text?: string) => {
    const m = text || inp.trim();
    if (!m || loading) return;
    if (!apiKey) { setShowKey(true); return; }
    setInp("");
    const updated = [...msgs, { role: "user", content: m }];
    setMsgs(updated); setLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, messages: updated.slice(-10) })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      const reply = d.content?.[0]?.text || "Sorry, couldn't process that.";
      const fin = [...updated, { role: "assistant", content: reply }];
      setMsgs(fin);
      await supabase.from("chat_history").insert([
        { user_id: profile.id, role: "user", content: m },
        { user_id: profile.id, role: "assistant", content: reply }
      ]);
    } catch (e: any) {
      setMsgs(m => [...m, { role: "assistant", content: "⚠️ Error: " + e.message }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 148px)" }}>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Ttl>✦ Tankish AI</Ttl>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn sm light onClick={() => setShowKey(v => !v)}>🔑 Key</Btn>
          <Btn sm light color="#C62828" onClick={async () => { setMsgs([]); await supabase.from("chat_history").delete().eq("user_id", profile.id); }}>Clear</Btn>
        </div>
      </div>
      {showKey && (
        <div style={{ background: "#E8F0FE", border: "1.5px solid #1B3A6B", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1B3A6B", marginBottom: 4 }}>Anthropic API Key</div>
          <div style={{ fontSize: 11, color: "#616161", marginBottom: 8 }}>Get from console.anthropic.com</div>
          <Inp value={apiKey} onChange={(e: any) => setApiKey(e.target.value)} placeholder="sk-ant-api03-..." type="password" />
          <Btn onClick={() => { localStorage.setItem("t-ckey", apiKey); setShowKey(false); }} style={{ width: "100%", justifyContent: "center" }}>Save</Btn>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {msgs.length === 0 && (
          <div>
            <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
              <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#1B3A6B,#0D2547)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>✦</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}>Tankish AI</div>
              <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 4 }}>Projects · Legal · Finance · Rent · Staff</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sugg.map(s => <button key={s} onClick={() => send(s)} style={{ background: "#fff", border: "1.5px solid #E0E0E0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#1B3A6B", cursor: "pointer", textAlign: "left", fontFamily: "Poppins, sans-serif" }}>{s}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role==="user"?"flex-end":"flex-start", marginBottom: 10 }}>
            {m.role === "assistant" && <div style={{ width: 28, height: 28, background: "#1B3A6B", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#E8A020", marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>✦</div>}
            <div style={{ maxWidth: "82%", background: m.role==="user"?"#1B3A6B":"#fff", color: m.role==="user"?"#fff":"#212121", borderRadius: m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", padding: "10px 14px", fontSize: 13, lineHeight: 1.65, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, background: "#1B3A6B", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#E8A020" }}>✦</div>
            <div style={{ background: "#fff", borderRadius: "14px 14px 14px 4px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#1B3A6B", animation: "bounce 1.2s infinite", animationDelay: i*0.2+"s" }} />)}
            </div>
          </div>
        )}
        <div ref={ref} />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E0E0E0" }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={(e: React.KeyboardEvent) => e.key==="Enter" && !e.shiftKey && send()} placeholder="Ask anything about Tankish..." style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E0E0E0", fontSize: 13, outline: "none", fontFamily: "Poppins, sans-serif", background: "#FAFAFA" }} />
        <button onClick={() => send()} disabled={loading||!inp.trim()} style={{ width: 44, height: 44, background: "#1B3A6B", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 18, color: "#fff", opacity: loading||!inp.trim()?0.5:1, flexShrink: 0 }}>→</button>
      </div>
    </div>
  );
}

// ─── USERS (ADMIN) ────────────────────────────────────────────
function Users({ profile }: { profile: Profile }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [uf, setUf] = useState({ email:"", name:"", phone:"", role:"staff", password:"tankish123" });
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => { supabase.from("profiles").select("*").order("name").then(({ data }) => { if (data) setUsers(data as Profile[]); setLoading(false); }); }, []);

  const invite = async () => {
    if (!uf.email || !uf.name) return;
    setInviteMsg("");
    const { error } = await supabase.auth.admin ? 
      { error: new Error("Use Supabase dashboard to invite") } :
      await supabase.auth.signUp({ email: uf.email, password: uf.password, options: { data: { name: uf.name, phone: uf.phone, role: uf.role } } });
    if (error) setInviteMsg("Error: " + error.message + " — Share login link manually with password: " + uf.password);
    else { setInviteMsg("Account created! Share: " + window.location.origin + " — Email: " + uf.email + " — Password: " + uf.password); setShowInvite(false); supabase.from("profiles").select("*").order("name").then(({ data }) => { if (data) setUsers(data as Profile[]); }); }
  };

  const updateRole = async (userId: string, role: string) => {
    await supabase.from("profiles").update({ role }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as any } : u));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Ttl>App Users</Ttl>
        <Btn sm onClick={() => setShowInvite(true)}>+ Add User</Btn>
      </div>
      {showInvite && (
        <Modal title="Add App User" onClose={() => setShowInvite(false)}>
          <Inp label="Full name *" value={uf.name} onChange={(e: any) => setUf(p => ({ ...p, name: e.target.value }))} />
          <Inp label="Email *" type="email" value={uf.email} onChange={(e: any) => setUf(p => ({ ...p, email: e.target.value }))} />
          <Inp label="Phone" type="tel" value={uf.phone} onChange={(e: any) => setUf(p => ({ ...p, phone: e.target.value }))} />
          <Sel label="Role" value={uf.role} onChange={(e: any) => setUf(p => ({ ...p, role: e.target.value }))}>{["admin","manager","staff"].map(r => <option key={r}>{r}</option>)}</Sel>
          <Inp label="Starting password" value={uf.password} onChange={(e: any) => setUf(p => ({ ...p, password: e.target.value }))} />
          <div style={{ background: "#FFF3E0", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#E65100", marginBottom: 10 }}>Share email + password with the person after creating</div>
          <Btn onClick={invite} style={{ width: "100%", justifyContent: "center" }}>Create Account</Btn>
        </Modal>
      )}
      {inviteMsg && <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#2E7D32" }}>{inviteMsg}</div>}
      {users.map(u => (
        <div key={u.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <Ava name={u.name} size={42} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>{u.name}</div>
            {u.phone && <div style={{ fontSize: 12, color: "#1B3A6B" }}>📞 {u.phone}</div>}
          </div>
          {profile.role === "admin" && u.id !== profile.id ? (
            <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} style={{ fontSize: 11, border: "1px solid #E0E0E0", borderRadius: 6, padding: "4px 8px", fontFamily: "Poppins, sans-serif" }}>
              {["admin","manager","staff"].map(r => <option key={r}>{r}</option>)}
            </select>
          ) : (
            <Bdg label={u.role} color={u.role==="admin"?"#C62828":u.role==="manager"?"#1565C0":"#2E7D32"} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [tab, setTab] = useState("dash");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => { if (data) setProfile(data as Profile); });
    Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("properties").select("*").order("name"),
      supabase.from("staff").select("*").order("name"),
      supabase.from("rent_records").select("*").order("date", { ascending: false })
    ]).then(([p, pr, s, r]) => {
      if (p.data) setProjects(p.data);
      if (pr.data) setProperties(pr.data);
      if (s.data) setStaff(s.data);
      if (r.data) setRentRecords(r.data);
    });
  }, [session]);

  if (session === undefined) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1B3A6B,#0D2547)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Poppins, sans-serif" }}>
      <div style={{ width: 64, height: 64, background: "#E8A020", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#1B3A6B" }}>T</div>
      <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Tankish Ops</div>
      <Spinner />
    </div>
  );

  if (!session || !profile) return <Login />;

  const isAdmin = profile.role === "admin";
  const TABS = [
    { id: "dash", icon: "⊞", label: "Home" },
    { id: "proj", icon: "🏗", label: "Projects" },
    { id: "staff", icon: "👷", label: "Staff" },
    { id: "att", icon: "✓", label: "Attend." },
    { id: "sal", icon: "₹", label: "Salary" },
    { id: "rent", icon: "🏠", label: "Rent" },
    { id: "ai", icon: "✦", label: "AI" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5", paddingBottom: 72, fontFamily: "Poppins, sans-serif" }}>
      <Analytics />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "linear-gradient(135deg,#1B3A6B 0%,#0D2547 100%)", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#E8A020", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, color: "#1B3A6B" }}>T</div>
          <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>Tankish Ops</div><div style={{ color: "#E8A020", fontSize: 9, fontWeight: 500 }}>Lucknow Real Estate</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAdmin && <button onClick={() => setTab("users")} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Users</button>}
          <Ava name={profile.name} size={30} />
          <button onClick={() => supabase.auth.signOut()} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Logout</button>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {tab === "dash" && <Dashboard profile={profile} projects={projects} staff={staff} properties={properties} rentRecords={rentRecords} setTab={setTab} />}
        {tab === "proj" && <Projects profile={profile} />}
        {tab === "staff" && <Staff profile={profile} projects={projects} />}
        {tab === "att" && <Attendance profile={profile} />}
        {tab === "sal" && <Salary profile={profile} projects={projects} />}
        {tab === "rent" && <Rent profile={profile} />}
        {tab === "ai" && <AIAssistant profile={profile} projects={projects} properties={properties} />}
        {tab === "users" && isAdmin && <Users profile={profile} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E8E8E8", display: "flex", zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, border: "none", background: "none", padding: "7px 2px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "Poppins, sans-serif" }}>
            <span style={{ fontSize: 17, filter: tab===t.id?"none":"grayscale(1) opacity(0.45)" }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: tab===t.id?700:500, color: tab===t.id?"#1B3A6B":"#9E9E9E" }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 14, height: 2, background: "#E8A020", borderRadius: 1 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
