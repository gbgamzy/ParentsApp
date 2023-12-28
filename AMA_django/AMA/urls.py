from django.urls import path
from . import views

urlpatterns = [
    path('updatePolicy1/', views.updatePolicy1, name = 'updatePolicy1'),
    path('getEnrollmentToken1/', views.getEnrollmentToken1, name = 'getEnrollmentToken1'),

]