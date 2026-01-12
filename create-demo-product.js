const API = 'https://jari-ecom-v2-production.up.railway.app';

async function test() {
  // Register a new user
  const uniqueId = Date.now().toString(36);
  const email = `demo${uniqueId}@test.com`;
  
  console.log('Registering:', email);
  
  const register = await fetch(API + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: 'demo123',
      name: 'Demo Fashion Store',
      slug: 'demofashion' + uniqueId
    })
  });
  
  const regData = await register.json();
  console.log('Registration:', regData.success ? 'SUCCESS' : 'FAILED');
  
  if (!regData.token) {
    console.log('Error:', regData.error || 'No token');
    return;
  }
  
  const token = regData.token;
  const slug = 'demofashion' + uniqueId;
  
  console.log('Token received, creating product...');
  console.log('Store slug:', slug);
  
  // Create rich product
  const product = await fetch(API + '/api/products', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token 
    },
    body: JSON.stringify({
      name: 'Premium Ankara Dress',
      template: 'quick-decision',
      data: {
        description: 'Beautiful handcrafted Ankara dress with vibrant African prints. Perfect for special occasions, parties, or making a statement. Made with 100% authentic African wax print fabric.',
        price: 4500,
        stock: 50,
        testimonials: [
          { author: 'Jane M.', text: 'Absolutely stunning! Got so many compliments at the wedding.', rating: 5 },
          { author: 'Sarah K.', text: 'Perfect fit and the quality is amazing. Will order more!', rating: 5 },
          { author: 'Grace O.', text: 'Fast delivery and exactly as pictured. Love it!', rating: 4 }
        ],
        policies: {
          delivery: 'Free delivery within Nairobi CBD. Delivery to other areas within Nairobi at KES 200. Upcountry delivery at KES 400. Orders processed within 24 hours.',
          returns: 'We accept returns within 7 days of delivery if the item is unused and in original packaging. Contact us on WhatsApp to initiate a return.',
          payment: 'We accept M-Pesa and Cash on Delivery. For M-Pesa, you will receive an STK push to complete payment. For COD, please have exact change ready.'
        }
      },
      media: {
        images: [
          'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
          'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800',
          'https://images.unsplash.com/photo-1544991875-7ab20a9e5e5c?w=800'
        ],
        stories: [
          { url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600', thumbnail: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=200' },
          { url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600', thumbnail: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=200' }
        ]
      }
    })
  });
  
  const result = await product.json();
  console.log('Product created:', result.success ? 'YES' : 'NO');
  
  if (result.success && result.product) {
    console.log('\\n=== SUCCESS ===');
    console.log('Product ID:', result.product.id);
    console.log('\\nVisit your store at:');
    console.log('https://jariecommstore.netlify.app/s/' + slug);
  } else {
    console.log('Error:', result.error);
  }
}

test().catch(console.error);
