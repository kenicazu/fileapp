export default {
  // Cognito UserPoolを配置しているAWSリージョン
  awsRegion: 'ap-northeast-1',

  // Cognito UserPoolのID
  userPoolId: 'ap-northeast-1_XXXXXXXX',

  // Cognito UserPool ClientのID
  userPoolClientId: 'XXXXXXXXXXXXXXXXXX',

  // Cognito Identity PoolのID
  identityPoolId: 'ap-northeast-1:XXXXXXXXXXXXXXXXXX',

  // ファイルを保存するS3のバケット名
  bucket: 'backendstack-XXXXXXXXXXXXXXXXXX',

  // バックエンドAPIのエンドポイント
  mainApiEndpoint:
    'https://XXXXXXXXXXXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/api/',
};
