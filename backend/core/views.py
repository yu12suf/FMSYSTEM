from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes

from .models import Record, RecordFile
from .serializers import RecordSerializer
from django.db.models import Count


from rest_framework.generics import ListAPIView
# Create or List Records
class RecordListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        records = Record.objects.all().order_by('-id')
        serializer = RecordSerializer(records, many=True)
        return Response(serializer.data)

    def post(self, request):
        print("Incoming request data:", request.data)

        files = request.FILES.getlist('uploaded_files')
        data = request.data.copy()
        data.pop('uploaded_files', None)

        serializer = RecordSerializer(data=data)
        if serializer.is_valid():
            record = serializer.save()

            # Save related files
            for f in files:
                RecordFile.objects.create(record=record, uploaded_file=f)

            return Response(RecordSerializer(record).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    queryset = Record.objects.all()
    serializer_class = RecordSerializer

    def get_queryset(self):
        queryset = Record.objects.all()

        # Sorting (if order=desc is specified)
        order = self.request.query_params.get('order')
        if order == 'desc':
            queryset = queryset.order_by('-created_at')  # Make sure you have a 'created_at' field
        else:
            queryset = queryset.order_by('created_at')

        # Limit
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass

        return queryset


# Search by UPIN or File Code
class RecordSearchView(APIView):
    def get(self, request):
        upin = request.query_params.get('UPIN')
        file_code = request.query_params.get('ExistingArchiveCode')

        if upin:
            records = Record.objects.filter(UPIN=upin)
        elif file_code:
            records = Record.objects.filter(ExistingArchiveCode=file_code)
        else:
            return Response({'error': 'No search parameter provided'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RecordSerializer(records, many=True)
        return Response(serializer.data)


# Edit or Delete a record by PK
class RecordDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        return get_object_or_404(Record, pk=pk)

    def put(self, request, pk):
        record = self.get_object(pk)
        files = request.FILES.getlist('uploaded_files')
        data = request.data.copy()
        data.pop('uploaded_files', None)

        serializer = RecordSerializer(record, data=data)
        if serializer.is_valid():
            updated_record = serializer.save()

            # Save new uploaded files if any
            for f in files:
                RecordFile.objects.create(record=updated_record, uploaded_file=f)

            return Response(RecordSerializer(updated_record).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        record = self.get_object(pk)
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Update a record by UPIN
class RecordUpdateByUPIN(APIView):
    def put(self, request, upin):
        record = get_object_or_404(Record, UPIN=upin)
        serializer = RecordSerializer(record, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Upload a single file to a record by UPIN
@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
def upload_files_to_record(request, upin):
    try:
        record = Record.objects.get(UPIN=upin)
    except Record.DoesNotExist:
        return Response({'error': 'Record not found'}, status=404)

    uploaded_file = request.FILES.get('uploaded_files')
    if uploaded_file:
        RecordFile.objects.create(record=record, uploaded_file=uploaded_file)
        return Response({'status': 'file uploaded'}, status=201)

    return Response({'error': 'No file provided'}, status=400)


# Search by Service of Estate
@api_view(['GET'])
def search_records_by_service(request):
    service = request.GET.get('ServiceOfEstate')
    records = Record.objects.filter(ServiceOfEstate=service) if service else Record.objects.none()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)


# Search by Kebele
@api_view(['GET'])
def search_records_by_kebele(request):
    kebele = request.GET.get('kebele')
    records = Record.objects.filter(kebele=kebele) if kebele else Record.objects.none()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)


# Search by Proof of Possession
@api_view(['GET'])
def search_records_by_proof(request):
    proof = request.GET.get('proofOfPossession')
    records = Record.objects.filter(proofOfPossession=proof) if proof else Record.objects.none()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)


# Search by Possession Status
@api_view(['GET'])
def search_records_by_possession(request):
    possession = request.GET.get('possessionStatus')
    records = Record.objects.filter(possessionStatus=possession) if possession else Record.objects.none()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)

class RecentRecordsView(ListAPIView):
    serializer_class = RecordSerializer

    def get_queryset(self):
        return Record.objects.all().order_by('-created_at')[:4]
    

class ProofOfPossessionStats(APIView):
    def get(self, request):
        stats = (
            Record.objects
            .values("proofOfPossession")
            .annotate(count=Count("proofOfPossession"))
            .order_by("-count")
        )
        return Response(stats)
    

class ServiceOfEstateStats(APIView):
    def get(self, request):
        stats = (
            Record.objects
            .values("ServiceOfEstate")
            .annotate(count=Count("ServiceOfEstate"))
            .order_by("-count")
        )
        return Response(stats)    
@api_view(['POST'])
def upload_files(request, upin):
    print("Received UPIN:", upin)
    try:
        record = Record.objects.get(UPIN=upin)
    except Record.DoesNotExist:
        return Response({'error': 'Record not found.'}, status=status.HTTP_404_NOT_FOUND)

    files = request.FILES.getlist('uploadedFile')
    archive_codes = request.data.getlist('ExistingArchiveCode')

    if len(files) != len(archive_codes):
        return Response({'error': 'Mismatch between files and archive codes.'}, status=status.HTTP_400_BAD_REQUEST)

    for f, code in zip(files, archive_codes):
        RecordFile.objects.create(
            record=record,
            uploadedFile=f,
            ExistingArchiveCode=code
        )

    return Response({'message': 'Files uploaded successfully.'}, status=status.HTTP_201_CREATED)





# new code below here
from rest_framework import viewsets

from .serializers import RecordSerializer
from .models import Record, RecordFile

# Handles creating the Record (with or without inline uploaded files)
class RecordCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print("Incoming request data:", request.data)

        # Extract files uploaded in the same form (optional)
        files = request.FILES.getlist('uploaded_files')

        # Copy request.data to modify
        data = request.data.copy()
        data.pop('uploaded_files', None)  # Remove files key if exists

        serializer = RecordSerializer(data=data)
        if serializer.is_valid():
            record = serializer.save()

            # Save inline files (if any)
            for f in files:
                RecordFile.objects.create(record=record, uploaded_file=f)

            result = RecordSerializer(record)
            return Response(result.data, status=status.HTTP_201_CREATED)

        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Handles uploading files after a record is created (via UPIN)
@api_view(['PUT'])
def upload_record_files(request, upin):
    record = get_object_or_404(Record, UPIN=upin)
    files = request.FILES.getlist('files')
    names = request.data.getlist('names[]') or request.data.getlist('names')
    categories = request.data.getlist('categories[]') or request.data.getlist('categories')

    for idx, file in enumerate(files):
        display_name = names[idx] if idx < len(names) else file.name
        category = categories[idx] if idx < len(categories) else ""
        RecordFile.objects.create(
            record=record,
            uploaded_file=file,
            display_name=display_name,
            category=category
        )

    return Response({'status': 'files uploaded'}, status=status.HTTP_200_OK)

class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer

    def list(self, request, *args, **kwargs):
        upin = request.query_params.get('upin')
        if upin:
            records = Record.objects.filter(UPIN=upin)
            serializer = self.get_serializer(records, many=True)
            return Response(serializer.data)
        return super().list(request, *args, **kwargs)
