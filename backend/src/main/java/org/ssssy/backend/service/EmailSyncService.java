package org.ssssy.backend.service;

import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.entity.EmailAccount;
import org.ssssy.backend.model.entity.EmailFolder;
import org.ssssy.backend.model.entity.EmailMessage;
import org.ssssy.backend.repository.EmailAccountRepository;
import org.ssssy.backend.repository.EmailFolderRepository;
import org.ssssy.backend.repository.EmailMessageRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailSyncService {

  private final EmailAccountRepository emailAccountRepository;
  private final EmailFolderRepository emailFolderRepository;
  private final EmailMessageRepository emailMessageRepository;
  private final EmailRuleExecutionService emailRuleExecutionService;

  @Value("${app.email.imap.host:localhost}")
  private String imapHost;

  @Value("${app.email.imap.port:143}")
  private int imapPort;

  @Scheduled(fixedRate = 300000)
  @Transactional
  public void syncAllAccounts() {
    List<EmailAccount> accounts = emailAccountRepository.findByImapSubscribedTrue();
    for (EmailAccount account : accounts) {
      try {
        syncAccount(account);
      } catch (Exception e) {
        // Log error and continue with next account
        System.err.println("Failed to sync account " + account.getEmailAddress() + ": " + e.getMessage());
      }
    }
  }

  @Transactional
  public void syncAccount(EmailAccount account) {
    if (!Boolean.TRUE.equals(account.getImapSubscribed())) return;

    try {
      Properties props = new Properties();
      props.put("mail.store.protocol", "imap");
      props.put("mail.imap.host", imapHost);
      props.put("mail.imap.port", imapPort);
      props.put("mail.imap.connectiontimeout", "10000");
      props.put("mail.imap.timeout", "10000");

      Session session = Session.getInstance(props);
      Store store = session.getStore("imap");
      store.connect(imapHost, imapPort, account.getUsername(), account.getPasswordHash());

      Folder defaultFolder = store.getDefaultFolder();
      Folder[] folders = defaultFolder.list();

      for (Folder folder : folders) {
        try {
          folder.open(Folder.READ_ONLY);
          String imapFolderName = folder.getFullName();
          EmailFolder localFolder = emailFolderRepository
              .findByAccountIdAndImapFolderName(account.getId(), imapFolderName)
              .orElse(null);

          if (localFolder == null) continue;

          Message[] messages = folder.getMessages();
          long existingCount = emailMessageRepository.countByFolderId(localFolder.getId());

          for (int i = (int) existingCount; i < messages.length; i++) {
            Message msg = messages[i];
            importMessage(account, localFolder, msg);
          }

          folder.close(false);
        } catch (Exception e) {
          System.err.println("Failed to sync folder " + folder.getFullName() + ": " + e.getMessage());
        }
      }

      store.close();
      account.setLastSyncAt(LocalDateTime.now());
      emailAccountRepository.save(account);
    } catch (Exception e) {
      throw new RuntimeException("Failed to sync account: " + e.getMessage(), e);
    }
  }

  private void importMessage(EmailAccount account, EmailFolder folder, Message msg) {
    try {
      String messageId = msg.getHeader("Message-ID") != null && msg.getHeader("Message-ID").length > 0
          ? msg.getHeader("Message-ID")[0] : null;

      if (messageId != null && emailMessageRepository.findByMessageId(messageId).isPresent()) {
        return;
      }

      long imapUid = msg.getMessageNumber();
      String from = msg.getFrom() != null && msg.getFrom().length > 0
          ? msg.getFrom()[0].toString() : "";
      String subject = msg.getSubject() != null ? msg.getSubject() : "";
      String bodyText = "";
      String bodyHtml = null;

      Object content = msg.getContent();
      if (content instanceof String) {
        bodyText = (String) content;
      }

      EmailMessage emailMsg = EmailMessage.builder()
          .account(account)
          .folder(folder)
          .messageId(messageId)
          .senderAddress(from)
          .senderName(from)
          .subject(subject)
          .bodyText(bodyText)
          .bodyHtml(bodyHtml)
          .previewText(subject.length() > 500 ? subject.substring(0, 500) : subject)
          .isRead(false)
          .deliveryStatus("RECEIVED")
          .imapUid(imapUid)
          .build();

      emailMessageRepository.save(emailMsg);

      try { emailRuleExecutionService.applyRulesOnReceive(emailMsg); } catch (Exception e) { /* ignore */ }
    } catch (Exception e) {
      System.err.println("Failed to import message: " + e.getMessage());
    }
  }
}
