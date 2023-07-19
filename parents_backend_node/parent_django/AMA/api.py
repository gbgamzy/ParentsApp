import json
from re import sub
import httplib2
import os
from apiclient import discovery
from google.oauth2 import service_account
from apiclient.discovery import build
from concurrent.futures import TimeoutError
from google.cloud import pubsub_v1


projectId = 'emisafe'
subscriptionId = 'DeviceEnrolledSubscription'
timeout = 5.0
SCOPES = ['https://www.googleapis.com/auth/androidmanagement']
secretFile = os.path.join(os.getcwd(), 'emisafe/emisafe-397b406ffd1b.json')
CALLBACK_URL = 'https://storage.googleapis.com/android-management-quick-start/enterprise_signup_callback.html'
enterpriseId = 'LC03rv38l8'


class AMA:

    id = 'emisafe'
    SCOPES = ['https://www.googleapis.com/auth/androidmanagement']
    secretFile = os.path.join(os.getcwd(), 'emisafe-397b406ffd1b.json')
    CALLBACK_URL = 'https://storage.googleapis.com/android-management-quick-start/enterprise_signup_callback.html'
    subscriptionId = 'DeviceEnrolledSubscription'
    enterpriseId = 'LC03rv38l8'
    timeout = 5.0
    credentials = service_account.Credentials.from_service_account_file(secretFile, scopes=SCOPES)
    # subscriber = pubsub_v1.SubscriberClient()
    # subscriptionPath = subscriber.subscription_path(projectId, subscriptionId)

    api = build('androidmanagement', 'v1', credentials=credentials)

    def patchPolicy(self, policy):
        

        with open('/home/gautam/emigaps.co.in/emisafe-backend/access.log', 'a') as f:
            f.write(json.dumps(policy))
            f.write('\n')

        try:
            self.api.enterprises().policies().patch(
                name = policy['name'],
                body = policy
            ).execute()
            return True
        except Exception as e:
            with open('/home/gautam/emigaps.co.in/emisafe-backend/access.log', 'a') as f:
                f.write(str(e))
                # new line
                f.write('\n')
            print(e)
            return e

    def createEnrollmentToken(self, policy):
        token = self.api.enterprises().enrollmentTokens().create(
            parent='enterprises/'+self.enterpriseId,
            body = {
                'duration': '86400000s',
                'policyName': policy['name'],
                'oneTimeOnly': False,
            }
        ).execute()
        
        return token

    def deleteEnrollmentToken(self, tokenName):
        try:
            res = self.api.enterprises().enrollmentTokens().delete(
                name = tokenName
            ).execute()
            print(res)
        except Exception as e:
            print('error')

    