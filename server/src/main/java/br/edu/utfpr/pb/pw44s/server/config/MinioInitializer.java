package br.edu.utfpr.pb.pw44s.server.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class MinioInitializer implements CommandLineRunner {

    private final MinioClient minioClient;
    private final String bucketName;

    public MinioInitializer(MinioClient minioClient,
                            @Value("${minio.bucket-name}") String bucketName) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure bucket exists
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }

        // Upload static resources to Minio
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:/static/images/**/*");
        for (Resource resource : resources) {
            if (resource.isReadable()) {
                String filename = resource.getFilename();
                if (filename != null && !filename.isEmpty()) {
                    String contentType = getContentType(filename);
                    if (contentType != null) {
                        try {
                            // Check if already exists in Minio
                            minioClient.statObject(StatObjectArgs.builder()
                                    .bucket(bucketName)
                                    .object(filename)
                                    .build());
                        } catch (Exception e) {
                            // Object does not exist, upload it
                            try (InputStream is = resource.getInputStream()) {
                                minioClient.putObject(PutObjectArgs.builder()
                                        .bucket(bucketName)
                                        .object(filename)
                                        .stream(is, resource.contentLength(), -1)
                                        .contentType(contentType)
                                        .build());
                                System.out.println("Uploaded to Minio: " + filename);
                            }
                        }
                    }
                }
            }
        }
    }

    private String getContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lower.endsWith(".png")) {
            return "image/png";
        } else if (lower.endsWith(".webp")) {
            return "image/webp";
        } else if (lower.endsWith(".svg")) {
            return "image/svg+xml";
        } else if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        return null;
    }
}
