import re

with open('bupzo-backend/app/main.py', 'r') as f:
    content = f.read()

# 1. Add GET /api/sellers/{seller_id}
# Find @app.get("/api/sellers/", response_model=List[SellerResponse])
sellers_list_endpoint = """@app.get("/api/sellers/", response_model=List[SellerResponse])"""
seller_detail_endpoint = """@app.get("/api/sellers/{seller_id}", response_model=SellerResponse)
async def get_seller(seller_id: UUID):
    query = "SELECT * FROM sellers WHERE id = $1"
    res = await execute_query_one(query, seller_id)
    if not res:
        raise HTTPException(status_code=404, detail="Seller not found")
    res_dict = dict(res)
    if isinstance(res_dict.get('kyc_details'), str):
        import json
        try:
            res_dict['kyc_details'] = json.loads(res_dict['kyc_details'])
        except:
            res_dict['kyc_details'] = {}
    return res_dict

@app.get("/api/sellers/", response_model=List[SellerResponse])"""
content = content.replace(sellers_list_endpoint, seller_detail_endpoint)


# 2. Add GET /api/products/{product_id}/stats
# Find @app.get("/api/products/{product_id}", response_model=ProductResponse)
product_detail_endpoint = """@app.get("/api/products/{product_id}", response_model=ProductResponse)"""
product_stats_endpoint = """@app.get("/api/products/{product_id}/stats")
async def get_product_stats(product_id: UUID):
    res = await execute_query_one(\"\"\"
        SELECT 
            COALESCE(AVG(rating), 0) as average_rating,
            COUNT(id) as total_reviews,
            COUNT(id) as total_ratings
        FROM reviews WHERE product_id = $1
    \"\"\", product_id)
    if not res:
        return {"average_rating": 4.5, "total_reviews": 0, "total_ratings": 0}
    return dict(res)

@app.get("/api/products/{product_id}", response_model=ProductResponse)"""
content = content.replace(product_detail_endpoint, product_stats_endpoint)


# 3. Fix GET /api/products/ and GET /api/products/{product_id} to fetch images
# Replace "SELECT id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, description, created_at, is_approved"
content = content.replace(
    "SELECT id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, description, created_at, is_approved",
    "SELECT id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at, is_approved"
)
# Make sure we also parse images in read_products and read_product!
# Wait, they return `results` directly from `execute_query(query)`.
# Let's write a regex to replace `read_products` and `read_product` functions to parse images.
content = content.replace("""    return results""", """    import json
    parsed_results = []
    for r in results:
        r_dict = dict(r)
        if isinstance(r_dict.get('images'), str):
            try:
                r_dict['images'] = json.loads(r_dict['images'])
            except:
                r_dict['images'] = []
        elif r_dict.get('images') is None:
            r_dict['images'] = []
        parsed_results.append(r_dict)
    return parsed_results""")

# For read_product (which returns a single result):
content = content.replace("""    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return result""", """    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    result_dict = dict(result)
    import json
    if isinstance(result_dict.get('images'), str):
        try:
            result_dict['images'] = json.loads(result_dict['images'])
        except:
            result_dict['images'] = []
    elif result_dict.get('images') is None:
        result_dict['images'] = []
    return result_dict""")


# 4. Fix POST /api/reviews/ to parse images JSON string
content = content.replace("""            return dict(row)
        except asyncpg.exceptions.UniqueViolationError:""", """            row_dict = dict(row)
            if isinstance(row_dict.get('images'), str):
                try:
                    row_dict['images'] = json.loads(row_dict['images'])
                except:
                    row_dict['images'] = []
            return row_dict
        except asyncpg.exceptions.UniqueViolationError:""")


# 5. Fix POST /api/wallet/topup (remove status column)
content = content.replace("""        INSERT INTO wallet_transactions (id, user_id, type, amount, status, description, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        \"\"\",
        uuid4(), user_id_uuid, 'CREDIT', req.amount, 'COMPLETED', 'Wallet Top Up via UI'""", """        INSERT INTO wallet_transactions (id, user_id, type, amount, description, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        \"\"\",
        uuid4(), user_id_uuid, 'CREDIT', req.amount, 'Wallet Top Up via UI'""")


with open('bupzo-backend/app/main.py', 'w') as f:
    f.write(content)

print("Backend patched!")
