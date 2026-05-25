from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from decimal import Decimal

from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0,
    limit: int = 100,
    category_id: UUID = None,
    seller_id: UUID = None,
    is_combo: bool = None,
    price_min: Decimal = None,
    price_max: Decimal = None,
    sort_by: str = None,
    db: Session = Depends(get_db)
):
    filters = {}
    if category_id:
        filters['category_id'] = category_id
    if seller_id:
        filters['seller_id'] = seller_id
    if is_combo is not None:
        filters['is_combo'] = is_combo
    if price_min:
        filters['price_min'] = price_min
    if price_max:
        filters['price_max'] = price_max
    if sort_by:
        filters['sort_by'] = sort_by

    products = crud.get_products(db, skip=skip, limit=limit, **filters)
    return products

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: UUID, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    # In a real implementation, we would get the user_id from the JWT token
    # For now, we'll use a placeholder
    user_id = UUID("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02")  # Halwa Seller
    db_product = crud.create_product(db, product=product, user_id=user_id)
    if db_product is None:
        raise HTTPException(status_code=400, detail="Seller not found")
    return db_product