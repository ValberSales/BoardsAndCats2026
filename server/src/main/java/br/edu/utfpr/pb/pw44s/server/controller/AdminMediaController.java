package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.service.MinioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/admin/media")
public class AdminMediaController {

    private final MinioService minioService;

    public AdminMediaController(MinioService minioService) {
        this.minioService = minioService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String filename = minioService.uploadFile(file);
        String fileUrl = "/media/" + filename;
        return ResponseEntity.ok(Map.of("url", fileUrl, "filename", filename));
    }
}
