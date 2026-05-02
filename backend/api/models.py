from django.db import models


class Patient(models.Model):
    GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    BLOOD_CHOICES = [('A+','A+'),('A-','A-'),('B+','B+'),('B-','B-'),
                     ('O+','O+'),('O-','O-'),('AB+','AB+'),('AB-','AB-')]

    name      = models.CharField(max_length=100)
    age       = models.IntegerField()
    gender    = models.CharField(max_length=10, choices=GENDER_CHOICES)
    condition = models.CharField(max_length=200, blank=True, default='')
    phone     = models.CharField(max_length=20, blank=True, default='')
    blood     = models.CharField(max_length=5, choices=BLOOD_CHOICES, blank=True, default='')
    address   = models.CharField(max_length=300, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    # ML risk fields (auto-populated by prediction engine)
    readmission_risk = models.FloatField(null=True, blank=True)
    risk_label       = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return self.name


class Doctor(models.Model):
    STATUS_CHOICES = [('Active','Active'), ('On Leave','On Leave'), ('Inactive','Inactive')]

    name   = models.CharField(max_length=100)
    spec   = models.CharField(max_length=100)   # specialization
    phone  = models.CharField(max_length=20, blank=True, default='')
    exp    = models.CharField(max_length=30, blank=True, default='')
    dept   = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    def __str__(self):
        return self.name


class Appointment(models.Model):
    STATUS_CHOICES = [('Scheduled','Scheduled'), ('Completed','Completed'), ('Cancelled','Cancelled')]

    patient = models.CharField(max_length=100)   # name string (mirrors frontend)
    doctor  = models.CharField(max_length=100)
    date    = models.DateField()
    time    = models.CharField(max_length=10, blank=True, default='')
    status  = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    notes   = models.TextField(blank=True, default='')

    # Smart scheduling fields
    suggested_slot  = models.CharField(max_length=50, blank=True, default='')
    conflict_flag   = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.patient} → {self.doctor} on {self.date}"


class Inventory(models.Model):
    CATEGORY_CHOICES = [('Medicine','Medicine'), ('PPE','PPE'), ('Equipment','Equipment'),
                        ('Supplies','Supplies'), ('Consumables','Consumables')]
    STATUS_CHOICES   = [('In Stock','In Stock'), ('Low Stock','Low Stock'),
                        ('Critical','Critical'), ('Out of Stock','Out of Stock')]

    name       = models.CharField(max_length=200)
    category   = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    quantity   = models.IntegerField(default=0)
    unit       = models.CharField(max_length=30, blank=True, default='')
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='In Stock')
    supplier   = models.CharField(max_length=100, blank=True, default='')
    reorder_at = models.IntegerField(default=10)   # reorder threshold
    reorder_qty= models.IntegerField(default=50)   # suggested reorder qty

    # ML alert flag
    auto_reorder_alert = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Billing(models.Model):
    STATUS_CHOICES = [('Paid','Paid'), ('Pending','Pending'), ('Partial','Partial')]

    patient = models.CharField(max_length=100)
    amount  = models.FloatField()
    paid    = models.FloatField(default=0)
    status  = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    date    = models.DateField()
    desc    = models.CharField(max_length=300, blank=True, default='')

    def __str__(self):
        return f"{self.patient} - ₹{self.amount}"


class Settings(models.Model):
    """Global system settings (singleton pattern)"""
    # Organization
    clinic_name = models.CharField(max_length=200, default='MediCore HMS')
    clinic_address = models.CharField(max_length=500, blank=True, default='')
    clinic_phone = models.CharField(max_length=20, blank=True, default='')
    clinic_email = models.CharField(max_length=100, blank=True, default='')
    operating_hours = models.CharField(max_length=100, default='09:00-18:00')

    # Appointments
    appointment_slot_duration = models.IntegerField(default=30)  # minutes
    max_appointments_per_day = models.IntegerField(default=20)
    advance_booking_days = models.IntegerField(default=30)

    # Inventory
    default_low_stock_threshold = models.IntegerField(default=10)
    default_reorder_quantity = models.IntegerField(default=50)
    auto_reorder_enabled = models.BooleanField(default=True)

    # Billing
    default_consultation_fee = models.FloatField(default=500)
    tax_percentage = models.FloatField(default=18)
    currency = models.CharField(max_length=10, default='INR')

    # Predictions
    high_risk_threshold = models.IntegerField(default=70)
    moderate_risk_threshold = models.IntegerField(default=40)
    save_prediction_history = models.BooleanField(default=True)

    # Display
    theme = models.CharField(max_length=20, default='dark')
    date_format = models.CharField(max_length=20, default='DD-MM-YYYY')
    items_per_page = models.IntegerField(default=10)

    # Notifications
    email_alerts = models.BooleanField(default=True)
    sms_alerts = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Settings"

    def __str__(self):
        return f"System Settings (updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"
