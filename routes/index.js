var express = require('express');
var router = express.Router();
const userModel=require('./users');
const postModel=require('./post');
const passport=require("passport");
const upload=require('./multer')
const localStrategy=require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/create',async function(req,res,next){
    var userdata=await userModel.create({
      username:"Akansha",
      password:"akansha",
      posts:[],
      email:"akanshaoptimist@gmail.com",
      fullname:"Akansha Pandey"
    })
    res.send(userdata);
 //our one user is ready and we have its id as well

})
router.get('/createpost',async function(req,res,next){
    var createdpost=await postModel.create({
       postText:"Sleeping after an intense workout",
       user:"657b40157654452dbf3546da"
    })
    let user=await userModel.findOne({_id:"657b40157654452dbf3546da"});
    user.posts.push(createdpost._id);
    await user.save(); //to save in structured format  according to predefined schema

    res.send("done");
})
router.get('/allusers',async function(req,res,next){
   let user=await userModel.findOne({_id:"657b40157654452dbf3546da"}).populate("posts");
   res.send(user);

})
*/
router.post("/register",function(req,res){
  const userData = new userModel({
    username,
    email,
    fullname,
  } = req.body);
  userModel.register(userData,req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/profile');
    })
  })
  
})
router.post('/login',passport.authenticate("local",{
  successRedirect:'/profile',
  failureRedirect:'/login',
  failureFlash:true
}),function(req,res){})

router.get('/profile', isLoggedIn, async function(req, res) {
  
    const user = await userModel.findOne({
      username: req.session.passport.user //ismein username saved hota h
    }).populate("posts");

    res.render('profile', { user });
 }
);
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post('/change',isLoggedIn,upload.single('file'),async function(req,res){
  if(!req.file){
    return res.status(400).send('No files were uploaded.');
  }
  //res.send('file uploaded successfully');
  // jo file upload hui hai uski post id user ko do aur uso user ki userid do.
  const user=await userModel.updateOne({username:req.session.passport.user},{ $set: { image: req.file.filename } });
  console.log(req.session.passport,user);
  res.redirect("/profile");

  
})

router.post('/upload',isLoggedIn,upload.single('file'),async function(req,res){
  if(!req.file){
    return res.status(400).send('No files were uploaded.');
  }
  //res.send('file uploaded successfully');
  // jo file upload hui hai uski post id user ko do aur uso user ki userid do.
  const user=await userModel.findOne({username:req.session.passport.user});
  const postdata=await postModel.create({
    image:req.file.filename,
    postText:req.body.filecaption,
    user:user._id

  })
  await user.posts.push(postdata._id);
  await user.save();
  res.redirect("/profile");


})
function isLoggedIn(req,res,next){
  
  console.log('Authenticated:', req.isAuthenticated());
  if(req.isAuthenticated()){
    next();
  }
  //res.redirect("/");
  else{
    res.redirect('/')
  }
  
}
router.get('/',function(req,res,next){
  res.render("index");
})
router.get('/login',function(req,res,next){
      
      res.render('login',{error:req.flash('error')});  //req.flash is an array

})
router.get('/feed',function(req,res,next){
  res.render("feed");
})

module.exports = router;
