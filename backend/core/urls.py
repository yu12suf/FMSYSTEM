from django.urls import path
from .views import (
    RecordListCreateView,
    RecordSearchView,
    RecordDetailView,
    RecordUpdateByUPIN,  # ✅ import the new view
    RecentRecordsView,
    ProofOfPossessionStats,
    ServiceOfEstateStats,
    FileDetailView,
    RecordUpdateView,
    search_records_by_service,  # Add this line
    search_records_by_kebele,  # Add this line
    search_records_by_proof,  # Add this line
    search_records_by_possession,  # Add this line
)
from .views import  upload_files, check_upin

from rest_framework.routers import DefaultRouter
from .views import RecordViewSet, upload_record_files
from .views import RecordViewSet

# Initialize the router for viewsets
router = DefaultRouter()
router.register(r'records', RecordViewSet, basename='record')

# Define urlpatterns
urlpatterns = [
    path('api/records/', RecordListCreateView.as_view(), name='record-list-create'),  # GET all records / POST new record
    path('api/records/search/', RecordSearchView.as_view(), name='record-search'),  # GET search by UPIN or File Code
    path('api/records/upin/<str:upin>', RecordUpdateByUPIN.as_view(), name='record-update-by-upin'),  # PUT/DELETE individual record by UPIN
    path('api/records/<int:pk>', RecordDetailView.as_view(), name='record-detail'),  # PUT/DELETE individual record by ID
    path('api/records/search-by-service/', search_records_by_service, name='search-by-service'),  # Search by Service of Estate
    path('api/records/search-by-kebele/', search_records_by_kebele, name='search-by-kebele'),  # Search by Kebele
    path('api/records/search-by-proof/', search_records_by_proof, name='search-by-proof'),  # Search by Proof of Possession
    path('api/records/search-by-possession/', search_records_by_possession, name='search-by-possession'),  # Search by Possession Status
    path('api/records/recent/', RecentRecordsView.as_view(), name='recent-records'),  # GET recent records
    path("api/statistics/proof-of-possession", ProofOfPossessionStats.as_view(), name='proof-of-possession-stats'),  # Proof of Possession Stats
    path("api/statistics/service-of-estate", ServiceOfEstateStats.as_view(), name='service-of-estate-stats'),  # Service of Estate Stats
    path('api/records/<str:upin>/files/', upload_files, name='upload_files'),  # Upload or list files for a record
    path('api/records/check-upin/<str:upin>/', check_upin, name='check-upin'),  # Check if a UPIN exists
    path("api/files/<int:pk>/", FileDetailView.as_view(), name="file-detail"),
    path("api/records/<str:upin>/", RecordUpdateView.as_view(), name="record-update"),
    path("api/files/<str:upin>/", FileDetailView.as_view(), name="file-upload"),
]

# Add router URLs
urlpatterns += router.urls