"use client";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    img: "https://img.j189eb.com/upload/h5Announcement/image_221766.jpg",
    alt: "Slide 1",
  },
  {
    img: "https://img.j189eb.com/upload/h5Announcement/image_179059.jpg",
    alt: "Slide 2",
  },
  {
    img: "https://img.j189eb.com/upload/h5Announcement/image_147472.jpg",
    alt: "Slide 3",
  },
  {
    img: "https://img.j189eb.com/upload/h5Announcement/image_231271.jpg",
    alt: "Slide 1",
  },
];

export default function CustomSlider() {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slideCount = slides.length;
  const [current, setCurrent] = useState(0);
  const indexRef = useRef(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > 50) {
      if (distance > 0 && indexRef.current < slideCount) {
        // Swipe left → Next
        indexRef.current++;
      } else if (distance < 0 && indexRef.current > 0) {
        // Swipe right → Previous
        indexRef.current--;
      }

      scrollToSlide(indexRef.current);
      setCurrent(indexRef.current % slideCount);

      // Reset autoplay
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(() => {
          indexRef.current += 1;
          if (indexRef.current > slideCount) {
            indexRef.current = 1;
            scrollToSlide(0, false);
            setTimeout(() => scrollToSlide(indexRef.current), 30);
            setCurrent(0);
          } else {
            scrollToSlide(indexRef.current);
            setCurrent(indexRef.current % slideCount);
          }
        }, 3000);
      }
    }
  };

  const scrollToSlide = (index: number, smooth = true) => {
    if (!sliderRef.current) return;
    const scrollX = sliderRef.current.offsetWidth * 0.85 * index;
    sliderRef.current.scrollTo({
      left: scrollX,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Auto sliding
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    autoplayRef.current = setInterval(() => {
      indexRef.current += 1;

      if (indexRef.current > slideCount) {
        // Jump to start, then scroll to next
        indexRef.current = 1;
        scrollToSlide(0, false);
        setTimeout(() => scrollToSlide(indexRef.current), 30);
        setCurrent(0);
      } else {
        scrollToSlide(indexRef.current);
        setCurrent(indexRef.current % slideCount);
      }
    }, 3000);

    return () => clearInterval(autoplayRef.current!);
  }, [slideCount]);

  const handleDotClick = (index: number) => {
    indexRef.current = index;
    scrollToSlide(index);
    setCurrent(index);
    // Reset autoplay interval on manual click
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        indexRef.current += 1;
        if (indexRef.current > slideCount) {
          indexRef.current = 1;
          scrollToSlide(0, false);
          setTimeout(() => scrollToSlide(indexRef.current), 30);
          setCurrent(0);
        } else {
          scrollToSlide(indexRef.current);
          setCurrent(indexRef.current % slideCount);
        }
      }, 3000);
    }
  };

  return (
    <div className="w-full overflow-hidden py-4">
      <div
        ref={sliderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
      >
        {[...slides, slides[0]].map((slide, idx) => (
          <div
            key={idx}
            className="snap-center shrink-0 w-[75vw] max-w-md rounded-sm overflow-hidden shadow-md"
          >
            <img
              src={slide.img}
              alt={slide.alt}
              className="w-full h-[150px] object-scale-down"
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-6 h-1 rounded-full transition-all ${
              current === idx ? "bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
