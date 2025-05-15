// Simple bundle override to prevent caching
console.log("React app initialized");

// Directly add ceremony images to the page
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM Content loaded - initializing homepage");
  const homeContent = document.getElementById('react-root');
  if (!homeContent) {
    console.error("Could not find react-root element");
    return;
  }
  
  // Define the ceremony data
  const ceremonies = [
    { 
      name: 'Haldi Ceremony', 
      images: [
        '/uploads/templates/pinterest/haldi/haldi_2.jpg',
        '/uploads/templates/pinterest/haldi/haldi_3.jpg',
        '/uploads/templates/pinterest/haldi/haldi_4.jpg',
        '/uploads/templates/pinterest/haldi/haldi_5.jpg'
      ]
    },
    { 
      name: 'Mehendi Ceremony', 
      images: [
        '/uploads/templates/pinterest/mehendi/mehendi_1.jpg',
        '/uploads/templates/pinterest/mehendi/mehendi_2.jpg',
        '/uploads/templates/pinterest/mehendi/mehendi_3.jpg',
        '/uploads/templates/pinterest/mehendi/mehendi_4.jpg'
      ]
    },
    { 
      name: 'Wedding Ceremony', 
      images: [
        '/uploads/templates/pinterest/wedding/wedding_1.jpg',
        '/uploads/templates/pinterest/wedding/wedding_3.jpg',
        '/uploads/templates/pinterest/wedding/wedding_4.jpg',
        '/uploads/templates/pinterest/wedding/wedding_5.jpg'
      ]
    },
    { 
      name: 'Reception Ceremony', 
      images: [
        '/uploads/templates/pinterest/reception/reception_1.jpg',
        '/uploads/templates/pinterest/reception/reception_2.jpg',
        '/uploads/templates/pinterest/reception/reception_3.jpg',
        '/uploads/templates/pinterest/reception/reception_4.jpg'
      ]
    }
  ];

  // Create container 
  const container = document.createElement('div');
  container.className = 'home-page';
  container.style.backgroundColor = '#121212';
  container.style.padding = '20px 10px';

  // Create brand logo
  const brandContainer = document.createElement('div');
  brandContainer.style.textAlign = 'center';
  brandContainer.style.marginBottom = '2rem';
  brandContainer.style.padding = '1rem';

  const brandLogo = document.createElement('h1');
  brandLogo.style.margin = '0';
  brandLogo.style.padding = '0';
  brandLogo.style.letterSpacing = '2px';

  const vowText = document.createElement('span');
  vowText.textContent = 'VOW';
  vowText.style.color = '#8a2be2';
  vowText.style.fontWeight = '800';
  vowText.style.fontSize = '2.2rem';

  const brideText = document.createElement('span');
  brideText.textContent = 'BRIDE';
  brideText.style.marginLeft = '10px';
  brideText.style.color = 'white';
  brideText.style.fontWeight = '700';
  brideText.style.fontStyle = 'italic';
  brideText.style.fontSize = '2rem';

  brandLogo.appendChild(vowText);
  brandLogo.appendChild(brideText);
  brandContainer.appendChild(brandLogo);
  container.appendChild(brandContainer);

  // Create row container
  const rowContainer = document.createElement('div');
  rowContainer.className = 'container px-2';

  const row = document.createElement('div');
  row.className = 'row g-0';

  // Add ceremony cards
  ceremonies.forEach(ceremony => {
    const col = document.createElement('div');
    col.className = 'col-md-3';
    
    const card = document.createElement('div');
    card.style.backgroundColor = '#212121';
    card.style.overflow = 'hidden';
    card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    card.style.height = '100%';
    
    const imageContainer = document.createElement('div');
    imageContainer.style.height = '280px';
    imageContainer.style.overflow = 'hidden';
    imageContainer.style.position = 'relative';
    
    // Add all images (only first one visible initially)
    ceremony.images.forEach((src, index) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.style.position = 'absolute';
      imgWrapper.style.top = '0';
      imgWrapper.style.left = '0';
      imgWrapper.style.width = '100%';
      imgWrapper.style.height = '100%';
      imgWrapper.style.opacity = index === 0 ? '1' : '0';
      imgWrapper.style.transition = 'opacity 1s ease-in-out';
      imgWrapper.style.zIndex = index === 0 ? '1' : '0';
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${ceremony.name} Image ${index + 1}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
      
      imgWrapper.appendChild(img);
      imageContainer.appendChild(imgWrapper);
    });
    
    // Add title bar
    const titleBar = document.createElement('div');
    titleBar.style.background = 'linear-gradient(transparent, rgba(0,0,0,0.7))';
    titleBar.style.padding = '15px';
    titleBar.style.textAlign = 'center';
    titleBar.style.position = 'relative';
    titleBar.style.marginTop = '-50px';
    
    const title = document.createElement('h4');
    title.textContent = ceremony.name;
    title.style.color = 'white';
    title.style.margin = '0';
    title.style.fontWeight = '400';
    title.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
    
    titleBar.appendChild(title);
    
    card.appendChild(imageContainer);
    card.appendChild(titleBar);
    col.appendChild(card);
    row.appendChild(col);
    
    // Set up image rotation
    let currentIndex = 0;
    setInterval(() => {
      const images = imageContainer.children;
      images[currentIndex].style.opacity = '0';
      images[currentIndex].style.zIndex = '0';
      
      currentIndex = (currentIndex + 1) % ceremony.images.length;
      
      images[currentIndex].style.opacity = '1';
      images[currentIndex].style.zIndex = '1';
    }, 3000);
  });
  
  rowContainer.appendChild(row);
  
  // Add How It Works section
  const howItWorks = document.createElement('div');
  howItWorks.style.backgroundColor = '#212121';
  howItWorks.style.borderRadius = '8px';
  howItWorks.style.padding = '1.5rem';
  howItWorks.style.marginTop = '20px';
  howItWorks.style.marginBottom = '20px';
  
  const sectionTitle = document.createElement('h3');
  sectionTitle.textContent = 'How It Works';
  sectionTitle.style.textAlign = 'center';
  sectionTitle.style.color = '#9d4edd';
  sectionTitle.style.marginBottom = '1.5rem';
  sectionTitle.style.fontWeight = '300';
  
  howItWorks.appendChild(sectionTitle);
  
  const stepsRow = document.createElement('div');
  stepsRow.className = 'row text-center';
  
  const steps = [
    { icon: 'fas fa-upload', text: 'Upload' },
    { icon: 'fas fa-list', text: 'Select' },
    { icon: 'fas fa-images', text: 'Templates' },
    { icon: 'fas fa-magic', text: 'Generate' }
  ];
  
  steps.forEach(step => {
    const stepCol = document.createElement('div');
    stepCol.className = 'col-3';
    
    const icon = document.createElement('i');
    icon.className = `${step.icon} fa-2x`;
    icon.style.color = '#9d4edd';
    
    const text = document.createElement('p');
    text.textContent = step.text;
    text.style.color = 'white';
    text.style.marginTop = '10px';
    text.style.fontSize = '0.9rem';
    
    stepCol.appendChild(icon);
    stepCol.appendChild(text);
    stepsRow.appendChild(stepCol);
  });
  
  howItWorks.appendChild(stepsRow);
  rowContainer.appendChild(howItWorks);
  
  container.appendChild(rowContainer);
  homeContent.innerHTML = '';
  homeContent.appendChild(container);
});