package br.edu.utfpr.pb.pw44s.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CarouselItemDTO {
    private Long id;
    private Long productId;
    private String imageUrl;
    private String alt;
}
