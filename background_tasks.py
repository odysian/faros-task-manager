import logging
import time
import os
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")

def send_task_completion_notification(user_email: str, task_title: str, task_id: int):
    """
    Send notification when a task is completed.
    In production this would send an actual email.
    """

    logger.info(f"BACKGROUND TASK: Sending completion notification for task_id={task_id}")

    # Simulate email sending delay
    time.sleep(2)

    # Log the "sent notification"
    logger.info(
        f"NOTIFICATION SENT: Task '{task_title}' completed | "
        f"Recipient: {user_email} | "
        f"Task ID: {task_id} | "
        f"Time: {datetime.now()}"
    )

def cleanup_old_tasks(days_old: int):
    """
    Example of a periodic cleanup task.
    Could be triggered by an endpoint or scheduled externally.
    """
    logger.info(f"BACKGROUND TASK: Starting cleanup of tasks older than {days_old} days")
    # In production: delete old completed tasks, compress data, etc.
    time.sleep(1)
    logger.info(f"BACKGROUND TASK: Cleanup completed")

def cleanup_after_task_deletion(task_id: int, task_title: str, file_list: list[str]):
    """
    Cleanup operations after task deletion
    In Production: delete uploaded files, remove from caches, update analytics, etc.
    """
    logger.info(f"BACKGROUND TASK: Starting cleanup after task deletion - task_id={task_id}")

    # Delete files from disk
    files_deleted = 0
    for stored_filename in file_list:
        file_path = UPLOAD_DIR / stored_filename
        if file_path.exists():
            os.remove(file_path)
            files_deleted += 1
            logger.info(f"Deleted file from disk: {stored_filename}")

    # Simulate cleanup work
    time.sleep(1)

    # Log what we "cleaned up"
    logger.info(
        f"CLEANUP COMPLETED: Task '{task_title}' (ID: {task_id}) | "
        f"Removed from cache, deleted associated files, updated analytics"
    )