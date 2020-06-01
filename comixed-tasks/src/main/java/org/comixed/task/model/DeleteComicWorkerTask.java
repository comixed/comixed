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

package org.comixed.task.model;

import java.io.File;
import java.io.IOException;
import java.text.MessageFormat;
import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixed.model.comic.Comic;
import org.comixed.model.library.ReadingList;
import org.comixed.repositories.comic.ComicRepository;
import org.comixed.repositories.library.ReadingListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Log4j2
public class DeleteComicWorkerTask extends AbstractWorkerTask implements WorkerTask {
  @Autowired private ComicRepository repository;
  @Autowired private ReadingListRepository readingListRepository;

  private boolean deleteFile;
  private Comic comic;

  public void setDeleteFile(boolean deleteFile) {
    this.deleteFile = deleteFile;
  }

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    if (!comic.getReadingLists().isEmpty()) {
      this.log.debug(
          "Removing comic from {} reading list{}",
          comic.getReadingLists().size(),
          comic.getReadingLists().size() == 1 ? "" : "s");
      while (!comic.getReadingLists().isEmpty()) {
        ReadingList readingList = comic.getReadingLists().get(0);
        readingList.removeComic(comic);
        comic.getReadingLists().remove(0);
        this.log.debug("Updating reading list: {}", readingList.getName());
        this.readingListRepository.save(readingList);
      }
    }

    if (this.deleteFile) {
      final String filename = this.comic.getFilename();
      this.log.debug("Deleting comic file: {}", filename);
      File file = new File(filename);
      try {
        FileUtils.forceDelete(file);
        this.log.debug("Removing comic from repository: id={}", this.comic.getId());
        this.repository.delete(this.comic);
      } catch (IOException error) {
        this.log.error("Unable to delete comic: {}", filename, error);
      }
    } else {
      this.log.debug("Marking comic for deletion: id={}", this.comic.getId());
      comic.setDateDeleted(new Date());
      comic.setDateLastUpdated(new Date());
      this.repository.save(this.comic);
    }
  }

  @Override
  protected String createDescription() {
    return MessageFormat.format(
        "Deleting comic: id={0} [delete file={1}]", this.comic.getId(), this.deleteFile);
  }

  public void setComic(final Comic comic) {
    this.comic = comic;
  }
}
