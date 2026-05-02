from django.urls import path
from api import views

urlpatterns = [
    path("", views.home),
    path("api/auth/register", views.register_user),
    path("api/auth/login", views.login_user),

    path("api/tasks", views.get_create_tasks),
    path("api/tasks/<int:task_id>", views.update_delete_task),

    path("api/admin/users", views.admin_users),
    path("api/admin/tasks", views.admin_tasks),
    path("api/admin/tasks/<int:task_id>", views.admin_delete_task),
]