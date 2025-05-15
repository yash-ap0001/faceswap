import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const CeremonyCard = ({ name, images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <Card className="h-100 shadow" style={{ backgroundColor: '#212121', overflow: 'hidden' }}>
      <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
        {images.map((src, index) => (
          <div 
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
          >
            <img 
              src={src} 
              alt={`${name} Image ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>
        ))}
      </div>
      <div style={{
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '15px',
        textAlign: 'center',
        position: 'relative',
        marginTop: '-50px'
      }}>
        <h4 style={{ color: 'white', margin: 0, fontWeight: 400, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {name}
        </h4>
      </div>
    </Card>
  );
};

const HomePage = () => {
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

  return (
    <div className="home-page" style={{ backgroundColor: '#121212', padding: '20px 10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1rem' }}>
        <h1 style={{ margin: 0, padding: 0, letterSpacing: '2px' }}>
          <span style={{ color: '#8a2be2', fontWeight: 800, fontSize: '2.2rem' }}>VOW</span>
          <span style={{ marginLeft: '10px', color: 'white', fontWeight: 700, fontStyle: 'italic', fontSize: '2rem' }}>BRIDE</span>
        </h1>
      </div>

      <Container className="px-2">
        <Row className="g-0">
          {ceremonies.map((ceremony, index) => (
            <Col md={3} key={index}>
              <CeremonyCard name={ceremony.name} images={ceremony.images} />
            </Col>
          ))}
        </Row>

        <div style={{ 
          backgroundColor: '#212121', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          marginTop: '20px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            color: '#9d4edd', 
            marginBottom: '1.5rem', 
            fontWeight: 300 
          }}>
            How It Works
          </h3>

          <Row className="text-center">
            {[
              { icon: 'fa-upload', text: 'Upload' },
              { icon: 'fa-list', text: 'Select' },
              { icon: 'fa-images', text: 'Templates' },
              { icon: 'fa-magic', text: 'Generate' }
            ].map((step, index) => (
              <Col xs={3} key={index}>
                <i className={`fas ${step.icon} fa-2x`} style={{ color: '#9d4edd' }}></i>
                <p style={{ color: 'white', marginTop: '10px', fontSize: '0.9rem' }}>{step.text}</p>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;