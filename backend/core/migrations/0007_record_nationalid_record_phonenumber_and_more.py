# Generated by Django 5.2.1 on 2025-05-27 08:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_recordfile_category_recordfile_display_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='record',
            name='NationalId',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='record',
            name='PhoneNumber',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='record',
            name='TotalBirr',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
