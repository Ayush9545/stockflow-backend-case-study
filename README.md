 #Part 1-


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
 I change the many thinks like I have add decimal, there us no sky, request.json, etc
I also see that it has two commit but I cannot solve how to handle that so o leave it as it is.




# part 2- 



As for company I will store company information- id SERIAL PRIMARY KEY
Name VARCHAR(100)

For warehouse-
id SERIAL PRIMARY KEY
company id INT 
name VARCHAR(100)

For products-
id SERIAL PRIMARY KEY
company_id INT
name VARCHAR(255)
sku VARCHAR(100) UNIQUE
price NUMERIC(10,2)

For inventory-
id SERIAL PRIMARY KEY
product_id INT UNIQUE
warehouse_id INT UNIQUE
quantity INT


I have use 4 table and use only necessary things as columns. and also I cannot file missing things. Sorry about that.



#Part 3-


import { Product, Warehouse, Inventory, Sale } from "../models/index.js";
import { Op } from "sequelize";

const LOW_STOCK = 10;

export const getLowStockAlerts = async (req, res) => {
  const companyId = req.params.companyId;

  // define recent sales range
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 30);

  const alerts = [];

  try {
    // get inventory with product and warehouse info
    const inventoryList = await Inventory.findAll({
      include: [
        {
          model: Product,
          where: { company_id: companyId }
        },
        {
          model: Warehouse
        }
      ]
    });

    // loop through inventory records
    for (let item of inventoryList) {

      // skip if stock is not low
      if (item.quantity >= LOW_STOCK) {
        continue;
      }

      // check if product has recent sales
      const sale = await Sale.findOne({
        where: {
          product_id: item.product_id,
          created_at: {
            [Op.gte]: recentDate
          }
        }
      });

      // skip if no recent sales
      if (!sale) {
        continue;
      }

      // add alert
      alerts.push({
        product_id: item.Product.id,
        product_name: item.Product.name,
        sku: item.Product.sku,
        warehouse_id: item.Warehouse.id,
        warehouse_name: item.Warehouse.name,
        current_stock: item.quantity,
        threshold: LOW_STOCK
      });
    }

    return res.json({
      alerts: alerts,
      total_alerts: alerts.length
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
};



I have use node.js and express.js as I am good at it.
