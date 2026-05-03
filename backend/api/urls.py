from django.urls import path
from . import views

urlpatterns = [
    # Patients
    path('patients/',           views.patients_list,    name='patients-list'),
    path('patients/<int:pk>/',  views.patient_detail,   name='patient-detail'),
    path('patients/<int:pk>/risk/', views.patient_risk, name='patient-risk'),
    path('patients/<int:pk>/disease-risk/', views.patient_disease_risk, name='patient-disease-risk'),
    path('predictions/history/', views.predictions_history, name='predictions-history'),

    # Doctors
    path('doctors/',            views.doctors_list,     name='doctors-list'),
    path('doctors/<int:pk>/',   views.doctor_detail,    name='doctor-detail'),

    # Appointments
    path('appointments/',           views.appointments_list,   name='appointments-list'),
    path('appointments/<int:pk>/',  views.appointment_detail,  name='appointment-detail'),
    path('appointments/suggest/',   views.appointment_suggest, name='appointment-suggest'),

    # Inventory
    path('inventory/',              views.inventory_list,      name='inventory-list'),
    path('inventory/<int:pk>/',     views.inventory_detail,    name='inventory-detail'),
    path('inventory/alerts/',       views.inventory_alerts_view, name='inventory-alerts'),

    # Billing
    path('billing/',            views.billing_list,     name='billing-list'),
    path('billing/<int:pk>/',   views.billing_detail,   name='billing-detail'),

    # Settings
    path('settings/',           views.settings,         name='settings'),

    # Dashboard
    path('dashboard/stats/',    views.dashboard_stats,  name='dashboard-stats'),

    # NLP / LLM
    path('nlp/parse-notes/',           views.nlp_parse_notes,         name='nlp-parse-notes'),
    path('nlp/check-drug-conflict/',   views.nlp_check_drug_conflict, name='nlp-check-drug-conflict'),
    path('nlp/generate-care-plan/',    views.nlp_generate_care_plan,  name='nlp-generate-care-plan'),
    path('nlp/translate/',             views.nlp_translate,           name='nlp-translate'),
    path('nlp/chat/',                  views.nlp_chat,                name='nlp-chat'),
]
