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

package org.comixedproject.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import java.security.Principal;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.net.*;
import org.comixedproject.model.net.library.MoveComicsRequest;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.library.LibraryService;
import org.comixedproject.service.library.ReadingListService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.task.model.ConvertComicsWorkerTask;
import org.comixedproject.task.model.MoveComicsWorkerTask;
import org.comixedproject.task.runner.TaskManager;
import org.comixedproject.views.View;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api")
@Log4j2
public class LibraryController {
  @Autowired private LibraryService libraryService;
  @Autowired private ComicService comicService;
  @Autowired private UserService userService;
  @Autowired private ReadingListService readingListService;
  @Autowired private TaskManager taskManager;
  @Autowired private ObjectFactory<ConvertComicsWorkerTask> convertComicsWorkerTaskObjectFactory;
  @Autowired private ObjectFactory<MoveComicsWorkerTask> moveComicsWorkerTaskObjectFactory;

  @PostMapping(
      value = "/library/updates",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.LibraryUpdate.class)
  public GetUpdatedComicsResponse getUpdatedComics(
      Principal principal, @RequestBody() GetUpdatedComicsRequest request)
      throws ComiXedUserException {
    Date latestUpdateDate = new Date(request.getLastUpdatedDate());
    String email = principal.getName();
    log.info(
        "Getting comics updated since {} for {} (max: {}, last id: {}, timeout: {}s)",
        latestUpdateDate,
        email,
        request.getMaximumComics(),
        request.getLastComicId(),
        request.getTimeout());

    long expire = System.currentTimeMillis() + (request.getTimeout() * 1000L);
    boolean done = false;
    List<Comic> comics = null;
    Long lastComicId = null;
    Date mostRecentUpdate = null;
    boolean moreUpdates = false;
    long processingCount = 0L;

    while (!done) {
      comics =
          this.libraryService.getComicsUpdatedSince(
              email, latestUpdateDate, request.getMaximumComics() + 1, request.getLastComicId());

      if (comics.size() > request.getMaximumComics()) {
        log.debug("More updates are waiting");
        moreUpdates = true;
        log.debug("Removing last comic from result set");
        comics.remove(comics.size() - 1);
      }

      log.debug("Getting processing count");
      processingCount = this.libraryService.getProcessingCount();

      if (!comics.isEmpty()) {
        log.debug("{} update{} loaded", comics.size(), comics.size() == 1 ? "" : "s");
        lastComicId = comics.get(comics.size() - 1).getId();
        mostRecentUpdate = comics.get(comics.size() - 1).getDateLastUpdated();
        done = true;
      } else if (System.currentTimeMillis() > expire) {
        log.debug("Timeout reached");
        done = true;
      } else {
        log.debug("Sleeping 1000ms");
        try {
          Thread.sleep(1000L);
        } catch (InterruptedException error) {
          log.error("error while waiting for updates", error);
          Thread.currentThread().interrupt();
        }
      }
    }

    log.debug("Loading updated last read dates");
    List<LastReadDate> lastReadDates =
        this.libraryService.getLastReadDatesSince(email, latestUpdateDate);

    log.debug("Getting updated reading lists");
    List<ReadingList> readingLists =
        this.readingListService.getReadingListsForUser(email, latestUpdateDate);

    log.debug("Returning result");
    return new GetUpdatedComicsResponse(
        comics,
        lastComicId,
        mostRecentUpdate,
        lastReadDates,
        readingLists,
        moreUpdates,
        processingCount);
  }

  @PostMapping(value = "/library/convert", consumes = MediaType.APPLICATION_JSON_VALUE)
  public void convertComics(@RequestBody() ConvertComicsRequest request) {
    List<Long> idList = request.getComicIdList();
    ArchiveType archiveType = request.getArchiveType();
    boolean renamePages = request.isRenamePages();
    boolean deletePages = request.isDeletePages();
    boolean deleteOriginal = request.isDeleteOriginal();

    log.info(
        "Converting {} comic{} to {}{}{}{}",
        idList.size(),
        idList.size() == 1 ? "" : "s",
        archiveType,
        renamePages ? " (rename pages)" : "",
        deletePages ? " (delete pages)" : "",
        deleteOriginal ? " (delete original comic)" : "");

    final ConvertComicsWorkerTask task = this.convertComicsWorkerTaskObjectFactory.getObject();
    task.setIdList(idList);
    task.setTargetArchiveType(archiveType);
    task.setRenamePages(renamePages);
    task.setDeletePages(deletePages);
    task.setDeleteOriginal(deleteOriginal);

    this.taskManager.runTask(task);
  }

  @PostMapping(
      value = "/library/consolidate",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DeletedComicList.class)
  public List<Comic> consolidateLibrary(@RequestBody() ConsolidateLibraryRequest request) {
    log.info("Consolidating library: delete physic files={}", request.getDeletePhysicalFiles());
    return this.libraryService.consolidateLibrary(request.getDeletePhysicalFiles());
  }

  @DeleteMapping(value = "/library/cache/images")
  public ClearImageCacheResponse clearImageCache() {
    log.info("Clearing the image cache");

    try {
      this.libraryService.clearImageCache();
    } catch (LibraryException error) {
      log.error("failed to clear image cache", error);
      return new ClearImageCacheResponse(false);
    }

    return new ClearImageCacheResponse(true);
  }

  /**
   * Consolidates the library, moving all comics under the specified parent directory and using
   * given naming rules. Will delete comics marked for deletion as well.
   *
   * @param request the request body
   * @return the response body
   */
  @PostMapping(
      value = "/library/move",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint
  public ApiResponse<Void> moveComics(@RequestBody() MoveComicsRequest request) {
    final ApiResponse<Void> response = new ApiResponse<>();

    try {
      String targetDirectory = request.getTargetDirectory();
      String renamingRule = request.getRenamingRule();
      Boolean deletePhysicalFiles = request.getDeletePhysicalFiles();

      log.info("Moving comics: targetDirectory={}", targetDirectory);
      log.info("             : renamingRule={}", renamingRule);

      final MoveComicsWorkerTask task = this.moveComicsWorkerTaskObjectFactory.getObject();
      task.setDirectory(targetDirectory);
      task.setRenamingRule(renamingRule);

      this.taskManager.runTask(task);

      response.setSuccess(true);
    } catch (Exception error) {
      response.setSuccess(false);
      response.setError(error.getMessage());
      response.setThrowable(error);
    }

    return response;
  }
}
