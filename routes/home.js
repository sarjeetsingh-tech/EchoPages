const express=require('express');
const router=express.Router();

router.get('/', (req, res, next) => {
    try {
        res.render('posts/home.ejs')
    } catch (err) {
        throw new appError('Internal Server Error', 500);
    }
})
module.exports=router;