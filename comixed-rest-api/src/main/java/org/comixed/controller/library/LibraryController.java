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
import org.comixed.model.library.Comic;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.comixed.net.GetComicsRequest;
import org.comixed.net.GetComicsResponse;
import org.comixed.service.library.ComicService;
import org.comixed.service.library.LibraryService;
import org.comixed.service.user.ComiXedUserException;
import org.comixed.service.user.UserService;
import org.comixed.views.View;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api")
public class LibraryController {
  private static final boolean TEST_ASCENDING = true;

  protected final Logger log = LoggerFactory.getLogger(this.getClass());

  @Autowired private LibraryService libraryService;
  @Autowired private ComicService comicService;
  @Autowired private UserService userService;

  @PostMapping(
      value = "/library",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicList.class)
  public GetComicsResponse getComics(
      Principal principal, @RequestBody() final GetComicsRequest request)
      throws ComiXedUserException {
    final ComiXedUser user = this.userService.findByEmail(principal.getName());

    this.log.info(
        "Getting comics: user={} page={} count={} sortField={} order={}",
        user.getEmail(),
        request.getPage(),
        request.getCount(),
        request.getSortField(),
        request.isAscending() ? "Ascending" : "Descending");

    this.log.debug("Fetching comics");
    final List<Comic> comics =
        this.libraryService.getComics(
            request.getPage(), request.getCount(), request.getSortField(), request.isAscending());
    this.log.debug("Found {} comic{}", comics.size(), comics.size() == 1 ? "" : "s");

    this.log.debug("Fetching last read dates");
    final List<LastReadDate> lastReadDates = this.comicService.getLastReadDates(comics, user);
    this.log.debug(
        "Found {} entr{}", lastReadDates.size(), lastReadDates.size() == 1 ? "y" : "ies");

    this.log.debug("Getting latest updated date");
    final Date latestUpdatedDate = this.libraryService.getLatestUpdatedDate();
    this.log.debug("Received {}", latestUpdatedDate);

    this.log.debug("Getting comic count");
    final long comicCount = this.libraryService.getComicCount();
    this.log.debug("There are {} comic{}", comicCount, comicCount == 1 ? "" : "s");

    this.log.debug("Returning response");
    return new GetComicsResponse(comics, lastReadDates, latestUpdatedDate, comicCount);
  }
}
