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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.comixed.library.adaptors.archive.ArchiveAdaptorException;
import org.comixed.library.adaptors.archive.ZipArchiveAdaptor;
import org.comixed.library.model.*;
import org.comixed.library.model.comicvine.ComicVineIssue;
import org.comixed.library.model.comicvine.ComicVinePublisher;
import org.comixed.library.model.comicvine.ComicVineVolume;
import org.comixed.library.model.comicvine.ComicVineVolumeQueryCacheEntry;
import org.comixed.library.model.user.LastReadDate;
import org.comixed.repositories.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ImportExportControllerTest
{
    private static final byte[] TEST_ENCODED_VALUES = "This is just some set of encoded values".getBytes();
    private static final byte[] TEST_ENCODED_CONTENT = "This is the encoded content".getBytes();

    @InjectMocks
    private ImportExportController controller;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ObjectWriter objectWriter;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private Iterable<Comic> comicList;

    @Mock
    private PageRepository pageRepository;

    @Mock
    private List<Page> pageList;

    @Mock
    private ComiXedUserRepository userRepository;

    @Mock
    private List<ComiXedUser> userList;

    @Mock
    private BlockedPageHashRepository blockedPageRepository;

    @Mock
    Iterable<BlockedPageHash> blockedPageList;

    @Mock
    private LastReadDatesRepository lastReadDatesRepository;

    @Mock
    private List<LastReadDate> lastReadDatesList;

    @Mock
    private ComicVineIssueRepository comicVineIssueRepository;

    @Mock
    private List<ComicVineIssue> comicVineIssueList;

    @Mock
    private ComicVinePublisherRepository comicVinePublisherRepository;

    @Mock
    private List<ComicVinePublisher> comicVinePublisherList;

    @Mock
    private ComicVineVolumeQueryCacheRepository comicVineVolumeQueryCacheRepository;

    @Mock
    private List<ComicVineVolumeQueryCacheEntry> comicVineVolumeQueryCacheList;

    @Mock
    private ComicVineVolumeRepository comicVineVolumeRepository;

    @Mock
    private List<ComicVineVolume> comicVineVolumeList;

    @Mock
    private ZipArchiveAdaptor zipArchiveAdaptor;

    @Test
    public void testExportData() throws IOException, ArchiveAdaptorException
    {
        Mockito.when(comicRepository.findAll())
                .thenReturn(comicList);
        Mockito.when(pageRepository.findAll())
                .thenReturn(pageList);
        Mockito.when(userRepository.findAll())
                .thenReturn(userList);
        Mockito.when(blockedPageRepository.findAll())
                .thenReturn(blockedPageList);
        Mockito.when(lastReadDatesRepository.findAll())
                .thenReturn(lastReadDatesList);
        Mockito.when(comicVineIssueRepository.findAll())
                .thenReturn(comicVineIssueList);
        Mockito.when(comicVinePublisherRepository.findAll())
                .thenReturn(comicVinePublisherList);
        Mockito.when(comicVineVolumeQueryCacheRepository.findAll())
                .thenReturn(comicVineVolumeQueryCacheList);
        Mockito.when(comicVineVolumeRepository.findAll())
                .thenReturn(comicVineVolumeList);
        Mockito.when(objectMapper.writerWithView(Mockito.any()))
                .thenReturn(objectWriter);
        Mockito.when(objectWriter.writeValueAsBytes(Mockito.anyCollection()))
                .thenReturn(TEST_ENCODED_VALUES);
        Mockito.when(objectMapper.writeValueAsBytes(Mockito.any()))
                .thenReturn(TEST_ENCODED_VALUES);
        Mockito.when(zipArchiveAdaptor.encodeFileToStream(Mockito.anyMap()))
                .thenReturn(TEST_ENCODED_CONTENT);

        byte[] results = controller.exportData();

        assertNotNull(results);
        assertSame(TEST_ENCODED_CONTENT.length, results.length);

        Mockito.verify(objectMapper, Mockito.times(2))
                .writerWithView(View.DatabaseBackup.class);
        Mockito.verify(comicRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(userRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(blockedPageRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(lastReadDatesRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(comicVineIssueRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(comicVinePublisherRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(comicVineVolumeQueryCacheRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(comicVineIssueRepository, Mockito.times(1))
                .findAll();
        Mockito.verify(objectMapper, Mockito.times(2))
                .writerWithView(View.DatabaseBackup.class);
        Mockito.verify(objectWriter, Mockito.times(1))
                .writeValueAsBytes(comicList);
        Mockito.verify(objectWriter, Mockito.times(1))
                .writeValueAsBytes(pageList);
        Mockito.verify(objectMapper, Mockito.times(1))
                .writeValueAsBytes(userList);
        Mockito.verify(objectMapper, Mockito.times(1))
                .writeValueAsBytes(blockedPageList);
        Mockito.verify(objectMapper, Mockito.times(1))
                .writeValueAsBytes(lastReadDatesList);
        Mockito.verify(objectMapper, Mockito.times(1))
                .writeValueAsBytes(comicVineIssueList);
        Mockito.verify(objectMapper, Mockito.times(1))
                .writeValueAsBytes(comicVinePublisherList);
        Mockito.verify(objectMapper, Mockito.times(1))
                .writeValueAsBytes(comicVineVolumeQueryCacheList);
        Mockito.verify(objectMapper, Mockito.times(1))
                .writeValueAsBytes(comicVineVolumeList);
    }
}