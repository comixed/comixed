/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.service.library;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.library.LastReadDatesRepository;
import org.comixedproject.service.comic.PageCacheService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class LibraryService {
  @Autowired private TaskService taskService;
  @Autowired private UserService userService;
  @Autowired private ComicRepository comicRepository;
  @Autowired private LastReadDatesRepository lastReadDateRepository;
  @Autowired private ReadingListService readingListService;
  @Autowired private Utils utils;
  @Autowired private PageCacheService pageCacheService;

  public List<Comic> getComicsUpdatedSince(
      String email, Date latestUpdatedDate, int maximumComics, long lastComicId) {
    log.debug(
        "Finding up to {} comics updated since {} for {}", maximumComics, latestUpdatedDate, email);

    List<Comic> comics =
        this.comicRepository.getLibraryUpdates(latestUpdatedDate, PageRequest.of(0, maximumComics));
    List<Comic> result = new ArrayList<>();

    final long timestamp = latestUpdatedDate.getTime();
    for (int index = 0; index < comics.size(); index++) {
      Comic comic = comics.get(index);
      final long thisTimestamp = comic.getDateLastUpdated().getTime();
      final Long thisId = comic.getId();
      log.debug(
          "Checking comic: timestamp: {} >= {} id: {} > {}",
          thisTimestamp,
          timestamp,
          thisId,
          lastComicId);
      boolean include = thisTimestamp > timestamp || thisId > lastComicId;

      if (include) {
        log.debug("Including comic: id={}", thisId);
        result.add(comic);
      }
    }

    if (!result.isEmpty()) {
      log.debug("Loading reading lists");
      this.readingListService.getReadingListsForComics(email, result);
    }

    log.debug("Returning {} updated comic{}", result.size(), result.size() == 1 ? "" : "s");
    return result;
  }

  public List<LastReadDate> getLastReadDatesSince(String email, Date lastReadDate)
      throws ComiXedUserException {
    ComiXedUser user = this.userService.findByEmail(email);
    log.debug(
        "Retrieving all last read dates updated since {} for {}", lastReadDate, user.getEmail());
    return this.lastReadDateRepository.findAllForUser(user.getId(), lastReadDate);
  }

  public long getProcessingCount() {
    log.debug("Getting processing count");
    return this.taskService.getTaskCount(TaskType.PROCESS_COMIC);
  }

  @Transactional
  public List<Comic> consolidateLibrary(boolean deletePhysicalFiles) {
    log.debug("Consolidating library: delete physical files={}", deletePhysicalFiles);

    List<Comic> result = this.comicRepository.findAllMarkedForDeletion();

    for (Comic comic : result) {
      log.debug("Removing deleted comics from library");
      this.comicRepository.delete(comic);

      if (deletePhysicalFiles) {
        String filename = comic.getFilename();
        File file = comic.getFile();
        log.debug("Deleting physical file: {}", filename);
        this.utils.deleteFile(file);
      }
    }
    return result;
  }

  /**
   * Removes all files in the image cache directory.
   *
   * @throws LibraryException if an error occurs
   */
  public void clearImageCache() throws LibraryException {
    String directory = this.pageCacheService.getRootDirectory();
    log.debug("Clearing the image cache: {}", directory);
    try {
      this.utils.deleteDirectoryContents(directory);
    } catch (IOException error) {
      throw new LibraryException("failed to clean image cache directory", error);
    }
  }
}
