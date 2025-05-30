from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from django.db.models import Count
from rest_framework.generics import ListAPIView
from rest_framework import viewsets

from .models import Record, RecordFile
from .serializers import RecordSerializer, RecordFileSerializer

import mimetypes
import hashlib

# Create or List Records
class RecordListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        records = Record.objects.all().order_by('-id')
        serializer = RecordSerializer(records, many=True)
        return Response(serializer.data)

    def post(self, request):
        print("Incoming request data:", request.data)

        files = request.FILES.getlist('files')
        data = request.data.copy()
        

        # Check if a record with the same UPIN already exists
        upin = data.get('UPIN')
        if Record.objects.filter(UPIN=upin).exists():
            return Response(
                {'error': f"A record with UPIN '{upin}' already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RecordSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            record = serializer.save()

            # Save related files
            for idx, file in enumerate(files):
                display_name = request.data.getlist('names[]')[idx] if idx < len(request.data.getlist('names[]')) else file.name
                category = request.data.getlist('categories[]')[idx] if idx < len(request.data.getlist('categories[]')) else "Uncategorized"
                RecordFile.objects.create(
                    record=record,
                    uploaded_file=file,
                    display_name=display_name,
                    category=category
                )

            return Response(RecordSerializer(record).data, status=status.HTTP_201_CREATED)

        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

        serializer = RecordSerializer(record, data=data, context={'request': request})
        if serializer.is_valid():
            updated_record = serializer.save()

            # Save new uploaded files if any
            for f in files:
                print(f"Saving file: {f.name}")  # Debugging log
                RecordFile.objects.create(record=updated_record, uploaded_file=f)

            return Response(RecordSerializer(updated_record).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        record = self.get_object(pk)
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Update a record by UPIN
class RecordUpdateByUPIN(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, upin):
        record = get_object_or_404(Record, UPIN=upin)
        serializer = RecordSerializer(record, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Search by Service of Estate
@api_view(['GET'])
def search_records_by_service(request):
    service = request.GET.get('ServiceOfEstate')
    if service:
        records = Record.objects.filter(ServiceOfEstate=service)
        serializer = RecordSerializer(records, many=True)
        return Response(serializer.data, status=200)
    return Response({'error': 'ServiceOfEstate parameter is required'}, status=400)

# Search by Kebele
@api_view(['GET'])
def search_records_by_kebele(request):
    kebele = request.GET.get('kebele')
    if kebele:
       records = Record.objects.filter(kebele=kebele) 
       serializer = RecordSerializer(records, many=True)
       return Response(serializer.data, status=200)
    return Response({'error': 'kebele parameter is required'}, status=400)

# Search by Proof of Possession
@api_view(['GET'])
def search_records_by_proof(request):
    proof = request.GET.get('proofOfPossession')
    if proof:
      records = Record.objects.filter(proofOfPossession=proof) 
      serializer = RecordSerializer(records, many=True)
      return Response(serializer.data, status=200)
    return Response({'error': 'proofOfPossession parameter is required'}, status=400)

# Search by Possession Status
@api_view(['GET'])
def search_records_by_possession(request):
    possession = request.GET.get('possessionStatus')
    if possession:
      records = Record.objects.filter(possessionStatus=possession) 
      serializer = RecordSerializer(records, many=True)
      return Response(serializer.data, status=200)
    return Response({'error': 'possessionStatus parameter is required'}, status=400)

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

@api_view(['GET'])
def check_upin(request, upin):
    exists = Record.objects.filter(UPIN=upin).exists()
    return Response({"exists": exists}, status=200)

# Handles uploading files after a record is created (via UPIN) AND listing files for a record
@api_view(['GET', 'PUT'])
@parser_classes([MultiPartParser, FormParser])
def upload_record_files(request, upin):
    record = get_object_or_404(Record, UPIN=upin)

    if request.method == 'GET':
        files = RecordFile.objects.filter(record=record)
        if not files.exists():
            return Response({'error': f"No files found for the record with UPIN '{upin}'."}, status=status.HTTP_404_NOT_FOUND)

        serializer = RecordFileSerializer(files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    elif request.method == 'PUT':
        files = request.FILES.getlist('files')
        names = request.data.getlist('names[]') or request.data.getlist('names')
        categories = request.data.getlist('categories[]') or request.data.getlist('categories')

        if len(files) != len(names) or len(files) != len(categories):
            return Response({'error': 'Mismatch between files, names, and categories.'}, status=400)

        for idx, file in enumerate(files):
            display_name = names[idx] if idx < len(names) else file.name
            category = categories[idx] if idx < len(categories) else "Uncategorized"
            content_type = file.content_type or mimetypes.guess_type(file.name)[0] or "Unknown"

            # Generate hash for the file content
            hasher = hashlib.sha256()
            for chunk in file.chunks():
                hasher.update(chunk)
            file_hash = hasher.hexdigest()

            
            # Check if the file already exists using the hash
            if not RecordFile.objects.filter(
                file_hash=file_hash, record=record,
                display_name=display_name,
                uploaded_file__name=file.name,
                category=category,
                type=content_type
            ).exists():
                RecordFile.objects.create(
                  record=record,
                  uploaded_file=file,
                  display_name=display_name,
                  category=category,
                  type=content_type
               )

        
        return Response({'status': 'files uploaded successfully'}, status=200)

    
    return Response({'error': 'Method not allowed'}, status=405)
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


@api_view(['GET', 'PUT'])
@parser_classes([MultiPartParser, FormParser])
def upload_files(request, upin):
    """
    Handles uploading files to a record identified by UPIN and retrieving files for a record.
    """
    record = get_object_or_404(Record, UPIN=upin)

    if request.method == 'GET':
        files = RecordFile.objects.filter(record=record)

        if not files.exists():
            return Response({'error': f"No files found for the record with UPIN '{upin}'."}, status=status.HTTP_404_NOT_FOUND)

        serializer = RecordFileSerializer(files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        files = request.FILES.getlist('files')
        names = request.data.getlist('names[]') or request.data.getlist('names')
        categories = request.data.getlist('categories[]') or request.data.getlist('categories')

        if len(files) != len(names) or len(files) != len(categories):
            return Response({'error': 'Mismatch between files, names, and categories.'}, status=status.HTTP_400_BAD_REQUEST)

        for idx, file in enumerate(files):
            display_name = names[idx] if idx < len(names) else file.name
            category = categories[idx] if idx < len(categories) else "Uncategorized"
            content_type = file.content_type or mimetypes.guess_type(file.name)[0] or "Unknown"

            # Generate hash for the file content
            hasher = hashlib.sha256()
            for chunk in file.chunks():
                hasher.update(chunk)
            file_hash = hasher.hexdigest()

            # Prevent duplicate files
            if not RecordFile.objects.filter(
                file_hash=file_hash, record=record,
                display_name=display_name,
                uploaded_file__name=file.name,
                category=category,
                type=content_type
            ).exists():
                RecordFile.objects.create(
                    record=record,
                    uploaded_file=file,
                    display_name=display_name,
                    category=category,
                    type=content_type
                )

        return Response({'status': 'files uploaded successfully'}, status=status.HTTP_200_OK)

    return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


##############
#######
class FileDetailView(APIView):
    def put(self, request, pk):
        file = get_object_or_404(RecordFile, pk=pk)
        uploaded_file = request.FILES.get("uploaded_file")
        if uploaded_file:
            file.uploaded_file = uploaded_file
            file.save()
            return Response({"message": "File replaced successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        file = get_object_or_404(RecordFile, pk=pk)
        if file.category == "required":
            return Response(
                {"error": "Required files cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def post(self, request, upin):
        record = get_object_or_404(Record, UPIN=upin)
        uploaded_file = request.FILES.get("uploaded_file")
        display_name = request.data.get("display_name")
        category = request.data.get("category", "additional")

        if uploaded_file and display_name:
            RecordFile.objects.create(
                record=record,
                uploaded_file=uploaded_file,
                display_name=display_name,
                category=category,
            )
            return Response({"message": "File uploaded successfully."}, status=status.HTTP_201_CREATED)
        return Response({"error": "Invalid file or display name."}, status=status.HTTP_400_BAD_REQUEST)

class RecordUpdateView(APIView):
    def put(self, request, upin):
        record = Record.objects.filter(UPIN=upin).first()
        if not record:
            return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = RecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)   