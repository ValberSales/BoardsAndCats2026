package br.edu.utfpr.pb.pw44s.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class OrderDocumentDTO {
    private Long id;
    private String fileName;
    private String contentType;
    private LocalDateTime uploadedAt;
}
