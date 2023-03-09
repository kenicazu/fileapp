import { Auth } from 'aws-amplify';
import config from './config';

const settings = {
  API: {
    endpoints: [
      {
        name: 'main',
        endpoint: config.mainApiEndpoint,
        custom_header: async () => {
          const currentSession = await Auth.currentSession();
          return {
            Authorization: currentSession.getIdToken().getJwtToken(),
            'Content-type': 'application/json',
          };
        },
      },
    ],
  },
  Auth: {
    region: config.awsRegion,
    userPoolId: config.userPoolId,
    userPoolWebClientId: config.userPoolClientId,
    identityPoolId: config.identityPoolId,
  },

  Storage: {
    region: config.awsRegion,
    bucket: config.bucket,
  },
};

export default settings;
