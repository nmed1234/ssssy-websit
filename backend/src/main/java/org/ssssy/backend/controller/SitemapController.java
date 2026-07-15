package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.ssssy.backend.repository.ContentItemRepository;
import org.ssssy.backend.repository.EventRepository;
import org.ssssy.backend.repository.JobVacancyRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class SitemapController {

  private final ContentItemRepository contentItemRepository;
  private final EventRepository eventRepository;
  private final JobVacancyRepository jobVacancyRepository;

  @Value("${app.base-url:https://ssssy.org.sy}")
  private String baseUrl;

  @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
  public ResponseEntity<String> generateSitemap() {
    StringBuilder xml = new StringBuilder();
    xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

    String today = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

    addUrl(xml, baseUrl, today, "1.0", "daily");
    addUrl(xml, baseUrl + "/about", today, "0.8", "monthly");
    addUrl(xml, baseUrl + "/president-message", today, "0.7", "monthly");
    addUrl(xml, baseUrl + "/board", today, "0.7", "monthly");
    addUrl(xml, baseUrl + "/members", today, "0.6", "weekly");
    addUrl(xml, baseUrl + "/news", today, "0.9", "daily");
    addUrl(xml, baseUrl + "/publications", today, "0.8", "weekly");
    addUrl(xml, baseUrl + "/events", today, "0.8", "daily");
    addUrl(xml, baseUrl + "/jobs", today, "0.7", "daily");
    addUrl(xml, baseUrl + "/contact", today, "0.6", "monthly");

    contentItemRepository.findByStatus("PUBLISHED").forEach(item -> {
      addUrl(xml, baseUrl + "/news/" + item.getSlug(),
          item.getPublishedAt() != null ? item.getPublishedAt().toLocalDate().toString() : today,
          "0.6", "weekly");
    });

    eventRepository.findByIsPublishedTrueOrderByEventDateDesc(org.springframework.data.domain.Pageable.unpaged())
        .forEach(event -> {
          addUrl(xml, baseUrl + "/events/" + event.getSlug(),
              event.getCreatedAt().toLocalDate().toString(), "0.5", "weekly");
        });

    jobVacancyRepository.findByIsPublishedTrueOrderByCreatedAtDesc(org.springframework.data.domain.Pageable.unpaged())
        .forEach(job -> {
          addUrl(xml, baseUrl + "/jobs/" + job.getSlug(),
              job.getUpdatedAt() != null ? job.getUpdatedAt().toLocalDate().toString() : today,
              "0.5", "weekly");
        });

    xml.append("</urlset>");
    return ResponseEntity.ok(xml.toString());
  }

  private void addUrl(StringBuilder xml, String loc, String lastmod, String priority, String changefreq) {
    xml.append("  <url>\n");
    xml.append("    <loc>").append(loc).append("</loc>\n");
    xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
    xml.append("    <priority>").append(priority).append("</priority>\n");
    xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
    xml.append("  </url>\n");
  }
}
