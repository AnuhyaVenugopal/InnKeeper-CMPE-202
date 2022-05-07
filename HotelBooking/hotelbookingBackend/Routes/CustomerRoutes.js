var express = require('express');
var router = express.Router();
var pool = require('./../Database/db')
router.post("/getPricing",async(req,res)=>{
    let {custId,hotelId,roomId,checkIn,checkOut,breakfast,fitnessRoom,swimmingPool,parking,allMeals}=req.body;
    let finalPrice=[];
    
    // for(let i=0;i<roomIds.length;i++){
        let getBasePriceQuery= `select basePrice from Rooms where roomID=? and hotelId=? `;
        let result=await pool.query(getBasePriceQuery,[roomId,hotelId]);
        let basePrice=await result[0][0]?.basePrice
        console.log(basePrice)
        checkIn=new Date(checkIn);
        checkOut=new Date(checkOut);
        const diffDays = Math.ceil((checkOut-checkIn) / (1000 * 60 * 60 * 24)); 
        basePrice=basePrice * (diffDays)
        let price=basePrice;
        price+=getPricingBasedOnCheckInDates(basePrice,checkIn,checkOut);
        price+=getPricingBasedOnHolidaySeason(basePrice,checkIn,checkOut);
        price+=getPricingBasedOnAmenities(diffDays,breakfast,fitnessRoom,swimmingPool,parking,allMeals)
        price+=getPricingBasedOnCustomerLoyalty(basePrice,custId);
        
        finalPrice.push({roomId:roomId,price:price})
    // }
    res.send(finalPrice)
});
 function isWeekend(date1, date2) {
    var d1 = new Date(date1),
        d2 = new Date(date2), 
        isWeekend = false;

    while (d1 < d2) {
        var day = d1.getDay();
        isWeekend = (day === 6) || (day === 0); 
        if (isWeekend) { return true; } // return immediately if weekend found
        d1.setDate(d1.getDate() + 1);
    }
    return false;
}
function getPricingBasedOnCheckInDates(basePrice,checkIn,checkOut) {
    let increment=0;
    if(isWeekend(checkIn,checkOut)){
        increment=basePrice*0.20;
    }else{
        increment=basePrice*0.05;
    }
    return increment
}
function getPricingBasedOnHolidaySeason(basePrice,checkIn,checkOut){
    let increment=0;
    /**Summer holiday season */
    if(checkIn.getMonth() in [5,6] || checkOut.getMonth() in [5,6]){
        increment+=basePrice*0.15;
    /**Thanksgiving and christmas season */
    if((checkIn.getDate()>=20 && checkIn.getMonth()==11) || checkIn.getMonth() ==12)
        increment+=basePrice*0.25;
    }
    return increment;
}
function getPricingBasedOnAmenities(diffDays,breakfast,fitnessRoom,swimmingPool,parking,allMeals){
    let increment=0;
    if(breakfast===true)
        increment+=diffDays*4;
    if(fitnessRoom===true)
        increment+=diffDays*3;
    if(swimmingPool===true)
        increment+=diffDays*3;
    if(parking===true)
        increment+=diffDays*2;
    if(allMeals===true)
        increment+=diffDays*8;
    return increment;
}
function getPricingBasedOnCustomerLoyalty(basePrice,custId){
    let decrement=0;
    /**
     * Get rewards points from table and do if else for some range and provide discount based on it
     */
    return decrement;
}
module.exports=router
