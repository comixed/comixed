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

package org.comixed.service.library;

import org.comixed.model.library.Comic;
import org.comixed.model.library.ReadingList;
import org.comixed.model.library.ReadingListEntry;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ReadingListRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReadingListService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired ReadingListRepository readingListRepository;
    @Autowired ComiXedUserRepository userRepository;
    @Autowired ComicService comicService;

    @Transactional
    public ReadingList createReadingList(final String email,
                                         final String name,
                                         final String summary,
                                         final List<Long> entries)
            throws
            ReadingListNameException {
        this.logger.info("Creating reading list: email={} name={}",
                         email,
                         name);

        this.logger.debug("Getting owner");
        final ComiXedUser owner = this.userRepository.findByEmail(email);
        ReadingList readingList = this.readingListRepository.findReadingListForUser(owner,
                                                                                    name);

        if (readingList != null) {
            throw new ReadingListNameException("Name already used: " + name);
        }

        this.logger.debug("Creating reading list object");
        readingList = new ReadingList();
        readingList.setOwner(owner);
        readingList.setName(name);
        readingList.setSummary(summary);

        loadComics(entries,
                   readingList);

        this.logger.debug("Saving reading list");
        return this.readingListRepository.save(readingList);
    }

    private void loadComics(final List<Long> entries,
                            final ReadingList readingList) {
        this.logger.debug("Adding comics to list");
        readingList.getEntries()
                   .clear();
        for (int index = 0;
             index < entries.size();
             index++) {
            final Long id = entries.get(index);
            this.logger.debug("Loading comic: id={}",
                              id);
            final Comic comic = this.comicService.getComic(id);
            readingList.getEntries()
                       .add(new ReadingListEntry(comic,
                                                 readingList));
        }
    }

    public List<ReadingList> getReadingListsForUser(final String email) {
        this.logger.info("Getting reading lists for user: email={}",
                         email);

        this.logger.debug("Getting owner");
        final ComiXedUser owner = this.userRepository.findByEmail(email);

        return this.readingListRepository.findAllReadingListsForUser(owner);
    }

    @Transactional
    public ReadingList updateReadingList(final String email,
                                         final long id,
                                         final String name,
                                         final String summary,
                                         final List<Long> entries)
            throws
            NoSuchReadingListException {
        this.logger.info("Updating reading list: owner={} id={} name={}",
                         email,
                         id,
                         name);

        this.logger.debug("Getting owner");
        final ComiXedUser owner = this.userRepository.findByEmail(email);

        this.logger.debug("Getting reading list");
        final Optional<ReadingList> readingList = this.readingListRepository.findById(id);

        if (!readingList.isPresent()) {
            throw new NoSuchReadingListException("No such reading list: id=" + id);
        }

        this.logger.debug("Updating reading list details");
        readingList.get()
                   .setName(name);
        readingList.get()
                   .setSummary(summary);

        loadComics(entries,
                   readingList.get());

        this.logger.debug("Updating reading list");
        return this.readingListRepository.save(readingList.get());
    }

    public ReadingList getReadingListForUser(final String email,
                                             final long id)
            throws
            NoSuchReadingListException {
        final ComiXedUser user = this.userRepository.findByEmail(email);
        final Optional<ReadingList> readingList = this.readingListRepository.findById(id);

        if (readingList.isPresent()) {
            final ComiXedUser owner = readingList.get()
                                                 .getOwner();

            if (owner.getId() == user.getId()) {
                return readingList.get();
            }

            throw new NoSuchReadingListException(
                    "User is not the owner: user id=" + user.getId() + " owner id=" + owner.getId());
        }

        throw new NoSuchReadingListException("Invalid reading list: id=" + id);
    }
}
