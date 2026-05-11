"""
AquaIntelli Enterprise v3 — JWT Authentication & RBAC Service
Full multi-tenant auth: JWT access/refresh tokens, RBAC roles, API keys.
"""
import os
import uuid
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Optional JWT import
try:
    import jwt as pyjwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False
    logger.warning("PyJWT not installed — JWT auth disabled. pip install PyJWT")

bearer_scheme = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# ── RBAC Role Definitions ─────────────────────────────────────────────────
ROLES: Dict[str, List[str]] = {
    "super_admin": ["*"],                           # All permissions
    "admin": [
        "aquifer:read", "aquifer:write",
        "forecast:read", "forecast:write",
        "pipeline:read", "pipeline:write",
        "sensor:read", "sensor:write",
        "esg:read", "esg:write",
        "tenant:read", "tenant:write",
        "llm:chat", "llm:report",
        "3d:view", "audit:read",
    ],
    "analyst": [
        "aquifer:read", "forecast:read",
        "pipeline:read", "sensor:read",
        "esg:read", "llm:chat", "3d:view",
    ],
    "viewer": [
        "aquifer:read", "forecast:read",
        "pipeline:read", "3d:view",
    ],
    "api_client": [
        "aquifer:read", "forecast:read",
        "pipeline:read", "sensor:read",
    ],
}


class TokenPayload(BaseModel):
    sub: str                  # user_id
    tenant_id: str
    email: str
    role: str
    permissions: List[str]
    exp: int
    iat: int
    jti: str                  # unique token ID


class AuthUser(BaseModel):
    id: str
    tenant_id: str
    email: str
    role: str
    permissions: List[str]


class AuthService:
    """JWT + RBAC authentication service."""

    def __init__(self):
        self.secret = os.getenv("JWT_SECRET", "aquaintelli-dev-secret-CHANGE-IN-PROD")
        self.algorithm = "HS256"
        self.access_ttl_minutes = int(os.getenv("JWT_ACCESS_TTL_MINUTES", "60"))
        self.refresh_ttl_days = int(os.getenv("JWT_REFRESH_TTL_DAYS", "30"))

    def create_access_token(self, user_data: Dict[str, Any]) -> str:
        """Create a signed JWT access token."""
        if not JWT_AVAILABLE:
            return "mock-token-no-pyjwt"

        now = datetime.utcnow()
        permissions = self._get_permissions(user_data.get("role", "viewer"))

        payload = {
            "sub": str(user_data["id"]),
            "tenant_id": str(user_data.get("tenant_id", "")),
            "email": user_data.get("email", ""),
            "role": user_data.get("role", "viewer"),
            "permissions": permissions,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=self.access_ttl_minutes)).timestamp()),
            "jti": str(uuid.uuid4()),
            "type": "access",
        }
        return pyjwt.encode(payload, self.secret, algorithm=self.algorithm)

    def create_refresh_token(self, user_id: str) -> str:
        """Create a signed JWT refresh token."""
        if not JWT_AVAILABLE:
            return "mock-refresh-token"

        now = datetime.utcnow()
        payload = {
            "sub": user_id,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=self.refresh_ttl_days)).timestamp()),
            "jti": str(uuid.uuid4()),
            "type": "refresh",
        }
        return pyjwt.encode(payload, self.secret, algorithm=self.algorithm)

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT. Returns None on failure."""
        if not JWT_AVAILABLE:
            # Mock decode for dev without PyJWT
            return {
                "sub": "dev-user",
                "tenant_id": "dev-tenant",
                "email": "dev@aquaintelli.com",
                "role": "admin",
                "permissions": ROLES["admin"],
            }
        try:
            payload = pyjwt.decode(token, self.secret, algorithms=[self.algorithm])
            return payload
        except pyjwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except pyjwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    def generate_api_key(self, prefix: str = "aq") -> str:
        """Generate a secure API key with prefix."""
        raw = secrets.token_urlsafe(32)
        return f"{prefix}_{raw}"

    def hash_api_key(self, api_key: str) -> str:
        """Hash API key for secure storage (never store plaintext)."""
        return hashlib.sha256(api_key.encode()).hexdigest()

    def _get_permissions(self, role: str) -> List[str]:
        return ROLES.get(role, ROLES["viewer"])

    def check_permission(self, user: AuthUser, permission: str) -> bool:
        """Check if user has a specific permission."""
        if "*" in user.permissions:
            return True
        return permission in user.permissions


# ── Singleton ─────────────────────────────────────────────────────────────
_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service


# ── FastAPI Dependency: Get Current User ──────────────────────────────────
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
    api_key: Optional[str] = Security(api_key_header),
) -> AuthUser:
    """
    FastAPI dependency that extracts and verifies the current user
    from either a Bearer JWT token or an X-API-Key header.
    """
    auth = get_auth_service()

    if credentials:
        payload = auth.verify_token(credentials.credentials)
        return AuthUser(
            id=payload["sub"],
            tenant_id=payload.get("tenant_id", ""),
            email=payload.get("email", ""),
            role=payload.get("role", "viewer"),
            permissions=payload.get("permissions", []),
        )

    if api_key:
        # In production: look up hashed key in DB and return user
        # For dev: return a limited api_client user
        if api_key.startswith("aq_"):
            return AuthUser(
                id="api-user",
                tenant_id="default",
                email="api@aquaintelli.com",
                role="api_client",
                permissions=ROLES["api_client"],
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Provide Bearer token or X-API-Key header.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
    api_key: Optional[str] = Security(api_key_header),
) -> Optional[AuthUser]:
    """Non-raising user resolver — returns None if unauthenticated."""
    try:
        return await get_current_user(credentials, api_key)
    except HTTPException:
        return None


def require_permission(permission: str):
    """Dependency factory that enforces a specific RBAC permission."""
    async def _check(user: AuthUser = Depends(get_current_user)):
        auth = get_auth_service()
        if not auth.check_permission(user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission}",
            )
        return user
    return _check
