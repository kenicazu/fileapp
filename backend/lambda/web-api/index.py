import os
from http import HTTPStatus
from aws_lambda_powertools.event_handler.api_gateway import ApiGatewayResolver, CORSConfig
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools import Logger
import get_items
import put_items

from common import make_response


ALLOW_ORIGIN = os.environ['ALLOW_ORIGIN']
cors_config = CORSConfig(allow_origin=ALLOW_ORIGIN)
logger = Logger()
app = ApiGatewayResolver(cors=cors_config)


@app.get("/items/")
def get_items_handler():
    return make_response(get_items.handler())


@app.put("/items/")
def put_items_handler():
    payload = app.current_event.json_body
    return make_response(put_items.handler(payload))


@app.exception_handler(Exception)
def handle_any_error(e: Exception):
    metadata = {"path": app.current_event.path}
    logger.error(f"Error: {e}", extra=metadata)
    return make_response({'error': str(e)}, HTTPStatus.INTERNAL_SERVER_ERROR)


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
def handler(event, context):
    logger.debug(event)
    return app.resolve(event, context)
