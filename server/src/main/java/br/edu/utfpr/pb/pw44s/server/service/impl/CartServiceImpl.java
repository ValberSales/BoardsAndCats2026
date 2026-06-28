package br.edu.utfpr.pb.pw44s.server.service.impl;

import br.edu.utfpr.pb.pw44s.server.dto.CartItemResponseDTO;
import br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO;
import br.edu.utfpr.pb.pw44s.server.dto.CartSyncDTO;
import br.edu.utfpr.pb.pw44s.server.dto.ProductDTO;
import br.edu.utfpr.pb.pw44s.server.model.Cart;
import br.edu.utfpr.pb.pw44s.server.model.CartItem;
import br.edu.utfpr.pb.pw44s.server.model.Product;
import br.edu.utfpr.pb.pw44s.server.model.User;
import br.edu.utfpr.pb.pw44s.server.repository.CartRepository;
import br.edu.utfpr.pb.pw44s.server.repository.ProductRepository;
import br.edu.utfpr.pb.pw44s.server.service.ICartService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements ICartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    public CartServiceImpl(CartRepository cartRepository,
                           ProductRepository productRepository,
                           ModelMapper modelMapper) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    @Transactional
    public CartResponseDTO getAndValidateCart(User user) {
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null) {
            return null;
        }

        List<CartItemResponseDTO> responseItems = new ArrayList<>();
        List<CartItem> itemsToRemove = new ArrayList<>();
        boolean needsSave = false;

        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);

            // Se produto não existe ou estoque zerado, marca para remover
            if (product == null || product.getStock() == 0) {
                itemsToRemove.add(item);
                needsSave = true;
                continue;
            }

            // Valida e prepara o item para resposta
            CartItemResponseDTO itemDTO = validarEConverterItem(item, product);

            // Se houve mensagem de validação (preço mudou ou estoque baixou), precisa salvar
            if (itemDTO.getValidationMessage() != null) {
                needsSave = true;
            }

            responseItems.add(itemDTO);
        }

        // Aplica as remoções
        if (!itemsToRemove.isEmpty()) {
            cart.getItems().removeAll(itemsToRemove);
            needsSave = true;
        }

        // Salva ou deleta se ficou vazio
        if (needsSave) {
            if (cart.getItems().isEmpty()) {
                cartRepository.delete(cart);
                return null;
            }
            cartRepository.save(cart);
        }

        return montarRespostaCarrinho(cart, responseItems);
    }

    @Override
    @Transactional
    public CartResponseDTO saveCart(User user, CartSyncDTO cartSyncDTO) {
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(new Cart());
        cart.setUser(user);
        cart.getItems().clear(); // Limpa itens antigos para sobrescrever

        List<CartItemResponseDTO> responseItems = new ArrayList<>();

        for (var itemDTO : cartSyncDTO.getItems()) {
            // Busca produto
            Product product = productRepository.findById(itemDTO.getProductId()).orElse(null);

            if (product == null || product.getStock() == 0) {
                continue; // Ignora produtos inválidos
            }

            // Cria novo item
            CartItem newItem = criarNovoItem(cart, product, itemDTO.getQuantity());
            cart.getItems().add(newItem);

            // Prepara resposta
            CartItemResponseDTO responseItem = new CartItemResponseDTO();
            responseItem.setProduct(modelMapper.map(product, ProductDTO.class));
            responseItem.setQuantity(newItem.getQuantity());
            responseItem.setPriceAtSave(newItem.getPriceAtSave());

            responseItems.add(responseItem);
        }

        if (cart.getItems().isEmpty()) {
            if (cart.getId() != null) cartRepository.delete(cart);
            return null;
        }

        cartRepository.save(cart);
        return montarRespostaCarrinho(cart, responseItems);
    }

    // ===================================================================================
    // MÉTODOS AUXILIARES
    // ===================================================================================

    private CartItemResponseDTO validarEConverterItem(CartItem item, Product product) {
        CartItemResponseDTO dto = new CartItemResponseDTO();
        dto.setProduct(modelMapper.map(product, ProductDTO.class));
        dto.setPriceAtSave(item.getPriceAtSave());
        dto.setQuantity(item.getQuantity());

        // Valida Visibilidade
        if (Boolean.FALSE.equals(product.getVisible())) {
            item.setQuantity(0);
            dto.setQuantity(0);
            dto.setValidationMessage("Produto indisponível.");
            return dto;
        }

        // Valida Preço
        BigDecimal effectivePrice = product.getEffectivePrice();
        if (effectivePrice.compareTo(item.getPriceAtSave()) != 0) {
            item.setPriceAtSave(effectivePrice);
            dto.setPriceAtSave(effectivePrice);
            dto.setValidationMessage("Preço atualizado.");
        }

        // Valida Estoque
        if (product.getStock() < item.getQuantity()) {
            item.setQuantity(product.getStock());
            dto.setQuantity(product.getStock());
            dto.setValidationMessage("Quantidade ajustada ao estoque.");
        }

        return dto;
    }

    private CartItem criarNovoItem(Cart cart, Product product, int quantidadeSolicitada) {
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProductId(product.getId());

        // Garante que não pede mais que o estoque
        int quantidadeFinal = Math.min(quantidadeSolicitada, product.getStock());

        item.setQuantity(quantidadeFinal);
        item.setPriceAtSave(product.getEffectivePrice());
        return item;
    }

    private CartResponseDTO montarRespostaCarrinho(Cart cart, List<CartItemResponseDTO> items) {
        BigDecimal total = BigDecimal.ZERO;

        for (CartItemResponseDTO item : items) {
            BigDecimal subtotal = item.getPriceAtSave().multiply(new BigDecimal(item.getQuantity()));
            total = total.add(subtotal);
        }

        CartResponseDTO responseDTO = new CartResponseDTO();
        responseDTO.setId(cart.getId());
        responseDTO.setItems(items);
        responseDTO.setTotal(total);
        return responseDTO;
    }

    @Override
    @Transactional
    public CartResponseDTO addItemToCart(User user, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Produto não encontrado."));

        if (product.getStock() == 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Produto fora de estoque.");
        }

        if (Boolean.FALSE.equals(product.getVisible())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Produto indisponível.");
        }

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + quantity;
            existingItem.setQuantity(Math.min(newQuantity, product.getStock()));
            existingItem.setPriceAtSave(product.getEffectivePrice());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductId(productId);
            newItem.setQuantity(Math.min(quantity, product.getStock()));
            newItem.setPriceAtSave(product.getEffectivePrice());
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return getAndValidateCart(user);
    }

    @Override
    @Transactional
    public CartResponseDTO updateItemQuantity(User user, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Carrinho não encontrado."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Produto não encontrado."));

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Item não encontrado no carrinho."));

        if (quantity <= 0) {
            cart.getItems().remove(existingItem);
        } else {
            existingItem.setQuantity(Math.min(quantity, product.getStock()));
            existingItem.setPriceAtSave(product.getEffectivePrice());
        }

        if (cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
            return null;
        }

        cartRepository.save(cart);
        return getAndValidateCart(user);
    }

    @Override
    @Transactional
    public CartResponseDTO removeItem(User user, Long productId) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Carrinho não encontrado."));

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Item não encontrado no carrinho."));

        cart.getItems().remove(existingItem);

        if (cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
            return null;
        }

        cartRepository.save(cart);
        return getAndValidateCart(user);
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        cartRepository.findByUserId(user.getId()).ifPresent(cartRepository::delete);
    }
}