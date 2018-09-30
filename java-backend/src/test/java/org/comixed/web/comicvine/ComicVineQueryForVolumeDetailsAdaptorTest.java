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

import org.comixed.library.model.Comic;
import org.comixed.web.ComicVineVolumeDetailsWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineQueryForVolumeDetailsAdaptorTest
{
    private static final String TEST_API_KEY = "12345";
    private static final String TEST_VOLUME_ID = "54312";
    private static final byte[] TEST_CONTENT = "The response body".getBytes();

    @InjectMocks
    private ComicVineQueryForVolumeDetailsAdaptor adaptor;

    @Mock
    private WebRequestProcessor webRequestProcessor;

    @Mock
    private ObjectFactory<ComicVineVolumeDetailsWebRequest> requestFactory;

    @Mock
    private ComicVineVolumeDetailsWebRequest request;

    @Mock
    private Comic comic;

    @Mock
    private ComicVineVolumeDetailsResponseProcessor contentProcessor;

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteWebRequestProcessorRaisesException() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(requestFactory.getObject()).thenReturn(request);
        Mockito.when(webRequestProcessor.execute(Mockito.any())).thenThrow(new WebRequestException("expected"));

        try
        {
            adaptor.execute(TEST_API_KEY, TEST_VOLUME_ID, comic);
        }
        finally
        {
            Mockito.verify(requestFactory, Mockito.times(1)).getObject();
            Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
        }
    }

    @Test
    public void testExecute() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(requestFactory.getObject()).thenReturn(request);
        Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_CONTENT);
        Mockito.doNothing().when(contentProcessor).process(Mockito.any(byte[].class), Mockito.any(Comic.class));

        adaptor.execute(TEST_API_KEY, TEST_VOLUME_ID, comic);

        Mockito.verify(requestFactory, Mockito.times(1)).getObject();
        Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
        Mockito.verify(contentProcessor, Mockito.times(1)).process(TEST_CONTENT, comic);
    }
}
