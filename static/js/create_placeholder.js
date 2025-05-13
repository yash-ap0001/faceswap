// Create a placeholder image for saloons
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 600;
    
    canvas.width = width;
    canvas.height = height;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#9c4dcc');   // Purple
    gradient.addColorStop(1, '#5b2b75');   // Darker purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add a decorative pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 50;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Bridal Salon', width/2, height/2 - 20);
    
    ctx.font = '24px Arial';
    ctx.fillText('Beauty Services & Makeup Artists', width/2, height/2 + 30);
    
    // Convert to image data URL
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Create an image element for download
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // Save the image
    const saveImage = () => {
        // In a real app, you would save this to the server
        // For now, we'll just log it
        console.log('Placeholder image created');
        
        // Create a download link
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'placeholder_saloon.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    // Create download button
    const btn = document.createElement('button');
    btn.textContent = 'Download Placeholder Image';
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '9999';
    btn.onclick = saveImage;
    
    // For this example, we won't actually add the button to avoid confusion
    // document.body.appendChild(btn);
});