from typing import Annotated, Literal
from pydantic import BaseModel, Field
from settings import setting


class ClassifyMessages(BaseModel):
    messages: Annotated[
        list[str], Field(min_length=1, max_length=setting.MAX_BATCH_LENGHT)
    ]


class TriageOutput(BaseModel):
    message: str
    category: Literal[
        "Billing",
        "Account",
        "Technical Support",
        "Order",
        "Complaint",
        "Feature Request",
        "General Inquiry",
        "Spam",
        "Security",
    ]
    confidence: float = Field(ge=0, le=1)
    billing: bool
    needed_human: bool
    priority: Literal["P0", "P1", "P2", "P3"]
