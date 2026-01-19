import { Product, Warehouse, Inventory, Sale } from "../models/index.js";
import { Op } from "sequelize";

const LOW_STOCK = 10;

export const getLowStockAlerts = async (req, res) => {
  const companyId = req.params.companyId;

  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 30);

  const alerts = [];

  try {
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

    for (let item of inventoryList) {

      if (item.quantity >= LOW_STOCK) {
        continue;
      }

      const sale = await Sale.findOne({
        where: {
          product_id: item.product_id,
          created_at: {
            [Op.gte]: recentDate
          }
        }
      });

      if (!sale) {
        continue;
      }

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

