from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

import pandas as pd
from statsmodels.tsa.api import SimpleExpSmoothing

from .models import Case

@api_view(['GET'])
# @permission_classes((IsAuthenticated, ))
def forecast(request):
    csv_file_path = Case.objects.all().first().csv_file.url
    dataset = pd.read_csv(csv_file_path[1:], index_col='Date')
    dataset.squeeze()
    dataset.index = pd.to_datetime(dataset.index)

    data = {
        'a': dataset
    }
    return Response(data)