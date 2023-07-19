import json
from django.http import JsonResponse
from django.shortcuts import render
from AMA.api import AMA



def updatePolicy(request):
        
    if(request.method != 'PUT'):
        return JsonResponse({'message': 'Invalid request'},
                            status=400)
    print("updating policy..")
    
    try:
        data = json.loads(request.body)
        print(data)
        
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
        print(e)
        return JsonResponse({'message': 'Some error occured',
                            'body': {},
                            'error': str(e)
                            },
                            status=400)
