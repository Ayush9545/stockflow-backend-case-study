from decimal import Decimal

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json()

    # request.json can be None
    if not data:
        return {"error": "Invalid or missing JSON body"}, 400

    # input validation to prevent KeyError
    if (
        'name' not in data or
        'sku' not in data or
        'price' not in data or
        'warehouse_id' not in data
    ):
        return {"error": "name, sku, price and warehouse_id are required"}, 400

    # price handled as decimal (no float usage)
    try:
        price = Decimal(str(data['price']))
    except:
        return {"error": "Invalid price format"}, 400

    # Create new product
    product = Product(
        name=data['name'],
        sku=data['sku'],
        price=price,
        warehouse_id=data['warehouse_id']
    )

    db.session.add(product)
    db.session.commit()

    # Update inventory count
    inventory = Inventory(
        product_id=product.id,
        warehouse_id=data['warehouse_id'],
        quantity=data.get('initial_quantity', 0)
    )

    db.session.add(inventory)
    db.session.commit()

    return {
        "message": "Product created",
        "product_id": product.id
    }