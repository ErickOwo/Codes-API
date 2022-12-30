const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();


const fs = require('fs-extra')
const { addImage } = require('../utils/use-media');

// models
const User = require('../models/user');

router.post('/add', async (req, res) => {
  const token = req.header('Authorization');
  if(!token) return res.status(401).json({message: 'Usuario no autenticado', type: 'error'});
  
  const decode = jwt.decode(token);
  const user = await User.findOne({ email: decode.email });

  const data = req.body;

  for(let i; i < user.data.length; i++){
    if(data.code == user.data[i]) {
      await User.findByIdAndUpdate(user._id, {
        data: user.data.pop()
      })
      return res.send({error: true, message: 'Objeto ya existente'})
    }
  }

  let result;

  if(req.file.path) {
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

  if(req.file.path) await fs.unlink(req.file.path);
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

  console.log(data)

  res.send({error: true, message: 'reading request'})
})

module.exports = router;