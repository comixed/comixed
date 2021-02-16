package org.comixedproject.auditing;

import org.comixedproject.model.auditlog.SessionUpdateEventHandler;

public interface SessionEventAuditor {
  void addHandler(SessionUpdateEventHandler handler);
}
