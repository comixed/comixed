package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.views.View;

/**
 * <code>GetTaskAuditLogResponse</code> represents the response body for a task audit log entry
 * request.
 *
 * @author Darryl L. Pierce
 */
public class GetTaskAuditLogResponse {
  @Getter
  @Setter
  @JsonProperty("entries")
  @JsonView(View.AuditLogEntryList.class)
  private List<TaskAuditLogEntry> entries = new ArrayList<>();

  @Getter
  @Setter
  @JsonProperty("latest")
  @JsonView(View.AuditLogEntryList.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Date latest;
}
