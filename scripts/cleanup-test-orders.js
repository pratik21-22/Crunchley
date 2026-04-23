const mongoose = require('mongoose');

const URI = 'mongodb+srv://pratikrajece2022_db_user:U2g9Rk0mnYKl2rr3@cluster12.eokjijd.mongodb.net/crunchley?retryWrites=true&w=majority&appName=Cluster12';

mongoose.connect(URI)
  .then(async () => {
    const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const regex = /test|example\.com|guest|track|cod-/i;
    
    const count = await Order.countDocuments({ userEmail: { $regex: regex } });
    console.log('Orders to delete (by userEmail):', count);
    
    const count2 = await Order.countDocuments({ 'customer.email': { $regex: regex } });
    console.log('Customer emails to delete:', count2);
    
    const result = await Order.deleteMany({
      $or: [
        { userEmail: { $regex: regex } },
        { 'customer.email': { $regex: regex } }
      ]
    });
    
    console.log('Deleted count:', result.deletedCount);
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
