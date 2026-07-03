from typing import Literal
from pydantic import BaseModel, Field


class ClassifyMessage(BaseModel):
    message: str


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
