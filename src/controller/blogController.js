const blogModel = require("../models/blogModel")
let moment = require('moment')
const { isValidObjectId } = require("mongoose")
const authorModel = require("../models/authorModel")


//=========================CREATE the blogs
const createblog = async function(req, res){
  try{
    let data = req.body
    const{title,body,authorId,tags,category,subcategory} = req.body
    if(!title) return res.status(400).send({status: false, msg:"title is required"})
    if(!body) return res.status(400).send({status: false, msg:"body is required"})
    if(!authorId) return res.status(400).send({status: false, msg:"authorId is required"})
    if(!tags) return res.status(400).send({status: false, msg:"tags is required"})
    if(!category) return res.status(400).send({status: false, msg:"category is required"})
    if(!subcategory) return res.status(400).send({status: false, msg:"subcategory is required"})
    if(!isValidObjectId(authorId)) res.status(400).send({status:false,msg:"Author id is not Valid"})
    const isAuthorIdValid = await authorModel.findById(authorId).count()
    if(isAuthorIdValid==0){
      res.status(404).send({status:false,msg:"Author id doesnt Exist"})
    }
    let created = await blogModel.create(data)
    res.send({status: true, data: created})
  }
  catch(err){
    res.status(500).send(err.message)
  }
}

//============================ GET the blogs

const getblog = async function(req,res){
    const {authorId,category,tags,subcategory} = req.query
    if(!authorId && !category && !tags && !subcategory)
    {
      let blogData = await blogModel.find({isDeleted : false , isPublished :true,})
      if(!blogData) 
        return res.status(404).send({
          status: false,
          msg: "Blog doesnt exits in database"
        })
      return res.status(200).send({ status: true,data:blogData})
    }
    const blogData =await blogModel.find({$and:[{authorId:authorId},{category:category},{tags:tags},{subcategory:subcategory}]})
    if(!blogData) 
        return res.status(404).send({
          status: false,
          msg: "Blog doesnt exits in database"
        })
    return res.status(200).send({ status: true,data:blogData})
    
  } 

//updating blog data 
const updateBlogData = async function(req,res){
  try
  {    
       const {title,body,tags,subcategory} = req.body
       if(Object.keys(req.body).length != 0) // checking if there is data in request's body or not
       {
           blogId = req.params.blogId //storing blog id into variable
           let blogIDExist = await blogModel.findById(blogId) //validation - if user id valid or not
           //checking if user is deleted or not
           if(blogIDExist.isDeleted==true) res.status(404).send({status:false,msg: "This Blog ID Doesn't Exist"})
           if("tags" in req.body || "subcategory" in req.body){
             await blogModel.findByIdAndUpdate(
               blogId,
               {$push:{tags:tags,subcategory:subcategory}},
               {new:true}
             )
           }
           if(blogIDExist.isPublished==false)
           {
               let updatedBlogData = await blogModel.findByIdAndUpdate
               (
                 blogId,
                 {$set:{
                   title:title,
                   body:body,
                   isPublished : true,
                   publishedAt : moment().format() //inserting date with moment library
                   }},
                 {new:true}
               )
               res.status(200).send({status:true,data:updatedBlogData})
           }
           else 
           {
             let updatedBlogData = await blogModel.findByIdAndUpdate
               (
                 blogId,
                 {$set:{
                   title:title,
                   body:body
                   }},
                 {new:true}
               )
               res.status(200).send({status:true,data:updatedBlogData}) 
           }
       }
       else 
       {
              res.status(400).send({status:false,msg:"There is no Data in request's Body"})
       }
    }
 catch(err)
 {
   res.status(500).send({status:false,msg:err.message})
 }
}
// delete blog

const deleteByParams = async function (req, res) {
  try {
        let userId = req.params.blogId;
        if(!isValidObjectId(userId))
          return res.status(400).send({status:false,msg:" Please Enter Correct valid objectId"})
        let checkBlog = await blogModel.findById(userId)
        if(!checkBlog)
          return res.status(400).send({status:false,msg:"userId not found"})
        if (checkBlog.isDeleted == true)
          return res.status(404).send({ status:false,msg: "blog is already deleted...!" })
        let deleteBlog = await blogModel.findOneAndUpdate(
            { _id: userId },
            { $set: { isDeleted: true, deletedAt: new Date() } },
            { new: true }
        );
          return res.status(200).send({ status: true, data: deleteBlog })


      }
      catch(err)
      {
          return res.status(500).send({ status: false, msg: err.message })
      }

}



const deleteByQuery = async function (req, res) {
  try {
      let filterdata={isDeleted:false,authorId:req.authorId}
      let {category,subcategory,tags,authorId} = req.query

      if(authorId){
        if(!isValidObjectId(req.query.authorId))
        return res.status(400).send({status:false,message:"Please Enter Correct valid authorId"})
        else
        filterdata.authorId=authorId
      }

      if(category){
        filterdata.category=category
      }

      if(subcategory){
        filterdata.subcategory=subcategory
      }

      if(tags){
        filterdata.tags=tags
      }
      let checkBlog = await blogModel.findOne(filterdata)

      if(!checkBlog)
        return res.status(404).send({status:false,msg:"Data is nomatching"})
      
      if(checkBlog.authorId._id.toString()!==req.authorId)
         return res.status(401).send({status:false,msg:"Authorisation failed"})

      let deleteBlog = await blogModel.updateOne(
              filterdata,
              { $set: { isDeleted: true, deletedAt: new Date() } },
              { new: true}
          );

         return res.status(200).send({ status: true, data: deleteBlog })


  } catch (err) {
     return res.status(500).send({ status: false, msg: err.message })
  }

}


module.exports.getblog=getblog
module.exports.createblog=createblog 
module.exports.deleteByParams=deleteByParams
module.exports.updateBlogData=updateBlogData
module.exports.deleteByQuery=deleteByQuery