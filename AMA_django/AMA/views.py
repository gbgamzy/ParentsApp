import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from AMA.api import AMA 
import logging

@csrf_exempt
def getEnrollmentToken1(request):
    logging.debug(request.method)
    if(request.method != 'PUT'):

        logging.debug("Invalid method")
        logging.debug(request.method)
        return JsonResponse({
            'message': 'Invalid request',
            'method': str(request.method)
        },
        status=400)
    
    print("getting enrollment token..")
    logging.debug("getting enrollment token..")
    # data = request.body.decode('utf-8')
    data = json.loads(request.body)
    logging.debug(data)

    try:
        policy = data['policyItself']
        # print(policy)
        policyMade = AMA().patchPolicy(policy)
        if(policyMade == False):
            return JsonResponse({'message': 'Some error occured'},
                            status=304)
        token = AMA().createEnrollmentToken(policy)
        return JsonResponse({'message': 'Token generated successfully',
                            'status': 'success',
                            'body': {
                                'token': token,
                            }    
        }, status = 200)
        

    except Exception as e:
        print(e)
        return JsonResponse({'message': 'Some error occured',
                        'status': 'error',
                        'body': "",
                        'error': str(e)
                        },
                        status=400)


@csrf_exempt
def updatePolicy1(request):
    print("Django View")
    if(request.method != 'PUT'):
        print("Invalid method")
        return JsonResponse({'message': 'Invalid request'},
                            status=400)
    print("updating policy..")
    
    try:
        print("Printing Django view")
        print(request.body)
        data = json.loads(request.body)
        # print(data)
        
        apiPatch = AMA().patchPolicy(data['policyItself'])
        if(apiPatch == True):
            return JsonResponse({'message': 'Policy updated successfully',
                            'status': 'success',
                            
        }, status = 200)
        else :
            return JsonResponse({'message': 'Some error occured',
                            'body': {apiPatch},
                            'error': "Policy not updated on AMA"
                            },
                            status=503)
        
    except Exception as e:
        # print(e)
        return JsonResponse({'message': 'Some error occured',
                            'body': {},
                            'error': str(e)
                            },
                            status=403)


