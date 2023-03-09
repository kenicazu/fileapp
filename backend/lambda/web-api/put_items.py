import boto3
import os
import hashlib
from datetime import datetime, timedelta, timezone

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('ITEM_TABLE_NAME'))

JST = timezone(timedelta(hours=+9), 'JST')


def handler(payload):
    timestamp = int(datetime.now(JST).timestamp())
    material = payload["itemName"] + payload["categoryName"]
    hash = hashlib.sha256()
    hash.update(material.encode())
    item = {
        "item_id": hash.hexdigest(),
        "created_at": timestamp,
        "item_name": payload["itemName"],
        "category_name": payload["categoryName"],
        "file_name": payload["fileName"],
        "s3_path": payload["fileName"]
        # "s3_path": hash.hexdigest() + payload["fileName"].split('.')[-1]
    }
    table.put_item(
        Item=item
    )

    return []
