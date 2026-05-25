﻿from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from .. import main as _main
from ..bupzo_agents.multi_agent import ( # Corrected import path
    admin_suggest_banners,
    seller_generate_description,
    customer_generate_notifications,
    run_sync
)

router = APIRouter()

class AdminRequest(BaseModel):
    context: str
    task: str = "default"
    format: str = "text"

class SellerRequest(BaseModel):
    context: str
    task: str = "default"
    format: str = "text"

class CustomerRequest(BaseModel):
    context: str
    task: str = "default"
    format: str = "text"

class ChatRequest(BaseModel):
    context: str
    task: str = "default"
    format: str = "text"

async def _call_agent(prompt: str) -> str:
    """Generic agent call that can be used for any task."""
    return await admin_suggest_banners(prompt)

@router.post("/admin")
async def admin_agent(req: AdminRequest):
    try:
        # Handle different tasks
        if req.task == "customer_sentiment_analysis":
            prompt = f"You are AdminAgent analyzing customer sentiment. Given the following context, provide a detailed sentiment analysis and suggest a personalized retention strategy:\n{req.context}"
        else:
            prompt = f"You are AdminAgent for BUPZO marketplace. Given the following context, {req.task}:\n{req.context}"

        result = await _call_agent(prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seller")
async def seller_agent(req: SellerRequest):
    try:
        # Handle different tasks
        if req.task == "price_optimization":
            prompt = f"You are SellerAgent optimizing prices. Given the following context, provide a price optimization recommendation:\n{req.context}"
        elif req.task == "packing_guidelines":
            prompt = f"You are SellerAgent providing packing instructions. Given the following context, provide detailed packing guidelines:\n{req.context}"
        else:
            prompt = f"You are SellerAgent. {req.task}:\n{req.context}"

        result = await _call_agent(prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer")
async def customer_agent(req: CustomerRequest):
    try:
        # Handle different tasks
        if req.task == "personalized_notifications":
            prompt = f"You are CustomerAgent generating notifications. Given the following context, provide 3 personalized notification messages:\n{req.context}"
        else:
            prompt = f"You are CustomerAgent. {req.task}:\n{req.context}"

        result = await _call_agent(prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/chat")
async def chat_agent(req: ChatRequest):
    try:
        # Handle different tasks
        if req.task == "smart_replies":
            prompt = f"You are ChatAgent generating smart replies. Given the following context, provide 3 smart reply options:\n{req.context}"
        else:
            prompt = f"You are ChatAgent. {req.task}:\n{req.context}"

        result = await _call_agent(prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/admin")
async def admin_agent_v2(req: AdminRequest):
    try:
        # Handle different tasks
        if req.task == "fraud_risk_assessment":
            prompt = f"You are FraudRiskAgent analyzing refund requests. Given the following context, assess the fraud risk level (High/Medium/Low) and provide a detailed explanation:\n{req.context}"
        else:
            prompt = f"You are AdminAgent. {req.task}:\n{req.context}"

        result = await _call_agent(prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))