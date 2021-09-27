package org.comixedproject.messaging.comicpages;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.comicpages.BlockedPage;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishBlockedPageUpdateAction</code> publishes changeds to {@link BlockedPage} instances.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishBlockedPageUpdateAction extends AbstractPublishAction<BlockedPage> {
  @Override
  public void publish(final BlockedPage blockedPage) throws PublishingException {
    this.doPublish(
        Constants.BLOCKED_PAGE_LIST_UPDATE_TOPIC, blockedPage, View.BlockedPageList.class);
  }
}
