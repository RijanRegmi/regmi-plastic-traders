const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/WELCOME/OneDrive/Documents/Developer/API/regmi-plastic-traders/backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Blog = mongoose.model('BlogPost', new mongoose.Schema({ title: String, coverImage: String }));
  const blog = await Blog.findOne({ title: 'test' });
  console.log('--- BLOG DATA ---');
  console.log(JSON.stringify(blog, null, 2));
  
  const Product = mongoose.model('Product', new mongoose.Schema({ name: String, images: [String] }));
  const products = await Product.find({ name: /test|Silpolin|Tripal/i });
  console.log('--- PRODUCT DATA ---');
  console.log(JSON.stringify(products, null, 2));
  
  process.exit();
}
check();
