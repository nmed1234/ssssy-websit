package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.GalleryAiRequest;
import org.ssssy.backend.model.dto.GalleryAiResponse;
import org.ssssy.backend.model.entity.GalleryAlbum;
import org.ssssy.backend.model.entity.GalleryImage;
import org.ssssy.backend.model.entity.MediaFile;
import org.ssssy.backend.repository.GalleryAlbumRepository;
import org.ssssy.backend.repository.GalleryImageRepository;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GalleryAiService {

  private final GalleryAlbumRepository galleryAlbumRepository;
  private final GalleryImageRepository galleryImageRepository;
  private final SystemConfigService systemConfigService;

  private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

  public GalleryAiResponse generateAltText(GalleryAiRequest request) {
    GalleryImage image = galleryImageRepository.findById(request.getImageId())
        .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + request.getImageId()));

    String apiKey = getAiApiKey();
    if (apiKey == null || apiKey.isEmpty()) {
      return GalleryAiResponse.builder()
          .altText(generateFallbackAltText(image))
          .message("AI API key not configured. Using filename-based alt text.")
          .build();
    }

    try {
      String altText = callVisionApi(apiKey, image.getMediaFile().getUrl(),
          "Describe this image concisely for accessibility alt text. Max 120 characters. " +
          (request.getPrompt() != null ? "Context: " + request.getPrompt() : ""));
      if (altText != null) {
        image.setAltText(altText);
        galleryImageRepository.save(image);
      }
      return GalleryAiResponse.builder()
          .altText(altText != null ? altText : "Image")
          .message("Alt text generated via AI")
          .build();
    } catch (Exception e) {
      return GalleryAiResponse.builder()
          .altText(generateFallbackAltText(image))
          .message("AI generation failed: " + e.getMessage() + ". Using fallback.")
          .build();
    }
  }

  public GalleryAiResponse generateTags(GalleryAiRequest request) {
    GalleryAlbum album = galleryAlbumRepository.findById(request.getAlbumId())
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + request.getAlbumId()));

    String apiKey = getAiApiKey();
    if (apiKey == null || apiKey.isEmpty()) {
      return GalleryAiResponse.builder()
          .tags(List.of(album.getTitleEn(), "gallery", "image"))
          .message("AI API key not configured. Using fallback tags.")
          .build();
    }

    try {
      List<GalleryImage> images = galleryImageRepository.findByAlbumIdOrderBySortOrderAsc(request.getAlbumId());
      String imageUrls = images.stream()
          .limit(5)
          .map(i -> i.getMediaFile().getUrl())
          .filter(Objects::nonNull)
          .collect(Collectors.joining("\n"));

      String prompt = "Based on this gallery titled '" + album.getTitleEn() +
          "', suggest 5-10 relevant tags as a comma-separated list. " +
          (request.getPrompt() != null ? "Context: " + request.getPrompt() : "");

      String result = callChatApi(apiKey, prompt);
      List<String> tags = result != null
          ? Arrays.stream(result.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList())
          : List.of(album.getTitleEn(), "gallery");

      return GalleryAiResponse.builder()
          .tags(tags)
          .message("Tags generated via AI")
          .build();
    } catch (Exception e) {
      return GalleryAiResponse.builder()
          .tags(List.of(album.getTitleEn(), "gallery"))
          .message("AI generation failed: " + e.getMessage() + ". Using fallback.")
          .build();
    }
  }

  public GalleryAiResponse smartCrop(GalleryAiRequest request) {
    String apiKey = getAiApiKey();
    if (apiKey == null || apiKey.isEmpty()) {
      return GalleryAiResponse.builder()
          .smartCrop("center")
          .message("AI API key not configured. Using center crop.")
          .build();
    }

    try {
      String result = callChatApi(apiKey,
          "Given an image, what is the best crop focus point? Respond with just the position (e.g., 'center', 'top-left', 'face')");
      return GalleryAiResponse.builder()
          .smartCrop(result != null ? result : "center")
          .message("Crop suggestion generated via AI")
          .build();
    } catch (Exception e) {
      return GalleryAiResponse.builder()
          .smartCrop("center")
          .message("AI generation failed: " + e.getMessage() + ". Using default.")
          .build();
    }
  }

  private String getAiApiKey() {
    try {
      var config = systemConfigService.getConfig("gallery_settings");
      if (config != null && config.getConfigValue() != null) {
        String json = config.getConfigValue();
        if (json.contains("\"apiKey\"")) {
          int start = json.indexOf("\"apiKey\"") + 9;
          start = json.indexOf("\"", start) + 1;
          int end = json.indexOf("\"", start);
          if (start > 0 && end > start) {
            return json.substring(start, end);
          }
        }
      }
    } catch (Exception ignored) {}
    return null;
  }

  private String callVisionApi(String apiKey, String imageUrl, String prompt) {
    try {
      String body = "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"" +
          escapeJson(prompt) + "\"},{\"type\":\"image_url\",\"image_url\":{\"url\":\"" +
          escapeJson(imageUrl) + "\"}}]}],\"max_tokens\":300}";

      URL url = URI.create(OPENAI_API_URL).toURL();
      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("POST");
      conn.setRequestProperty("Authorization", "Bearer " + apiKey);
      conn.setRequestProperty("Content-Type", "application/json");
      conn.setDoOutput(true);
      conn.setConnectTimeout(15000);
      conn.setReadTimeout(30000);

      try (OutputStream os = conn.getOutputStream()) {
        os.write(body.getBytes(StandardCharsets.UTF_8));
      }

      String response = new String(conn.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
      return parseOpenAiResponse(response);
    } catch (Exception e) {
      return null;
    }
  }

  private String callChatApi(String apiKey, String prompt) {
    try {
      String body = "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"" +
          escapeJson(prompt) + "\"}],\"max_tokens\":300}";

      URL url = URI.create(OPENAI_API_URL).toURL();
      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("POST");
      conn.setRequestProperty("Authorization", "Bearer " + apiKey);
      conn.setRequestProperty("Content-Type", "application/json");
      conn.setDoOutput(true);
      conn.setConnectTimeout(15000);
      conn.setReadTimeout(30000);

      try (OutputStream os = conn.getOutputStream()) {
        os.write(body.getBytes(StandardCharsets.UTF_8));
      }

      String response = new String(conn.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
      return parseOpenAiResponse(response);
    } catch (Exception e) {
      return null;
    }
  }

  private String parseOpenAiResponse(String json) {
    try {
      int choicesStart = json.indexOf("\"choices\"");
      if (choicesStart < 0) return null;
      int contentStart = json.indexOf("\"content\"", choicesStart);
      if (contentStart < 0) return null;
      contentStart = json.indexOf("\"", contentStart + 10) + 1;
      int contentEnd = json.indexOf("\"", contentStart);
      if (contentStart <= 0 || contentEnd <= contentStart) return null;
      return json.substring(contentStart, contentEnd)
          .replace("\\n", "\n")
          .replace("\\\"", "\"")
          .replace("\\t", "\t");
    } catch (Exception e) {
      return null;
    }
  }

  private String escapeJson(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t");
  }

  private String generateFallbackAltText(GalleryImage image) {
    if (image.getAltText() != null && !image.getAltText().isEmpty()) return image.getAltText();
    if (image.getTitleEn() != null) return image.getTitleEn();
    if (image.getMediaFile().getOriginalFilename() != null) {
      String name = image.getMediaFile().getOriginalFilename();
      return name.contains(".") ? name.substring(0, name.lastIndexOf(".")) : name;
    }
    return "Gallery image";
  }
}
