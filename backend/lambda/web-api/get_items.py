import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('ITEM_TABLE_NAME'))


def handler():
    res = table.scan()
    items = res.get('Items', [])
    if len(items) == 0:
        return []
    else:
        js_items = [{
                    'itemName': item["item_name"],
                    'categoryName': item['category_name'],
                    'itemId': item['item_id'],
                    'createdAt': item['created_at'],
                    'fileName': item['file_name'],
                    's3Path': item['s3_path']
                    } for item in items]
        return js_items
