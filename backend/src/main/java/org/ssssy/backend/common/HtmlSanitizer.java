package org.ssssy.backend.common;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class HtmlSanitizer {

  private static final Safelist SAFELIST = Safelist.relaxed()
      .addTags("h1", "h2", "h3", "h4", "h5", "h6", "hr", "pre", "code", "br")
      .addAttributes("img", "src", "alt", "title", "width", "height")
      .addAttributes("a", "href", "title", "target", "rel")
      .addAttributes("table", "class")
      .addAttributes("td", "colspan", "rowspan")
      .addAttributes("th", "colspan", "rowspan")
      .addAttributes(":all", "class", "style")
      .preserveRelativeLinks(true);

  public static String sanitize(String html) {
    if (html == null || html.isBlank()) {
      return html;
    }
    return Jsoup.clean(html, SAFELIST);
  }
}
