from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('cadastro/', views.cadastro, name='cadastro'),
    path(
        'login/',
        auth_views.LoginView.as_view(template_name='registration/login.html'),
        name='login',
    ),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    path('comunidades/', views.comunidade_list, name='comunidade_list'),
    path('comunidades/nova/', views.comunidade_create, name='comunidade_create'),
    path('comunidades/<uuid:pk>/', views.comunidade_detail, name='comunidade_detail'),
    path('comunidades/<uuid:pk>/editar/', views.comunidade_update, name='comunidade_update'),
    path('comunidades/<uuid:pk>/excluir/', views.comunidade_delete, name='comunidade_delete'),

    path('eventos/', views.evento_list, name='evento_list'),
    path('eventos/novo/', views.evento_create, name='evento_create'),
    path('eventos/<uuid:pk>/', views.evento_detail, name='evento_detail'),
    path('eventos/<uuid:pk>/editar/', views.evento_update, name='evento_update'),
    path('eventos/<uuid:pk>/excluir/', views.evento_delete, name='evento_delete'),
]
