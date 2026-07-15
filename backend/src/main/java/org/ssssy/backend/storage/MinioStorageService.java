package org.ssssy.backend.storage;

import io.minio.*;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "minio")
@RequiredArgsConstructor
@Slf4j
public class MinioStorageService implements StorageService {

  @Value("${app.storage.minio.endpoint}")
  private String endpoint;

  @Value("${app.storage.minio.access-key}")
  private String accessKey;

  @Value("${app.storage.minio.secret-key}")
  private String secretKey;

  @Value("${app.storage.minio.bucket}")
  private String bucket;

  private MinioClient minioClient;

  @PostConstruct
  public void init() {
    minioClient = MinioClient.builder()
        .endpoint(endpoint)
        .credentials(accessKey, secretKey)
        .build();

    try {
      boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
      if (!found) {
        minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        log.info("Created MinIO bucket: {}", bucket);
      }
    } catch (Exception e) {
      log.warn("Could not verify/create MinIO bucket: {}", bucket, e);
    }

    log.info("MinioStorageService initialized at {}", endpoint);
  }

  @Override
  public String store(String filename, InputStream inputStream, long size, String contentType) {
    try {
      minioClient.putObject(PutObjectArgs.builder()
          .bucket(bucket)
          .object(filename)
          .stream(inputStream, size, -1)
          .contentType(contentType)
          .build());
      return bucket + "/" + filename;
    } catch (MinioException e) {
      throw new RuntimeException("MinIO storage error: " + e.getMessage(), e);
    } catch (Exception e) {
      throw new RuntimeException("Failed to store file in MinIO: " + filename, e);
    }
  }

  @Override
  public void delete(String storagePath) {
    try {
      String objectName = storagePath.substring(storagePath.indexOf('/') + 1);
      minioClient.removeObject(RemoveObjectArgs.builder()
          .bucket(bucket)
          .object(objectName)
          .build());
    } catch (Exception e) {
      log.warn("Failed to delete file from MinIO: {}", storagePath, e);
    }
  }

  @Override
  public InputStream retrieve(String storagePath) {
    try {
      String objectName = storagePath.substring(storagePath.indexOf('/') + 1);
      return minioClient.getObject(GetObjectArgs.builder()
          .bucket(bucket)
          .object(objectName)
          .build());
    } catch (Exception e) {
      throw new RuntimeException("Failed to retrieve file from MinIO: " + storagePath, e);
    }
  }

  @Override
  public boolean exists(String storagePath) {
    try {
      String objectName = storagePath.substring(storagePath.indexOf('/') + 1);
      minioClient.statObject(StatObjectArgs.builder()
          .bucket(bucket)
          .object(objectName)
          .build());
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  @Override
  public String getUrl(String storagePath) {
    String objectName = storagePath.substring(storagePath.indexOf('/') + 1);
    return endpoint + "/" + bucket + "/" + objectName;
  }
}
