"""
BUPZO Seller Router
Handles seller-specific endpoints for inventory and analytics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Product, User, Order, OrderItem
from schemas import InventoryItemResponse, SalesAnalyticsResponse
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/inventory", status_code=status.HTTP_200_OK, response_model=List[InventoryItemResponse])
async def get_seller_inventory(user_id: str, db: Session = Depends(get_db)):
    """
    Get inventory for a seller
    """
    # Get seller user
    seller = db.query(User).filter(User.id == user_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )

    # Get all products from this seller
    products = db.query(Product).filter(Product.seller_id == user_id).all()

    # Prepare inventory items with low stock status
    inventory_items = []
    for product in products:
        low_stock = product.stock_quantity < 20
        inventory_items.append({
            "id": str(product.id),
            "name": product.name,
            "category": product.category.name if product.category else "Uncategorized",
            "stock": product.stock_quantity,
            "price": float(product.price),
            "lowStock": low_stock
        })

    return inventory_items

@router.get("/sales-analytics", status_code=status.HTTP_200_OK, response_model=SalesAnalyticsResponse)
async def get_sales_analytics(user_id: str, db: Session = Depends(get_db)):
    """
    Get sales analytics for a seller
    """
    # Get seller user
    seller = db.query(User).filter(User.id == user_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )

    # Get current month's orders
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_month_end = current_month_start + timedelta(days=32)
    current_month_end = current_month_end.replace(day=1) - timedelta(days=1)

    orders = db.query(Order).filter(
        Order.user_id == user_id,
        Order.created_at >= current_month_start,
        Order.created_at <= current_month_end
    ).all()

    # Calculate total revenue and orders
    total_revenue = sum(float(order.total_amount) for order in orders)
    total_orders = len(orders)

    # Get monthly sales data (simplified for demo)
    monthly_revenue = [5000, 7500, 9000, 12000, 15000, 18000]
    monthly_orders = [20, 30, 40, 50, 60, 70]

    return {
        "totalRevenue": total_revenue,
        "totalOrders": total_orders,
        "monthlyRevenue": monthly_revenue,
        "monthlyOrders": monthly_orders,
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    }