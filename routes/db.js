const uri = "mongodb+srv://P2P:88888888@cluster0.o8iuu.mongodb.net/P2P?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const express = require('express');
const { text } = require('body-parser');


const dbRouter = express.Router();

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(() => {
    console.log('Connected')
}).catch(err => console.log(err))
dbRouter.use(bodyParser.json())

const userSchema = new mongoose.Schema({ name: 'string', peerId: 'string', IP: 'string' },{timestamps:true});
const userModel = mongoose.model('users', userSchema);
var obj = {}

dbRouter.route('/add').post((req, resPonse) => {
    resPonse.setHeader("Content-Type","applicaton/json");
    var obj2 = JSON.parse(JSON.stringify(req.body));
    var obj={}
    obj["name"]=obj2.name;
    obj["peerId"]=obj2.peerId;
    console.log((obj));
    userModel.create(obj, function (err, objectInserted) {
        if (err) return handleError(err);
        resPonse.json(obj)
    });
})

dbRouter.route('/:id').get((req, res) => {
    console.log(req.params.id);
    userModel.find({ peerId: req.params.id}).sort('-updatedAt').limit(1).exec(function(err, doc){ 
        if(err){
            console.log(err);
            res.send(null);
        }else{
            res.setHeader("Content-Type","applicaton/json");
            var obj2 = JSON.parse(JSON.stringify(doc));
            res.json(obj2);
        }
    });
})

module.exports = dbRouter;
