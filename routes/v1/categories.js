const express = require('express');
const router = express.Router();
const { Categorie ,SubCategorie} = require('../../models');
// File Upload Multer
const multer = require('multer');
// Sharp to image converter
const sharp = require('sharp');
const fs = require('fs');
const config = require('config');


// @route POST v1/categories
// @desc Create Categorie
// @access Private(Admin)
router.post('/', async (req, res) => {

    const {
       categorie_name,
    } = req.body;
 
    try {
 
       const categorie = await Categorie.create({
          categorie_name,
       });
       
       res.json(categorie);
    }
    catch (error) {
       console.log(error);
       res.status(500).send('Server error')
    }
});


// @route GET v1/categories
// @desc Get all Categories
// @access Public
router.get('/', async (req, res) => {

   let limit = null;

   // limit
   if (req.query.limit) {
      limit = Number(req.query.limit)
   }
      
   try {
      const categories = await Categorie.findAll({
         limit,
         include : {
            model : SubCategorie,
            as : 'subcategories',
            attributes : ['subcategorie_id','subcategorie_name']
         },
         
      });
      res.json(categories);
   }
   catch (error) {
      console.log(error);
      res.status(500).send('Server error')
   }
});


// @route GET v1/categories/:categorie_id
// @desc Get Categorie by id
// @access Public
router.get('/:categorie_id', async (req, res) => {

   try {
      const categorie = await Categorie.findOne({
         where: { categorie_id: req.params.categorie_id },
         include : 'subcategories'
      });

      if(!categorie) return res.status(404).send('Categorie not found !')

      res.json(categorie);
   }
   catch (error) {
      console.log(error);
      res.status(500).send('Server error')
   }
});


// @route PATCH v1/categories/:categorie_id
// @desc Update Categorie
// @access Private(Admin)
router.patch('/:categorie_id', async (req, res) => {

   const newObj = {};
   
   const {
      categorie_name,
   } = req.body;

   if (categorie_name) {
      newObj.categorie_name = categorie_name;
   }
   else {
      return res.status(400).send('Please input value!');
   }
   try {

      const categorie = await Categorie.update(newObj, {
         where: {
            categorie_id : req.params.categorie_id
         }
      });

      if(!categorie) res.status(404).send('Categorie not found !')

      res.json(categorie);
   }
   catch (error) {
      console.log(error);
      res.status(500).send('Server error')
   }
});



// @route DELETE v1/categories/:categorie_id
// @desc Delete Categorie
// @access Private(Admin)
router.delete('/:categorie_id', async (req, res) => {
   try {
      // Find Categorie
      const categorie = await Categorie.findOne({ where: { categorie_id: req.params.categorie_id } });

      if (!categorie) {
         return res.status(404).send('Categorie not found !');
      }
      // Delete
      await Categorie.destroy({ where: { categorie_id: req.params.categorie_id } });

      // Delete categorie image
      if(categorie.categorie_image){
         fs.unlinkSync(config.get('rootPath')  + categorie.categorie_image)
      }
      res.json(categorie);

   } catch (error) {
      console.log(error);
      res.status(500).send('Server error')
   }
});



// @route Post v1/categories/image/:categorie_id
// desc  Create Categorie Image
// access Private(Admin)

// Check file with multer
const upload = multer({
   limits: {
      fileSize: 2000000
   },
   fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg|jpeg|svg|webp)$/)) {
         return cb(new Error('Please upload image formats'))
      }
      cb(undefined, true)
   }
});
router.post('/image/:categorie_id', upload.single('image'), async (req, res) => {

   try {
      const categorie = await Categorie.findOne({
         where: { categorie_id: req.params.categorie_id },
      });
   
      if (!categorie) {
         return res.status(404).send('Categorie not found')
      }

      // Delete if categorie image already exists
      if(categorie.categorie_image){
         fs.unlinkSync(config.get('rootPath') + categorie.categorie_image);  
      }
   
      // Convert image to png with sharp 
      await sharp(req.file.buffer).resize({
         width: 1000,
         height: 1000
      }).webp().toFile(`./public/categorie-images/${req.file.originalname+ '-' + categorie.id}.webp`)
   
      // Pathname of new categorie image
      let image = `/categorie-images/${req.file.originalname + '-' + categorie.id}.webp`;
   
      categorie.categorie_image = image;
   
      categorie.save();
   
      return res.send(image);   
   }
   catch (error) {
      console.log(error);
      res.status(500).send('Server error')
   }
},
(error, req, res, next) => {
   res.status(400).send({
      error: error.message
   })
});




module.exports = router;