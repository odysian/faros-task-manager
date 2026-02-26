from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = "development"

    DATABASE_URL: str | None = None
    SQLALCHEMY_ECHO: bool = False
    REDIS_URL: str | None = None

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720
    TESTING: bool = False
    BCRYPT_ROUNDS: int | None = None

    STORAGE_PROVIDER: str = "local"
    UPLOAD_DIR: str = "uploads"

    EMAIL_PROVIDER: str = "resend"
    RESEND_API_KEY: str | None = None
    RESEND_FROM_EMAIL: str = "faros@odysian.dev"
    AWS_FROM_EMAIL: str = "faros@odysian.dev"

    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    S3_BUCKET_NAME: str | None = None

    FRONTEND_URL: str = "http://localhost:5173"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: str = ".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"

    @property
    def normalized_environment(self) -> str:
        return self.ENVIRONMENT.lower().strip()

    @property
    def has_explicit_database_url(self) -> bool:
        return bool(self.DATABASE_URL)

    @property
    def has_explicit_redis_url(self) -> bool:
        return bool(self.REDIS_URL)

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        if self.normalized_environment in ("development", "local"):
            return "postgresql://task_user:dev_password@localhost:5433/task_manager"
        return "postgresql://task_user:dev_password@localhost:5432/task_manager"

    @property
    def redis_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        if self.normalized_environment in ("development", "local"):
            return "redis://localhost:6380/0"
        return "redis://localhost:6379/0"

    @property
    def bcrypt_rounds(self) -> int:
        if self.BCRYPT_ROUNDS is not None:
            return self.BCRYPT_ROUNDS
        return 4 if self.TESTING else 12

    @property
    def storage_provider(self) -> str:
        return self.STORAGE_PROVIDER.lower()

    @property
    def email_provider(self) -> str:
        return self.EMAIL_PROVIDER.lower()

    @property
    def allowed_extensions(self) -> set[str]:
        return {
            ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",") if ext
        }


settings = Settings()
