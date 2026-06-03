"""Self-registering rule function registry.

Rule functions are registered by the 'check:' key from the YAML ruleset.
Adding a rule = add a function + reference it from a ruleset.
"""
from __future__ import annotations
from typing import Callable
from ..models import DocumentIR, StyleSpec, Diagnostic

RuleFunc = Callable[[DocumentIR, StyleSpec, dict], list[Diagnostic]]
_REGISTRY: dict[str, RuleFunc] = {}


def register(check_key: str):
    """Decorator to register a rule function under a check: key."""
    def decorator(fn: RuleFunc) -> RuleFunc:
        _REGISTRY[check_key] = fn
        return fn
    return decorator


def get_rule(check_key: str) -> RuleFunc | None:
    return _REGISTRY.get(check_key)


def get_all_rules() -> dict[str, RuleFunc]:
    return dict(_REGISTRY)
