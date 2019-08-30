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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.model.library.ReadingList;
import org.comixed.net.UpdateReadingListRequest;
import org.comixed.repositories.ReadingListRepository;
import org.comixed.service.library.NoSuchReadingListException;
import org.comixed.service.library.ReadingListNameException;
import org.comixed.service.library.ReadingListService;
import org.comixed.views.View;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReadingListController {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired ReadingListRepository readingListRepository;
    @Autowired ReadingListService readingListService;

    @RequestMapping(value = "/lists",
                    method = RequestMethod.POST)
    @JsonView(View.ReadingList.class)
    public ReadingList createReadingList(Principal principal,
                                         @RequestParam("name")
                                                 String name,
                                         @RequestParam("summary")
                                                 String summary,
                                         @RequestParam("entries")
                                                 List<Long> entries)
            throws
            NoSuchReadingListException,
            ReadingListNameException {
        final String email = principal.getName();

        this.logger.info("Creating reading list for user: email={} name={}",
                         email,
                         name);

        return this.readingListService.createReadingList(email,
                                                         name,
                                                         summary,
                                                         entries);
    }

    @PutMapping(value = "/lists/{id}",
                produces = "application/json",
                consumes = "application/json")
    @JsonView(View.ReadingList.class)
    public ReadingList updateReadingList(Principal principal,
                                         @PathVariable("id")
                                                 long id,
                                         @RequestBody()
                                                 UpdateReadingListRequest request)
            throws
            NoSuchReadingListException {
        final String email = principal.getName();
        final String name = request.getName();
        final String summary = request.getSummary();
        final List<Long> entries = request.getEntries();

        this.logger.info("Updating reading list for user: email={} id={} name={} summary={}",
                         email,
                         id,
                         name,
                         summary);

        return this.readingListService.updateReadingList(email,
                                                         id,
                                                         name,
                                                         summary,
                                                         entries);
    }

    @RequestMapping(value = "/lists",
                    method = RequestMethod.GET)
    @JsonView(View.ReadingList.class)
    public List<ReadingList> getReadingListsForUser(Principal principal) {
        if (principal == null) {
            return null;
        }
        final String email = principal.getName();

        this.logger.info("Getting reading lists: user={}",
                         email);

        final List<ReadingList> result = this.readingListService.getReadingListsForUser(email);

        this.logger.debug("Returning {} lists{}",
                          result.size(),
                          result.size() == 1
                          ? ""
                          : "s");
        return result;
    }

    @GetMapping(value = "/lists/{id}",
                produces = "application/json")
    @JsonView(View.ReadingList.class)
    public ReadingList getReadingList(final Principal principal,
                                      @PathVariable("id")
                                      final long id)
            throws
            NoSuchReadingListException {
        final String email = principal.getName();
        this.logger.info("Getting reading list for user: email={} id={}",
                         email,
                         id);

        return this.readingListService.getReadingListForUser(email,
                                                             id);
    }
}
