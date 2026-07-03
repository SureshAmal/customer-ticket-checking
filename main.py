import os
from fastapi import FastAPI

from dotenv import load_dotenv
from google import genai
from google.genai import types
from starlette.responses import JSONResponse

from model import ClassifyMessage, TriageOutput
from prompt import SYSTEM_PROMPT

load_dotenv(override=True)


app = FastAPI()

client = genai.Client()

config = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    response_mime_type="application/json",
    response_schema=TriageOutput,
)


def getLLMResponse(message: str):
    response = client.models.generate_content(
        model="gemini-2.5-flash", config=config, contents=message
    )
    return response


@app.post("/api/classify/", response_model=TriageOutput)
def classify(message: ClassifyMessage):
    try:
        response = getLLMResponse(message.message)
        if response.parsed is None:  # direct validation of schema by genai+pydantic
            return JSONResponse(
                status_code=502,
                content={
                    "success": False,
                    "message": "gemini output is not based on schema and invalid",
                    "raw_output": response.text,
                },
            )

        return response.parsed
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Classification failed.",
                "error": str(e),
            },
        )
