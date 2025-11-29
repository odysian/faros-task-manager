from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
import exceptions
from routers import tasks, auth

# cd task-manager-api
# source venv/bin/activate
# uvicorn main:app --reload
# Open:  http://localhost:8000/docs
# Ctrl+C to stop the server
# deactivate  # optional, closing terminal does this anyway


# --- Application Setup ---

app = FastAPI(
    title="Task Manager API",
    description="A simple task management API",
    version="0.1.0"
)


@app.get("/")
def root():
    """Health check / welcome endpoint"""
    return {"message": "Task Manager API", "status": "running"}

app.include_router(tasks.router)
app.include_router(auth.router)


# --- Exception Handlers ---

@app.exception_handler(exceptions.TaskNotFoundError)
async def task_not_found_handler(request: Request, exc: exceptions.TaskNotFoundError):
    """Handle TaskNotFoundError by returning 404"""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Task Not Found",
            "message": exc.message,
            "task_id": exc.task_id
        }
    )

@app.exception_handler(exceptions.UnauthorizedTaskAccessError)
async def unauthorized_task_handler(request: Request, exc: exceptions.UnauthorizedTaskAccessError):
    """Handle UnauthorizedTaskAccessError by returning 403"""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": "Unauthorized Access",
            "message": "You do not have permission to access this task"
            # Don't expose task_id or user_id in response for security
        }
    )

@app.exception_handler(exceptions.TagNotFoundError)
async def tag_not_found_handler(request: Request, exc: exceptions.TagNotFoundError):
    """Handle TagNotFoundError by returning 404"""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Tag Not Found",
            "message": exc.message,
            "task_id": exc.task_id,
            "tag": exc.tag
        }
    )

@app.exception_handler(exceptions.DuplicateUserError)
async def duplicate_user_handler(request: Request, exc: exceptions.DuplicateUserError):
    """Handle DuplicateUserError by returning 409"""
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": "Duplicate User",
            "message": exc.message,
            "field": exc.field
        }
    )

@app.exception_handler(exceptions.InvalidCredentialsError)
async def invalid_credentials_handler(request: Request, exc: exceptions.InvalidCredentialsError):
    """Handle InvalidCredentialsError by returning 401"""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": "Authentication Failed",
            "message": exc.message
        },
        headers={"WWW-Authenticate": "Bearer"}
    )