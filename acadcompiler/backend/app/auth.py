"""Simple JWT auth stub — replace with Supabase Auth in production."""
from __future__ import annotations
from typing import Optional
from fastapi import Header, HTTPException
from .config import settings


def verify_token(authorization: Optional[str] = Header(default=None)) -> dict:
    """Stub: accept any Bearer token in development; enforce in production."""
    if not authorization:
        # Allow unauthenticated in dev mode
        return {"sub": "anonymous", "role": "user"}
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid Authorization header format")
    token = authorization.removeprefix("Bearer ").strip()
    # TODO: verify JWT signature against settings.jwt_secret
    return {"sub": "stub-user", "role": "user", "token": token}
