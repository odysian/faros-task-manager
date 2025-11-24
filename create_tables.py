from db_config import engine, Base
from db_models import Task

# Import all models here so Base knows about them
# (Only have task for now)

# Create all tables
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")