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

import static org.junit.Assert.assertSame;

import java.util.List;

import org.comixed.web.ComicVineQueryWebRequest;
import org.comixed.web.WebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.comixed.web.model.ComicVolume;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineQueryForVolumesAdaptorTest
{
    private static final String TEST_API_KEY = "12345";
    private static final String TEST_VOLUME_NAME = "Awesome Comic Title";
    private static final byte[] TEST_RESPONSE_CONTENT = "This is the results".getBytes();

    @InjectMocks
    private ComicVineQueryForVolumesAdaptor adaptor;

    @Mock
    private WebRequestProcessor webRequestProcessor;

    @Mock
    private ObjectFactory<ComicVineQueryWebRequest> webRequestFactory;

    @Mock
    private ComicVineQueryWebRequest webRequest;

    @Mock
    private ComicVineVolumesReponseProcessor queryResult;

    @Captor
    private ArgumentCaptor<List<ComicVolume>> comicVolumeList;

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteWebRequestProcessorRaisesException() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class)))
               .thenThrow(new WebRequestException("expected"));

        try
        {
            adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME);
        }
        finally
        {
            Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
            Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
        }
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteResultProcessorRaisesException() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class)))
               .thenThrow(new ComicVineAdaptorException("expected"));

        try
        {
            adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME);
        }
        finally
        {
            Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
            Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
            Mockito.verify(queryResult, Mockito.times(1)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
        }
    }

    @Test
    public void testExecute() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setPage(Mockito.anyInt());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class))).thenReturn(true);

        List<ComicVolume> result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME);

        assertSame(comicVolumeList.getValue(), result);

        Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
        Mockito.verify(webRequest, Mockito.never()).setPage(1);
        Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
        Mockito.verify(queryResult, Mockito.times(1)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
    }

    @Test
    public void testExecuteWithMultiplePages() throws WebRequestException, ComicVineAdaptorException
    {
        Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
        Mockito.doNothing().when(webRequest).setPage(Mockito.anyInt());
        Mockito.when(webRequestProcessor.execute(Mockito.any(WebRequest.class))).thenReturn(TEST_RESPONSE_CONTENT);
        Mockito.when(queryResult.process(comicVolumeList.capture(), Mockito.any(byte[].class))).thenReturn(false, true);

        List<ComicVolume> result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_NAME);

        assertSame(comicVolumeList.getValue(), result);

        Mockito.verify(webRequestFactory, Mockito.times(2)).getObject();
        Mockito.verify(webRequest, Mockito.never()).setPage(1);
        Mockito.verify(webRequest, Mockito.times(1)).setPage(2);
        Mockito.verify(webRequestProcessor, Mockito.times(2)).execute(webRequest);
        Mockito.verify(queryResult, Mockito.times(2)).process(comicVolumeList.getValue(), TEST_RESPONSE_CONTENT);
    }
}
