# Generated by Django 5.2.1 on 2025-05-22 19:35

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_remove_record_uploadedfile_recordfile'),
    ]

    operations = [
        migrations.AddField(
            model_name='record',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='record',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='record',
            name='ExistingArchiveCode',
            field=models.CharField(db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='record',
            name='UPIN',
            field=models.CharField(db_index=True, max_length=255, unique=True),
        ),
    ]
