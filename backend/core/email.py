"""
Email abstraction layer supporting both Resend and AWS SES.

Switch between implementations using EMAIL_PROVIDER environment variable:
- "resend" (default) - Resend email service
- "aws" - AWS SES email service

This allows easy switching between implementations without code changes.
"""

from abc import ABC, abstractmethod
from typing import Optional

from core.settings import settings

# Email provider selection
EMAIL_PROVIDER = settings.email_provider


class EmailInterface(ABC):
    """Abstract base class for email implementations."""

    @abstractmethod
    def send_email(
        self,
        recipient_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
    ) -> bool:
        """
        Send an email.

        Returns True if successful, False otherwise.
        """
        pass


class ResendEmail(EmailInterface):
    """Resend email service implementation."""

    def __init__(self):
        try:
            import resend
        except ImportError:
            raise ImportError(
                "resend package is required. Install with: pip install resend"
            )

        api_key = settings.RESEND_API_KEY
        if not api_key:
            raise ValueError("RESEND_API_KEY environment variable is required")

        # Set API key globally for resend
        resend.api_key = api_key
        self.emails_client = resend.Emails()
        self.from_email = settings.RESEND_FROM_EMAIL

    def send_email(
        self,
        recipient_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
    ) -> bool:
        """Send email via Resend."""
        import logging

        logger = logging.getLogger(__name__)

        try:
            # Build email parameters
            email_params: dict = {
                "from": self.from_email,
                "to": [recipient_email],
                "subject": subject,
                "text": body_text,
            }

            if body_html:
                email_params["html"] = body_html

            response = self.emails_client.send(email_params)  # type: ignore

            logger.info(
                f"Email sent via Resend to {recipient_email}, "
                f"MessageId: {response.get('id')}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to send email via Resend: {e}")
            return False


class AWSEmail(EmailInterface):
    """AWS SES email service implementation."""

    def __init__(self):
        import boto3

        aws_region = settings.AWS_REGION
        aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY

        self.ses_client = boto3.client(
            "ses",
            region_name=aws_region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )
        self.from_email = settings.AWS_FROM_EMAIL

    def send_email(
        self,
        recipient_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
    ) -> bool:
        """Send email via AWS SES."""
        import logging

        from botocore.exceptions import ClientError

        logger = logging.getLogger(__name__)

        try:
            message_body: dict[str, dict[str, str]] = {}

            if body_text:
                message_body["Text"] = {"Data": body_text}

            if body_html:
                message_body["Html"] = {"Data": body_html}

            message = {"Subject": {"Data": subject}, "Body": message_body}

            response = self.ses_client.send_email(
                Source=self.from_email,
                Destination={"ToAddresses": [recipient_email]},
                Message=message,
            )

            logger.info(
                f"Email sent via SES to {recipient_email}, "
                f"MessageId: {response['MessageId']}"
            )
            return True

        except ClientError as e:
            error_code = e.response["Error"]["Code"]

            if error_code == "MessageRejected":
                logger.error(f"Email rejected: {recipient_email} - {e}")
            elif error_code == "MailFromDomainNotVerified":
                logger.error(f"Sender domain not verified in SES: {self.from_email}")
            else:
                logger.error(f"Failed to send email via SES: {e}")

            return False


# Initialize email service based on EMAIL_PROVIDER
def _get_email_service() -> EmailInterface:
    """Get the appropriate email implementation based on environment variable."""
    if EMAIL_PROVIDER == "aws":
        return AWSEmail()
    else:
        # Default to Resend
        return ResendEmail()


# Global email service instance
email_service = _get_email_service()
