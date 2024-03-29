'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
        static associate({ Product, Order, SizeName, Store }) {
        // define association here
        // this belongs to product with id
        this.belongsTo(Product, {foreignKey : 'productId', as : 'product'})
        // this belongs to order with id
        this.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
        this.belongsTo(SizeName, { foreignKey: 'sizeNameId', as : 'size_name'})
        this.belongsTo(Store, {foreignKey: 'storeId', as: 'store'})
    }
    };
    OrderProduct.init({
    order_product_id: {
        type : DataTypes.UUID,
        defaultValue : DataTypes.UUIDV4
    },
    productId: {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    product_code: {
        type : DataTypes.STRING,
        allowNull : false
    },
    product_name_tm: {
        type : DataTypes.STRING,
        allowNull : false
    },
    product_name_ru: {
        type : DataTypes.STRING,
        allowNull : false
    },
    product_name_en: {
        type : DataTypes.STRING,
        allowNull : false
    },
    orderId: {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    sizeNameId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sold_price: {
        type : DataTypes.DOUBLE,
        allowNull : false
    },
    quantity : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    store_name: {
        type: DataTypes.STRING,
        allowNull: true
    }
    },
    {
        sequelize,
        tableName : 'order_products',
        modelName: 'OrderProduct',
    });
    return OrderProduct;
};