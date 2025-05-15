// Simple bundle override to prevent caching
console.log("React app initialized");

// Fake React components for homepage
const React = {
  useState: (initial) => [initial, () => {}],
  useEffect: (fn, deps) => fn(),
  createElement: (type, props, ...children) => ({ type, props, children })
};

// Render the homepage with ceremony images
document.addEventListener('DOMContentLoaded', () => {
  // Define the images to use directly from uploads/templates/pinterest
  const ceremonyImages = {
    haldi: [
      'uploads/templates/pinterest/haldi/haldi_2.jpg',
      'uploads/templates/pinterest/haldi/haldi_3.jpg',
      'uploads/templates/pinterest/haldi/haldi_4.jpg',
      'uploads/templates/pinterest/haldi/haldi_5.jpg'
    ],
    mehendi: [
      'uploads/templates/pinterest/mehendi/mehendi_1.jpg',
      'uploads/templates/pinterest/mehendi/mehendi_2.jpg',
      'uploads/templates/pinterest/mehendi/mehendi_3.jpg',
      'uploads/templates/pinterest/mehendi/mehendi_4.jpg'
    ],
    wedding: [
      'uploads/templates/pinterest/wedding/wedding_1.jpg',
      'uploads/templates/pinterest/wedding/wedding_3.jpg',
      'uploads/templates/pinterest/wedding/wedding_4.jpg',
      'uploads/templates/pinterest/wedding/wedding_5.jpg'
    ],
    reception: [
      'uploads/templates/pinterest/reception/reception_1.jpg',
      'uploads/templates/pinterest/reception/reception_2.jpg',
      'uploads/templates/pinterest/reception/reception_3.jpg',
      'uploads/templates/pinterest/reception/reception_4.jpg'
    ]
  };

  // Set up images for the homepage
  const homeContent = document.getElementById('react-root');
  if (homeContent) {
    homeContent.innerHTML = '<div class="home-page">Loading images from uploads/templates/pinterest...</div>';
  }
});