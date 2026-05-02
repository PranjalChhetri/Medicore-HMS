"""
views.py — MediCore HMS REST API
All views are CSRF-exempt for frontend fetch() calls.
Endpoints:
  /api/patients/           GET (list) / POST (create)
  /api/patients/<id>/      GET / PUT / DELETE
  /api/patients/<id>/risk/ GET — run readmission risk ML
  /api/patients/<id>/disease-risk/ POST — run disease risk ML (neural networks for heart/breast/diabetes/kidney/liver)
  /api/doctors/            GET / POST
  /api/doctors/<id>/       GET / PUT / DELETE
  /api/appointments/       GET / POST
  /api/appointments/<id>/  GET / PUT / DELETE
  /api/appointments/suggest/ POST — smart scheduling
  /api/inventory/          GET / POST
  /api/inventory/<id>/     GET / PUT / DELETE
  /api/inventory/alerts/   GET — auto-reorder ML alerts
  /api/billing/            GET / POST
  /api/billing/<id>/       GET / PUT / DELETE
  /api/settings/           GET / PUT — system settings
  /api/dashboard/stats/    GET — aggregated dashboard numbers
"""

import json
from datetime import date

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Patient, Doctor, Appointment, Inventory, Billing, Settings
from .ml_engine import readmission_risk, smart_schedule, inventory_alerts, disease_risk


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _body(request):
    try:
        return json.loads(request.body)
    except Exception:
        return {}


def _ok(data, status=200):
    return JsonResponse(data, safe=False, status=status)


def _err(msg, status=400):
    return JsonResponse({'error': msg}, status=status)


def _patient_dict(p):
    return {
        'id': p.id, 'name': p.name, 'age': p.age, 'gender': p.gender,
        'condition': p.condition, 'phone': p.phone, 'blood': p.blood,
        'address': p.address,
        'readmission_risk': p.readmission_risk,
        'risk_label': p.risk_label,
    }


def _doctor_dict(d):
    return {
        'id': d.id, 'name': d.name, 'spec': d.spec, 'phone': d.phone,
        'exp': d.exp, 'dept': d.dept, 'status': d.status,
    }


def _appt_dict(a):
    return {
        'id': a.id, 'patient': a.patient, 'doctor': a.doctor,
        'date': str(a.date), 'time': a.time, 'status': a.status,
        'notes': a.notes, 'suggested_slot': a.suggested_slot,
        'conflict_flag': a.conflict_flag,
    }


def _inv_dict(i):
    return {
        'id': i.id, 'name': i.name, 'category': i.category,
        'quantity': i.quantity, 'unit': i.unit, 'status': i.status,
        'supplier': i.supplier, 'reorder_at': i.reorder_at,
        'auto_reorder_alert': i.auto_reorder_alert,
    }


def _bill_dict(b):
    return {
        'id': b.id, 'patient': b.patient, 'amount': b.amount,
        'paid': b.paid, 'status': b.status,
        'date': str(b.date), 'desc': b.desc,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PATIENTS
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
def patients_list(request):
    if request.method == 'GET':
        qs = Patient.objects.all().order_by('-id')
        q  = request.GET.get('q', '')
        if q:
            qs = qs.filter(name__icontains=q) | qs.filter(condition__icontains=q)
        return _ok([_patient_dict(p) for p in qs])

    if request.method == 'POST':
        d = _body(request)
        required = ['name', 'age', 'gender']
        for f in required:
            if not d.get(f):
                return _err(f'Missing required field: {f}')
        p = Patient.objects.create(
            name=d['name'], age=int(d['age']), gender=d['gender'],
            condition=d.get('condition', ''), phone=d.get('phone', ''),
            blood=d.get('blood', ''), address=d.get('address', ''),
        )
        # Auto-run risk on create
        risk = readmission_risk({'age': p.age, 'gender': p.gender, 'condition': p.condition})
        p.readmission_risk = risk['risk_score']
        p.risk_label       = risk['risk_label']
        p.save()
        return _ok(_patient_dict(p), status=201)

    return _err('Method not allowed', 405)


@csrf_exempt
def patient_detail(request, pk):
    try:
        p = Patient.objects.get(pk=pk)
    except Patient.DoesNotExist:
        return _err('Patient not found', 404)

    if request.method == 'GET':
        return _ok(_patient_dict(p))

    if request.method in ('PUT', 'PATCH'):
        d = _body(request)
        for field in ['name', 'age', 'gender', 'condition', 'phone', 'blood', 'address']:
            if field in d:
                setattr(p, field, int(d[field]) if field == 'age' else d[field])
        risk = readmission_risk({'age': p.age, 'gender': p.gender, 'condition': p.condition})
        p.readmission_risk = risk['risk_score']
        p.risk_label       = risk['risk_label']
        p.save()
        return _ok(_patient_dict(p))

    if request.method == 'DELETE':
        p.delete()
        return _ok({'deleted': True})

    return _err('Method not allowed', 405)


@csrf_exempt
def patient_risk(request, pk):
    """Run readmission risk ML on a specific patient."""
    try:
        p = Patient.objects.get(pk=pk)
    except Patient.DoesNotExist:
        return _err('Patient not found', 404)

    risk = readmission_risk({'age': p.age, 'gender': p.gender, 'condition': p.condition})
    p.readmission_risk = risk['risk_score']
    p.risk_label       = risk['risk_label']
    p.save()
    return _ok({'patient_id': pk, **risk})


@csrf_exempt
@require_http_methods(['POST'])
def patient_disease_risk(request, pk):
    """Run disease risk ML prediction (patient record is optional for stateless predictions)."""
    data = _body(request)
    disease = data.get('disease', 'heart')  # Default to heart
    risk = disease_risk(data, disease)
    return _ok({'patient_id': pk, 'disease': disease, **risk})


# ─────────────────────────────────────────────────────────────────────────────
# DOCTORS
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
def doctors_list(request):
    if request.method == 'GET':
        qs = Doctor.objects.all().order_by('name')
        return _ok([_doctor_dict(d) for d in qs])

    if request.method == 'POST':
        d = _body(request)
        if not d.get('name') or not d.get('spec'):
            return _err('name and spec are required')
        doc = Doctor.objects.create(
            name=d['name'], spec=d['spec'],
            phone=d.get('phone', ''), exp=d.get('exp', ''),
            dept=d.get('dept', ''), status=d.get('status', 'Active'),
        )
        return _ok(_doctor_dict(doc), status=201)

    return _err('Method not allowed', 405)


@csrf_exempt
def doctor_detail(request, pk):
    try:
        doc = Doctor.objects.get(pk=pk)
    except Doctor.DoesNotExist:
        return _err('Doctor not found', 404)

    if request.method == 'GET':
        return _ok(_doctor_dict(doc))

    if request.method in ('PUT', 'PATCH'):
        d = _body(request)
        for f in ['name', 'spec', 'phone', 'exp', 'dept', 'status']:
            if f in d:
                setattr(doc, f, d[f])
        doc.save()
        return _ok(_doctor_dict(doc))

    if request.method == 'DELETE':
        doc.delete()
        return _ok({'deleted': True})

    return _err('Method not allowed', 405)


# ─────────────────────────────────────────────────────────────────────────────
# APPOINTMENTS
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
def appointments_list(request):
    if request.method == 'GET':
        qs = Appointment.objects.all().order_by('-date', '-id')
        q  = request.GET.get('q', '')
        if q:
            qs = qs.filter(patient__icontains=q) | qs.filter(doctor__icontains=q)
        return _ok([_appt_dict(a) for a in qs])

    if request.method == 'POST':
        d = _body(request)
        if not d.get('patient') or not d.get('doctor') or not d.get('date'):
            return _err('patient, doctor, and date are required')

        # Smart scheduling: detect conflicts
        existing = list(Appointment.objects.filter(
            doctor=d['doctor'], date=d['date']
        ).exclude(status='Cancelled').values('time', 'doctor', 'date', 'status'))

        schedule = smart_schedule(d['doctor'], d['date'], existing)
        conflict = d.get('time', '') in schedule['booked_slots']

        a = Appointment.objects.create(
            patient=d['patient'], doctor=d['doctor'],
            date=d['date'], time=d.get('time', ''),
            status=d.get('status', 'Scheduled'),
            notes=d.get('notes', ''),
            suggested_slot=schedule.get('suggested_slot', ''),
            conflict_flag=conflict,
        )
        resp = _appt_dict(a)
        resp['scheduling'] = schedule
        return _ok(resp, status=201)

    return _err('Method not allowed', 405)


@csrf_exempt
def appointment_detail(request, pk):
    try:
        a = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return _err('Appointment not found', 404)

    if request.method == 'GET':
        return _ok(_appt_dict(a))

    if request.method in ('PUT', 'PATCH'):
        d = _body(request)
        for f in ['patient', 'doctor', 'date', 'time', 'status', 'notes']:
            if f in d:
                setattr(a, f, d[f])
        a.save()
        return _ok(_appt_dict(a))

    if request.method == 'DELETE':
        a.delete()
        return _ok({'deleted': True})

    return _err('Method not allowed', 405)


@csrf_exempt
def appointment_suggest(request):
    """Smart scheduling endpoint — POST {doctor, date}"""
    if request.method != 'POST':
        return _err('POST only', 405)
    d = _body(request)
    doctor = d.get('doctor', '')
    date_str = d.get('date', str(date.today()))

    existing = list(Appointment.objects.filter(
        doctor=doctor, date=date_str
    ).exclude(status='Cancelled').values('time', 'doctor', 'date', 'status'))

    result = smart_schedule(doctor, date_str, existing)
    return _ok(result)


# ─────────────────────────────────────────────────────────────────────────────
# INVENTORY
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
def inventory_list(request):
    if request.method == 'GET':
        qs = Inventory.objects.all().order_by('name')
        return _ok([_inv_dict(i) for i in qs])

    if request.method == 'POST':
        d = _body(request)
        if not d.get('name') or d.get('quantity') is None:
            return _err('name and quantity are required')
        qty = int(d['quantity'])
        status = d.get('status', 'In Stock')
        item = Inventory.objects.create(
            name=d['name'], category=d.get('category', 'Supplies'),
            quantity=qty, unit=d.get('unit', 'pcs'),
            status=status, supplier=d.get('supplier', ''),
            reorder_at=int(d.get('reorder_at', 10)),
        )
        return _ok(_inv_dict(item), status=201)

    return _err('Method not allowed', 405)


@csrf_exempt
def inventory_detail(request, pk):
    try:
        item = Inventory.objects.get(pk=pk)
    except Inventory.DoesNotExist:
        return _err('Item not found', 404)

    if request.method == 'GET':
        return _ok(_inv_dict(item))

    if request.method in ('PUT', 'PATCH'):
        d = _body(request)
        for f in ['name', 'category', 'unit', 'status', 'supplier']:
            if f in d:
                setattr(item, f, d[f])
        if 'quantity' in d:
            item.quantity = int(d['quantity'])
        if 'reorder_at' in d:
            item.reorder_at = int(d['reorder_at'])
        item.save()
        return _ok(_inv_dict(item))

    if request.method == 'DELETE':
        item.delete()
        return _ok({'deleted': True})

    return _err('Method not allowed', 405)


@csrf_exempt
def inventory_alerts_view(request):
    """ML-powered auto-reorder alerts for all inventory items."""
    if request.method != 'GET':
        return _err('GET only', 405)
    items = list(Inventory.objects.all().values(
        'id', 'name', 'category', 'quantity', 'unit', 'status', 'supplier'
    ))
    result = inventory_alerts(items)

    # Persist alert flags back to DB
    alert_ids = {a['item_id'] for a in result['alerts']}
    Inventory.objects.all().update(auto_reorder_alert=False)
    Inventory.objects.filter(pk__in=alert_ids).update(auto_reorder_alert=True)

    return _ok(result)


# ─────────────────────────────────────────────────────────────────────────────
# BILLING
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
def billing_list(request):
    if request.method == 'GET':
        qs = Billing.objects.all().order_by('-date', '-id')
        return _ok([_bill_dict(b) for b in qs])

    if request.method == 'POST':
        d = _body(request)
        if not d.get('patient') or d.get('amount') is None:
            return _err('patient and amount are required')
        b = Billing.objects.create(
            patient=d['patient'], amount=float(d['amount']),
            paid=float(d.get('paid', 0)),
            status=d.get('status', 'Pending'),
            date=d.get('date', str(date.today())),
            desc=d.get('desc', ''),
        )
        return _ok(_bill_dict(b), status=201)

    return _err('Method not allowed', 405)


@csrf_exempt
def billing_detail(request, pk):
    try:
        b = Billing.objects.get(pk=pk)
    except Billing.DoesNotExist:
        return _err('Bill not found', 404)

    if request.method == 'GET':
        return _ok(_bill_dict(b))

    if request.method in ('PUT', 'PATCH'):
        d = _body(request)
        for f in ['patient', 'status', 'date', 'desc']:
            if f in d:
                setattr(b, f, d[f])
        if 'amount' in d:
            b.amount = float(d['amount'])
        if 'paid' in d:
            b.paid = float(d['paid'])
        b.save()
        return _ok(_bill_dict(b))

    if request.method == 'DELETE':
        b.delete()
        return _ok({'deleted': True})

    return _err('Method not allowed', 405)


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD STATS
# ─────────────────────────────────────────────────────────────────────────────

def dashboard_stats(request):
    """Aggregated stats for the dashboard."""
    patients     = Patient.objects.count()
    active_docs  = Doctor.objects.filter(status='Active').count()
    scheduled_apts = Appointment.objects.filter(status='Scheduled').count()
    revenue      = sum(b.paid for b in Billing.objects.filter(status='Paid'))
    low_stock    = Inventory.objects.filter(
        status__in=['Low Stock', 'Critical']
    ).count()
    high_risk_pts = Patient.objects.filter(risk_label='High').count()

    return _ok({
        'patients':       patients,
        'active_doctors': active_docs,
        'scheduled_appointments': scheduled_apts,
        'revenue_paid':   revenue,
        'low_stock_items': low_stock,
        'high_risk_patients': high_risk_pts,
    })


# ─────────────────────────────────────────────────────────────────────────────
# SETTINGS
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'PUT'])
def settings(request):
    """Get or update global system settings."""
    # Singleton pattern: get or create settings
    setting, created = Settings.objects.get_or_create(pk=1)

    if request.method == 'GET':
        return _ok({
            'clinic_name': setting.clinic_name,
            'clinic_address': setting.clinic_address,
            'clinic_phone': setting.clinic_phone,
            'clinic_email': setting.clinic_email,
            'operating_hours': setting.operating_hours,
            'appointment_slot_duration': setting.appointment_slot_duration,
            'max_appointments_per_day': setting.max_appointments_per_day,
            'advance_booking_days': setting.advance_booking_days,
            'default_low_stock_threshold': setting.default_low_stock_threshold,
            'default_reorder_quantity': setting.default_reorder_quantity,
            'auto_reorder_enabled': setting.auto_reorder_enabled,
            'default_consultation_fee': setting.default_consultation_fee,
            'tax_percentage': setting.tax_percentage,
            'currency': setting.currency,
            'high_risk_threshold': setting.high_risk_threshold,
            'moderate_risk_threshold': setting.moderate_risk_threshold,
            'save_prediction_history': setting.save_prediction_history,
            'theme': setting.theme,
            'date_format': setting.date_format,
            'items_per_page': setting.items_per_page,
            'email_alerts': setting.email_alerts,
            'sms_alerts': setting.sms_alerts,
            'push_notifications': setting.push_notifications,
        })

    if request.method == 'PUT':
        d = _body(request)
        # Organization
        if 'clinic_name' in d:
            setting.clinic_name = d['clinic_name']
        if 'clinic_address' in d:
            setting.clinic_address = d['clinic_address']
        if 'clinic_phone' in d:
            setting.clinic_phone = d['clinic_phone']
        if 'clinic_email' in d:
            setting.clinic_email = d['clinic_email']
        if 'operating_hours' in d:
            setting.operating_hours = d['operating_hours']
        # Appointments
        if 'appointment_slot_duration' in d:
            setting.appointment_slot_duration = int(d['appointment_slot_duration'])
        if 'max_appointments_per_day' in d:
            setting.max_appointments_per_day = int(d['max_appointments_per_day'])
        if 'advance_booking_days' in d:
            setting.advance_booking_days = int(d['advance_booking_days'])
        # Inventory
        if 'default_low_stock_threshold' in d:
            setting.default_low_stock_threshold = int(d['default_low_stock_threshold'])
        if 'default_reorder_quantity' in d:
            setting.default_reorder_quantity = int(d['default_reorder_quantity'])
        if 'auto_reorder_enabled' in d:
            setting.auto_reorder_enabled = bool(d['auto_reorder_enabled'])
        # Billing
        if 'default_consultation_fee' in d:
            setting.default_consultation_fee = float(d['default_consultation_fee'])
        if 'tax_percentage' in d:
            setting.tax_percentage = float(d['tax_percentage'])
        if 'currency' in d:
            setting.currency = d['currency']
        # Predictions
        if 'high_risk_threshold' in d:
            setting.high_risk_threshold = int(d['high_risk_threshold'])
        if 'moderate_risk_threshold' in d:
            setting.moderate_risk_threshold = int(d['moderate_risk_threshold'])
        if 'save_prediction_history' in d:
            setting.save_prediction_history = bool(d['save_prediction_history'])
        # Display
        if 'theme' in d:
            setting.theme = d['theme']
        if 'date_format' in d:
            setting.date_format = d['date_format']
        if 'items_per_page' in d:
            setting.items_per_page = int(d['items_per_page'])
        # Notifications
        if 'email_alerts' in d:
            setting.email_alerts = bool(d['email_alerts'])
        if 'sms_alerts' in d:
            setting.sms_alerts = bool(d['sms_alerts'])
        if 'push_notifications' in d:
            setting.push_notifications = bool(d['push_notifications'])

        setting.save()
        return _ok({'success': True, 'message': 'Settings updated'})
