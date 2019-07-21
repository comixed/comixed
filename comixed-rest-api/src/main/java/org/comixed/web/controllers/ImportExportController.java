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

package org.comixed.web.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.comixed.views.View;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.adaptors.archive.ZipArchiveAdaptor;
import org.comixed.model.scraping.ComicVineIssue;
import org.comixed.model.scraping.ComicVinePublisher;
import org.comixed.model.scraping.ComicVineVolume;
import org.comixed.model.scraping.ComicVineVolumeQueryCacheEntry;
import org.comixed.model.library.BlockedPageHash;
import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.comixed.model.user.LastReadDate;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/data")
public class ImportExportController implements InitializingBean
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private ComiXedUserRepository userRepository;

    @Autowired
    private BlockedPageHashRepository blockedPageRepository;

    @Autowired
    private LastReadDatesRepository lastReadDatesRepository;

    @Autowired
    private ComicVineIssueRepository comicVineIssueRepository;

    @Autowired
    private ComicVinePublisherRepository comicVinePublisherRepository;

    @Autowired
    private ComicVineVolumeQueryCacheRepository comicVineVolumeQueryCacheRepository;

    @Autowired
    private ComicVineVolumeRepository comicVineVolumeRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ZipArchiveAdaptor zipArchiveAdaptor;

    /**
     * Returns the contents of the database as a string.
     * <p>
     * The result are broken up into multiplate files:
     * <ol>
     * <li><strong>users.json</strong> The system user list.</li>
     * <li><strong>comics.json</strong> The comics, including their pages, in the library.</li>
     * </ol>
     *
     * @return the zip encoded data
     *
     * @throws JsonProcessingException
     *         if a JSON encoding error occurs
     * @throws ArchiveAdaptorException
     *         if an archive encoding error occurs
     */
    @RequestMapping(value = "/export", method = RequestMethod.GET)
    public byte[] exportData() throws JsonProcessingException, ArchiveAdaptorException
    {
        this.logger.debug("Exporting data...");

        Map<String, byte[]> entries = new HashMap<>();

        this.logger.debug("Adding comics to result");
        Iterable<Comic> comics = this.comicRepository.findAll();
        entries.put("comics.json", objectMapper.writerWithView(View.DatabaseBackup.class)
                .writeValueAsBytes(comics));

        this.logger.debug("Adding pages to result");
        Iterable<Page> pages = this.pageRepository.findAll();
        entries.put("pages.json", objectMapper.writerWithView(View.DatabaseBackup.class)
                .writeValueAsBytes(pages));

        this.logger.debug("Adding users to result");
        List<ComiXedUser> users = this.userRepository.findAll();
        entries.put("users.json", objectMapper.writeValueAsBytes(users));

        this.logger.debug("Adding blocked pages to result");
        Iterable<BlockedPageHash> blockedPages = this.blockedPageRepository.findAll();
        entries.put("blocked-pages.json", objectMapper.writeValueAsBytes(blockedPages));

        this.logger.debug("Adding last read dates to result");
        Iterable<LastReadDate> lastReadDates = this.lastReadDatesRepository.findAll();
        entries.put("last-read-dates.json", objectMapper.writeValueAsBytes(lastReadDates));

        this.logger.debug("Adding comic vine issues to result");
        Iterable<ComicVineIssue> comicVineIssues = this.comicVineIssueRepository.findAll();
        entries.put("comic-vine-issues.json", objectMapper.writeValueAsBytes(comicVineIssues));

        this.logger.debug("Adding comic vine publishers to result");
        Iterable<ComicVinePublisher> comicVinePublishers = this.comicVinePublisherRepository.findAll();
        entries.put("comic-vine-publishers.json", objectMapper.writeValueAsBytes(comicVinePublishers));

        this.logger.debug("Adding comic vine volume cache to result");
        Iterable<ComicVineVolumeQueryCacheEntry> comicVineVolumeQueryEntries = this.comicVineVolumeQueryCacheRepository.findAll();
        entries.put("comic-vine-volume-query-entries.json", objectMapper.writeValueAsBytes(comicVineVolumeQueryEntries));

        this.logger.debug("Adding comic vine volumes to result");
        Iterable<ComicVineVolume> comicVineVolumes = this.comicVineVolumeRepository.findAll();
        entries.put("comic-vine-volumes.json", objectMapper.writeValueAsBytes(comicVineVolumes));

        byte[] result = this.zipArchiveAdaptor.encodeFileToStream(entries);

        this.logger.debug("Return {} bytes as content", result.length);

        return result;
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.objectMapper.disable(MapperFeature.DEFAULT_VIEW_INCLUSION);
    }
}
