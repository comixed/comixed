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

package org.comixed.web.comicvine;

import static org.junit.Assert.assertEquals;

import org.comixed.model.library.Comic;
import org.comixed.model.scraping.ComicVinePublisher;
import org.comixed.repositories.ComicVinePublisherRepository;
import org.comixed.web.ComicVinePublisherDetailsWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
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
public class ComicVineQueryForPublisherDetailsAdaptorTest
{
    private static final String TEST_CONTENT_TEXT = "The response body";
    private static final String TEST_API_KEY = "12345";
    private static final byte[] TEST_CONTENT = TEST_CONTENT_TEXT.getBytes();
    private static final String TEST_PUBLISHER_ID = "92134";

    @InjectMocks
    private ComicVineQueryForPublisherDetailsAdaptor adaptor;

    @Mock
    private WebRequestProcessor webRequestProcessor;

    @Mock
    private ObjectFactory<ComicVinePublisherDetailsWebRequest> requestFactory;

    @Mock
    private ComicVinePublisherDetailsWebRequest request;

    @Mock
    private Comic comic;

    @Mock
    private ComicVinePublisherDetailsResponseProcessor contentProcessor;

    @Mock
    private ComicVinePublisher comicVinePublisher;

    @Captor
    private ArgumentCaptor<ComicVinePublisher> comicVinePublisherCaptor;

    @Mock
    private ComicVinePublisherRepository comicVinePublisherRepository;

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteWebRequestProcessorRaisesException() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(comicVinePublisherRepository.findByPublisherId(Mockito.anyString())).thenReturn(null);
        Mockito.when(requestFactory.getObject()).thenReturn(request);
        Mockito.when(webRequestProcessor.execute(Mockito.any())).thenThrow(new WebRequestException("expected"));

        try
        {
            adaptor.execute(TEST_API_KEY, TEST_PUBLISHER_ID, comic, false);
        }
        finally
        {
            Mockito.verify(comicVinePublisherRepository, Mockito.times(1)).findByPublisherId(TEST_PUBLISHER_ID);
            Mockito.verify(requestFactory, Mockito.times(1)).getObject();
            Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
        }
    }

    @Test
    public void testExecute() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(comicVinePublisherRepository.findByPublisherId(Mockito.anyString())).thenReturn(null);
        Mockito.when(requestFactory.getObject()).thenReturn(request);
        Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_CONTENT_TEXT);
        Mockito.when(comicVinePublisherRepository.save(comicVinePublisherCaptor.capture()))
               .thenReturn(comicVinePublisher);
        Mockito.doNothing().when(contentProcessor).process(Mockito.any(byte[].class), Mockito.any(Comic.class));

        adaptor.execute(TEST_API_KEY, TEST_PUBLISHER_ID, comic, false);

        assertEquals(comicVinePublisherCaptor.getValue().getPublisherId(), TEST_PUBLISHER_ID);
        assertEquals(comicVinePublisherCaptor.getValue().getContent(), TEST_CONTENT_TEXT);

        Mockito.verify(comicVinePublisherRepository, Mockito.times(1)).findByPublisherId(TEST_PUBLISHER_ID);
        Mockito.verify(requestFactory, Mockito.times(1)).getObject();
        Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
        Mockito.verify(comicVinePublisherRepository, Mockito.times(1)).save(comicVinePublisherCaptor.getValue());
        Mockito.verify(contentProcessor, Mockito.times(1)).process(TEST_CONTENT, comic);
    }

    @Test
    public void testExecutePublisherInDatabase() throws ComicVineAdaptorException
    {
        Mockito.when(comicVinePublisherRepository.findByPublisherId(Mockito.anyString()))
               .thenReturn(comicVinePublisher);
        Mockito.when(comicVinePublisher.getContent()).thenReturn(TEST_CONTENT_TEXT);
        Mockito.doNothing().when(contentProcessor).process(Mockito.any(byte[].class), Mockito.any(Comic.class));

        adaptor.execute(TEST_API_KEY, TEST_PUBLISHER_ID, comic, false);

        Mockito.verify(comicVinePublisherRepository, Mockito.times(1)).findByPublisherId(TEST_PUBLISHER_ID);
        Mockito.verify(comicVinePublisher, Mockito.times(1)).getContent();
        Mockito.verify(contentProcessor, Mockito.times(1)).process(TEST_CONTENT, comic);
    }

    @Test
    public void testExecutePublisherInDatabaseSkipCache() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(comicVinePublisherRepository.findByPublisherId(Mockito.anyString()))
               .thenReturn(comicVinePublisher);
        Mockito.when(requestFactory.getObject()).thenReturn(request);
        Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_CONTENT_TEXT);
        Mockito.doNothing().when(comicVinePublisherRepository).delete(Mockito.any(ComicVinePublisher.class));
        Mockito.when(comicVinePublisherRepository.save(comicVinePublisherCaptor.capture()))
               .thenReturn(comicVinePublisher);
        Mockito.doNothing().when(contentProcessor).process(Mockito.any(byte[].class), Mockito.any(Comic.class));

        adaptor.execute(TEST_API_KEY, TEST_PUBLISHER_ID, comic, true);

        assertEquals(comicVinePublisherCaptor.getValue().getPublisherId(), TEST_PUBLISHER_ID);
        assertEquals(comicVinePublisherCaptor.getValue().getContent(), TEST_CONTENT_TEXT);

        Mockito.verify(comicVinePublisherRepository, Mockito.times(1)).findByPublisherId(TEST_PUBLISHER_ID);
        Mockito.verify(requestFactory, Mockito.times(1)).getObject();
        Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
        Mockito.verify(comicVinePublisherRepository, Mockito.times(1)).delete(comicVinePublisher);
        Mockito.verify(comicVinePublisherRepository, Mockito.times(1)).save(comicVinePublisherCaptor.getValue());
        Mockito.verify(contentProcessor, Mockito.times(1)).process(TEST_CONTENT, comic);
    }
}
