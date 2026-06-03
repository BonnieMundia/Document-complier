from fastapi import APIRouter, HTTPException
from pathlib import Path
import yaml
from ...models import StyleSpec

router = APIRouter()

_RULESETS_DIR = Path(__file__).parent.parent.parent / "rulesets"
_style_cache: dict[str, StyleSpec] = {}


def _load_all_styles() -> dict[str, StyleSpec]:
    styles = {}
    for yaml_file in _RULESETS_DIR.glob("*.yaml"):
        try:
            with open(yaml_file) as f:
                data = yaml.safe_load(f)
            spec = StyleSpec(**data)
            styles[spec.id] = spec
        except Exception as e:
            print(f"Warning: could not load {yaml_file}: {e}")
    return styles


def get_style(style_id: str) -> StyleSpec:
    global _style_cache
    if not _style_cache:
        _style_cache = _load_all_styles()
    spec = _style_cache.get(style_id)
    if not spec:
        raise HTTPException(404, f"Style '{style_id}' not found. Available: {list(_style_cache.keys())}")
    return spec


@router.get("/")
def list_styles():
    global _style_cache
    if not _style_cache:
        _style_cache = _load_all_styles()
    return [
        {
            "id": s.id,
            "name": s.name,
            "authority": s.authority,
            "edition": s.edition,
            "last_verified": s.last_verified,
        }
        for s in _style_cache.values()
    ]


@router.get("/{style_id}")
def get_style_detail(style_id: str) -> StyleSpec:
    return get_style(style_id)
