package org.ssssy.backend.service;

import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.Properties;

@Component
public class MimeParser {

  public ParsedEmail parse(String rawMime) {
    ParsedEmail result = new ParsedEmail();
    try {
      Session session = Session.getDefaultInstance(new Properties());
      MimeMessage msg = new MimeMessage(session, new ByteArrayInputStream(rawMime.getBytes(StandardCharsets.UTF_8)));

      result.setMessageId(msg.getMessageID());
      result.setSubject(msg.getSubject() != null ? msg.getSubject() : "");
      result.setFrom(formatAddress(msg.getFrom()));
      result.setTo(formatAddresses(msg.getRecipients(jakarta.mail.Message.RecipientType.TO)));
      result.setCc(formatAddresses(msg.getRecipients(jakarta.mail.Message.RecipientType.CC)));
      result.setBcc(formatAddresses(msg.getRecipients(jakarta.mail.Message.RecipientType.BCC)));
      result.setInReplyTo(msg.getHeader("In-Reply-To") != null && msg.getHeader("In-Reply-To").length > 0
          ? msg.getHeader("In-Reply-To")[0] : null);
      result.setReferences(msg.getHeader("References") != null && msg.getHeader("References").length > 0
          ? msg.getHeader("References")[0] : null);

      Object content = msg.getContent();
      if (content instanceof String) {
        result.setBodyText((String) content);
      } else if (content instanceof Multipart) {
        parseMultipart((Multipart) content, result);
      }

    } catch (Exception e) {
      result.setBodyText(rawMime);
    }
    return result;
  }

  private void parseMultipart(Multipart mp, ParsedEmail result) throws Exception {
    for (int i = 0; i < mp.getCount(); i++) {
      jakarta.mail.BodyPart part = mp.getBodyPart(i);
      String disposition = part.getDisposition();
      String contentType = part.getContentType() != null ? part.getContentType().toLowerCase() : "";

      if (disposition == null || disposition.equalsIgnoreCase(jakarta.mail.Part.INLINE)) {
        if (contentType.contains("text/plain") && result.getBodyText() == null) {
          result.setBodyText(part.getContent().toString());
        } else if (contentType.contains("text/html") && result.getBodyHtml() == null) {
          result.setBodyHtml(part.getContent().toString());
        }
      }

      if (part.getContent() instanceof Multipart) {
        parseMultipart((Multipart) part.getContent(), result);
      }
    }
  }

  private String formatAddress(jakarta.mail.Address[] addresses) {
    if (addresses == null || addresses.length == 0) return "";
    return formatSingle(addresses[0]);
  }

  private List<String> formatAddresses(jakarta.mail.Address[] addresses) {
    List<String> result = new ArrayList<>();
    if (addresses != null) {
      for (jakarta.mail.Address addr : addresses) {
        result.add(formatSingle(addr));
      }
    }
    return result;
  }

  private String formatSingle(jakarta.mail.Address addr) {
    if (addr instanceof InternetAddress) {
      InternetAddress ia = (InternetAddress) addr;
      return ia.getPersonal() != null
          ? ia.getPersonal() + " <" + ia.getAddress() + ">"
          : ia.getAddress();
    }
    return addr.toString();
  }

  public static class ParsedEmail {
    private String messageId;
    private String subject;
    private String from;
    private List<String> to = new ArrayList<>();
    private List<String> cc = new ArrayList<>();
    private List<String> bcc = new ArrayList<>();
    private String inReplyTo;
    private String references;
    private String bodyText;
    private String bodyHtml;
    private Map<String, List<String>> headers = new HashMap<>();

    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public List<String> getTo() { return to; }
    public void setTo(List<String> to) { this.to = to; }
    public List<String> getCc() { return cc; }
    public void setCc(List<String> cc) { this.cc = cc; }
    public List<String> getBcc() { return bcc; }
    public void setBcc(List<String> bcc) { this.bcc = bcc; }
    public String getInReplyTo() { return inReplyTo; }
    public void setInReplyTo(String inReplyTo) { this.inReplyTo = inReplyTo; }
    public String getReferences() { return references; }
    public void setReferences(String references) { this.references = references; }
    public String getBodyText() { return bodyText; }
    public void setBodyText(String bodyText) { this.bodyText = bodyText; }
    public String getBodyHtml() { return bodyHtml; }
    public void setBodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; }
    public Map<String, List<String>> getHeaders() { return headers; }
    public void setHeaders(Map<String, List<String>> headers) { this.headers = headers; }
  }
}
