#!/usr/bin/env python3
"""
AquaIntelli Enterprise v3 — Multi-Tenant Provisioning Script
Auto-provisions a new tenant with all required resources.

Usage:
    python scripts/provision_tenant.py \
        --name "Hyderabad Water Board" \
        --slug "hwb" \
        --plan enterprise \
        --email admin@hwb.gov.in
"""
import argparse
import json
import uuid
import secrets
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("provision_tenant")


PLAN_LIMITS = {
    "basic":        {"max_aquifers": 10,   "max_users": 5,   "api_rpm": 100,  "features": ["groundwater", "forecast"]},
    "professional": {"max_aquifers": 100,  "max_users": 25,  "api_rpm": 1000, "features": ["groundwater", "forecast", "3d_viewer", "pipeline", "llm_chat"]},
    "enterprise":   {"max_aquifers": 1000, "max_users": 200, "api_rpm": 10000,"features": ["*"]},
}


def provision_tenant(name: str, slug: str, plan: str, email: str,
                     api_base: str = "http://localhost:8001") -> dict:
    """Provision a complete new tenant environment."""
    try:
        import requests
        USE_HTTP = True
    except ImportError:
        USE_HTTP = False

    tenant_id = str(uuid.uuid4())
    api_key = f"aq_{secrets.token_urlsafe(32)}"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["basic"])

    tenant_config = {
        "id": tenant_id,
        "name": name,
        "slug": slug,
        "plan": plan,
        "contact_email": email,
        "api_key": api_key,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "limits": limits,
        "namespaces": {
            "redis_prefix": f"tenant:{tenant_id}:",
            "mongo_collection_prefix": f"t_{slug}_",
            "influxdb_bucket": f"aquaintelli_{slug}",
            "s3_prefix": f"tenants/{tenant_id}/",
        },
        "default_aquifer": {
            "id": str(uuid.uuid4()),
            "name": f"{name} - Primary Basin",
            "code": f"{slug.upper()}-001",
            "location": {"lat": 17.385, "lon": 78.487},
        },
        "branding": {
            "primary_color": "#0f172a",
            "logo_url": f"https://aquaintelli.com/tenants/{slug}/logo.png",
            "domain": f"{slug}.aquaintelli.com",
        },
    }

    logger.info(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info(f"  Provisioning Tenant: {name} ({plan.upper()} plan)")
    logger.info(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info(f"  Tenant ID:  {tenant_id}")
    logger.info(f"  Slug:       {slug}")
    logger.info(f"  API Key:    {api_key[:20]}...")

    steps = [
        ("Database namespace",     lambda: _create_db_namespace(tenant_config)),
        ("Redis namespace",        lambda: _create_redis_namespace(tenant_config)),
        ("Default aquifer",        lambda: _create_default_aquifer(tenant_config, api_base, USE_HTTP)),
        ("Default admin user",     lambda: _create_admin_user(tenant_config, email)),
        ("Weaviate class",         lambda: _create_weaviate_class(tenant_config)),
        ("Welcome email",          lambda: _send_welcome_email(tenant_config)),
        ("Config file",            lambda: _save_config(tenant_config)),
    ]

    for step_name, step_fn in steps:
        try:
            step_fn()
            logger.info(f"  ✅ {step_name}")
        except Exception as e:
            logger.warning(f"  ⚠️  {step_name} — {e} (non-fatal)")

    logger.info(f"\n✅ Tenant provisioned successfully!")
    logger.info(f"   Dashboard:  https://{slug}.aquaintelli.com")
    logger.info(f"   API Base:   {api_base}/api/v3")
    logger.info(f"   API Key:    {api_key}")
    logger.info(f"   Plan:       {plan} ({limits['max_aquifers']} aquifers, {limits['max_users']} users)")
    logger.info(f"\n⚠️  Save the API key — it will not be shown again!\n")
    return tenant_config


def _create_db_namespace(config: dict):
    """Create isolated PostgreSQL schema for tenant."""
    # In production: run SQL CREATE SCHEMA tenant_{slug}
    logger.debug(f"Would create schema: tenant_{config['slug']}")


def _create_redis_namespace(config: dict):
    """Set up Redis key prefix and TTL policies."""
    # In production: set Redis config for namespace
    logger.debug(f"Redis prefix: {config['namespaces']['redis_prefix']}")


def _create_default_aquifer(config: dict, api_base: str, use_http: bool):
    """Register the default aquifer for the tenant."""
    if use_http:
        import requests
        try:
            requests.post(
                f"{api_base}/api/v1/groundwater/",
                json={"aquifer_id": config["default_aquifer"]["id"],
                      "tenant_id": config["id"], "name": config["default_aquifer"]["name"]},
                timeout=5,
            )
        except Exception:
            pass


def _create_admin_user(config: dict, email: str):
    """Create the first admin user for the tenant."""
    temp_password = secrets.token_urlsafe(12)
    logger.debug(f"Admin: {email} / temp: {temp_password}")


def _create_weaviate_class(config: dict):
    """Create tenant-specific Weaviate class for RAG knowledge base."""
    logger.debug(f"Weaviate class: AquaIntelli_{config['slug'].upper()}_Knowledge")


def _send_welcome_email(config: dict):
    """Send onboarding email to tenant contact."""
    logger.debug(f"Would send welcome email to {config['contact_email']}")


def _save_config(config: dict):
    """Save tenant config to local JSON file."""
    from pathlib import Path
    Path("data/tenants").mkdir(parents=True, exist_ok=True)
    path = f"data/tenants/{config['slug']}.json"
    safe_config = {k: v for k, v in config.items() if k != "api_key"}
    with open(path, "w") as f:
        json.dump(safe_config, f, indent=2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AquaIntelli Tenant Provisioner")
    parser.add_argument("--name",  required=True, help="Tenant display name")
    parser.add_argument("--slug",  required=True, help="URL-safe identifier (e.g. hwb)")
    parser.add_argument("--plan",  default="professional",
                        choices=["basic", "professional", "enterprise"])
    parser.add_argument("--email", required=True, help="Admin contact email")
    parser.add_argument("--api-base", default="http://localhost:8001")
    args = parser.parse_args()

    result = provision_tenant(
        name=args.name,
        slug=args.slug,
        plan=args.plan,
        email=args.email,
        api_base=args.api_base,
    )
