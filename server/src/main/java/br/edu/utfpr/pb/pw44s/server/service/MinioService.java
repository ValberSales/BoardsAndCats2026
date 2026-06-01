package br.edu.utfpr.pb.pw44s.server.service;

import io.minio.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.UUID;

@Service
public class MinioService {

    private final MinioClient minioClient;
    private final String bucketName;

    public MinioService(MinioClient minioClient,
                        @Value("${minio.bucket-name}") String bucketName) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
    }

    /**
     * Uploads a file to Minio and returns the unique name/key of the object.
     */
    public String uploadFile(MultipartFile file) {
        try {
            // Ensure bucket exists
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            String originalName = file.getOriginalFilename();
            String uniqueName = UUID.randomUUID() + "_" + (originalName != null ? originalName : "file");

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(uniqueName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return uniqueName;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer upload do arquivo para o Minio", e);
        }
    }

    /**
     * Downloads a file from Minio as an InputStream.
     */
    public InputStream downloadFile(String objectName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Erro ao baixar arquivo do Minio: " + objectName, e);
        }
    }
}
