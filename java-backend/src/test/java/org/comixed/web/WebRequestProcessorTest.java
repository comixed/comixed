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

package org.comixed.web;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(PowerMockRunner.class)
@PrepareForTest(
{IOUtils.class})
@SpringBootTest
public class WebRequestProcessorTest
{
    private static final String TEST_REQUEST_URL = "http://www.testsite.org/getdata";
    private static final long TEST_CONTENT_LENGTH = 2342L;
    private static final byte[] TEST_CONTENT = "This is the content".getBytes();

    @InjectMocks
    private WebRequestProcessor processor;

    @Mock
    private HttpClient httpClient;

    @Mock
    private WebRequest request;

    @Captor
    private ArgumentCaptor<HttpGet> httpGet;

    @Mock
    private HttpResponse httpResponse;

    @Mock
    private HttpEntity httpEntity;

    @Mock
    private InputStream inputStream;

    @Mock
    private WebRequestClient requestClient;

    @Captor
    private ArgumentCaptor<InputStream> inputStreamCaptor;

    @Captor
    private ArgumentCaptor<byte[]> content;

    @Test
    public void testExecute() throws ClientProtocolException, IOException, WebRequestException
    {
        Mockito.when(requestClient.createClient()).thenReturn(httpClient);
        Mockito.when(this.request.getURL()).thenReturn(TEST_REQUEST_URL);
        Mockito.when(httpClient.execute(Mockito.any(HttpGet.class))).thenReturn(httpResponse);
        Mockito.when(httpResponse.getEntity()).thenReturn(httpEntity);
        Mockito.when(httpEntity.getContentLength()).thenReturn(TEST_CONTENT_LENGTH);
        Mockito.when(httpEntity.getContent()).thenReturn(inputStream);
        PowerMockito.mockStatic(IOUtils.class);
        PowerMockito.doReturn(TEST_CONTENT).when(IOUtils.class);
        IOUtils.toByteArray(Mockito.any(InputStream.class));

        this.processor.execute(this.request);

        Mockito.verify(requestClient, Mockito.times(1)).createClient();
        Mockito.verify(request, Mockito.times(1)).getURL();
        Mockito.verify(httpClient, Mockito.times(1)).execute(httpGet.capture());
        Mockito.verify(httpResponse, Mockito.times(1)).getEntity();
        Mockito.verify(httpEntity, Mockito.times(1)).getContent();
        PowerMockito.verifyStatic(IOUtils.class, Mockito.times(1));
        IOUtils.toByteArray(inputStreamCaptor.capture());
    }

    @Test(expected = WebRequestException.class)
    public void testExecuteRequestFailure() throws ClientProtocolException, IOException, WebRequestException
    {
        Mockito.when(requestClient.createClient()).thenReturn(httpClient);
        Mockito.when(this.request.getURL()).thenReturn(TEST_REQUEST_URL);
        Mockito.when(httpClient.execute(Mockito.any(HttpGet.class))).thenThrow(new IOException());

        try
        {
            this.processor.execute(this.request);
        }
        catch (WebRequestException expected)
        {
            Mockito.verify(requestClient, Mockito.times(1)).createClient();
            Mockito.verify(request, Mockito.times(1)).getURL();
            Mockito.verify(httpClient, Mockito.times(1)).execute(httpGet.capture());

            assertEquals(WebRequestProcessor.AGENT_NAME,
                         this.httpGet.getValue().getFirstHeader(WebRequestProcessor.AGENT_HEADER).getValue());

            throw expected;
        }
    }
}
