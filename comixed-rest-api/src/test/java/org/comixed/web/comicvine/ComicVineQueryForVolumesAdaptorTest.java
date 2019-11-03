/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.web.comicvine;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;

import java.util.List;

import org.comixed.model.scraping.ComicVineVolumeQueryCacheEntry;
import org.comixed.repositories.ComicVineVolumeQueryCacheRepository;
import org.comixed.web.ComicVineQueryWebRequest;
import org.comixed.web.WebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.comixed.web.model.ScrapingVolume;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineQueryForVolumesAdaptorTest
{
    private static final String TEST_RESPONSE_CONTENT_TEXT = "This is the results";
    private static final String TEST_API_KEY = "12345";
    private static final String TEST_VOLUME_NAME = "Awesome Comic Title";
    private static final byte[] TEST_RESPONSE_CONTENT = TEST_RESPONSE_CONTENT_TEXT.getBytes();

    @InjectMocks
    private ComicVineQueryForVolumesAdaptor adaptor;

    @Mock
    private WebRequestProcessor webRequestProcessor;

    @Mock
    private ObjectFactory<ComicVineQueryWebRequest> webRequestFactory;

    @Mock
    private ComicVineQueryWebRequest webRequest;

    @Mock
    private ComicVineVolumesResponseProcessor queryResult;

    @Captor
    private ArgumentCaptor<List<ScrapingVolume>> comicVolumeList;

    @Mock
    private List<ComicVineVolumeQueryCacheEntry> queryEntries;

    @Mock
    private ComicVineVolumeQueryCacheEntry queryEntry;

    @Captor
    private ArgumentCaptor<ComicVineVolumeQueryCacheEntry> queryEntryCaptor;

    @Mock
    private ComicVineVolumeQueryCacheRepository queryRepository;

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteWebRequestProcessorRaisesException() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(queryRepository.findBySeriesNameOrderBySequence(Mockito.anyString())).thenReturn(null);
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
        Mockito.doNothing().when(webRequest).setSeriesName(Mockito.anyString());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class)))
               .thenThrow(new WebRequestException("expected"));

        try
        {
            adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME, false);
        }
        finally
        {
            Mockito.verify(queryRepository, Mockito.times(1)).findBySeriesNameOrderBySequence(TEST_VOLUME_NAME);
            Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
            Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
            Mockito.verify(webRequest, Mockito.times(1)).setSeriesName(TEST_VOLUME_NAME);
            Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
        }
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteResultProcessorRaisesException() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(queryRepository.findBySeriesNameOrderBySequence(Mockito.anyString())).thenReturn(null);
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
        Mockito.doNothing().when(webRequest).setSeriesName(Mockito.anyString());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT_TEXT);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class)))
               .thenThrow(new ComicVineAdaptorException("expected"));

        try
        {
            adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME, false);
        }
        finally
        {
            Mockito.verify(queryRepository, Mockito.times(1)).findBySeriesNameOrderBySequence(TEST_VOLUME_NAME);
            Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
            Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
            Mockito.verify(webRequest, Mockito.times(1)).setSeriesName(TEST_VOLUME_NAME);
            Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
            Mockito.verify(queryResult, Mockito.times(1)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
        }
    }

    @Test
    public void testExecute() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(queryRepository.findBySeriesNameOrderBySequence(Mockito.anyString())).thenReturn(null);
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
        Mockito.doNothing().when(webRequest).setSeriesName(Mockito.anyString());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT_TEXT);
        Mockito.when(queryRepository.save(queryEntryCaptor.capture())).thenReturn(queryEntry);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class))).thenReturn(true);

        List<ScrapingVolume> result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME, false);

        assertSame(comicVolumeList.getValue(), result);
        assertEquals(TEST_VOLUME_NAME, queryEntryCaptor.getValue().getSeriesName());
        assertEquals(TEST_RESPONSE_CONTENT_TEXT, queryEntryCaptor.getValue().getContent());

        Mockito.verify(queryRepository, Mockito.times(1)).findBySeriesNameOrderBySequence(TEST_VOLUME_NAME);
        Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
        Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
        Mockito.verify(webRequest, Mockito.times(1)).setSeriesName(TEST_VOLUME_NAME);
        Mockito.verify(webRequest, Mockito.never()).setPage(1);
        Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
        Mockito.verify(queryRepository, Mockito.times(1)).save(queryEntryCaptor.getValue());
        Mockito.verify(queryResult, Mockito.times(1)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
    }

    @Test
    public void testExecuteEntryInDatabase() throws ComicVineAdaptorException, WebRequestException
    {
        Mockito.when(queryRepository.findBySeriesNameOrderBySequence(Mockito.anyString())).thenReturn(queryEntries);
        Mockito.when(queryEntries.size()).thenReturn(1);
        Mockito.when(queryEntries.get(Mockito.anyInt())).thenReturn(queryEntry);
        Mockito.when(queryEntry.getAgeInDays()).thenReturn(ComicVineVolumeQueryCacheEntry.CACHE_TTL - 1);
        Mockito.when(queryEntry.getContent()).thenReturn(TEST_RESPONSE_CONTENT_TEXT);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class))).thenReturn(true);

        List<ScrapingVolume> result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME, false);

        assertSame(comicVolumeList.getValue(), result);

        Mockito.verify(queryRepository, Mockito.times(1)).findBySeriesNameOrderBySequence(TEST_VOLUME_NAME);
        Mockito.verify(queryEntries, Mockito.atLeast(1)).size();
        Mockito.verify(queryEntries, Mockito.times(2)).get(0);
        Mockito.verify(queryEntry, Mockito.times(1)).getAgeInDays();
        Mockito.verify(queryEntry, Mockito.times(1)).getContent();
        Mockito.verify(queryResult, Mockito.times(1)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
    }

    @Test
    public void testExecuteEntryInDatabaseSkipCache() throws ComicVineAdaptorException, WebRequestException
    {
        Mockito.when(queryRepository.findBySeriesNameOrderBySequence(Mockito.anyString())).thenReturn(queryEntries);
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
        Mockito.doNothing().when(webRequest).setSeriesName(Mockito.anyString());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT_TEXT);
        Mockito.doNothing().when(queryRepository).deleteAll(Mockito.anyCollection());
        Mockito.when(queryRepository.save(queryEntryCaptor.capture())).thenReturn(queryEntry);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class))).thenReturn(true);

        List<ScrapingVolume> result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME, true);

        assertSame(comicVolumeList.getValue(), result);
        assertEquals(TEST_VOLUME_NAME, queryEntryCaptor.getValue().getSeriesName());
        assertEquals(TEST_RESPONSE_CONTENT_TEXT, queryEntryCaptor.getValue().getContent());

        Mockito.verify(queryRepository, Mockito.times(1)).findBySeriesNameOrderBySequence(TEST_VOLUME_NAME);
        Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
        Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
        Mockito.verify(webRequest, Mockito.times(1)).setSeriesName(TEST_VOLUME_NAME);
        Mockito.verify(webRequest, Mockito.never()).setPage(1);
        Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
        Mockito.verify(queryRepository, Mockito.times(1)).deleteAll(queryEntries);
        Mockito.verify(queryRepository, Mockito.times(1)).save(queryEntryCaptor.getValue());
        Mockito.verify(queryResult, Mockito.times(1)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
    }

    @Test
    public void testExecuteEntryInDatabaseExpired() throws ComicVineAdaptorException, WebRequestException
    {
        Mockito.when(queryRepository.findBySeriesNameOrderBySequence(Mockito.anyString())).thenReturn(queryEntries);
        Mockito.when(queryEntries.isEmpty()).thenReturn(false);
        Mockito.when(queryEntries.size()).thenReturn(1);
        Mockito.when(queryEntries.get(Mockito.anyInt())).thenReturn(queryEntry);
        Mockito.when(queryEntry.getAgeInDays()).thenReturn(ComicVineVolumeQueryCacheEntry.CACHE_TTL);
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
        Mockito.doNothing().when(webRequest).setSeriesName(Mockito.anyString());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT_TEXT);
        Mockito.doNothing().when(queryRepository).deleteAll(Mockito.anyCollection());
        Mockito.when(queryRepository.save(queryEntryCaptor.capture())).thenReturn(queryEntry);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class))).thenReturn(true);

        List<ScrapingVolume> result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME, false);

        assertSame(comicVolumeList.getValue(), result);
        assertEquals(TEST_VOLUME_NAME, queryEntryCaptor.getValue().getSeriesName());
        assertEquals(TEST_RESPONSE_CONTENT_TEXT, queryEntryCaptor.getValue().getContent());

        Mockito.verify(queryRepository, Mockito.times(1)).findBySeriesNameOrderBySequence(TEST_VOLUME_NAME);
        Mockito.verify(queryEntries, Mockito.atLeast(2)).isEmpty();
        Mockito.verify(queryEntries, Mockito.atLeast(1)).size();
        Mockito.verify(queryEntries, Mockito.times(1)).get(0);
        Mockito.verify(queryEntry, Mockito.atLeast(1)).getAgeInDays();
        Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
        Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
        Mockito.verify(webRequest, Mockito.times(1)).setSeriesName(TEST_VOLUME_NAME);
        Mockito.verify(webRequest, Mockito.never()).setPage(1);
        Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
        Mockito.verify(queryRepository, Mockito.times(1)).deleteAll(queryEntries);
        Mockito.verify(queryRepository, Mockito.times(1)).save(queryEntryCaptor.getValue());
        Mockito.verify(queryResult, Mockito.times(1)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
    }

    @Test
    public void testExecuteWithMultiplePages() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(queryRepository.findBySeriesNameOrderBySequence(Mockito.anyString())).thenReturn(null);
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
        Mockito.doNothing().when(webRequest).setSeriesName(Mockito.anyString());
        Mockito.doNothing().when(webRequest).setPage(Mockito.anyInt());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT_TEXT);
        Mockito.when(queryRepository.save(queryEntryCaptor.capture())).thenReturn(queryEntry);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class))).thenReturn(false, true);

        List<ScrapingVolume> result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME, false);

        assertSame(comicVolumeList.getValue(), result);

        Mockito.verify(queryRepository, Mockito.times(1)).findBySeriesNameOrderBySequence(TEST_VOLUME_NAME);
        Mockito.verify(webRequestFactory, Mockito.times(2)).getObject();
        Mockito.verify(webRequest, Mockito.times(2)).setApiKey(TEST_API_KEY);
        Mockito.verify(webRequest, Mockito.times(2)).setSeriesName(TEST_VOLUME_NAME);
        Mockito.verify(webRequest, Mockito.never()).setPage(1);
        Mockito.verify(webRequest, Mockito.times(1)).setPage(2);
        Mockito.verify(webRequestProcessor, Mockito.times(2)).execute(webRequest);
        Mockito.verify(queryRepository, Mockito.times(1)).save(queryEntryCaptor.getValue());
        Mockito.verify(queryResult, Mockito.times(2)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
    }
}
