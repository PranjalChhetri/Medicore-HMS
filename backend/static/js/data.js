/* ═══════════════════════════════════════════════════════════
   data.js — Database Layer (localStorage) + Seed Data
   ═══════════════════════════════════════════════════════════ */

const SEED = {
  patients: [
    { id:1, name:"Amit Sharma",   age:45, gender:"Male",   status:"Waiting", condition:"Diabetes",      phone:"9876543210", blood:"B+", address:"Delhi", readmission_risk: 72.4 },
    { id:2, name:"Priya Patel",   age:32, gender:"Female", status:"Waiting", condition:"Hypertension",  phone:"9765432109", blood:"A+", address:"Mumbai", readmission_risk: 45.2 },
    { id:3, name:"Rahul Kumar",   age:28, gender:"Male",   status:"Waiting", condition:"",              phone:"9654321098", blood:"O+", address:"Bangalore", readmission_risk: 12.8 },
    { id:4, name:"Sneha Gupta",   age:35, gender:"Female", status:"Waiting", condition:"Asthma",        phone:"9543210987", blood:"AB+", address:"Pune", readmission_risk: 38.5 },
    { id:5, name:"Vikram Singh",  age:50, gender:"Male",   status:"Waiting", condition:"Heart Disease", phone:"9432109876", blood:"B-", address:"Jaipur", readmission_risk: 88.9 },
    { id:6, name:"Neha Verma",    age:27, gender:"Female", status:"Waiting", condition:"Anemia",        phone:"9321098765", blood:"A-", address:"Lucknow", readmission_risk: 25.1 },
    { id:7, name:"Arjun Reddy",   age:42, gender:"Male",   status:"Waiting", condition:"Obesity",       phone:"9210987654", blood:"O-", address:"Hyderabad", readmission_risk: 54.6 },
    { id:8, name:"Kavya Nair",    age:38, gender:"Female", status:"Waiting", condition:"Thyroid",       phone:"9109876543", blood:"B+", address:"Chennai", readmission_risk: 18.3 },
  ],
  doctors: [
    { id:1, name:"Dr. Rajesh Mehta",   spec:"General Physician", phone:"9999999999", exp:"12 yrs", dept:"OPD",          status:"Active" },
    { id:2, name:"Dr. Anjali Sharma",  spec:"Cardiologist",       phone:"8888888888", exp:"8 yrs",  dept:"Cardiology",   status:"Active" },
    { id:3, name:"Dr. Suresh Patel",   spec:"Oncologist",         phone:"7777777777", exp:"15 yrs", dept:"Oncology",     status:"Active" },
    { id:4, name:"Dr. Meena Iyer",     spec:"Neurologist",        phone:"6666666666", exp:"10 yrs", dept:"Neurology",    status:"On Leave" },
    { id:5, name:"Dr. Anil Gupta",     spec:"Orthopedic",         phone:"5555555555", exp:"6 yrs",  dept:"Orthopedics",  status:"Active" },
  ],
  appointments: [
    { id:1, patient:"Amit Sharma",  doctor:"Dr. Rajesh Mehta",  date:"2025-12-01", time:"10:00", status:"Scheduled",  notes:"Follow-up for diabetes" },
    { id:2, patient:"Priya Patel",  doctor:"Dr. Anjali Sharma", date:"2025-12-02", time:"11:00", status:"Completed",  notes:"BP check" },
    { id:3, patient:"Rahul Kumar",  doctor:"Dr. Rajesh Mehta",  date:"2025-12-03", time:"09:30", status:"Scheduled",  notes:"General checkup" },
    { id:4, patient:"Sneha Gupta",  doctor:"Dr. Rajesh Mehta",  date:"2025-12-04", time:"14:00", status:"Cancelled",  notes:"Asthma review" },
    { id:5, patient:"Vikram Singh", doctor:"Dr. Anjali Sharma", date:"2025-12-05", time:"15:30", status:"Scheduled",  notes:"Cardiac review" },
  ],
  inventory: [
    { id:1, name:"Surgical Masks",    category:"PPE",       quantity:120, unit:"pcs",   status:"In Stock",  supplier:"MedPlus" },
    { id:2, name:"Latex Gloves",      category:"PPE",       quantity:8,   unit:"boxes", status:"Low Stock", supplier:"SafetyFirst" },
    { id:3, name:"Paracetamol 500mg", category:"Medicine",  quantity:450, unit:"tabs",  status:"In Stock",  supplier:"Sun Pharma" },
    { id:4, name:"Insulin Vials",     category:"Medicine",  quantity:12,  unit:"vials", status:"Low Stock", supplier:"Novo Nordisk" },
    { id:5, name:"BP Monitor",        category:"Equipment", quantity:6,   unit:"units", status:"In Stock",  supplier:"Omron" },
    { id:6, name:"IV Drip Set",       category:"Supplies",  quantity:3,   unit:"sets",  status:"Critical",  supplier:"Baxter" },
    { id:7, name:"Oxygen Masks",      category:"Equipment", quantity:20,  unit:"pcs",   status:"In Stock",  supplier:"Philips" },
    { id:8, name:"Syringes 5ml",      category:"Supplies",  quantity:500, unit:"pcs",   status:"In Stock",  supplier:"BD Medical" },
  ],
  billing: [
    { id:1, patient:"Amit Sharma",  amount:1500, paid:1500, status:"Paid",    date:"2025-11-20", desc:"Consultation + Tests" },
    { id:2, patient:"Priya Patel",  amount:2200, paid:0,    status:"Pending", date:"2025-11-22", desc:"Cardiology Consult" },
    { id:3, patient:"Rahul Kumar",  amount:800,  paid:800,  status:"Paid",    date:"2025-11-23", desc:"General OPD" },
    { id:4, patient:"Sneha Gupta",  amount:3500, paid:1000, status:"Partial", date:"2025-11-24", desc:"Asthma Treatment" },
    { id:5, patient:"Vikram Singh", amount:8500, paid:0,    status:"Pending", date:"2025-11-25", desc:"Cardiac Procedure" },
  ],
  scans: [
    { id:1, patientId:1, patientName:"Amit Sharma",  type:"MRI", area:"Brain", date:"2025-11-28", status:"Completed", findings:"Normal", risk:"Low" },
    { id:2, patientId:5, patientName:"Vikram Singh", type:"CT",  area:"Chest", date:"2025-11-29", status:"Pending",   findings:"N/A",    risk:"N/A" }
  ]
};

const DB = {
  _key(k)    { return `hms_${k}`; },
  get(k)     { try { const d = localStorage.getItem(this._key(k)); return d ? JSON.parse(d) : null; } catch { return null; } },
  set(k, v)  { try { localStorage.setItem(this._key(k), JSON.stringify(v)); } catch(e) { console.warn('Storage error:', e); } },
  load(k)    { return this.get(k) || []; },
  save(k, v) { this.set(k, v); },
  nextId(k)  { const arr = this.load(k); return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; },
  init() {
    ['patients','doctors','appointments','inventory','billing', 'scans'].forEach(k => {
      const current = this.get(k);
      // Auto-Heal: If data is missing OR if patients are missing their risk scores, re-seed.
      if (!current || !current.length || (k === 'patients' && current[0] && !current[0].readmission_risk)) {
        console.log(`[DB] Auto-Heal: Initializing clinical ${k} data...`);
        this.set(k, SEED[k]);
      }
    });
  },
  reset() {
    ['patients','doctors','appointments','inventory','billing', 'scans'].forEach(k => this.set(k, SEED[k]));
  }
};
