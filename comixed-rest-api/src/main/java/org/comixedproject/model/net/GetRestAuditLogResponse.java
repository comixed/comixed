package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.auditlog.RestAuditLogEntry;
import org.comixedproject.views.View;

/**
 * <code>GetRestAuditLogResponse</code> represents the content for a reqwuest to get REST audit log
 * entries.
 *
 * @author Darryl L. Pierce
 */
public class GetRestAuditLogResponse {
  @Getter
  @Setter
  @JsonProperty("entries")
  @JsonView(View.AuditLogEntryList.class)
  private List<RestAuditLogEntry> entries;

  @Getter
  @Setter
  @JsonProperty("latest")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView(View.AuditLogEntryList.class)
  private Date latest;
}
