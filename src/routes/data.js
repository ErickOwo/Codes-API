const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');


const fs = require('fs-extra')
const { addImage, deleteImage } = require('../utils/use-media');

// models
const User = require('../models/user');

router.post('/add', async (req, res) => {
  const token = req.header('Authorization');
  if(!token) return res.status(401).json({message: 'Usuario no autenticado', type: 'error'});
  
  const decode = jwt.decode(token);
  const user = await User.findOne({ email: decode.email });

  const data = req.body;

  data.id = uuidv4()

  for(let i; i < user.data.length; i++){
    if(data.code == user.data[i]) {
      await User.findByIdAndUpdate(user._id, {
        data: user.data.pop()
      })
      return res.send({error: true, message: 'Objeto ya existente'})
    }
  }

  let result;

  if(req.file) {
    result = await addImage(req.file.path, 'Codes App/public');
    
    data.imgURL = result.url;
    data.public_id = result.public_id;
  } 


  if(user.data || !(user.data.length != 0)) await User.findByIdAndUpdate(user._id, {
    data: [...user.data, data]
  }, {
    new: true,
    runValidators: true,
  }); else await User.findByIdAndUpdate(user._id, {
    data: [ data ]
  }, {
    new: true,
    runValidators: true,
  });

  if(req.file) await fs.unlink(req.file.path);
  res.send({error: false, message: 'Objeto agregado con exito'});
})

router.get('/', async (req, res)=>{
  const token = req.header('Authorization');
  if(!token) return res.status(401).json({message: 'Usuario no autenticado', type: 'error'});
  
  const decode = jwt.decode(token);
  const user = await User.findOne({ email: decode.email });

  res.send(user.data)
})

router.patch('/update/:id',async (req, res)=> {
  const token = req.header('Authorization');
  const id = req.params.id;

  if(!token) return res.status(401).json({message: 'Usuario no autenticado', type: 'error'});
  
  const decode = jwt.decode(token);
  const user = await User.findOne({ email: decode.email });
  
  const data = req.body;
  if(req.file) {
    result = await addImage(req.file.path, 'Codes App/public');

    if(data.public_id) {
      deleteImage(data.public_id)
    }
    
    data.imgURL = result.url;
    data.public_id = result.public_id;
  } 


  const array = user.data.map(item => {
    if (!item.id && data.title == item.title || data.code == item.code) {
      
      data.id = uuidv4()
      return data
    } else if (data.id && item.id == data.id) {
      return data
    }
    return item
  })

  await User.findByIdAndUpdate(user._id, {
    data: array
  }, {
    new: true,
    runValidators: true,
  });

  if(req.file) await fs.unlink(req.file.path);

  res.send({error: false, message: 'Obejeto modificado con éxito'})
})

module.exports = router;