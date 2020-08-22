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

package org.comixedproject.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import java.security.Principal;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.net.*;
import org.comixedproject.repositories.library.ReadingListRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.library.NoSuchReadingListException;
import org.comixedproject.service.library.ReadingListException;
import org.comixedproject.service.library.ReadingListNameException;
import org.comixedproject.service.library.ReadingListService;
import org.comixedproject.views.View;
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

    log.info("Creating reading list for user: email={} name={}", email, name);

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

    log.info(
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

    log.info("Getting reading lists: user={}", email);

    final List<ReadingList> result =
        this.readingListService.getReadingListsForUser(email, lastUpdated);

    log.debug("Returning {} lists{}", result.size(), result.size() == 1 ? "" : "s");
    return result;
  }

  @GetMapping(value = "/lists/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ReadingList.class)
  public ReadingList getReadingList(final Principal principal, @PathVariable("id") final long id)
      throws NoSuchReadingListException {
    final String email = principal.getName();
    log.info("Getting reading list for user: email={} id={}", email, id);

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
    List<Long> comicIds = request.getIds();

    log.info(
        "Adding {} comic{} to the reading list for {}: id={}",
        comicIds.size(),
        comicIds.size() == 1 ? "" : "s",
        email,
        id);

    int count = this.readingListService.addComicsToList(email, id, comicIds);

    return new AddComicsToReadingListResponse(count);
  }

  @PostMapping(
      value = "/lists/{id}/comics/remove",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public RemoveComicsFromReadingListResponse removeComicsFromList(
      Principal principal,
      @PathVariable("id") long id,
      @RequestBody() RemoveComicsFromReadingListRequest request)
      throws ReadingListException {
    String email = principal.getName();
    List<Long> comicIds = request.getIds();

    log.info(
        "Removing {} comic{} from the reading list for {}: id={}",
        comicIds.size(),
        comicIds.size() == 1 ? "" : "s",
        email,
        id);

    int count = this.readingListService.removeComicsFromList(email, id, comicIds);

    return new RemoveComicsFromReadingListResponse(count);
  }
}
