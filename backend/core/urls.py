from django.urls import path
from .views import (
    RecordListCreateView,
    RecordSearchView,
    RecordDetailView,
    RecordUpdateByUPIN,  # ✅ import the new view
    RecentRecordsView,
    ProofOfPossessionStats,
    ServiceOfEstateStats,
    search_records_by_service,  # Add this line
    search_records_by_kebele,  # Add this line
    search_records_by_proof,  # Add this line
    search_records_by_possession,  # Add this line
)
from .views import upload_files_to_record, upload_files


urlpatterns = [
    path('api/records/', RecordListCreateView.as_view(), name='record-list-create'),       # GET all records / POST new record
    path('api/records/search/', RecordSearchView.as_view(), name='record-search'),  # GET search by UPIN or File Code
    path('api/records/upin/<str:upin>', RecordUpdateByUPIN.as_view(), name='record-update-by-upin'),# PUT/DELETE individual record by ID
    path('api/records/<int:pk>', RecordDetailView.as_view(), name='record-detail'),   # ✅ PUT update by UPIN           
    path('records/search-by-service/', search_records_by_service, name='search-by-service'),  # Add this line
    path('records/search-by-kebele/', search_records_by_kebele, name='search-by-kebele'),  # Add this line
    path('records/search-by-proof/', search_records_by_proof, name='search-by-proof'),  # Add this line
    path('records/search-by-possession/', search_records_by_possession, name='search-by-possession'),  # Add this line
    path('records/<str:upin>/', upload_files_to_record, name='upload_files_to_record'),
    path('api/records/search/', RecordSearchView.as_view(), name='record-search'),
    path('api/records/recent/', RecentRecordsView.as_view(), name='recent-records'),
    path("api/statistics/proof-of-possession", ProofOfPossessionStats.as_view()),
    path("api/statistics/service-of-estate", ServiceOfEstateStats.as_view()),
    path('api/records/<str:upin>/upload/', upload_files, name='upload_files'),


]
