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

package org.comixed.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import java.security.Principal;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.comic.Comic;
import org.comixed.model.library.ReadingList;
import org.comixed.model.user.LastReadDate;
import org.comixed.net.*;
import org.comixed.service.comic.ComicService;
import org.comixed.service.library.LibraryException;
import org.comixed.service.library.LibraryService;
import org.comixed.service.library.ReadingListService;
import org.comixed.service.user.ComiXedUserException;
import org.comixed.service.user.UserService;
import org.comixed.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api")
@Log4j2
public class LibraryController {
  @Autowired private LibraryService libraryService;
  @Autowired private ComicService comicService;
  @Autowired private UserService userService;
  @Autowired private ReadingListService readingListService;

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
    this.log.info(
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
        this.log.debug("More updates are waiting");
        moreUpdates = true;
        this.log.debug("Removing last comic from result set");
        comics.remove(comics.size() - 1);
      }

      this.log.debug("Getting processing count");
      processingCount = this.libraryService.getProcessingCount();

      if (!comics.isEmpty()) {
        this.log.debug("{} update{} loaded", comics.size(), comics.size() == 1 ? "" : "s");
        lastComicId = comics.get(comics.size() - 1).getId();
        mostRecentUpdate = comics.get(comics.size() - 1).getDateLastUpdated();
        done = true;
      } else if (System.currentTimeMillis() > expire) {
        this.log.debug("Timeout reached");
        done = true;
      } else {
        this.log.debug("Sleeping 1000ms");
        try {
          Thread.sleep(1000L);
        } catch (InterruptedException error) {
          this.log.error("error while waiting for updates", error);
          Thread.currentThread().interrupt();
        }
      }
    }

    this.log.debug("Loading updated last read dates");
    List<LastReadDate> lastReadDates =
        this.libraryService.getLastReadDatesSince(email, latestUpdateDate);

    this.log.debug("Getting updated reading lists");
    List<ReadingList> readingLists =
        this.readingListService.getReadingListsForUser(email, latestUpdateDate);

    this.log.debug("Returning result");
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
    boolean renamePages = request.getRenamePages();

    this.log.info(
        "Converting {} comic{} to {}{}",
        idList.size(),
        idList.size() == 1 ? "" : "s",
        archiveType,
        renamePages ? " (rename pages)" : "");

    this.libraryService.convertComics(idList, archiveType, renamePages);
  }

  @PostMapping(
      value = "/library/consolidate",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DeletedComicList.class)
  public List<Comic> consolidateLibrary(@RequestBody() ConsolidateLibraryRequest request) {
    this.log.info(
        "Consolidating library: delete physic files={}", request.getDeletePhysicalFiles());
    return this.libraryService.consolidateLibrary(request.getDeletePhysicalFiles());
  }

  @DeleteMapping(value = "/library/cache/images")
  public ClearImageCacheResponse clearImageCache() {
    this.log.info("Clearing the image cache");

    try {
      this.libraryService.clearImageCache();
    } catch (LibraryException error) {
      this.log.error("failed to clear image cache", error);
      return new ClearImageCacheResponse(false);
    }

    return new ClearImageCacheResponse(true);
  }
}
