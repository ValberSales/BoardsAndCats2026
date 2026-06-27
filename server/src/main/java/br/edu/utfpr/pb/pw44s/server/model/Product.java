package br.edu.utfpr.pb.pw44s.server.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_product")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Positive
    @Column(nullable = false)
    private BigDecimal price;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private String mechanics;
    private String players; // Ex: "2-5"
    private String editor;

    @NotNull
    @Column(nullable = false)
    private Boolean promo;

    @NotNull
    @Column(nullable = false)
    private Boolean visible = true;

    @Column(name = "discount_type")
    private String discountType;

    @Column(name = "discount_value")
    private BigDecimal discountValue;

    @NotNull
    @Min(value = 0, message = "O estoque não pode ser negativo.")
    @Column(nullable = false)
    private Integer stock;

    @Column(name = "image_url")
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "tb_product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> otherImages = new ArrayList<>();

    @Column(name = "duracao")
    private String duracao; // Ex: "30-60 min"

    @Column(name = "idade_recomendada")
    private String idadeRecomendada; // Ex: "14+"

    public BigDecimal getEffectivePrice() {
        if (Boolean.TRUE.equals(promo) && discountValue != null && discountType != null) {
            if ("PERCENTAGE".equals(discountType)) {
                BigDecimal discount = price.multiply(discountValue).divide(new BigDecimal("100"));
                BigDecimal finalPrice = price.subtract(discount);
                return finalPrice.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : finalPrice.setScale(2, java.math.RoundingMode.HALF_UP);
            } else if ("VALUE".equals(discountType)) {
                BigDecimal finalPrice = price.subtract(discountValue);
                return finalPrice.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : finalPrice.setScale(2, java.math.RoundingMode.HALF_UP);
            }
        }
        return price;
    }
}