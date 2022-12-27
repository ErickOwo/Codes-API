const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// models
const User = require('../models/user');

router.post('/add', async (req, res) => {
  const token = req.header('Authorization');
  if(!token) return res.status(401).json({message: 'Usuario no autenticado', type: 'error'});
  
  const decode = jwt.decode(token);
  const user = await User.findOne({ email: decode.email });

  const data = req.body 

  for(let i; i < user.data.length; i++){
    if(data.code == user.data[i]) {
      await User.findByIdAndUpdate(user._id, {
        data: user.data.pop()
      })
      return res.send({error: true, message: 'Objeto ya existente'})
    }
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

  
  res.send({error: false, message: 'Objeto agregado con exito'});
})

router.get('/', async (req, res)=>{
  const token = req.header('Authorization');
  if(!token) return res.status(401).json({message: 'Usuario no autenticado', type: 'error'});
  
  const decode = jwt.decode(token);
  const user = await User.findOne({ email: decode.email });

  res.send(user.data)
})

module.exports = router;