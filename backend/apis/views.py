from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

import datetime
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

from .models import Case

@api_view(['GET', 'POST'])
# @permission_classes((IsAuthenticated, ))
def forecast(request):
    # read data, convert to pd.Series, and add date index
    series = []
    if request.method == 'GET':
        recent_case = Case.objects.all().first()
        csv_file_path = recent_case.csv_file.url
        series = pd.read_csv(csv_file_path[1:])
        series = series.iloc[:, 0]
        series.index = pd.date_range(start=recent_case.start_date, periods=len(series), freq='M')

    elif request.method == 'POST':
        series = pd.Series(request.data['cases'])
        series.index = pd.date_range(start=datetime.date(2010, 1, 1), periods=len(request.data['cases']), freq='M')

    # generate training and testing data
    seventy_percent = int(((len(series)) / 10) * 7.5)
    train = series[:seventy_percent]
    test = series[seventy_percent:]

    # fit model
    initial_model = ARIMA(train, order=(1,1,1), freq="M").fit()
    final_model = ARIMA(series, order=(1,1,1), freq="M").fit()

    # get validation and residuals
    validation = pd.Series(initial_model.forecast(len(test))[0], index=test.index)
    residuals = test - validation

    # # forecast
    # forecast = pd.Series(final_model.forecast(24)[0], index=pd.date_range(start=series.index[-1], periods=24, freq='M', closed='right')).to_frame('Number of Cases')

    data = {
        "actual": {
            "startDate": [series.index[0].year, series.index[0].month],
            "cases": series.tolist(),
        },
        "validation" : {
            "startDate": [validation.index[0].year, validation.index[0].month],
            "cases": validation.tolist(),
        },
         "residuals": {
            "startDate": [residuals.index[0].year, residuals.index[0].month],
            "cases": residuals.tolist()
        },
    }

    return Response(data)

# @api_view(['POST'])
# def edit(request):
