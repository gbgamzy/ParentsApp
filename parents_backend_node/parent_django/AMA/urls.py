from django.urls import path
from . import views

urlpatterns = [
    path('updatePolicy/', views.updatePolicy, name = 'updatePolicy'),
    path('getEnrollmentToken/', views.getEnrollmentToken, name = 'getEnrollmentToken'),

]