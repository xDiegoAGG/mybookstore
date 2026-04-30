import { Container } from "react-bootstrap";
import Carousel from "react-bootstrap/Carousel";

const slides = [
  { src: "/images/img-book-of-year.jpeg", alt: "Libro del año" },
  { src: "/images/img-new-releases.jpeg", alt: "Nuevos lanzamientos" },
];

const HomeCarousel = () => {
  return (
    <Container className="pt-4">
      <Carousel fade interval={5000} className="home-carousel rounded-4 overflow-hidden shadow-sm">
        {slides.map((s) => (
          <Carousel.Item key={s.src}>
            <img className="home-carousel__img" src={s.src} alt={s.alt} />
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
};

export default HomeCarousel;
