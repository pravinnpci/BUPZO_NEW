from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

from . import models, schemas

def get_user(db: Session, user_id: UUID):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_phone_number(db: Session, phone_number: str):
    return db.query(models.User).filter(models.User.phone_number == phone_number).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        phone_number=user.phone_number,
        email=user.email,
        full_name=user.full_name,
        is_premium=user.is_premium,
        signup_platform=user.signup_platform,
        privacy_policy_accepted=user.privacy_policy_accepted,
        marketing_consent=user.marketing_consent,
        wallet_balance=Decimal('0.00'),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create wallet for the user
    wallet = models.Wallet(
        user_id=user.id,
        balance=Decimal('0.00'),
        updated_at=datetime.now()
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)

    return db_user

def get_products(db: Session, skip: int = 0, limit: int = 100, **filters):
    query = db.query(models.Product)

    if 'category_id' in filters:
        query = query.filter(models.Product.category_id == filters['category_id'])

    if 'seller_id' in filters:
        query = query.filter(models.Product.seller_id == filters['seller_id'])

    if 'is_combo' in filters:
        query = query.filter(models.Product.is_combo == filters['is_combo'])

    if 'price_min' in filters:
        query = query.filter(models.Product.price >= filters['price_min'])

    if 'price_max' in filters:
        query = query.filter(models.Product.price <= filters['price_max'])

    if 'sort_by' in filters:
        if filters['sort_by'] == 'new_arrivals':
            query = query.order_by(models.Product.created_at.desc())
        elif filters['sort_by'] == 'price_asc':
            query = query.order_by(models.Product.price.asc())
        elif filters['sort_by'] == 'price_desc':
            query = query.order_by(models.Product.price.desc())

    return query.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: UUID):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate, user_id: UUID):
    seller = db.query(models.Seller).filter(models.Seller.user_id == user_id).first()
    if not seller:
        return None

    db_product = models.Product(
        name=product.name,
        description=product.description,
        category_id=product.category_id,
        price=product.price,
        weight_grams=product.weight_grams,
        image_url=product.image_url,
        is_combo=product.is_combo,
        stock_quantity=product.stock_quantity,
        seller_id=seller.id,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_wallet_balance(db: Session, user_id: UUID):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user_id).first()
    return wallet.balance if wallet else Decimal('0.00')

def get_wallet_transactions(db: Session, user_id: UUID, skip: int = 0, limit: int = 100):
    return db.query(models.WalletTransaction).filter(
        models.WalletTransaction.user_id == user_id
    ).order_by(models.WalletTransaction.created_at.desc()).offset(skip).limit(limit).all()