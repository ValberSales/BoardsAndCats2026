package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.dto.CarouselItemDTO;
import br.edu.utfpr.pb.pw44s.server.model.CarouselItem;
import br.edu.utfpr.pb.pw44s.server.model.Product;
import br.edu.utfpr.pb.pw44s.server.repository.ProductRepository;
import br.edu.utfpr.pb.pw44s.server.service.ICarouselItemService;
import br.edu.utfpr.pb.pw44s.server.service.ICrudService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("carousel")
public class CarouselItemController extends CrudController<CarouselItem, CarouselItemDTO, Long> {

    private final ICarouselItemService carouselItemService;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    public CarouselItemController(ICarouselItemService carouselItemService,
                                  ProductRepository productRepository,
                                  ModelMapper modelMapper) {
        super(CarouselItem.class, CarouselItemDTO.class);
        this.carouselItemService = carouselItemService;
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    protected ICrudService<CarouselItem, Long> getService() {
        return carouselItemService;
    }

    @Override
    protected ModelMapper getModelMapper() {
        return modelMapper;
    }

    @Override
    @PostMapping
    public ResponseEntity<CarouselItemDTO> create(@RequestBody @Valid CarouselItemDTO dto) {
        CarouselItem item = new CarouselItem();
        item.setImageUrl(dto.getImageUrl());
        item.setAlt(dto.getAlt());
        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId()).orElse(null);
            item.setProduct(product);
        }
        CarouselItem saved = carouselItemService.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(saved));
    }

    @Override
    @PutMapping("{id}")
    public ResponseEntity<CarouselItemDTO> update(@PathVariable Long id, @RequestBody @Valid CarouselItemDTO dto) {
        CarouselItem item = carouselItemService.findById(id);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        item.setImageUrl(dto.getImageUrl());
        item.setAlt(dto.getAlt());
        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId()).orElse(null);
            item.setProduct(product);
        } else {
            item.setProduct(null);
        }
        CarouselItem saved = carouselItemService.save(item);
        return ResponseEntity.ok(convertToDto(saved));
    }

    private CarouselItemDTO convertToDto(CarouselItem entity) {
        CarouselItemDTO dto = new CarouselItemDTO();
        dto.setId(entity.getId());
        dto.setImageUrl(entity.getImageUrl());
        dto.setAlt(entity.getAlt());
        if (entity.getProduct() != null) {
            dto.setProductId(entity.getProduct().getId());
        }
        return dto;
    }
}
