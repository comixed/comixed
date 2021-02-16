package org.comixedproject.model.page;

import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditing.AbstractSessionEventAuditor;
import org.comixedproject.model.session.SessionUpdateEventType;
import org.springframework.stereotype.Component;

/**
 * <code>BlockedPageHashSessionEventAuditor</code> maintains a list of changes to persisted
 * instances of {@link BlockedPageHash}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class BlockedPageHashSessionEventAuditor extends AbstractSessionEventAuditor {
  /**
   * Adds an entry for a removed hash.
   *
   * @param hash the hash
   */
  @PostRemove
  public void removedHash(final BlockedPageHash hash) {
    log.debug("Blocked page hash removed: {}", hash.getHash());
    this.fireNotifications(SessionUpdateEventType.BLOCKED_HASH_REMOVED, hash.getHash());
  }

  /**
   * Adds an entry for a saved hash.
   *
   * @param hash the hash
   */
  @PostPersist
  public void addedHash(final BlockedPageHash hash) {
    log.debug("Blocked page hash added: {}", hash.getHash());
    this.fireNotifications(SessionUpdateEventType.BLOCKED_HASH_ADDED, hash.getHash());
  }
}
