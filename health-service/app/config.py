import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ISSUER = os.environ["JWT_ISSUER"]
JWT_AUDIENCE = os.environ["JWT_AUDIENCE"]