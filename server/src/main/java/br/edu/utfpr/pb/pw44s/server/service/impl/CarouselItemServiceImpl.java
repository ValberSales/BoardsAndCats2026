package br.edu.utfpr.pb.pw44s.server.service.impl;

import br.edu.utfpr.pb.pw44s.server.model.CarouselItem;
import br.edu.utfpr.pb.pw44s.server.repository.CarouselItemRepository;
import br.edu.utfpr.pb.pw44s.server.service.ICarouselItemService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class CarouselItemServiceImpl extends CrudServiceImpl<CarouselItem, Long> implements ICarouselItemService {

    private final CarouselItemRepository carouselItemRepository;

    public CarouselItemServiceImpl(CarouselItemRepository carouselItemRepository) {
        this.carouselItemRepository = carouselItemRepository;
    }

    @Override
    protected JpaRepository<CarouselItem, Long> getRepository() {
        return carouselItemRepository;
    }
}
