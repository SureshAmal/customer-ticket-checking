import os
from dotenv import load_dotenv

load_dotenv(override=True)


class Setting:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "don't-write-key-here")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    MAX_BATCH_LENGHT: int = int(os.getenv("MAX_BATCH_LENGHT", 30))
    ALLLOW_ORIGINS: list[str] = os.getenv(
        "ALLLOW_ORIGINS", "http://localhost:3000"
    ).split(",")


setting = Setting()
