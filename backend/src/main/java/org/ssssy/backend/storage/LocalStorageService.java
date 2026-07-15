package org.ssssy.backend.storage;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
@Slf4j
public class LocalStorageService implements StorageService {

  @Value("${app.storage.local.path:uploads}")
  private String storagePath;

  private Path basePath;

  @PostConstruct
  public void init() {
    basePath = Path.of(storagePath);
    try {
      Files.createDirectories(basePath);
    } catch (IOException e) {
      throw new RuntimeException("Could not create storage directory: " + storagePath, e);
    }
    log.info("LocalStorageService initialized at {}", basePath.toAbsolutePath());
  }

  @Override
  public String store(String filename, InputStream inputStream, long size, String contentType) {
    try {
      Path targetPath = basePath.resolve(filename);
      Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
      return "uploads/" + filename;
    } catch (IOException e) {
      throw new RuntimeException("Failed to store file locally: " + filename, e);
    }
  }

  @Override
  public void delete(String storagePath) {
    try {
      Path filePath = basePath.resolve(Path.of(storagePath).getFileName());
      Files.deleteIfExists(filePath);
    } catch (IOException e) {
      log.warn("Failed to delete file: {}", storagePath, e);
    }
  }

  @Override
  public InputStream retrieve(String storagePath) {
    try {
      Path filePath = basePath.resolve(Path.of(storagePath).getFileName());
      return Files.newInputStream(filePath);
    } catch (IOException e) {
      throw new RuntimeException("Failed to retrieve file: " + storagePath, e);
    }
  }

  @Override
  public boolean exists(String storagePath) {
    Path filePath = basePath.resolve(Path.of(storagePath).getFileName());
    return Files.exists(filePath);
  }

  @Override
  public String getUrl(String storagePath) {
    return "/api/media/files/" + Path.of(storagePath).getFileName() + "/download";
  }
}
