const express = require('express');
const router = express.Router();

// models
const User = require('../models/user');

// essentials to authenticate
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { schemaRegisterUser, schemaLoginUser  } = require('../utils/schemas-joi');

router.get('/profile', async (req, res)=>{
  try{
    const token = req.headers.authorization;
    const decode = jwt.decode(token);
    const isEmailExist = await User.findOne({email: decode.email});
    if(isEmailExist && isEmailExist._id == decode.id) return res.send(decode);
    else throw('email no registrado');
  } catch(error){
    return res.status(400).send(error);
  }
});

router.post('/signup', async (req, res)=>{
  try {
    const { error } = schemaRegisterUser.validate(req.body);
    if(error) return res.status(400).json({ error: error.details[0].message });
    
    const isEmailExist = await User.findOne({ email: req.body.email });
    if(isEmailExist) return res.status(400).json({ error: 'Correo electrónico ya registrado' });

    const salt = await bcrypt.genSalt(11);
    const password = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password,
    })

   await user.save();

   return res.json({ error: null, message: "Usuario agregado correctamente"}); 
  
  } catch(error) {
    return res.status(400).json(error);
  } 
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if(!user) return res.send({error: true, message: "Usuario o contraseña incorrecto"});
  
  const validatePassword = await bcrypt.compare(req.body.password, user.password);
  
  if(!validatePassword) {
    return res.status(400).json({ error: true, message: 'Usuario o contraseña incorrecto' });}
  
  user._id = `${user._id}`;

  const access_token = jwt.sign({
    name: user.name,
    email: user.email,
    id: user._id,
  }, process.env.TOKEN_SECRET);
  
  return res.header('auth-token', access_token).json({ 
    error: null, 
    message: "Bienvenido", 
    access_token });
});

module.exports = router;