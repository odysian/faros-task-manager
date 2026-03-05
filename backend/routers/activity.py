# routers/activity.py

from datetime import datetime
from typing import Any, Optional, cast

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, desc, or_
from sqlalchemy.orm import Session, joinedload

import db_models
from core.exceptions import TaskNotFoundError
from db_config import get_db
from dependencies import TaskPermission, get_current_user, require_task_access
from schemas.activity import ActivityLogResponse

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=list[ActivityLogResponse])
def get_my_activity(
    db_session: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
    resource_type: Optional[str] = Query(
        None, description="Filter by resource type (task, comment, file)"
    ),
    action: Optional[str] = Query(
        None,
        description="Filter by action (created, updated, deleted, shared, unshared)",
    ),
    start_date: Optional[datetime] = Query(
        None, description="Filter activities after this date"
    ),
    end_date: Optional[datetime] = Query(
        None, description="Filter activities before this date"
    ),
    limit: int = Query(50, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
):
    """
    Get the current user's activity history with optional filtering.

    Returns activity logs ordered by most recent first
    """

    # Subquery: task IDs shared with current user
    shared_task_ids = (
        db_session.query(db_models.TaskShare.task_id)
        .filter(db_models.TaskShare.shared_with_user_id == current_user.id)
    )

    query = db_session.query(db_models.ActivityLog).filter(
        or_(
            # My own actions
            db_models.ActivityLog.user_id == current_user.id,
            # Shared task activity (exclude created/deleted — those are private)
            and_(
                db_models.ActivityLog.resource_type == "task",
                db_models.ActivityLog.resource_id.in_(shared_task_ids),
                db_models.ActivityLog.action.notin_(["created", "deleted"]),
            ),
            # Comment/file activity on tasks shared with me
            and_(
                db_models.ActivityLog.resource_type.in_(["comment", "file"]),
                db_models.ActivityLog.details["task_id"].as_integer().in_(shared_task_ids),
            ),
        )
    )

    # Filters
    if resource_type:
        query = query.filter(db_models.ActivityLog.resource_type == resource_type)

    if action:
        query = query.filter(db_models.ActivityLog.action == action)

    if start_date:
        query = query.filter(db_models.ActivityLog.created_at >= start_date)

    if end_date:
        query = query.filter(db_models.ActivityLog.created_at <= end_date)

    # Eager load user relationship to avoid N+1
    query = query.options(joinedload(db_models.ActivityLog.user))

    # Order by most recent first
    query = query.order_by(desc(db_models.ActivityLog.created_at))

    # Apply pagination
    logs = query.offset(offset).limit(limit).all()

    # Convert to response model with username
    results = []
    for log in logs:
        results.append(
            ActivityLogResponse(
                id=log.id,  # type: ignore
                user_id=log.user_id,  # type: ignore
                action=log.action,  # type: ignore
                resource_type=log.resource_type,  # type: ignore
                resource_id=log.resource_id,  # type: ignore
                details=log.details,  # type: ignore
                created_at=log.created_at,  # type: ignore
                username=log.user.username if log.user else None,
            )
        )

    return results


@router.get("/stats")
def get_activity_stats(
    db_session: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    """
    Get summary statistics about user's activity.

    Returns counts by action type and resource type.
    """

    # Get all user's activity
    logs = (
        db_session.query(db_models.ActivityLog)
        .filter(db_models.ActivityLog.user_id == current_user.id)
        .all()
    )

    # Count by action
    action_counts: dict[str, int] = {}
    for log in logs:
        log_obj = cast(Any, log)
        action = cast(str, log_obj.action)
        action_counts[action] = action_counts.get(action, 0) + 1

    # Count by resource type
    resource_counts: dict[str, int] = {}
    for log in logs:
        log_obj = cast(Any, log)
        resource_type = cast(str, log_obj.resource_type)
        resource_counts[resource_type] = resource_counts.get(resource_type, 0) + 1

    return {
        "total_activities": len(logs),
        "by_action": action_counts,
        "by_resource": resource_counts,
    }


@router.get("/tasks/{task_id}", response_model=list[ActivityLogResponse])
def get_task_timeline(
    task_id: int,
    db_session: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    """Get complete activity timeline for a specific task"""

    # Check task exists and user has access
    task = db_session.query(db_models.Task).filter(db_models.Task.id == task_id).first()

    if not task:
        raise TaskNotFoundError(task_id=task_id)

    require_task_access(task, current_user, db_session, TaskPermission.VIEW)

    # Query activity related to this task at the SQL level
    logs = (
        db_session.query(db_models.ActivityLog)
        .options(joinedload(db_models.ActivityLog.user))
        .filter(
            or_(
                # Direct task activity
                and_(
                    db_models.ActivityLog.resource_type == "task",
                    db_models.ActivityLog.resource_id == task_id,
                ),
                # Comment/file activity referencing this task
                and_(
                    db_models.ActivityLog.resource_type.in_(["comment", "file"]),
                    db_models.ActivityLog.details["task_id"].as_integer() == task_id,
                ),
            )
        )
        .order_by(db_models.ActivityLog.created_at)
        .all()
    )

    # Convert to response model
    results: list[ActivityLogResponse] = []
    for log in logs:
        log_obj = cast(Any, log)
        results.append(
            ActivityLogResponse(
                id=log_obj.id,
                user_id=log_obj.user_id,
                action=log_obj.action,
                resource_type=log_obj.resource_type,
                resource_id=log_obj.resource_id,
                details=log_obj.details,
                created_at=log_obj.created_at,
                username=log_obj.user.username if log_obj.user else None,
            )
        )

    return results
