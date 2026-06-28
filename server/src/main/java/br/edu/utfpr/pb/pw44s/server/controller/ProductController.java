package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.dto.ProductDTO;
import br.edu.utfpr.pb.pw44s.server.model.Product;
import br.edu.utfpr.pb.pw44s.server.service.ICrudService;
import br.edu.utfpr.pb.pw44s.server.service.IProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("products")
@Tag(name = "Produtos", description = "Endpoints para consulta e gerenciamento de produtos (jogos de tabuleiro, etc.)")
public class ProductController extends CrudController<Product, ProductDTO, Long> {

    private final IProductService productService;
    private final ModelMapper modelMapper;

    public ProductController(IProductService productService, ModelMapper modelMapper) {
        super(Product.class, ProductDTO.class);
        this.productService = productService;
        this.modelMapper = modelMapper;
    }

    @Override
    protected ICrudService<Product, Long> getService() {
        return productService;
    }

    @Override
    protected ModelMapper getModelMapper() {
        return modelMapper;
    }

    @GetMapping("category/{id}")
    @Operation(summary = "Listar produtos por categoria", description = "Retorna todos os produtos associados a uma categoria específica identificada pelo ID.")
    public ResponseEntity<List<ProductDTO>> findByCategoryId(
            @Parameter(description = "ID da categoria", example = "1") @PathVariable Long id) {
        List<Product> products = productService.findAllByCategoryId(id);
        return ResponseEntity.ok(products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .collect(Collectors.toList()));
    }

    @GetMapping("search")
    @Operation(summary = "Buscar produtos por termo de pesquisa", description = "Realiza uma busca textual nos nomes e descrições dos produtos cadastrados.")
    public ResponseEntity<List<ProductDTO>> search(
            @Parameter(description = "Termo de busca (nome ou descrição)", example = "Catan") @RequestParam("query") String query) {
        List<Product> products = productService.search(query);
        return ResponseEntity.ok(products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .collect(Collectors.toList()));
    }
}