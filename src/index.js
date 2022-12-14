const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const app = express();
const { default : mongoose } = require('mongoose');
mongoose.set("strictQuery", false)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb+srv://Chetan_ProjectClustor:PNr1Fn8OcRu2cGmk@project1.h4p8xqh.mongodb.net/group8Database",{useNewUrlParser:true})
.then(()=>console.log("Mongo db is connected"))
.catch(err=>console.log(err))
app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
