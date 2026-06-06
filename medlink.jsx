import { useState, useEffect, useRef } from "react";

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────────
const getStorage = async (key) => {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
};
const setStorage = async (key, val) => {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
};

// ─── INITIAL DATA ──────────────────────────────────────────────────────────────
const INIT_PATIENT = {
  name: "Arjun Sharma", dob: "1997-03-14", gender: "Male", blood: "B+",
  height: 175, weight: 72, phone: "+91 98765 43210", email: "arjun@email.com",
  address: "12 Gandhi Nagar, Chennai, TN 600001", nationality: "Indian",
  allergies: ["Penicillin", "Peanuts", "Latex"],
  conditions: ["Mild Hypertension", "Seasonal Allergies"],
  smoking: "Never", alcohol: "Occasionally", exercise: "3x/week", diet: "Vegetarian",
  donorStatus: "Organ Donor", insurance: "Star Health Gold", policyNo: "SH-4421-2025",
  emergencyContact: { name: "Priya Sharma", relation: "Spouse", phone: "+91 98765 11111" },
  medicalId: "MED-2024-08-IND-7741",
  photo: null,
};
const INIT_MEDICATIONS = [
  { id: 1, name: "Amlodipine", dose: "5mg", freq: "Once daily", time: "Morning", taken: true, active: true },
  { id: 2, name: "Vitamin D3", dose: "1000 IU", freq: "Once daily", time: "Morning", taken: false, active: true },
  { id: 3, name: "Cetirizine", dose: "10mg", freq: "As needed", time: "Night", taken: false, active: true },
];
const INIT_RECORDS = [
  { id: 1, type: "Blood Test", name: "CBC Report", date: "2025-05-10", category: "Lab", status: "Normal" },
  { id: 2, type: "Prescription", name: "Amlodipine Rx", date: "2025-04-22", category: "Prescription", status: "Active" },
  { id: 3, type: "X-Ray", name: "Chest X-Ray", date: "2025-01-15", category: "Radiology", status: "Clear" },
];
const INIT_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Ravi Kumar", spec: "Cardiologist", date: "2025-06-12", time: "10:30 AM", type: "In-person", status: "Upcoming" },
  { id: 2, doctor: "Dr. Anita Menon", spec: "General Physician", date: "2025-06-08", time: "3:00 PM", type: "Video", status: "Upcoming" },
];
const INIT_VACCINATIONS = [
  { id: 1, name: "COVID-19 (Covishield)", date: "2021-06-15", due: null, status: "Complete" },
  { id: 2, name: "Hepatitis B", date: "2020-01-10", due: null, status: "Complete" },
  { id: 3, name: "Typhoid", date: "2023-03-20", due: "2026-03-20", status: "Due Soon" },
  { id: 4, name: "Influenza (Annual)", date: "2024-11-01", due: "2025-11-01", status: "Upcoming" },
];
const DOCTOR_QUEUE = [
  { initials: "MN", name: "Meera Nair", blood: "B+", age: 34, gender: "F", condition: "Hypertension", status: "In", allergy: "Aspirin" },
  { initials: "RD", name: "Rahul Das", blood: "O+", age: 52, gender: "M", condition: "Diabetes T2", status: "Next", allergy: "None" },
  { initials: "SK", name: "Sana Khan", blood: "A+", age: 29, gender: "F", condition: "Asthma", status: "2:30 PM", allergy: "Penicillin" },
  { initials: "VP", name: "Vijay Pillai", blood: "AB-", age: 61, gender: "M", condition: "Post-cardiac", status: "3:00 PM", allergy: "Ibuprofen" },
];
const HOSPITAL_PATIENTS = [
  { id: "MED-001", name: "Arjun Sharma", ward: "Cardiology", bed: "C-14", blood: "B+", admitted: "2025-06-01", status: "Stable" },
  { id: "MED-002", name: "Lakshmi Rao", ward: "General", bed: "G-08", blood: "O+", admitted: "2025-06-04", status: "Recovering" },
  { id: "MED-003", name: "Farhan Ahmed", ward: "ICU", bed: "ICU-3", blood: "A-", admitted: "2025-06-05", status: "Critical" },
  { id: "MED-004", name: "Deepa Krishnan", ward: "Maternity", bed: "M-02", blood: "B+", admitted: "2025-06-06", status: "Stable" },
];

// ─── COLOURS & STYLES ──────────────────────────────────────────────────────────
const C = {
  navy: "#0C2340", blue: "#0A5FA8", blueLight: "#E8F4FD", blueM: "#1976D2",
  emerald: "#0F7B5C", emeraldLight: "#E6F7F2", emeraldM: "#1D9E75",
  red: "#C0392B", redLight: "#FDECEA",
  amber: "#D97706", amberLight: "#FEF3C7",
  gray50: "#F8FAFC", gray100: "#F1F5F9", gray200: "#E2E8F0",
  gray400: "#94A3B8", gray600: "#475569", gray800: "#1E293B",
  white: "#FFFFFF", bg: "#F0F4F8",
};

const tag = (color, bg, txt) => ({
  display: "inline-flex", alignItems: "center", padding: "2px 10px",
  borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
  color, background: bg,
});

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function Avatar({ initials, size = 40, bg = C.blue, color = "#fff" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ children, color = C.blue, bg = C.blueLight }) {
  return <span style={tag(color, bg, children)}>{children}</span>;
}

function Card({ children, style = {}, p = 20 }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, padding: p, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: `1px solid ${C.gray200}`, ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color = C.blue, icon }) {
  return (
    <Card p={16} style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </Card>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 16, fontWeight: 700, color: C.gray800, marginBottom: 14 }}>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", style = {}, small = false }) {
  const base = {
    padding: small ? "6px 14px" : "10px 20px", borderRadius: 10, fontSize: small ? 12 : 14,
    fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s",
  };
  const variants = {
    primary: { background: C.blue, color: C.white },
    secondary: { background: C.gray100, color: C.gray800, border: `1px solid ${C.gray200}` },
    danger: { background: C.redLight, color: C.red },
    emerald: { background: C.emerald, color: C.white },
    ghost: { background: "transparent", color: C.blue, textDecoration: "underline" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 14, color: C.gray800, background: C.white, outline: "none" }}
      />
    </div>
  );
}

// ─── MEDICAL CARD ──────────────────────────────────────────────────────────────
function MedicalCard({ patient }) {
  const bmi = (patient.weight / ((patient.height / 100) ** 2)).toFixed(1);
  return (
    <div style={{ width: "100%", maxWidth: 380, borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 32px rgba(10,95,168,0.18)" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blueM} 100%)`, padding: "24px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>MEDLINK HEALTH ID</div>
            <div style={{ color: C.white, fontSize: 22, fontWeight: 700 }}>{patient.name}</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>{patient.medicalId}</div>
          </div>
          <Avatar initials={patient.name.split(" ").map(n => n[0]).join("")} size={52} bg="rgba(255,255,255,0.15)" color="#fff" />
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          {[["BLOOD", patient.blood], ["AGE", new Date().getFullYear() - new Date(patient.dob).getFullYear()], ["BMI", bmi], ["SEX", patient.gender[0]]].map(([l, v]) => (
            <div key={l}>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>{l}</div>
              <div style={{ color: C.white, fontSize: 18, fontWeight: 700, marginTop: 2 }}>{v}</div>
            </div>
          ))}
          <div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>DONOR</div>
            <div style={{ color: C.emeraldM, fontSize: 12, fontWeight: 700, marginTop: 4 }}>✓ {patient.donorStatus.split(" ")[0]}</div>
          </div>
        </div>
      </div>

      <div style={{ background: C.white, padding: "16px 24px", borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, letterSpacing: "0.08em", marginBottom: 8 }}>ALLERGIES</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {patient.allergies.map(a => <Badge key={a} color={C.red} bg={C.redLight}>{a}</Badge>)}
        </div>
      </div>

      <div style={{ background: C.white, padding: "16px 24px", borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, letterSpacing: "0.08em", marginBottom: 8 }}>EMERGENCY CONTACT</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.gray800 }}>{patient.emergencyContact.name}</div>
            <div style={{ fontSize: 12, color: C.gray400 }}>{patient.emergencyContact.relation} · {patient.emergencyContact.phone}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.emeraldLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📞</div>
        </div>
      </div>

      <div style={{ background: C.white, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, letterSpacing: "0.08em", marginBottom: 4 }}>INSURANCE</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.gray800 }}>{patient.insurance}</div>
          <div style={{ fontSize: 11, color: C.gray400 }}>Policy #{patient.policyNo}</div>
        </div>
        <div style={{ width: 72, height: 72, background: C.gray50, borderRadius: 12, border: `1px solid ${C.gray200}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <div style={{ fontSize: 28 }}>⊞</div>
          <div style={{ fontSize: 9, color: C.gray400, fontWeight: 600 }}>SCAN QR</div>
        </div>
      </div>

      <div style={{ background: C.navy, padding: "10px 24px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>medlink.health</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Valid 2025–2026</span>
      </div>
    </div>
  );
}

// ─── PATIENT DASHBOARD ─────────────────────────────────────────────────────────
function PatientDashboard({ patient, medications, records, appointments, vaccinations, setMedications }) {
  const today = medications.filter(m => m.active);
  const taken = today.filter(m => m.taken).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome + stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Medications Today" value={`${taken}/${today.length}`} color={C.blue} />
        <StatCard label="Active Conditions" value={patient.conditions.length} color={C.amber} />
        <StatCard label="Records Stored" value={records.length} color={C.emerald} />
        <StatCard label="Upcoming Appts" value={appointments.length} color={C.blueM} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
        {/* Medical Card */}
        <div>
          <SectionTitle>Your Medical Card</SectionTitle>
          <MedicalCard patient={patient} />
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Medications */}
          <Card>
            <SectionTitle>Medications Today</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {medications.filter(m => m.active).map(med => (
                <div key={med.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: med.taken ? C.emeraldLight : C.gray50, borderRadius: 12, border: `1px solid ${med.taken ? "#B6E8D6" : C.gray200}` }}>
                  <div onClick={() => setMedications(ms => ms.map(m => m.id === med.id ? { ...m, taken: !m.taken } : m))}
                    style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${med.taken ? C.emerald : C.gray400}`, background: med.taken ? C.emerald : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {med.taken && <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.gray800 }}>{med.name}</div>
                    <div style={{ fontSize: 12, color: C.gray400 }}>{med.dose} · {med.time}</div>
                  </div>
                  <Badge color={med.taken ? C.emerald : C.gray600} bg={med.taken ? C.emeraldLight : C.gray100}>
                    {med.taken ? "Taken" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming appointments */}
          <Card>
            <SectionTitle>Upcoming Appointments</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {appointments.map(apt => (
                <div key={apt.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.blueLight, borderRadius: 12, border: `1px solid #C4DEFA` }}>
                  <div style={{ fontSize: 24 }}>{apt.type === "Video" ? "🎥" : "🏥"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.gray800 }}>{apt.doctor}</div>
                    <div style={{ fontSize: 12, color: C.gray400 }}>{apt.spec} · {apt.date} · {apt.time}</div>
                  </div>
                  <Badge color={C.blue} bg={C.blueLight}>{apt.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Records + Vaccinations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <SectionTitle>Medical Records</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {records.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: C.gray50, border: `1px solid ${C.gray200}` }}>
                <div style={{ fontSize: 22 }}>{r.category === "Lab" ? "🧪" : r.category === "Radiology" ? "🔬" : "💊"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.gray800 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: C.gray400 }}>{r.type} · {r.date}</div>
                </div>
                <Badge color={r.status === "Active" ? C.emerald : r.status === "Normal" ? C.blue : C.gray600} bg={r.status === "Active" ? C.emeraldLight : r.status === "Normal" ? C.blueLight : C.gray100}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Vaccinations</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vaccinations.map(v => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: C.gray50, border: `1px solid ${C.gray200}` }}>
                <div style={{ fontSize: 22 }}>💉</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.gray800 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: C.gray400 }}>Given: {v.date}{v.due ? ` · Due: ${v.due}` : ""}</div>
                </div>
                <Badge
                  color={v.status === "Complete" ? C.emerald : v.status === "Due Soon" ? C.amber : C.blue}
                  bg={v.status === "Complete" ? C.emeraldLight : v.status === "Due Soon" ? C.amberLight : C.blueLight}
                >{v.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── HEALTH PROFILE ────────────────────────────────────────────────────────────
function HealthProfile({ patient, setPatient }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(patient);
  const [newAllergy, setNewAllergy] = useState("");
  const bmi = (patient.weight / ((patient.height / 100) ** 2)).toFixed(1);
  const bmiColor = bmi < 18.5 ? C.amber : bmi < 25 ? C.emerald : bmi < 30 ? C.amber : C.red;

  const save = () => { setPatient(form); setEdit(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle>Health Profile</SectionTitle>
        <Btn variant={edit ? "secondary" : "primary"} onClick={() => edit ? save() : setEdit(true)} small>
          {edit ? "Save Changes" : "Edit Profile"}
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.gray600, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Personal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {edit ? (
              <>
                <Input label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
                <Input label="Date of Birth" value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} type="date" />
                <Input label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
                <Input label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
                <Input label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
              </>
            ) : (
              [["Full Name", patient.name], ["Date of Birth", patient.dob], ["Gender", patient.gender], ["Phone", patient.phone], ["Email", patient.email], ["Address", patient.address]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.gray100}`, paddingBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.gray400 }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.gray800, maxWidth: "55%", textAlign: "right" }}>{v}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray600, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vitals</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["Blood Group", patient.blood, C.red], ["Height", `${patient.height} cm`, C.blue], ["Weight", `${patient.weight} kg`, C.blue]].map(([l, v, c]) => (
                <div key={l} style={{ background: C.gray50, borderRadius: 10, padding: 12, border: `1px solid ${C.gray200}` }}>
                  <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c, marginTop: 4 }}>{v}</div>
                </div>
              ))}
              <div style={{ background: C.gray50, borderRadius: 10, padding: 12, border: `1px solid ${C.gray200}` }}>
                <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600 }}>BMI</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: bmiColor, marginTop: 4 }}>{bmi}</div>
                <div style={{ fontSize: 10, color: bmiColor }}>{bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Allergies</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: edit ? 10 : 0 }}>
              {patient.allergies.map(a => (
                <div key={a} style={{ ...tag(C.red, C.redLight), gap: 5, cursor: edit ? "pointer" : "default" }}
                  onClick={() => edit && setPatient(p => ({ ...p, allergies: p.allergies.filter(x => x !== a) }))}>
                  {a}{edit && " ×"}
                </div>
              ))}
            </div>
            {edit && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Add allergy..."
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 13 }} />
                <Btn small onClick={() => { if (newAllergy) { setPatient(p => ({ ...p, allergies: [...p.allergies, newAllergy] })); setNewAllergy(""); } }}>Add</Btn>
              </div>
            )}
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Conditions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {patient.conditions.map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.amber, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.gray800 }}>{c}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── AI HEALTH ASSISTANT ───────────────────────────────────────────────────────
function AIAssistant({ patient }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hello ${patient.name.split(" ")[0]}! I'm your MedLink AI Health Assistant. I can explain your reports, check medication interactions, answer health questions, and more. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const systemPrompt = `You are MedLink AI, a helpful and empathetic health assistant embedded in the MedLink platform. 
Patient profile: ${patient.name}, ${new Date().getFullYear() - new Date(patient.dob).getFullYear()} year old ${patient.gender}, Blood group ${patient.blood}.
Allergies: ${patient.allergies.join(", ")}.
Conditions: ${patient.conditions.join(", ")}.
Current medications: Amlodipine 5mg (daily), Vitamin D3 1000IU (daily), Cetirizine 10mg (as needed).
Lifestyle: Smoking: ${patient.smoking}, Alcohol: ${patient.alcohol}, Exercise: ${patient.exercise}.

Be helpful, empathetic, and clear. Always include a disclaimer that you're an AI and serious concerns should be discussed with a real doctor. Keep responses concise and formatted nicely. Do not recommend specific diagnoses.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that right now.";
      setMessages(ms => [...ms, { role: "assistant", content: reply }]);
    } catch {
      setMessages(ms => [...ms, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    }
    setLoading(false);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const quickQ = ["Explain my CBC report results", "Is Amlodipine safe long-term?", "What are Penicillin allergy risks?", "How to manage hypertension naturally?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "70vh" }}>
      <SectionTitle>AI Health Assistant</SectionTitle>
      <Card style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} p={0}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.role === "user" ? C.blue : C.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {m.role === "user" ? "👤" : "🤖"}
              </div>
              <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? C.blue : C.gray50, color: m.role === "user" ? C.white : C.gray800, fontSize: 14, lineHeight: 1.6, border: m.role === "user" ? "none" : `1px solid ${C.gray200}`, whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: C.gray50, border: `1px solid ${C.gray200}`, display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gray400, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        {messages.length === 1 && (
          <div style={{ padding: "0 20px 12px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {quickQ.map(q => (
              <button key={q} onClick={() => { setInput(q); }} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${C.blue}`, background: C.blueLight, color: C.blue }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.gray200}`, display: "flex", gap: 10 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about your health, medications, reports..."
            style={{ flex: 1, padding: "10px 16px", borderRadius: 25, border: `1.5px solid ${C.gray200}`, fontSize: 14, outline: "none", background: C.gray50 }}
          />
          <Btn onClick={send} style={{ borderRadius: 25, padding: "10px 20px" }}>
            {loading ? "..." : "Send →"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── EMERGENCY MODE ────────────────────────────────────────────────────────────
function EmergencyMode({ patient }) {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!active) { setCountdown(5); return; }
    if (countdown === 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [active, countdown]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionTitle>Emergency Mode</SectionTitle>

      {/* SOS Button */}
      <Card style={{ textAlign: "center", padding: 40, background: active ? "#FFF0EE" : C.white }}>
        <div style={{ fontSize: 14, color: C.gray400, marginBottom: 20 }}>Tap to send emergency SOS alert with your location and medical summary</div>
        <div
          onClick={() => setActive(!active)}
          style={{ width: 140, height: 140, borderRadius: "50%", background: active ? C.red : C.redLight, border: `4px solid ${C.red}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: active ? `0 0 0 20px rgba(192,57,43,0.15)` : "none", transition: "all 0.3s" }}>
          <div style={{ fontSize: 40 }}>🆘</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: active ? C.white : C.red, marginTop: 4 }}>{active ? (countdown > 0 ? `Cancel (${countdown})` : "ACTIVE") : "SOS"}</div>
        </div>
        {active && countdown === 0 && <Badge color={C.red} bg={C.redLight}>📡 Live · Emergency contacts notified · Location shared</Badge>}
      </Card>

      {/* Emergency card visible to responders */}
      <Card style={{ border: `2px solid ${C.red}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 20 }}>🚨</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.red }}>Emergency Medical Information</div>
          <div style={{ fontSize: 11, color: C.gray400, marginLeft: "auto" }}>Visible to all responders · No login required</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div style={{ background: C.redLight, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: "0.06em" }}>BLOOD GROUP</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.red, marginTop: 4 }}>{patient.blood}</div>
          </div>
          <div style={{ background: C.amberLight, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: "0.06em" }}>ALLERGIES</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginTop: 6, lineHeight: 1.5 }}>{patient.allergies.join(", ")}</div>
          </div>
          <div style={{ background: C.blueLight, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: "0.06em" }}>CONDITIONS</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, marginTop: 6, lineHeight: 1.6 }}>{patient.conditions.join(", ")}</div>
          </div>
        </div>

        <div style={{ marginTop: 14, padding: 14, background: C.gray50, borderRadius: 12, border: `1px solid ${C.gray200}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, letterSpacing: "0.06em", marginBottom: 8 }}>EMERGENCY CONTACTS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 20 }}>📞</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.gray800 }}>{patient.emergencyContact.name}</div>
              <div style={{ fontSize: 12, color: C.gray400 }}>{patient.emergencyContact.relation} · {patient.emergencyContact.phone}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── DOCTOR DASHBOARD ──────────────────────────────────────────────────────────
function DoctorDashboard() {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [rx, setRx] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const getAISupport = async (patient) => {
    setLoadingAI(true);
    setAiNote("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: `You are MedLink AI assisting a cardiologist. Patient: ${patient.name}, ${patient.age}${patient.gender}, Blood: ${patient.blood}, Condition: ${patient.condition}, Allergy: ${patient.allergy}. Provide a brief clinical summary with 2-3 key considerations and any allergy warnings. Be concise and clinically relevant.`
          }]
        })
      });
      const data = await res.json();
      setAiNote(data.content?.[0]?.text || "Unable to generate AI support.");
    } catch { setAiNote("AI support unavailable."); }
    setLoadingAI(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle>Doctor Dashboard</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials="DR" size={36} bg={C.navy} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray800 }}>Dr. Ravi Kumar</div>
            <div style={{ fontSize: 12, color: C.gray400 }}>Cardiologist · Apollo Hospitals</div>
          </div>
          <Badge color={C.emerald} bg={C.emeraldLight}>● Verified</Badge>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {[["Today's Patients", "12", C.blue], ["Pending Reviews", "4", C.amber], ["Prescriptions", "38", C.emerald], ["Upcoming", "3", C.blueM]].map(([l, v, c]) => (
          <StatCard key={l} label={l} value={v} color={c} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
        {/* Queue */}
        <Card>
          <SectionTitle>Patient Queue</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DOCTOR_QUEUE.map((p, i) => (
              <div key={p.name} onClick={() => { setSelected(p); setNote(""); setRx(""); setAiNote(""); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${selected?.name === p.name ? C.blue : C.gray200}`, background: selected?.name === p.name ? C.blueLight : p.status === "In" ? "#EEF9F5" : C.gray50, cursor: "pointer" }}>
                <Avatar initials={p.initials} size={36} bg={p.status === "In" ? C.emerald : C.gray200} color={p.status === "In" ? C.white : C.gray600} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.gray800 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.gray400 }}>{p.blood} · {p.age}{p.gender} · {p.condition}</div>
                </div>
                <Badge color={p.status === "In" ? C.emerald : p.status === "Next" ? C.amber : C.gray600} bg={p.status === "In" ? C.emeraldLight : p.status === "Next" ? C.amberLight : C.gray100}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Patient detail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {selected ? (
            <>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.gray800 }}>{selected.name}</div>
                    <div style={{ fontSize: 13, color: C.gray400 }}>{selected.blood} · {selected.age}{selected.gender} · {selected.condition}</div>
                    {selected.allergy !== "None" && <Badge color={C.red} bg={C.redLight} style={{ marginTop: 6 }}>⚠ Allergy: {selected.allergy}</Badge>}
                  </div>
                  <Btn variant="secondary" small onClick={() => getAISupport(selected)}>🤖 AI Support</Btn>
                </div>

                {(aiNote || loadingAI) && (
                  <div style={{ background: C.blueLight, border: `1px solid #C4DEFA`, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 13, color: C.gray800, lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, color: C.blue, fontSize: 11, marginBottom: 6 }}>🤖 AI CLINICAL SUPPORT</div>
                    {loadingAI ? "Analyzing patient data..." : aiNote}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gray400, marginBottom: 6 }}>DIAGNOSIS / NOTE</div>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add clinical notes, observations..."
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 13, resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gray400, marginBottom: 6 }}>PRESCRIPTION</div>
                    <textarea value={rx} onChange={e => setRx(e.target.value)} rows={3} placeholder="Drug name, dosage, instructions..."
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 13, resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="primary" small>💊 Issue Prescription</Btn>
                    <Btn variant="secondary" small>📅 Schedule Follow-up</Btn>
                    <Btn variant="secondary" small>📋 Save Notes</Btn>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card style={{ textAlign: "center", padding: 60, color: C.gray400 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👆</div>
              <div style={{ fontSize: 15 }}>Select a patient from the queue to view details and use AI support</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HOSPITAL DASHBOARD ────────────────────────────────────────────────────────
function HospitalDashboard() {
  const [search, setSearch] = useState("");
  const filtered = HOSPITAL_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search) || p.ward.toLowerCase().includes(search.toLowerCase())
  );

  const wardCounts = HOSPITAL_PATIENTS.reduce((acc, p) => { acc[p.ward] = (acc[p.ward] || 0) + 1; return acc; }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle>Hospital Dashboard</SectionTitle>
        <Badge color={C.blue} bg={C.blueLight}>🏥 Apollo Hospitals · Chennai</Badge>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {[["Total Admitted", HOSPITAL_PATIENTS.length, C.blue], ["Critical", HOSPITAL_PATIENTS.filter(p => p.status === "Critical").length, C.red], ["Departments", Object.keys(wardCounts).length, C.emerald], ["Doctors On Duty", "18", C.blueM]].map(([l, v, c]) => (
          <StatCard key={l} label={l} value={v} color={c} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* Department overview */}
        <Card>
          <SectionTitle>Departments</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(wardCounts).map(([ward, count]) => (
              <div key={ward} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: C.gray50, border: `1px solid ${C.gray200}` }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.gray800 }}>{ward}</div>
                <Badge color={C.blue} bg={C.blueLight}>{count} patients</Badge>
              </div>
            ))}
            {[["Orthopedics", 0], ["Neurology", 0], ["Pediatrics", 0]].map(([w]) => (
              <div key={w} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: C.gray50, border: `1px solid ${C.gray200}` }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.gray400 }}>{w}</div>
                <Badge color={C.gray400} bg={C.gray100}>0 patients</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Patient list */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionTitle>Admitted Patients</SectionTitle>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, ward..."
              style={{ padding: "7px 12px", borderRadius: 20, border: `1px solid ${C.gray200}`, fontSize: 13, width: 200 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.5fr 1fr 0.7fr 1fr 0.8fr", gap: 8, padding: "6px 10px", borderBottom: `1px solid ${C.gray200}` }}>
              {["ID", "Name", "Ward", "Bed", "Admitted", "Status"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: C.gray400, letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>
            {filtered.map(p => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "0.8fr 1.5fr 1fr 0.7fr 1fr 0.8fr", gap: 8, padding: "10px", borderRadius: 10, background: p.status === "Critical" ? C.redLight : C.gray50, border: `1px solid ${p.status === "Critical" ? "#F5C1BE" : C.gray200}`, alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400 }}>{p.id}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.gray800 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: C.gray600 }}>{p.ward}</div>
                <div style={{ fontSize: 13, color: C.gray600 }}>{p.bed}</div>
                <div style={{ fontSize: 12, color: C.gray400 }}>{p.admitted}</div>
                <Badge
                  color={p.status === "Critical" ? C.red : p.status === "Stable" ? C.emerald : C.blue}
                  bg={p.status === "Critical" ? C.redLight : p.status === "Stable" ? C.emeraldLight : C.blueLight}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const users = [
    { name: "Arjun Sharma", role: "Patient", joined: "2025-01-10", status: "Active", id: "MED-7741" },
    { name: "Dr. Ravi Kumar", role: "Doctor", joined: "2024-12-01", status: "Verified", id: "DOC-0021" },
    { name: "Apollo Hospitals", role: "Hospital", joined: "2024-11-15", status: "Active", id: "HOS-0005" },
    { name: "Meera Nair", role: "Patient", joined: "2025-03-08", status: "Active", id: "MED-7890" },
    { name: "Dr. Anita Menon", role: "Doctor", joined: "2025-02-14", status: "Pending", id: "DOC-0034" },
  ];

  const logs = [
    { time: "06:14:21", event: "QR Scan", user: "MED-7741", detail: "Emergency scan · ICU-3", level: "info" },
    { time: "06:10:05", event: "Login", user: "DOC-0021", detail: "Doctor portal login · Chennai", level: "ok" },
    { time: "05:58:44", event: "Record Upload", user: "MED-7890", detail: "Blood report uploaded", level: "ok" },
    { time: "05:44:12", event: "Failed Login", user: "Unknown", detail: "3 failed attempts · IP blocked", level: "danger" },
    { time: "05:30:00", event: "New Signup", user: "HOS-0008", detail: "New hospital registered", level: "info" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionTitle>Admin Dashboard</SectionTitle>

      <div style={{ display: "flex", gap: 14 }}>
        {[["Total Users", "12,847", C.blue], ["Doctors Verified", "340", C.emerald], ["Hospitals", "28", C.blueM], ["QR Scans Today", "1,204", C.amber]].map(([l, v, c]) => (
          <StatCard key={l} label={l} value={v} color={c} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        <Card>
          <SectionTitle>User Management</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.7fr", gap: 8, padding: "4px 10px", borderBottom: `1px solid ${C.gray200}` }}>
              {["Name", "Role", "ID", "Joined", "Status"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: C.gray400, letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>
            {users.map(u => (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.7fr", gap: 8, padding: "9px 10px", borderRadius: 8, background: C.gray50, border: `1px solid ${C.gray200}`, alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.gray800 }}>{u.name}</div>
                <Badge color={u.role === "Doctor" ? C.blue : u.role === "Hospital" ? C.emerald : C.gray600} bg={u.role === "Doctor" ? C.blueLight : u.role === "Hospital" ? C.emeraldLight : C.gray100}>{u.role}</Badge>
                <div style={{ fontSize: 11, color: C.gray400 }}>{u.id}</div>
                <div style={{ fontSize: 12, color: C.gray400 }}>{u.joined}</div>
                <Badge color={u.status === "Verified" ? C.emerald : u.status === "Active" ? C.blue : C.amber} bg={u.status === "Verified" ? C.emeraldLight : u.status === "Active" ? C.blueLight : C.amberLight}>{u.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Audit Logs</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", borderRadius: 8, background: l.level === "danger" ? C.redLight : C.gray50, border: `1px solid ${l.level === "danger" ? "#F5C1BE" : C.gray200}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.level === "danger" ? C.red : l.level === "ok" ? C.emerald : C.blue, marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.gray800 }}>{l.event}</span>
                    <span style={{ fontSize: 11, color: C.gray400 }}>{l.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.gray400 }}>{l.user} · {l.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("arjun@email.com");
  const [pass, setPass] = useState("demo123");
  const [name, setName] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 24, overflow: "hidden", width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blueM} 100%)`, padding: "40px 40px 30px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏥</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.white, letterSpacing: "-0.5px" }}>MedLink</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Your universal medical identity</div>
        </div>

        <div style={{ padding: "30px 40px 40px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: C.gray100, borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: mode === m ? C.white : "transparent", color: mode === m ? C.blue : C.gray400, boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && <Input label="Full Name" value={name} onChange={setName} placeholder="Your full name" />}
            <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="email@example.com" />
            <Input label="Password" value={pass} onChange={setPass} type="password" placeholder="••••••••" />

            {mode === "register" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.gray600, marginBottom: 8 }}>I am a</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["patient", "doctor", "hospital", "caregiver", "school"].map(r => (
                    <button key={r} onClick={() => setRole(r)} style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${role === r ? C.blue : C.gray200}`, background: role === r ? C.blueLight : "transparent", color: role === r ? C.blue : C.gray600, fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={onLogin} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blueM} 100%)`, color: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
              {mode === "login" ? "Sign In →" : "Create Account →"}
            </button>

            {mode === "login" && (
              <div style={{ textAlign: "center", fontSize: 12, color: C.gray400 }}>
                Demo: email pre-filled · Click Sign In to continue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function MedLinkApp() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patient, setPatient] = useState(INIT_PATIENT);
  const [medications, setMedications] = useState(INIT_MEDICATIONS);
  const [records] = useState(INIT_RECORDS);
  const [appointments] = useState(INIT_APPOINTMENTS);
  const [vaccinations] = useState(INIT_VACCINATIONS);

  useEffect(() => {
    (async () => {
      const saved = await getStorage("medlink:patient");
      if (saved) setPatient(saved);
      const savedMeds = await getStorage("medlink:medications");
      if (savedMeds) setMedications(savedMeds);
    })();
  }, []);

  useEffect(() => { if (authed) setStorage("medlink:patient", patient); }, [patient, authed]);
  useEffect(() => { if (authed) setStorage("medlink:medications", medications); }, [medications, authed]);

  if (!authed) return <AuthScreen onLogin={() => setAuthed(true)} />;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "ai", label: "AI Assistant", icon: "🤖" },
    { id: "emergency", label: "Emergency", icon: "🆘" },
    { id: "doctor", label: "Doctor View", icon: "🩺" },
    { id: "hospital", label: "Hospital", icon: "🏥" },
    { id: "admin", label: "Admin", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.navy, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: "-0.5px" }}>🏥 MedLink</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Universal Health ID</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActiveTab(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: activeTab === n.id ? "rgba(255,255,255,0.12)" : "transparent", color: activeTab === n.id ? C.white : "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: activeTab === n.id ? 700 : 500, textAlign: "left", transition: "all 0.15s" }}>
              <span>{n.icon}</span> {n.label}
              {n.id === "emergency" && <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: C.red }} />}
            </button>
          ))}
        </nav>

        {/* User pill */}
        <div style={{ padding: "14px 14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={patient.name.split(" ").map(n => n[0]).join("")} size={34} bg="rgba(255,255,255,0.15)" color="#fff" />
            <div>
              <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{patient.name.split(" ")[0]}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{patient.medicalId}</div>
            </div>
          </div>
          <button onClick={() => setAuthed(false)} style={{ marginTop: 12, width: "100%", padding: "7px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 30px" }}>
          {activeTab === "dashboard" && <PatientDashboard patient={patient} medications={medications} records={records} appointments={appointments} vaccinations={vaccinations} setMedications={setMedications} />}
          {activeTab === "profile" && <HealthProfile patient={patient} setPatient={setPatient} />}
          {activeTab === "ai" && <AIAssistant patient={patient} />}
          {activeTab === "emergency" && <EmergencyMode patient={patient} />}
          {activeTab === "doctor" && <DoctorDashboard />}
          {activeTab === "hospital" && <HospitalDashboard />}
          {activeTab === "admin" && <AdminDashboard />}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        textarea { font-family: inherit; }
        button:hover { opacity: 0.88; }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>
    </div>
  );
}
