from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from databases import Database
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Router
router = APIRouter()

# Models
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    price: float
    weight_grams: Optional[int] = 500
    image_url: Optional[str] = None
    is_combo: Optional[bool] = False
    stock_quantity: Optional[int] = 0
    seller_id: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    price: Optional[float] = None
    weight_grams: Optional[int] = None
    image_url: Optional[str] = None
    is_combo: Optional[bool] = None
    stock_quantity: Optional[int] = None

class Product(ProductBase):
    id: str

    class Config:
        orm_mode = True

class ProductListItem(BaseModel):
    id: str
    name: str
    price: float
    image_url: Optional[str] = None
    seller_id: Optional[str] = None

# Utility functions
def get_db():
    return Database(os.getenv("DATABASE_URL"))

async def get_product(db: Database, product_id: str):
    query = """
    SELECT id, name, description, category_id, price, weight_grams,
           image_url, is_combo, stock_quantity, seller_id
    FROM products
    WHERE id = :product_id
    """
    return await db.fetch_one(query=query, values={"product_id": product_id})

async def get_products(
    db: Database,
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    seller_id: Optional[str] = None
):
    query = """
    SELECT id, name, price, image_url, seller_id
    FROM products
    WHERE 1=1
    """
    values = {}

    if category_id:
        query += " AND category_id = :category_id"
        values["category_id"] = category_id

    if min_price is not None:
        query += " AND price >= :min_price"
        values["min_price"] = min_price

    if max_price is not None:
        query += " AND price <= :max_price"
        values["max_price"] = max_price

    if seller_id:
        query += " AND seller_id = :seller_id"
        values["seller_id"] = seller_id

    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
    values["limit"] = limit
    values["offset"] = skip

    return await db.fetch_all(query=query, values=values)

# Routes
@router.post("/", response_model=Product)
async def create_product(
    product: ProductCreate,
    db: Database = Depends(get_db)
):
    query = """
    INSERT INTO products
    (id, name, description, category_id, price, weight_grams,
     image_url, is_combo, stock_quantity, seller_id)
    VALUES
    (uuid_generate_v4(), :name, :description, :category_id, :price,
     :weight_grams, :image_url, :is_combo, :stock_quantity, :seller_id)
    RETURNING id
    """
    values = product.dict()
    product_id = await db.fetch_val(query=query, values=values)
    return await get_product(db, product_id)

@router.get("/", response_model=List[ProductListItem])
async def read_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    seller_id: Optional[str] = Query(None),
    db: Database = Depends(get_db)
):
    return await get_products(
        db, skip, limit, category_id, min_price, max_price, seller_id
    )

@router.get("/{product_id}", response_model=Product)
async def read_product(
    product_id: str,
    db: Database = Depends(get_db)
):
    product = await get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product: ProductUpdate,
    db: Database = Depends(get_db)
):
    query = """
    UPDATE products
    SET
        name = COALESCE(:name, name),
        description = COALESCE(:description, description),
        category_id = COALESCE(:category_id, category_id),
        price = COALESCE(:price, price),
        weight_grams = COALESCE(:weight_grams, weight_grams),
        image_url = COALESCE(:image_url, image_url),
        is_combo = COALESCE(:is_combo, is_combo),
        stock_quantity = COALESCE(:stock_quantity, stock_quantity)
    WHERE id = :product_id
    RETURNING id
    """
    values = product.dict()
    values["product_id"] = product_id
    await db.execute(query=query, values=values)
    return await get_product(db, product_id)

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    db: Database = Depends(get_db)
):
    query = "DELETE FROM products WHERE id = :product_id"
    await db.execute(query=query, values={"product_id": product_id})
    return {"message": "Product deleted successfully"}