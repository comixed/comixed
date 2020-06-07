/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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
import org.comixed.model.library.ReadingList;
import org.comixed.net.AddComicsToReadingListRequest;
import org.comixed.net.AddComicsToReadingListResponse;
import org.comixed.net.CreateReadingListRequest;
import org.comixed.net.UpdateReadingListRequest;
import org.comixed.repositories.library.ReadingListRepository;
import org.comixed.service.comic.ComicException;
import org.comixed.service.library.NoSuchReadingListException;
import org.comixed.service.library.ReadingListException;
import org.comixed.service.library.ReadingListNameException;
import org.comixed.service.library.ReadingListService;
import org.comixed.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Log4j2
public class ReadingListController {
  @Autowired ReadingListRepository readingListRepository;
  @Autowired ReadingListService readingListService;

  @RequestMapping(value = "/lists", method = RequestMethod.POST)
  @JsonView(View.ReadingList.class)
  public ReadingList createReadingList(
      Principal principal, @RequestBody() CreateReadingListRequest request)
      throws NoSuchReadingListException, ReadingListNameException, ComicException {
    final String email = principal.getName();
    final String name = request.getName();
    final String summary = request.getSummary();

    this.log.info("Creating reading list for user: email={} name={}", email, name);

    return this.readingListService.createReadingList(email, name, summary);
  }

  @PutMapping(
      value = "/lists/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ReadingList.class)
  public ReadingList updateReadingList(
      Principal principal,
      @PathVariable("id") long id,
      @RequestBody() UpdateReadingListRequest request)
      throws NoSuchReadingListException, ComicException {
    final String email = principal.getName();
    final String name = request.getName();
    final String summary = request.getSummary();

    this.log.info(
        "Updating reading list for user: email={} id={} name={} summary={}",
        email,
        id,
        name,
        summary);

    return this.readingListService.updateReadingList(email, id, name, summary);
  }

  @RequestMapping(value = "/lists", method = RequestMethod.GET)
  @JsonView(View.ReadingList.class)
  public List<ReadingList> getReadingListsForUser(Principal principal, final Date lastUpdated) {
    if (principal == null) {
      return null;
    }
    final String email = principal.getName();

    this.log.info("Getting reading lists: user={}", email);

    final List<ReadingList> result =
        this.readingListService.getReadingListsForUser(email, lastUpdated);

    this.log.debug("Returning {} lists{}", result.size(), result.size() == 1 ? "" : "s");
    return result;
  }

  @GetMapping(value = "/lists/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ReadingList.class)
  public ReadingList getReadingList(final Principal principal, @PathVariable("id") final long id)
      throws NoSuchReadingListException {
    final String email = principal.getName();
    this.log.info("Getting reading list for user: email={} id={}", email, id);

    return this.readingListService.getReadingListForUser(email, id);
  }

  @PostMapping(
      value = "/lists/{id}/comics/add",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public AddComicsToReadingListResponse addComicsToList(
      Principal principal,
      @PathVariable("id") Long id,
      @RequestBody() AddComicsToReadingListRequest request)
      throws ReadingListException {
    String email = principal.getName();
    List<Long> ids = request.getIds();

    this.log.info(
        "Adding {} comic{} to the reading list for {}: id={}",
        ids.size(),
        ids.size() == 1 ? "" : "s",
        email,
        id);

    int count = this.readingListService.addComicsToList(email, id, ids);

    return new AddComicsToReadingListResponse(count);
  }
}
