package br.edu.utfpr.pb.pw44s.server.repository;

import br.edu.utfpr.pb.pw44s.server.model.OrderDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderDocumentRepository extends JpaRepository<OrderDocument, Long> {
    List<OrderDocument> findByOrderId(Long orderId);
}
