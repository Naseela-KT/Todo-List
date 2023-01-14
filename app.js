//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
// mongoose.connect("mongodb://127.0.0.1/todolistDB");
mongoose.connect("mongodb+srv://Naseela:Nasla%4025@cluster0.nadghvc.mongodb.net/todolistDB");





const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to ut todo list"
});
const item2=new Item({
  name:"Hit + to add Item"
});
const item3=new Item({
  name:"<-- Hit this to delete an Item"
});

const defaultItem=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema);


const workItems = [];

app.get("/", function(req, res) {
Item.find(function(err,result){
  if(result.length===0){
    
  Item.insertMany(defaultItem,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Success");
    }
  });
  res.redirect("/");
  }else{
     res.render("list", {listTitle: "Today", newListItems: result});
  }
})

 

});

app.post("/", function(req, res){


  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

  

}
);

app.post("/delete",function(req,res){
  const checked=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.deleteOne({_id:checked},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findByIdAndUpdate({name:listName},{$pull:{items:{_id:checked}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

app.get("/:customListName",function(req,res){
  customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
  
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
