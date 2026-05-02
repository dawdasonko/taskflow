import os
import jwt
import bcrypt
from datetime import datetime, timedelta

from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


JWT_SECRET = os.environ.get("JWT_SECRET", "taskflow_secret_key")


def home(request):
    return JsonResponse({
        "message": "TaskFlow API is running successfully with Django and PostgreSQL"
    })


def json_body(request):
    try:
        return json.loads(request.body.decode("utf-8"))
    except Exception:
        return {}


def generate_token(user):
    payload = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(days=1),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def get_auth_user(request):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None


def is_admin(user):
    return user and user.get("role") == "admin"


@csrf_exempt
def register_user(request):
    if request.method == "OPTIONS":
        return JsonResponse({}, status=204)

    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        data = json_body(request)
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return JsonResponse({"message": "All fields are required"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", [email])
            existing = cursor.fetchone()

            if existing:
                return JsonResponse({"message": "Email already registered"}, status=409)

            hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            cursor.execute(
                """
                INSERT INTO users (name, email, password, role)
                VALUES (%s, %s, %s, %s)
                """,
                [name, email, hashed, "user"],
            )

        return JsonResponse({"message": "User registered successfully"}, status=201)

    except Exception as e:
        print("Register Error:", e)
        return JsonResponse({"message": "Server error during registration"}, status=500)


@csrf_exempt
def login_user(request):
    if request.method == "OPTIONS":
        return JsonResponse({}, status=204)

    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        data = json_body(request)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"message": "Email and password are required"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, password, role FROM users WHERE email = %s",
                [email],
            )
            row = cursor.fetchone()

        if not row:
            return JsonResponse({"message": "Invalid email or password"}, status=401)

        user = {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "password": row[3],
            "role": row[4],
        }

        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return JsonResponse({"message": "Invalid email or password"}, status=401)

        token = generate_token(user)

        return JsonResponse({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        })

    except Exception as e:
        print("Login Error:", e)
        return JsonResponse({"message": "Server error during login"}, status=500)


@csrf_exempt
def get_create_tasks(request):
    if request.method == "OPTIONS":
        return JsonResponse({}, status=204)

    user = get_auth_user(request)

    if not user:
        return JsonResponse({"message": "Invalid or missing token"}, status=401)

    try:
        if request.method == "GET":
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, user_id, title, description, status, created_at
                    FROM tasks
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    """,
                    [user["id"]],
                )
                rows = cursor.fetchall()

            tasks = [
                {
                    "id": row[0],
                    "user_id": row[1],
                    "title": row[2],
                    "description": row[3],
                    "status": row[4],
                    "created_at": row[5],
                }
                for row in rows
            ]

            return JsonResponse(tasks, safe=False)

        if request.method == "POST":
            data = json_body(request)
            title = data.get("title")
            description = data.get("description", "")

            if not title:
                return JsonResponse({"message": "Task title is required"}, status=400)

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO tasks (user_id, title, description, status)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                    """,
                    [user["id"], title, description, "pending"],
                )
                task_id = cursor.fetchone()[0]

            return JsonResponse({
                "message": "Task created successfully",
                "taskId": task_id,
            }, status=201)

        return JsonResponse({"message": "Method not allowed"}, status=405)

    except Exception as e:
        print("Tasks Error:", e)
        return JsonResponse({"message": "Server error while handling tasks"}, status=500)


@csrf_exempt
def update_delete_task(request, task_id):
    if request.method == "OPTIONS":
        return JsonResponse({}, status=204)

    user = get_auth_user(request)

    if not user:
        return JsonResponse({"message": "Invalid or missing token"}, status=401)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, title, description, status FROM tasks WHERE id = %s AND user_id = %s",
                [task_id, user["id"]],
            )
            task = cursor.fetchone()

        if not task:
            return JsonResponse({"message": "Task not found"}, status=404)

        if request.method == "PUT":
            data = json_body(request)

            title = data.get("title") or task[1]
            description = data.get("description") if data.get("description") is not None else task[2]
            status = data.get("status") or task[3]

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE tasks
                    SET title = %s, description = %s, status = %s
                    WHERE id = %s AND user_id = %s
                    """,
                    [title, description, status, task_id, user["id"]],
                )

            return JsonResponse({"message": "Task updated successfully"})

        if request.method == "DELETE":
            with connection.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM tasks WHERE id = %s AND user_id = %s",
                    [task_id, user["id"]],
                )

            return JsonResponse({"message": "Task deleted successfully"})

        return JsonResponse({"message": "Method not allowed"}, status=405)

    except Exception as e:
        print("Update/Delete Task Error:", e)
        return JsonResponse({"message": "Server error while updating/deleting task"}, status=500)


def admin_users(request):
    user = get_auth_user(request)

    if not is_admin(user):
        return JsonResponse({"message": "Access denied. Admin only."}, status=403)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, email, role, created_at
                FROM users
                ORDER BY created_at DESC
                """
            )
            rows = cursor.fetchall()

        users = [
            {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "role": row[3],
                "created_at": row[4],
            }
            for row in rows
        ]

        return JsonResponse(users, safe=False)

    except Exception as e:
        print("Admin Users Error:", e)
        return JsonResponse({"message": "Server error while fetching users"}, status=500)


def admin_tasks(request):
    user = get_auth_user(request)

    if not is_admin(user):
        return JsonResponse({"message": "Access denied. Admin only."}, status=403)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    tasks.id,
                    tasks.title,
                    tasks.description,
                    tasks.status,
                    tasks.created_at,
                    users.name AS user_name,
                    users.email AS user_email
                FROM tasks
                JOIN users ON tasks.user_id = users.id
                ORDER BY tasks.created_at DESC
                """
            )
            rows = cursor.fetchall()

        tasks = [
            {
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "status": row[3],
                "created_at": row[4],
                "user_name": row[5],
                "user_email": row[6],
            }
            for row in rows
        ]

        return JsonResponse(tasks, safe=False)

    except Exception as e:
        print("Admin Tasks Error:", e)
        return JsonResponse({"message": "Server error while fetching all tasks"}, status=500)


@csrf_exempt
def admin_delete_task(request, task_id):
    if request.method == "OPTIONS":
        return JsonResponse({}, status=204)

    user = get_auth_user(request)

    if not is_admin(user):
        return JsonResponse({"message": "Access denied. Admin only."}, status=403)

    if request.method != "DELETE":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM tasks WHERE id = %s RETURNING id",
                [task_id],
            )
            deleted = cursor.fetchone()

        if not deleted:
            return JsonResponse({"message": "Task not found"}, status=404)

        return JsonResponse({"message": "Task deleted by admin successfully"})

    except Exception as e:
        print("Admin Delete Task Error:", e)
        return JsonResponse({"message": "Server error while deleting task"}, status=500)