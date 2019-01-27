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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.controllers;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import java.util.Optional;

import org.comixed.library.model.Comic;
import org.comixed.repositories.ComicRepository;
import org.comixed.web.WebRequestException;
import org.comixed.web.comicvine.ComicVineAdaptorException;
import org.comixed.web.comicvine.ComicVineQueryForIssueAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForIssueDetailsAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForPublisherDetailsAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForVolumeDetailsAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForVolumesAdaptor;
import org.comixed.web.model.ComicIssue;
import org.comixed.web.model.ComicVolume;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicVineScraperControllerTest
{
    private static final String TEST_API_KEY = "12345";
    private static final String TEST_SERIES_NAME = "Awesome Comic";
    private static final String TEST_VOLUME = "2018";
    private static final String TEST_ISSUE_NUMBER = "15";
    private static final long TEST_COMIC_ID = 213L;
    private static final String TEST_ISSUE_ID = "48132";
    private static final String TEST_VOLUME_ID = "23184";
    private static final String TEST_PUBLISHER_ID = "8213";

    @InjectMocks
    private ComicVineScraperController controller;

    @Mock
    private ComicVineQueryForVolumesAdaptor queryForVolumesAdaptor;

    @Mock
    private ComicVineQueryForIssueAdaptor queryForIssueAdaptor;

    @Mock
    private ComicVineQueryForIssueDetailsAdaptor queryForIssueDetailsAdaptor;

    @Mock
    private ComicVineQueryForVolumeDetailsAdaptor queryForVolumeDetailsAdaptor;

    @Mock
    private ComicVineQueryForPublisherDetailsAdaptor queryForPublisherDetailsAdaptor;

    @Mock
    private List<ComicVolume> comicVolumeList;

    @Mock
    private ComicIssue comicIssue;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private Optional<Comic> queryResultComic;

    @Mock
    private Comic comic;

    @Test(expected = ComicVineAdaptorException.class)
    public void testQueryForVolumesAdaptorRaisesException() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(queryForVolumesAdaptor.execute(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
               .thenThrow(new ComicVineAdaptorException("expected"));

        try
        {
            controller.queryForVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER, false);
        }
        finally
        {
            Mockito.verify(queryForVolumesAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_SERIES_NAME, false);
        }
    }

    @Test
    public void testQueryForVolumes() throws ComicVineAdaptorException, WebRequestException
    {
        Mockito.when(queryForVolumesAdaptor.execute(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
               .thenReturn(comicVolumeList);

        List<ComicVolume> result = controller.queryForVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_VOLUME,
                                                              TEST_ISSUE_NUMBER, false);

        assertSame(comicVolumeList, result);

        Mockito.verify(queryForVolumesAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_SERIES_NAME, false);
    }

    @Test
    public void testQueryForVolumesSkipCache() throws ComicVineAdaptorException, WebRequestException
    {
        Mockito.when(queryForVolumesAdaptor.execute(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
               .thenReturn(comicVolumeList);

        List<ComicVolume> result = controller.queryForVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_VOLUME,
                                                              TEST_ISSUE_NUMBER, true);

        assertSame(comicVolumeList, result);

        Mockito.verify(queryForVolumesAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_SERIES_NAME, true);
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testQueryForIssueAdaptorRaisesException() throws ComicVineAdaptorException
    {
        Mockito.when(queryForIssueAdaptor.execute(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
               .thenThrow(new ComicVineAdaptorException("expected"));

        try
        {
            controller.queryForIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER);
        }
        finally
        {
            Mockito.verify(queryForIssueAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_VOLUME,
                                                                           TEST_ISSUE_NUMBER);
        }
    }

    @Test
    public void testQueryForIssue() throws ComicVineAdaptorException
    {
        Mockito.when(queryForIssueAdaptor.execute(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
               .thenReturn(comicIssue);

        ComicIssue result = controller.queryForIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER);

        assertNotNull(result);
        assertSame(comicIssue, result);

        Mockito.verify(queryForIssueAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER);
    }

    @Test
    public void testScrapeAndSaveComicDetailsNoSuchComic() throws ComicVineAdaptorException
    {
        Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(queryResultComic);
        Mockito.when(queryResultComic.get()).thenReturn(null);

        controller.scrapeAndSaveComicDetails(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, false);

        Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
        Mockito.verify(queryResultComic, Mockito.times(1)).get();
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testScrapeAndSaveComicIssueDetailsAdaptorRaisesException() throws ComicVineAdaptorException
    {
        Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(queryResultComic);
        Mockito.when(queryResultComic.get()).thenReturn(comic);
        Mockito.doThrow(new ComicVineAdaptorException("expected")).when(queryForIssueDetailsAdaptor)
               .execute(Mockito.anyString(), Mockito.anyLong(), Mockito.anyString(), Mockito.any(Comic.class),
                        Mockito.anyBoolean());

        try
        {
            controller.scrapeAndSaveComicDetails(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, false);
        }
        finally
        {
            Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
            Mockito.verify(queryResultComic, Mockito.times(1)).get();
            Mockito.verify(queryForIssueDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_COMIC_ID,
                                                                                  TEST_ISSUE_ID, comic, false);
        }
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testScrapeAndSaveComicVolumeDetailsAdaptorRaisesException() throws ComicVineAdaptorException
    {
        Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(queryResultComic);
        Mockito.when(queryResultComic.get()).thenReturn(comic);
        Mockito.when(queryForIssueDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyLong(), Mockito.anyString(),
                                                         Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_VOLUME_ID);
        Mockito.doThrow(new ComicVineAdaptorException("expected")).when(queryForVolumeDetailsAdaptor)
               .execute(Mockito.anyString(), Mockito.anyString(), Mockito.any(Comic.class), Mockito.anyBoolean());

        try
        {
            controller.scrapeAndSaveComicDetails(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, false);
        }
        finally
        {
            Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
            Mockito.verify(queryResultComic, Mockito.times(1)).get();
            Mockito.verify(queryForIssueDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_COMIC_ID,
                                                                                  TEST_ISSUE_ID, comic, false);
            Mockito.verify(queryForVolumeDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_VOLUME_ID, comic,
                                                                                   false);
        }
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testScrapeAndSaveComicPublisherDetailsAdaptorRaisesException() throws ComicVineAdaptorException
    {
        Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(queryResultComic);
        Mockito.when(queryResultComic.get()).thenReturn(comic);
        Mockito.when(queryForIssueDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyLong(), Mockito.anyString(),
                                                         Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_VOLUME_ID);
        Mockito.when(queryForVolumeDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyString(),
                                                          Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_PUBLISHER_ID);
        Mockito.doThrow(new ComicVineAdaptorException("expected")).when(queryForPublisherDetailsAdaptor)
               .execute(Mockito.anyString(), Mockito.anyString(), Mockito.any(Comic.class), Mockito.anyBoolean());

        try
        {
            controller.scrapeAndSaveComicDetails(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, false);
        }
        finally
        {
            Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
            Mockito.verify(queryResultComic, Mockito.times(1)).get();
            Mockito.verify(queryForIssueDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_COMIC_ID,
                                                                                  TEST_ISSUE_ID, comic, false);
            Mockito.verify(queryForVolumeDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_VOLUME_ID, comic,
                                                                                   false);
            Mockito.verify(queryForPublisherDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_PUBLISHER_ID,
                                                                                      comic, false);
        }
    }

    @Test
    public void testScrapeAndSaveComicDetails() throws ComicVineAdaptorException
    {
        Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(queryResultComic);
        Mockito.when(queryResultComic.get()).thenReturn(comic);
        Mockito.when(queryForIssueDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyLong(), Mockito.anyString(),
                                                         Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_VOLUME_ID);
        Mockito.when(queryForVolumeDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyString(),
                                                          Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_PUBLISHER_ID);
        Mockito.when(queryForVolumeDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyString(),
                                                          Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_PUBLISHER_ID);
        Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

        Comic result = controller.scrapeAndSaveComicDetails(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, false);

        assertNotNull(result);
        assertSame(comic, result);

        Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
        Mockito.verify(queryResultComic, Mockito.times(1)).get();
        Mockito.verify(queryForIssueDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_COMIC_ID,
                                                                              TEST_ISSUE_ID, comic, false);
        Mockito.verify(queryForVolumeDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_VOLUME_ID, comic,
                                                                               false);
        Mockito.verify(queryForPublisherDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_PUBLISHER_ID,
                                                                                  comic, false);
        Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    }

    @Test
    public void testScrapeAndSaveComicDetailsSkipCache() throws ComicVineAdaptorException
    {
        Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(queryResultComic);
        Mockito.when(queryResultComic.get()).thenReturn(comic);
        Mockito.when(queryForIssueDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyLong(), Mockito.anyString(),
                                                         Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_VOLUME_ID);
        Mockito.when(queryForVolumeDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyString(),
                                                          Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_PUBLISHER_ID);
        Mockito.when(queryForVolumeDetailsAdaptor.execute(Mockito.anyString(), Mockito.anyString(),
                                                          Mockito.any(Comic.class), Mockito.anyBoolean()))
               .thenReturn(TEST_PUBLISHER_ID);
        Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

        Comic result = controller.scrapeAndSaveComicDetails(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, true);

        assertNotNull(result);
        assertSame(comic, result);

        Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
        Mockito.verify(queryResultComic, Mockito.times(1)).get();
        Mockito.verify(queryForIssueDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_COMIC_ID,
                                                                              TEST_ISSUE_ID, comic, true);
        Mockito.verify(queryForVolumeDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_VOLUME_ID, comic,
                                                                               true);
        Mockito.verify(queryForPublisherDetailsAdaptor, Mockito.times(1)).execute(TEST_API_KEY, TEST_PUBLISHER_ID,
                                                                                  comic, true);
        Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    }
}
