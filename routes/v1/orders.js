const express = require('express');
const router = express.Router();
// Models
const { Order , OrderProduct, Product, User, Stock } = require('../../models');
// auth
const userAuth = require('../../middleware/userAuth');
const order = require('../../models/order');


// @route POST v1/orders
// @desc Order Products
// @access Private
router.post('/', userAuth , async (req, res) => {

    let total_price = 0;

    const {
        products
    } = req.body;

    if(!products) return res.status(400).send('Please Choose Products')
    if(products.length === 0) return res.status(400).send('Please Choose Products')

    try {
        // Get auth user
        const user = await User.findOne({
            where: {
                user_id : req.user.id
            }
        });

        const order = await Order.create({
            userId : user.id
        })

        await products.forEach(async (val,index) => {
            const product = await Product.findOne({where : {product_id : val.product_id}}); 
            const stock = await Stock.findOne({where : {stock_id : val.stock_id}});

            await OrderProduct.create({
                productId : product.id,
                orderId : order.id,
                sold_price : product.price_tmt,
                quantity : val.quantity
            });

            // Mukdar sany azalya
            stock.stock_quantity = Number(stock.stock_quantity) - val.quantity 
            stock.save()
            
            total_price = total_price + product.price_tmt
            
            if(index === products.length - 1){
                order.subtotal = total_price;
                await order.save();
                return res.json(order)
            }
        });
 
    } catch (error) {
       console.log(error);
       res.status(400).send('Server error')
    }
});


// @route GET v1/orders
// @desc Get all orders
// @access Private
router.get('/' , async (req, res) => {

    try {
        
        const orders = await Order.findAll({
            include : [
                {
                    model : OrderProduct,
                    as : 'order_products',
                    include : {
                        model : Product,
                        as : 'product',
                        attributes : ['product_id','product_name']
                    }
                }
            ]
        });
        
        return res.json(orders)
 
    } catch (error) {
       console.log(error);
       res.status(400).send('Server error')
    }
});



// @route POST v1/orders/status/:order_id
// @desc Change Order Status
// 'waiting', 'processing', 'delivered', 'rejected'
// @access Private
router.post('/status/:order_id' , async (req, res) => {

    const {
        order_status
    } = req.body;

    if(!order_status) return res.status(400).send('Select Status')

    try {
        
        const order = await Order.findOne({
            order_id : req.params.order_id
        })

        
        if(!order) return res.status(404).send('Order not found!');

        order.order_status = order_status
        await order.save();
        
        return res.send(`Order Status Changed to ' ${order_status} '`)
 
    } catch (error) {
       console.log(error);
       res.status(400).send('Server error')
    }
});

module.exports = router;