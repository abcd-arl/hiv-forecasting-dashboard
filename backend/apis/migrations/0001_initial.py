# Generated by Django 4.1.2 on 2022-10-14 13:54

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Case',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('csv_file', models.FileField(upload_to='csv-files')),
                ('start_date', models.DateField(blank=True, default=None, null=True)),
                ('date_uploaded', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-date_uploaded'],
            },
        ),
    ]
