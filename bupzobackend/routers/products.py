"""
BUPZO Products Router
Handles product CRUD operations and category management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Product, Category
from schemas import ProductCreate, ProductResponse, CategoryCreate, CategoryResponse

router = APIRouter()

@router.post("/categories", status_code=status.HTTP_201_CREATED, response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Create a new product category
    """
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories", status_code=status.HTTP_200_OK, response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """
    Get all product categories
    """
    categories = db.query(Category).all()
    return categories

@router.get("/categories/{category_id}", status_code=status.HTTP_200_OK, response_model=CategoryResponse)
async def get_category(category_id: str, db: Session = Depends(get_db)):
    """
    Get a specific product category
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.post("/products", status_code=status.HTTP_201_CREATED, response_model=ProductResponse)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product
    """
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products", status_code=status.HTTP_200_OK, response_model=List[ProductResponse])
async def get_products(
    category_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all products (optionally filtered by category)
    """
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    products = query.all()
    return products

@router.get("/products/{product_id}", status_code=status.HTTP_200_OK, response_model=ProductResponse)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """
    Get a specific product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.put("/products/{product_id}", status_code=status.HTTP_200_OK, response_model=ProductResponse)
async def update_product(
    product_id: str,
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    Update a product
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    for key, value in product.model_dump().items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, db: Session = Depends(get_db)):
    """
    Delete a product
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    db.delete(db_product)
    db.commit()
    return None