from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.core.files import File

import sys
import datetime
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

from .models import Case

@api_view(['GET', 'POST'])
def forecast(request):
    # read data, convert to pd.Series, and add date index
    series = []
    if request.method == 'GET':
        recent_case = Case.objects.all().first()
        # print(recent_case.start_date)
        csv_file_path = recent_case.csv_file.url
        series = pd.read_csv(csv_file_path[1:])
        series = series.iloc[:, 0]
        series.index = pd.date_range(start=recent_case.start_date, periods=len(series), freq='M')

    elif request.method == 'POST':
        series = pd.Series(request.data['cases'])
        print('isNull', pd.isnull(request.data['cases'][-1]))
        series.index = pd.date_range(start=datetime.date(2010, 1, 1), periods=len(request.data['cases']), freq='M')

    # generate training and testing data
    seventy_percent = int(((len(series)) / 10) * 7.5)
    train = series[:seventy_percent]
    test = series[seventy_percent:]

    # fit model
    initial_model = ARIMA(train, order=(1,1,1), freq="M").fit()
    final_model = ARIMA(series, order=(1,1,1), freq="M").fit()

    # get validation and residuals
    validation = pd.Series(initial_model.forecast(len(test)))
    residuals = test - validation

    # forecast
    forecast = pd.Series(final_model.forecast(12), name='Forecast')

    data = {
        "actual": {
            "name": "Actual",
            "startDate": [series.index[0].year, series.index[0].month, series.index[0].day],
            "cases": series.tolist(),
        },
        "validation" : {
            "name": "Validation",
            "startDate": [validation.index[0].year, validation.index[0].month],
            "cases": validation.tolist(),
        },
        "residuals": {
            "name": "Residuals",
            "startDate": [residuals.index[0].year, residuals.index[0].month],
            "cases": residuals.tolist()
        },
        "forecast": {
            "name": "Forecast",
            "startDate": [forecast.index[0].year, forecast.index[0].month],
            "cases": forecast.tolist()
        }
    }

    return Response(data)

@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def update_table(request):
    try:
        series = pd.Series([int(value) for value in request.data['cases']], name='Cases')
        start_date = datetime.datetime.strptime(request.data['startDate'], '%Y-%m-%d').date()
        
        series.to_csv("media/new.csv", index=False)
        f = open('media/new.csv')
        myfile = File(f)

    except ValueError:
        return Response(status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

    new_record = Case(start_date=start_date)
    new_record.csv_file.save("new.csv", myfile)
    new_record.save()

    return Response()