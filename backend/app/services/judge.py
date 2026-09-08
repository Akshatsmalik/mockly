import httpx
from fastapi import HTTPException

from app.config import get_settings


async def execute(payload: dict) -> dict:
    """Delegate untrusted code to an isolated runner outside this API process."""
    runner_url = get_settings().code_execution_url
    if not runner_url:
        raise HTTPException(status_code=503, detail="Code execution is not configured. Set CODE_EXECUTION_URL to an isolated judge service.")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(runner_url.rstrip("/") + "/execute", json=payload)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail="The code-execution service is unavailable.") from error
