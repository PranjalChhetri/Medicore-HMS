"""
python manage.py seed_db

Seeds the database with the same sample data used in the frontend localStorage,
so the backend starts with meaningful data for demos.
"""
from django.core.management.base import BaseCommand
from api.models import Patient, Doctor, Appointment, Inventory, Billing
from api.ml_engine import readmission_risk, inventory_alerts
from datetime import date


PATIENTS = [
    dict(name="Amit Sharma",   age=45, gender="Male",   condition="Diabetes",      phone="9876543210", blood="B+", address="Delhi"),
    dict(name="Priya Patel",   age=32, gender="Female", condition="Hypertension",  phone="9765432109", blood="A+", address="Mumbai"),
    dict(name="Rahul Kumar",   age=28, gender="Male",   condition="",              phone="9654321098", blood="O+", address="Bangalore"),
    dict(name="Sneha Gupta",   age=35, gender="Female", condition="Asthma",        phone="9543210987", blood="AB+",address="Pune"),
    dict(name="Vikram Singh",  age=50, gender="Male",   condition="Heart Disease", phone="9432109876", blood="B-", address="Jaipur"),
    dict(name="Neha Verma",    age=27, gender="Female", condition="Anemia",        phone="9321098765", blood="A-", address="Lucknow"),
    dict(name="Arjun Reddy",   age=42, gender="Male",   condition="Obesity",       phone="9210987654", blood="O-", address="Hyderabad"),
    dict(name="Kavya Nair",    age=38, gender="Female", condition="Thyroid",       phone="9109876543", blood="B+", address="Chennai"),
]

DOCTORS = [
    dict(name="Dr. Rajesh Mehta",  spec="General Physician", phone="9999999999", exp="12 yrs", dept="OPD",         status="Active"),
    dict(name="Dr. Anjali Sharma", spec="Cardiologist",       phone="8888888888", exp="8 yrs",  dept="Cardiology",  status="Active"),
    dict(name="Dr. Suresh Patel",  spec="Oncologist",         phone="7777777777", exp="15 yrs", dept="Oncology",    status="Active"),
    dict(name="Dr. Meena Iyer",    spec="Neurologist",        phone="6666666666", exp="10 yrs", dept="Neurology",   status="On Leave"),
    dict(name="Dr. Anil Gupta",    spec="Orthopedic",         phone="5555555555", exp="6 yrs",  dept="Orthopedics", status="Active"),
]

INVENTORY = [
    dict(name="Surgical Masks",    category="PPE",       quantity=120, unit="pcs",   status="In Stock",  supplier="MedPlus",      reorder_at=20),
    dict(name="Latex Gloves",      category="PPE",       quantity=8,   unit="boxes", status="Low Stock", supplier="SafetyFirst",  reorder_at=15),
    dict(name="Paracetamol 500mg", category="Medicine",  quantity=450, unit="tabs",  status="In Stock",  supplier="Sun Pharma",   reorder_at=50),
    dict(name="Insulin Vials",     category="Medicine",  quantity=12,  unit="vials", status="Low Stock", supplier="Novo Nordisk", reorder_at=20),
    dict(name="BP Monitor",        category="Equipment", quantity=6,   unit="units", status="In Stock",  supplier="Omron",        reorder_at=3),
    dict(name="IV Drip Set",       category="Supplies",  quantity=3,   unit="sets",  status="Critical",  supplier="Baxter",       reorder_at=10),
    dict(name="Oxygen Masks",      category="Equipment", quantity=20,  unit="pcs",   status="In Stock",  supplier="Philips",      reorder_at=5),
    dict(name="Syringes 5ml",      category="Supplies",  quantity=500, unit="pcs",   status="In Stock",  supplier="BD Medical",   reorder_at=50),
]

BILLING = [
    dict(patient="Amit Sharma",  amount=1500, paid=1500, status="Paid",    date=date(2025,11,20), desc="Consultation + Tests"),
    dict(patient="Priya Patel",  amount=2200, paid=0,    status="Pending", date=date(2025,11,22), desc="Cardiology Consult"),
    dict(patient="Rahul Kumar",  amount=800,  paid=800,  status="Paid",    date=date(2025,11,23), desc="General OPD"),
    dict(patient="Sneha Gupta",  amount=3500, paid=1000, status="Partial", date=date(2025,11,24), desc="Asthma Treatment"),
    dict(patient="Vikram Singh", amount=8500, paid=0,    status="Pending", date=date(2025,11,25), desc="Cardiac Procedure"),
]

APPOINTMENTS = [
    dict(patient="Amit Sharma",  doctor="Dr. Rajesh Mehta",  date=date(2025,12,1), time="10:00", status="Scheduled",  notes="Follow-up for diabetes"),
    dict(patient="Priya Patel",  doctor="Dr. Anjali Sharma", date=date(2025,12,2), time="11:00", status="Completed",  notes="BP check"),
    dict(patient="Rahul Kumar",  doctor="Dr. Rajesh Mehta",  date=date(2025,12,3), time="09:30", status="Scheduled",  notes="General checkup"),
    dict(patient="Sneha Gupta",  doctor="Dr. Rajesh Mehta",  date=date(2025,12,4), time="14:00", status="Cancelled",  notes="Asthma review"),
    dict(patient="Vikram Singh", doctor="Dr. Anjali Sharma", date=date(2025,12,5), time="15:30", status="Scheduled",  notes="Cardiac review"),
]


class Command(BaseCommand):
    help = 'Seed the database with sample HMS data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data first')

    def handle(self, *args, **options):
        if options['clear']:
            Patient.objects.all().delete()
            Doctor.objects.all().delete()
            Appointment.objects.all().delete()
            Inventory.objects.all().delete()
            Billing.objects.all().delete()
            self.stdout.write('[*] Cleared existing data')

        # Patients + auto ML risk
        for p in PATIENTS:
            if not Patient.objects.filter(name=p['name']).exists():
                risk = readmission_risk(p)
                Patient.objects.create(**p, readmission_risk=risk['risk_score'], risk_label=risk['risk_label'])
        self.stdout.write(f'[+] Seeded {len(PATIENTS)} patients with ML risk scores')

        for d in DOCTORS:
            if not Doctor.objects.filter(name=d['name']).exists():
                Doctor.objects.create(**d)
        self.stdout.write(f'[+] Seeded {len(DOCTORS)} doctors')

        for i in INVENTORY:
            if not Inventory.objects.filter(name=i['name']).exists():
                Inventory.objects.create(**i)
        self.stdout.write(f'[+] Seeded {len(INVENTORY)} inventory items')

        for b in BILLING:
            Billing.objects.get_or_create(patient=b['patient'], date=b['date'], defaults=b)
        self.stdout.write(f'[+] Seeded {len(BILLING)} billing records')

        for a in APPOINTMENTS:
            Appointment.objects.get_or_create(patient=a['patient'], date=a['date'], defaults=a)
        self.stdout.write(f'[+] Seeded {len(APPOINTMENTS)} appointments')

        # Run inventory ML alerts
        items = list(Inventory.objects.all().values('id','name','category','quantity','unit','status','supplier'))
        alerts = inventory_alerts(items)
        alert_ids = {a['item_id'] for a in alerts['alerts']}
        Inventory.objects.filter(pk__in=alert_ids).update(auto_reorder_alert=True)
        self.stdout.write(f'[ML] {alerts["total_alerts"]} inventory alert(s) flagged')

        self.stdout.write(self.style.SUCCESS('\n[*] MediCore database seeded successfully!'))
