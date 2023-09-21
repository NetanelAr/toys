const express = require("express");
const { auth } = require("../middlewares/auth");
const { validateToy,ToyModel } = require("../models/toyModel");
const router = express.Router();

//Route A,B,C - domain/toys/
router.get("/", async(req,res) => {
  try{
    const limit = req.query.limit || 10;
    const page = req.query.page - 1 || 0;
    const sort = req.query.sort || "_id";
    const reverse = req.query.reverse == "yes" ? 1 : -1;

    let filteFind = {};
    if(req.query.s && req.query.catname)
    {
        const searchExpSearch = new RegExp(req.query.s,"i");
        const searchExpCat = new RegExp(req.query.catname,"i");
        filteFind = {$or:[{name:searchExpSearch},{info:searchExpSearch}],category:searchExpCat}
    }
    else if(req.query.s){
        const searchExp = new RegExp(req.query.s,"i");
        filteFind = {$or:[{name:searchExp},{info:searchExp}]}
    }
    else if(req.query.catname){
        const searchExpCat = new RegExp(req.query.catname,"i");
        filteFind = {category:searchExpCat}
    }
    
    const data = await ToyModel
    .find(filteFind)
    .limit(limit)
    .skip(page * limit)
    .sort({[sort]:reverse})
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

//Route H - domain/toys/single/:id
router.get("/single/:id",async(req,res)=>{
    try{
        const toyId=req.params.id;
        const data= await ToyModel.find({_id:toyId})
        res.json(data);
    }
    catch(err){
        console.log(err);
        res.status(502).json({err})
    }
})

//Route G - domain/toys/price
router.get("/price",async(req,res)=>{
    try{
        const max=req.query.max || 99999;
        const min=req.query.min || 1;
        const page = req.query.page - 1 || 0;
        const data= await ToyModel
        .find({price:{$lte:max,$gte:min}})
        .limit(10)
        .skip(page * 10)
        res.json(data);

    }
    catch(err){
        console.log(err);
        res.status(502).json({err})
    }
  })

//Route I - domain/toys/count
router.get("/count", async(req,res) => {
  try{
    const limit = req.query.limit || 5;
    const count = await ToyModel.countDocuments({})
    res.json({count,pages:Math.ceil(count/limit)})
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

//Route D - domain/toys/
router.post("/" , auth ,async(req,res) => {
  const validBody = validateToy(req.body)
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    const toy = new ToyModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save()
    res.status(201).json(toy);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

//Route E - domain/toys/:editId
router.put("/:editId", auth, async(req,res) => {
  const validBody = validateToy(req.body)
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    const id = req.params.editId;
    const data = await ToyModel.updateOne({_id:id,user_id:req.tokenData._id},req.body);
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

//Route F - domain/toys/:delId
router.delete("/:delId", auth, async(req,res) => {
  try{
    const id = req.params.delId;
    const data = await ToyModel.deleteOne({_id:id,user_id:req.tokenData._id});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

module.exports = router;