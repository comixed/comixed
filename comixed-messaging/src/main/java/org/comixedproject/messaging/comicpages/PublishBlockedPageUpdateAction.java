package org.comixedproject.messaging.comicpages;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishBlockedPageUpdateAction</code> publishes changeds to {@link BlockedHash} instances.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishBlockedPageUpdateAction extends AbstractPublishAction<BlockedHash> {
  @Override
  public void publish(final BlockedHash blockedHash) throws PublishingException {
    this.doPublish(
        Constants.BLOCKED_HASH_LIST_UPDATE_TOPIC, blockedHash, View.BlockedHashList.class);
  }
}
