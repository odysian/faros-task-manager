import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import db_models
from db_config import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

logger = logging.getLogger(__name__)


@router.get("/search")
def search_users(
    query: str = Query(..., min_length=1, description="Username to search for"),
    limit: int = Query(10, ge=1, le=50, description="Max results to return"),
    db_session: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    """
    Search for users by username.

    Returns list of users matching the search query.
    Excluded the current user from results.
    Case-insensitive search.
    """

    logger.info(f"User search: query='{query}', user_id={current_user.id}")

    users = (
        db_session.query(db_models.User)
        .filter(db_models.User.username.ilike(f"%{query}%"))
        .filter(db_models.User.id != current_user.id)
        .limit(limit)
        .all()
    )

    logger.info(f"Found {len(users)} users matching '{query}'")

    return [
        {
            "id": user.id,
            "username": user.username,
        }
        for user in users
    ]
