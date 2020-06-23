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

package org.comixed.scrapers;


import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.comixed.utils.Utils;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class WebRequestProcessorTest {
  private static final String TEST_CONTENT_TEXT = "This is the content";
  private static final String TEST_REQUEST_URL = "http://www.testsite.org/getdata";
  private static final long TEST_CONTENT_LENGTH = 2342L;

  @InjectMocks private WebRequestProcessor processor;
  @Mock private HttpClient httpClient;
  @Mock private WebRequest request;
  @Captor private ArgumentCaptor<HttpGet> httpGet;
  @Mock private HttpResponse httpResponse;
  @Mock private HttpEntity httpEntity;
  @Mock private InputStream inputStream;
  @Mock private WebRequestClient requestClient;
  @Captor private ArgumentCaptor<InputStream> inputStreamCaptor;
  @Captor private ArgumentCaptor<Charset> charsetCaptor;
  @Captor private ArgumentCaptor<byte[]> content;
  @Mock private Utils utils;

  @Test
  public void testExecute() throws ClientProtocolException, IOException, WebRequestException {
    Mockito.when(requestClient.createClient()).thenReturn(httpClient);
    Mockito.when(this.request.getURL()).thenReturn(TEST_REQUEST_URL);
    Mockito.when(httpClient.execute(Mockito.any(HttpGet.class))).thenReturn(httpResponse);
    Mockito.when(httpResponse.getEntity()).thenReturn(httpEntity);
    Mockito.when(httpEntity.getContent()).thenReturn(inputStream);
    Mockito.when(utils.streamToString(Mockito.any(InputStream.class), Mockito.any(Charset.class)))
        .thenReturn(TEST_CONTENT_TEXT);

    this.processor.execute(this.request);

    Mockito.verify(requestClient, Mockito.times(1)).createClient();
    Mockito.verify(request, Mockito.times(1)).getURL();
    Mockito.verify(httpClient, Mockito.times(1)).execute(httpGet.capture());
    Mockito.verify(httpResponse, Mockito.times(1)).getEntity();
    Mockito.verify(httpEntity, Mockito.times(1)).getContent();
  }

  @Test(expected = WebRequestException.class)
  public void testExecuteRequestFailure()
      throws ClientProtocolException, IOException, WebRequestException {
    Mockito.when(requestClient.createClient()).thenReturn(httpClient);
    Mockito.when(this.request.getURL()).thenReturn(TEST_REQUEST_URL);
    Mockito.when(httpClient.execute(Mockito.any(HttpGet.class))).thenThrow(new IOException());

    try {
      this.processor.execute(this.request);
    } catch (WebRequestException expected) {
      Mockito.verify(requestClient, Mockito.times(1)).createClient();
      Mockito.verify(request, Mockito.times(1)).getURL();
      Mockito.verify(httpClient, Mockito.times(1)).execute(httpGet.capture());

      Assert.assertEquals(
          WebRequestProcessor.AGENT_NAME,
          this.httpGet.getValue().getFirstHeader(WebRequestProcessor.AGENT_HEADER).getValue());

      throw expected;
    }
  }
}
