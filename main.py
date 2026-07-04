from typing import Annotated, cast
from fastapi import Body, FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from model import ClassifyMessages, TriageOutput
from settings import setting
from llm import ask_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=setting.ALLLOW_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["*"],
)


# only one call of api with content and direct long answer of 20 meesages in one parse
# the average time of response is 12s for 20 messages list
# for 15 messages 10s
# for 10 messages 8.5s
# for 30 messages 18s
# for 25 messages 15s (one request tool 24s on gemini-2.5-flash)
@app.post("/api/classify/batch/")
def classify_batch(messages: Annotated[ClassifyMessages, Body(...)]):
    result = cast(
        list[TriageOutput],
        ask_llm(
            data={"messages": messages.messages},
        ),
    )

    if len(result) != len(messages.messages):
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Gemini returned wrong number of results.",
                "expected": len(messages.messages),
                "got": len(result),
            },
        )

    return {
        "total": len(result),
        "results": [item.model_dump() for item in result],
    }
