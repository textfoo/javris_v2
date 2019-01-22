db.getCollection("brokers").aggregate([
    { $match : { 'user.userId' : '209899169253556224' }}, 
    { $project : { 'books' : 1 }},
    { $unwind : '$books' },
    { $match :  {'books._id' : ObjectId("5c340ceb08147c46203acccc")}}
    ])
   