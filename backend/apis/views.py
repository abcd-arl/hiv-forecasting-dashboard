from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

from .models import Case


@api_view(['GET'])
# @permission_classes((IsAuthenticated, ))
def forecast(request):

    # read and initialize data
    csv_file_path = Case.objects.all().first().csv_file.url
    dataset = pd.read_csv(csv_file_path[1:], index_col='Date')
    dataset.squeeze()
    dataset.index = pd.to_datetime(dataset.index)

    # training and testing set
    seventy_percent = int(((len(dataset)) / 10) * 7.5)
    train = dataset[:seventy_percent]
    test = dataset[seventy_percent:]

    # set model
    initial_model = ARIMA(train, order=(1, 1, 1), freq="M").fit()
    final_model = ARIMA(dataset, order=(1, 1, 1), freq="M").fit()

    # validation from the initial model
    validation = pd.Series(initial_model.forecast(len(test))[
                           0], index=test.index).to_frame('Number of Cases')
    validation.index = pd.to_datetime(validation.index)
    residuals = test - validation

    # forecast

    data = {
        'dataset': dataset,
        'validation': validation,
    }

    return Response(data)
