/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.comicbooks;

import java.util.Date;
import java.util.List;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicBookUpdateAction;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.comixedproject.state.comicbooks.ComicStateListener;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicStateAdaptor</code> provides an implementation of {@link ComicStateListener} to
 * response to state change vents.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicStateChangeAdaptor implements InitializingBean, ComicStateListener {
  @Autowired private ComicDetailService comicDetailService;
  @Autowired private ComicStateAdaptor comicStateAdaptor;
  @Autowired private PublishComicBookUpdateAction publishComicBookUpdateAction;
  @Autowired private PublishComicBookRemovalAction publishComicBookRemovalAction;
  @Autowired private DisplayableComicService displayableComicService;

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to comic state changes");
    this.comicStateAdaptor.addListener(this);
  }

  @Override
  public void onComicStateChanged(final ComicDetail comic) {
    try {
      if (comic.getState().equals(ComicState.REMOVED)) {
        log.debug("Comic book deleted");
        this.publishComicBookRemovalAction.publish(
            this.displayableComicService.getForComicBookId(comic.getComicId()));
      } else {
        log.debug("Saving updated comic book");
        comic.setLastModifiedDate(new Date());
        final ComicDetail updated = this.comicDetailService.save(comic);
        final DisplayableComic details =
            this.displayableComicService.getForComicBookId(updated.getComicId());
        final List<ComicPage> pages = updated.getPages();
        final ComicMetadataSource metadata = updated.getMetadata();
        final Set<ComicTag> tags = updated.getTags();

        this.publishComicBookUpdateAction.publish(
            new ComicBookData(details, pages, metadata, tags.stream().toList()));
      }
    } catch (PublishingException | ComicBookException error) {
      log.error("Failed to publish comic state change", error);
    }
  }
}
