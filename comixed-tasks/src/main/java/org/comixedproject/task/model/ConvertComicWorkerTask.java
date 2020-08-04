/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.task.model;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.library.ReadingListService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.ProcessComicWorkerTaskEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ConvertComicWorkerTask</code> converts comics from one archive type to, potentially,
 * another. It also managings renaming and deleting pages.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ConvertComicWorkerTask extends AbstractWorkerTask {
  @Autowired private ComicService comicService;
  @Autowired private TaskService taskService;

  @Autowired
  private ObjectFactory<ProcessComicWorkerTaskEncoder> processComicTaskEncoderObjectFactory;

  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private ReadingListService readingListService;

  @Getter @Setter private Comic comic;
  @Getter @Setter private ArchiveType targetArchiveType;
  @Getter @Setter private boolean renamePages;
  @Getter @Setter private boolean deletePages;
  @Getter @Setter private boolean deleteOriginal;

  @Override
  protected String createDescription() {
    return String.format(
        "Saving comic: id=%d source type=%s destination type=%s %s%s%s",
        this.comic.getId(),
        this.comic.getArchiveType(),
        this.targetArchiveType,
        this.renamePages ? "(renaming pages)" : "",
        this.deletePages ? "(deleting pages)" : "",
        this.deleteOriginal ? "(deleting original comic)" : "");
  }

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    log.debug(
        "Saving comic: id={} target archive type={}", this.comic.getId(), this.targetArchiveType);
    ArchiveAdaptor targetArchiveAdaptor =
        this.comicFileHandler.getArchiveAdaptorFor(this.targetArchiveType);

    try {
      this.comic.removeDeletedPages(this.deletePages);
      Comic saveComic = targetArchiveAdaptor.saveComic(this.comic, this.renamePages);
      log.debug("Saving updated comic");
      saveComic.setDateLastUpdated(new Date());
      final Comic result = this.comicService.save(saveComic);
      updateReadingList(this.comic, result);

      if (this.deleteOriginal) {
        deleteOriginal();
      }
      log.debug("Queueing up a comic processing task");
      ProcessComicWorkerTaskEncoder taskEncoder =
          this.processComicTaskEncoderObjectFactory.getObject();
      taskEncoder.setComic(result);
      taskEncoder.setIgnoreMetadata(false);
      taskEncoder.setDeleteBlockedPages(false);
      this.taskService.save(taskEncoder.encode());
    } catch (ArchiveAdaptorException | IOException error) {
      throw new WorkerTaskException("Failed to save comic", error);
    }
  }

  private void deleteOriginal() throws WorkerTaskException {
    final String filename = this.comic.getFilename();
    log.debug("Deleting comic file: {}", filename);
    File file = new File(filename);
    try {
      FileUtils.forceDelete(file);
      log.debug("Removing comic from repository: id={}", this.comic.getId());
      this.comicService.delete(this.comic);
    } catch (IOException error) {
      log.error("Unable to delete comic: {}", filename, error);
      throw new WorkerTaskException("failed to delete comic", error);
    }
  }

  private void updateReadingList(final Comic originalComic, final Comic convertedComic)
      throws WorkerTaskException {
    if (originalComic == null) {
      throw new WorkerTaskException("failed to update reading list");
    }
    log.debug("updating reading list{}", originalComic.getReadingLists().size() == 1 ? "" : "s");
    if (!originalComic.getReadingLists().isEmpty()) {
      Set<ReadingList> readingLists = originalComic.getReadingLists();
      for (ReadingList readingList : readingLists) {
        if (this.deleteOriginal) {
          readingList.getComics().remove(originalComic);
          originalComic.getReadingLists().remove(readingList);
        }
        readingList.getComics().add(convertedComic);
        log.debug("Updating reading list: {}", readingList.getName());
        this.readingListService.save(readingList);
      }
    }
  }
}
