package org.ssssy.backend.storage;

import java.io.InputStream;

public interface StorageService {

  String store(String filename, InputStream inputStream, long size, String contentType);

  void delete(String storagePath);

  InputStream retrieve(String storagePath);

  boolean exists(String storagePath);

  String getUrl(String storagePath);
}
