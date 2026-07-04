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
)


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
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Classification failed.",
                "error": str(e),
            },
        )
