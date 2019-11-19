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

import org.comixed.model.library.Comic;
import org.comixed.model.opds.OPDSBookmark;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ComicRepository;
import org.comixed.service.library.ComicException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * <code>OPDSBookmarkController</code> allows the remote agent request reading bookmark
 * and set reading bookmark of a book
 *
 * @author João França
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/user-api")
public class OPDSBookmarkController
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComiXedUserRepository userRepository;

    @Autowired private ComicRepository comicRepository;

    @GetMapping(value = "/bookmark", produces = MediaType.APPLICATION_JSON_VALUE)
    public OPDSBookmark getBookmark(@RequestParam("docId") long docId) throws ComicException{
        this.logger.debug("Getting book bookmark: id={}", docId);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ComiXedUser user = this.userRepository.findByEmail(email);

        if (user.getBookmark(docId).equalsIgnoreCase("0"))
            throw new ComicException("Bookmark Not Found");
        else {
            String mark =  user.getBookmark(docId);
            Optional<Comic> record = this.comicRepository.findById(docId);
            if (!record.isPresent())
            {
                this.logger.error("No such comic");
                throw new ComicException("Bookmark Not Found");
            }
            String totalPages = String.valueOf(record.get().getPageCount());
            return new OPDSBookmark(docId, mark , mark.equalsIgnoreCase(totalPages));
        }
    }

    @PutMapping(value = "/bookmark", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity setBookmark(@RequestParam("docId") long docId,
                                      @RequestBody() final OPDSBookmark opdsBookmark){
        this.logger.debug("Setting book bookmark: id={}", docId);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ComiXedUser user = this.userRepository.findByEmail(email);
        user.setBookmark(docId, opdsBookmark.getMark());
        this.userRepository.save(user);

        return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
    }
}