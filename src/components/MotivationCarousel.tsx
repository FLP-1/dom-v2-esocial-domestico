// src/components/MotivationCarousel.tsx
import styled from 'styled-components';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type MotivationCarouselProps = {
  phrases: string[];
};

const CarouselContainer = styled.div`
  margin-bottom: 1.5rem;
  height: 100%;
`;

const StyledSwiper = styled(Swiper)`
  height: 100%;
`;

const MotivationText = styled.p`
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  margin: 0;
  line-height: 1.4;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function MotivationCarousel({
  phrases,
}: MotivationCarouselProps) {
  return (
    <CarouselContainer>
      <StyledSwiper
        modules={[Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
      >
        {phrases.map((txt, idx) => (
          <SwiperSlide key={idx}>
            <MotivationText>{txt}</MotivationText>
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </CarouselContainer>
  );
}
