import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from main import SessionLocal, User, Category, Seller, Product, Order, Address, Base, engine

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_db():
    print("Creating tables if not exists...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(Category).count() > 0:
            print("Database already seeded!")
            return

        print("Seeding Categories...")
        categories_data = ["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports & Outdoors"]
        for cat_name in categories_data:
            db.add(Category(name=cat_name))
        db.commit()

        print("Seeding Users...")
        users_data = []
        for i in range(1, 6):
            user = User(
                phone=f"+91999999999{i}",
                email=f"user{i}@example.com",
                password_hash=get_password_hash("password123"),
                signup_platform="WEB",
                is_premium=(i % 2 == 0),
                wallet_balance=1000.0,
                privacy_accepted=True
            )
            db.add(user)
            users_data.append(user)
        db.commit()

        print("Seeding Addresses...")
        for user in users_data:
            addr = Address(
                user_id=user.id,
                name=f"{user.email.split('@')[0].capitalize()} Doe",
                street=f"{user.id} Main St",
                city="Mumbai",
                state="MH",
                zip_code="400001",
                is_default=True
            )
            db.add(addr)
        db.commit()

        print("Seeding Sellers...")
        sellers_data = []
        for i, user in enumerate(users_data):
            seller = Seller(
                user_id=user.id,
                business_name=f"Seller Store {i+1}",
                commission_rate=5.0,
                status="APPROVED"
            )
            db.add(seller)
            sellers_data.append(seller)
        db.commit()

        print("Seeding Products...")
        products_data = [
            {"name": "Wireless Headphones", "cat": 1, "price": 2999.0, "img": "https://via.placeholder.com/400x400.png?text=Headphones"},
            {"name": "Smart Watch Pro", "cat": 1, "price": 4999.0, "img": "https://via.placeholder.com/400x400.png?text=SmartWatch"},
            {"name": "Men's Casual Shirt", "cat": 2, "price": 999.0, "img": "https://via.placeholder.com/400x400.png?text=Shirt"},
            {"name": "Women's Handbag", "cat": 2, "price": 1499.0, "img": "https://via.placeholder.com/400x400.png?text=Handbag"},
            {"name": "Non-Stick Cookware", "cat": 3, "price": 1999.0, "img": "https://via.placeholder.com/400x400.png?text=Cookware"},
            {"name": "Organic Face Serum", "cat": 4, "price": 799.0, "img": "https://via.placeholder.com/400x400.png?text=FaceSerum"},
            {"name": "Yoga Mat", "cat": 5, "price": 499.0, "img": "https://via.placeholder.com/400x400.png?text=YogaMat"},
        ]
        
        for i, prod in enumerate(products_data):
            # Assign products round-robin to sellers
            seller_id = sellers_data[i % len(sellers_data)].id
            db_prod = Product(
                name=prod["name"],
                category_id=prod["cat"],
                price=prod["price"],
                weight_grams=500,
                image_url=prod["img"],
                stock_quantity=50,
                is_approved=True, # Pre-approved for display
                seller_id=seller_id
            )
            db.add(db_prod)
        db.commit()

        print("Seeding Orders...")
        # Create an order for each seller
        for i, seller in enumerate(sellers_data):
            order = Order(
                customer_name=users_data[(i+1) % len(users_data)].email,
                amount=999.0 + (i * 100),
                status="Pending",
                seller_id=seller.id
            )
            db.add(order)
        db.commit()

        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
