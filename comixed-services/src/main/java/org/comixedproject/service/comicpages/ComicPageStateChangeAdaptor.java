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

package org.comixedproject.service.comicpages;

import static org.comixedproject.state.comicpages.ComicPageStateHandler.HEADER_PAGE;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
import org.comixedproject.state.comicpages.ComicPageEvent;
import org.comixedproject.state.comicpages.ComicPageStateChangeListener;
import org.comixedproject.state.comicpages.ComicPageStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Component;

/**
 * <code>ComicPageStateChangeAdaptor</code> provides an adaptor that responds to page events.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicPageStateChangeAdaptor implements InitializingBean, ComicPageStateChangeListener {
  @Autowired private ComicPageService comicPageService;
  @Autowired private ComicPageStateHandler comicPageStateHandler;

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to comic page state events");
    this.comicPageStateHandler.addListener(this);
  }

  @Override
  public void onPageStateChange(
      final State<ComicPageState, ComicPageEvent> state, final Message<ComicPageEvent> message) {
    final var page = message.getHeaders().get(HEADER_PAGE, ComicPage.class);
    if (page == null) return;
    log.debug("Processing page state change: [{}] =>  {}", page.getId(), state.getId());
    page.setPageState(state.getId());
    try {
      this.comicPageService.save(page);
    } catch (ComicPageException error) {
      log.error("Failed to update page", error);
    }
  }
}
