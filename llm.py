import json
from fastapi import HTTPException
from settings import setting
from google import genai
from google.genai import types
from prompt import SYSTEM_PROMPT
from model import TriageOutput

# can be wrap into class with client and config if needed in future
client = genai.Client()

config = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    response_mime_type="application/json",
    response_schema=list[TriageOutput],
    temperature=0,
)


def classify_provider_error(error: Exception):
    error_text = str(error)

    if (
        "503 UNAVAILABLE" in error_text
        or "'code': 503" in error_text
        or "high demand" in error_text.lower()
    ):
        return 503, "The model is temporarily busy. Please try again in a minute."

    if "429" in error_text or "rate limit" in error_text.lower():
        return 429, "The model rate limit was reached. Please wait and try again."

    return 500, "Classification failed."


def ask_llm(data):
    try:
        response = client.models.generate_content(
            model=setting.GEMINI_MODEL,
            config=config,
            contents=json.dumps(data),
        )

        if response.parsed is None:
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "Gemini returned invalid JSON/schema.",
                    "raw_output": response.text,
                },
            )

        return response.parsed

    except HTTPException:
        raise

    except Exception as e:
        status_code, message = classify_provider_error(e)
        raise HTTPException(
            status_code=status_code,
            detail={
                "message": message,
                "retryable": status_code in (429, 503),
                "provider": "gemini",
                "provider_error": str(e),
            },
        )
