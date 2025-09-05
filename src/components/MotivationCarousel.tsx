// src/components/MotivationCarousel.tsx
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type MotivationCarouselProps = {
  phrases: string[];
};

export default function MotivationCarousel({
  phrases,
}: MotivationCarouselProps) {
  return (
    <div style={{ marginBottom: '1.5rem', height: '100%' }}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        style={{ height: '100%' }}
      >
        {phrases.map((txt, idx) => (
          <SwiperSlide key={idx}>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#555',
                textAlign: 'center',
                margin: '0',
                lineHeight: '1.4',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {txt}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
