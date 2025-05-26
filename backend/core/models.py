from django.db import models

class Record(models.Model):
    PropertyOwnerName = models.CharField(max_length=255)
    ExistingArchiveCode = models.CharField(max_length=255, db_index=True)  # searchable
    UPIN = models.CharField(max_length=255, unique=True, db_index=True)  # searchable
    ServiceOfEstate = models.CharField(max_length=255)
    placeLevel = models.CharField(max_length=255)
    possessionStatus = models.CharField(max_length=255)
    spaceSize = models.CharField(max_length=255)
    kebele = models.CharField(max_length=255)
    proofOfPossession = models.CharField(max_length=255)
    DebtRestriction = models.CharField(max_length=255)
    LastTaxPaymtDate = models.DateField(null=True, blank=True)
    unpaidTaxDebt = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    InvoiceNumber = models.CharField(max_length=255, null=True, blank=True)
    lastDatePayPropTax = models.DateField(null=True, blank=True)
    unpaidPropTaxDebt = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    InvoiceNumber2 = models.CharField(max_length=255, null=True, blank=True)
    filePath = models.CharField(max_length=255, null=True, blank=True)
    EndLeasePayPeriod = models.DateField(null=True, blank=True)
    unpaidLeaseDebt = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    InvoiceNumber3 = models.CharField(max_length=255, null=True, blank=True)
    FolderNumber = models.CharField(max_length=255, null=True, blank=True)
    Row = models.CharField(max_length=255, null=True, blank=True)
    ShelfNumber = models.CharField(max_length=255, null=True, blank=True)
    NumberOfPages = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # optional: tracking
    updated_at = models.DateTimeField(auto_now=True)      # optional: tracking

    def __str__(self):
        return f"{self.UPIN} - {self.PropertyOwnerName}"


class RecordFile(models.Model):
    record = models.ForeignKey(Record, related_name='files', on_delete=models.CASCADE)
    uploaded_file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    display_name = models.CharField(max_length=255, blank=True)  # Add this
    category = models.CharField(max_length=32, blank=True)       # Add this 

      
