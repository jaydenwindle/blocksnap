from django.urls import path
from core import views

urlpatterns = [
    path('create-snapshot/', views.create_snapshot, name="create-snapshot"),
    path('get-snapshots/<str:user_address>/', views.get_snaphot_list,
         name="get-snapshot-by-user"),
    path('get-snapshots/<str:user_address>/<str:contract_address>/',
         views.get_snaphot_list_by_contract,
         name="get-snapshot-by-contract"),
]
