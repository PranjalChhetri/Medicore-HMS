from django.contrib import admin
from .models import Patient, Doctor, Appointment, Inventory, Billing


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'age', 'gender', 'condition', 'risk_label', 'readmission_risk')
    list_filter   = ('gender', 'risk_label')
    search_fields = ('name', 'condition', 'phone')


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'spec', 'dept', 'status')
    list_filter   = ('status', 'dept')
    search_fields = ('name', 'spec')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display  = ('id', 'patient', 'doctor', 'date', 'time', 'status', 'conflict_flag')
    list_filter   = ('status', 'conflict_flag')
    search_fields = ('patient', 'doctor')


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'category', 'quantity', 'unit', 'status', 'auto_reorder_alert')
    list_filter   = ('category', 'status', 'auto_reorder_alert')
    search_fields = ('name', 'supplier')


@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display  = ('id', 'patient', 'amount', 'paid', 'status', 'date')
    list_filter   = ('status',)
    search_fields = ('patient',)
