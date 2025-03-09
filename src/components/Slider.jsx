import React, { useState, useEffect } from "react";

const Slider = ({ images, itemsPerSlide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to group images into slides
  const createSlides = (images, itemsPerSlide) => {
    let slides = [];
    for (let i = 0; i < images.length; i += itemsPerSlide) {
      slides.push(images.slice(i, i + itemsPerSlide));
    }
    return slides;
  };

  const slides = createSlides(images, itemsPerSlide);

  // Move to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < slides.length - 1 ? prevIndex + 1 : 0
    );
  };

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className='slider-container'>
      <div
        className='slider-track'
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className='slider-item'>
            {slide.map((image, i) => (
              <img key={i} src={image} alt='Slide' className='slider-image' />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
