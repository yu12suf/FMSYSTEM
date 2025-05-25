from rest_framework import serializers
from .models import Record, RecordFile

class RecordFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecordFile
        fields = ['id', 'uploaded_file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class RecordSerializer(serializers.ModelSerializer):
    files = RecordFileSerializer(many=True, read_only=True)

    class Meta:
        model = Record
        fields = '__all__'

    def to_internal_value(self, data):
        # Clone data to avoid mutating input
        data = data.copy()

        # Auto-format 4-digit year to full date format
        date_fields = ['LastTaxPaymtDate', 'lastDatePayPropTax', 'EndLeasePayPeriod']
        for field in date_fields:
            val = data.get(field)
            if val and len(val) == 4 and val.isdigit():
                data[field] = f"{val}-01-01"
        return super().to_internal_value(data)
