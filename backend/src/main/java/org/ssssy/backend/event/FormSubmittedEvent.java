package org.ssssy.backend.event;

import java.util.UUID;

/**
 * Fired when a user submits a dynamic form.
 * Listeners can trigger emails, workflow starts, CRM contact creation, etc.
 */
public class FormSubmittedEvent extends CmsEvent {

  private final UUID formId;
  private final String formSlug;
  private final String formTitle;
  private final UUID submissionId;
  private final String submissionDataJson;
  private final String submitterEmail;  // extracted from submission if email field present

  public FormSubmittedEvent(UUID formId, String formSlug, String formTitle,
      UUID submissionId, String submissionDataJson, String submitterEmail, UUID userId) {
    super(userId);
    this.formId = formId;
    this.formSlug = formSlug;
    this.formTitle = formTitle;
    this.submissionId = submissionId;
    this.submissionDataJson = submissionDataJson;
    this.submitterEmail = submitterEmail;
  }

  @Override
  public String getEventType() { return "FORM_SUBMITTED"; }

  public UUID getFormId() { return formId; }
  public String getFormSlug() { return formSlug; }
  public String getFormTitle() { return formTitle; }
  public UUID getSubmissionId() { return submissionId; }
  public String getSubmissionDataJson() { return submissionDataJson; }
  public String getSubmitterEmail() { return submitterEmail; }
}
