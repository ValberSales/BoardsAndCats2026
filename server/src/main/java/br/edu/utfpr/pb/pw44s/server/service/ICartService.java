package br.edu.utfpr.pb.pw44s.server.service;

import br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO;
import br.edu.utfpr.pb.pw44s.server.dto.CartSyncDTO;
import br.edu.utfpr.pb.pw44s.server.model.User;

public interface ICartService {

    /**
     * Busca o carrinho salvo, valida estoque/preço e atualiza se necessário.
     */
    CartResponseDTO getAndValidateCart(User user);

    /**
     * Sobrescreve o carrinho do usuário com os itens fornecidos.
     */
    CartResponseDTO saveCart(User user, CartSyncDTO cartSyncDTO);

    /**
     * Adiciona um item ao carrinho (incrementando a quantidade se ja existir).
     */
    CartResponseDTO addItemToCart(User user, Long productId, int quantity);

    /**
     * Atualiza a quantidade de um item no carrinho (substituindo o valor).
     */
    CartResponseDTO updateItemQuantity(User user, Long productId, int quantity);

    /**
     * Remove um item do carrinho.
     */
    CartResponseDTO removeItem(User user, Long productId);

    /**
     * Limpa todo o carrinho do usuario.
     */
    void clearCart(User user);
}