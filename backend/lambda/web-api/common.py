import json
from http import HTTPStatus
from decimal import Decimal
import datetime
from aws_lambda_powertools.event_handler.api_gateway import Response


def default_json_converter(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    if isinstance(obj, datetime.date):
        return obj.strftime('%Y%m%d')
    raise TypeError


def make_response(body, status_code=HTTPStatus.OK):
    return Response(status_code=status_code,
                    content_type="application/json",
                    body=json.dumps(body, default=default_json_converter)
                    )


def validate_date(date_str):
    return datetime.date.fromisoformat(date_str)
