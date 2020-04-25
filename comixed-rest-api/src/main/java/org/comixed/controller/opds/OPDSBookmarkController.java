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

package org.comixed.controller.opds;

import lombok.extern.log4j.Log4j2;
import org.comixed.model.comic.Comic;
import org.comixed.model.opds.OPDSBookmark;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.service.comic.ComicException;
import org.comixed.service.comic.ComicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * <code>OPDSBookmarkController</code> allows the remote agent request reading bookmark and set
 * reading bookmark of a book
 *
 * @author João França
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/user-api")
@Log4j2
public class OPDSBookmarkController {
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private ComicService comicService;

  @GetMapping(value = "/bookmark", produces = MediaType.APPLICATION_JSON_VALUE)
  public OPDSBookmark getBookmark(@RequestParam("docId") long comicId) throws ComicException {
    this.log.debug("Loading comic: id={}", comicId);
    final Comic comic = this.comicService.getComic(comicId);
    if (comic == null) {
      throw new ComicException("No such comic: id=" + comicId);
    }

    this.log.debug("Getting book bookmark: id={}", comicId);
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    ComiXedUser user = this.userRepository.findByEmail(email);
    final String bookmark = user.getBookmark(comic);

    if (bookmark == null) throw new ComicException("Bookmark Not Found");
    else {
      String totalPages = String.valueOf(comic.getPageCount());
      return new OPDSBookmark(comic.getId(), bookmark, bookmark.equals(totalPages));
    }
  }

  @PutMapping(value = "/bookmark", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity setBookmark(
      @RequestParam("docId") long comicId, @RequestBody() final OPDSBookmark opdsBookmark)
      throws ComicException {
    this.log.debug("Loading comic: id={}", comicId);
    final Comic comic = this.comicService.getComic(comicId);

    if (comic == null) {
      throw new ComicException("No such comic: id=" + comicId);
    }

    this.log.debug("Setting book bookmark: id={}", comicId);

    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    ComiXedUser user = this.userRepository.findByEmail(email);
    user.setBookmark(comic, opdsBookmark.getMark());
    this.userRepository.save(user);

    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
  }
}
