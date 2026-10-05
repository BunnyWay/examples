from django.urls import path

from uploads import views

urlpatterns = [
    path("", views.index),
    path("api/uploads", views.create_upload),
    path("api/videos/<str:video_id>", views.video_status),
]
