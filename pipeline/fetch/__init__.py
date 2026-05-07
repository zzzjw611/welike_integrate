from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class RawItem:
    source: str
    title: str
    summary: str
    url: str
    published: Optional[str] = None
    extra: Optional[dict] = None

    def to_dict(self) -> dict:
        return asdict(self)
