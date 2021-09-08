/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.task;

import com.fasterxml.jackson.annotation.JsonView;
import java.text.MessageFormat;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>MarkComicForRemovalTask</code> marks a single comic for removal from the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkComicForRemovalTask extends AbstractTask implements Task {
  @Autowired private ComicService comicService;
  @Autowired private ReadingListService readingListService;
  @Autowired private ComicStateHandler comicStateHandler;

  @JsonView(View.AuditLogEntryDetail.class)
  @Setter
  private Comic comic;

  public MarkComicForRemovalTask() {
    super(PersistedTaskType.MARK_COMIC_FOR_REMOVAL);
  }

  @Override
  @Transactional
  public void startTask() {
    if (!comic.getReadingLists().isEmpty()) {
      log.debug(
          "Removing comic from {} reading list{}",
          comic.getReadingLists().size(),
          comic.getReadingLists().size() == 1 ? "" : "s");
      while (!comic.getReadingLists().isEmpty()) {
        ReadingList[] readingLists =
            comic.getReadingLists().toArray(new ReadingList[comic.getReadingLists().size()]);
        for (int index = 0; index < readingLists.length; index++) {
          ReadingList readingList = readingLists[index];
          readingList.getComics().remove(comic);
          comic.getReadingLists().remove(readingList);
          log.debug("Updating reading list: {}", readingList.getName());
          this.readingListService.saveReadingList(readingList);
        }
      }
    }

    log.trace("Fire comic event: mark comic deleted");
    this.comicStateHandler.fireEvent(this.comic, ComicEvent.markedForRemoval);
  }

  @Override
  protected String createDescription() {
    return MessageFormat.format("Marking comic deleted: id={0}", this.comic.getId());
  }
}
