from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Patient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('age', models.IntegerField()),
                ('gender', models.CharField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], max_length=10)),
                ('condition', models.CharField(blank=True, default='', max_length=200)),
                ('phone', models.CharField(blank=True, default='', max_length=20)),
                ('blood', models.CharField(blank=True, default='', max_length=5)),
                ('address', models.CharField(blank=True, default='', max_length=300)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('readmission_risk', models.FloatField(blank=True, null=True)),
                ('risk_label', models.CharField(blank=True, default='', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Doctor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('spec', models.CharField(max_length=100)),
                ('phone', models.CharField(blank=True, default='', max_length=20)),
                ('exp', models.CharField(blank=True, default='', max_length=30)),
                ('dept', models.CharField(blank=True, default='', max_length=100)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('On Leave', 'On Leave'), ('Inactive', 'Inactive')], default='Active', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('patient', models.CharField(max_length=100)),
                ('doctor', models.CharField(max_length=100)),
                ('date', models.DateField()),
                ('time', models.CharField(blank=True, default='', max_length=10)),
                ('status', models.CharField(choices=[('Scheduled', 'Scheduled'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')], default='Scheduled', max_length=20)),
                ('notes', models.TextField(blank=True, default='')),
                ('suggested_slot', models.CharField(blank=True, default='', max_length=50)),
                ('conflict_flag', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Inventory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('category', models.CharField(choices=[('Medicine', 'Medicine'), ('PPE', 'PPE'), ('Equipment', 'Equipment'), ('Supplies', 'Supplies'), ('Consumables', 'Consumables')], max_length=50)),
                ('quantity', models.IntegerField(default=0)),
                ('unit', models.CharField(blank=True, default='', max_length=30)),
                ('status', models.CharField(choices=[('In Stock', 'In Stock'), ('Low Stock', 'Low Stock'), ('Critical', 'Critical'), ('Out of Stock', 'Out of Stock')], default='In Stock', max_length=20)),
                ('supplier', models.CharField(blank=True, default='', max_length=100)),
                ('reorder_at', models.IntegerField(default=10)),
                ('reorder_qty', models.IntegerField(default=50)),
                ('auto_reorder_alert', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Billing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('patient', models.CharField(max_length=100)),
                ('amount', models.FloatField()),
                ('paid', models.FloatField(default=0)),
                ('status', models.CharField(choices=[('Paid', 'Paid'), ('Pending', 'Pending'), ('Partial', 'Partial')], default='Pending', max_length=20)),
                ('date', models.DateField()),
                ('desc', models.CharField(blank=True, default='', max_length=300)),
            ],
        ),
    ]
