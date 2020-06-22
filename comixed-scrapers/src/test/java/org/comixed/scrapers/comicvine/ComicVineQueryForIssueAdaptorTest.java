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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.scrapers.comicvine;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import org.comixed.scrapers.ComicVineIssuesWebRequest;
import org.comixed.scrapers.WebRequestException;
import org.comixed.scrapers.WebRequestProcessor;
import org.comixed.scrapers.model.ScrapingIssue;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineQueryForIssueAdaptorTest {
  private static final String TEST_REQUEST_CONTENT_TEXT = "This is a response body";
  private static final String TEST_API_KEY = "12345";
  private static final String TEST_ISSUE_NUMBER = "327";
  private static final byte[] TEST_REQUEST_CONTENT = TEST_REQUEST_CONTENT_TEXT.getBytes();
  private static final Integer TEST_VOLUME = 2018;

  @InjectMocks private ComicVineQueryForIssueAdaptor adaptor;
  @Mock private ObjectFactory<ComicVineIssuesWebRequest> webRequestFactory;
  @Mock private ComicVineIssuesWebRequest webRequest;
  @Mock private WebRequestProcessor webRequestProcessor;
  @Mock private ComicVineIssueResponseProcessor responseProcessor;
  @Mock private ScrapingIssue comicIssue;

  @Test(expected = ComicVineAdaptorException.class)
  public void testExecuteWebRequestProcessorRaisesException()
      throws WebRequestException, ComicVineAdaptorException {
    Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
    Mockito.doNothing().when(webRequest).setVolume(Mockito.anyInt());
    Mockito.doNothing().when(webRequest).setIssueNumber(Mockito.anyString());
    Mockito.when(webRequestProcessor.execute(Mockito.any()))
        .thenThrow(new WebRequestException("expected"));

    try {
      adaptor.execute(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER);
    } finally {
      Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
      Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
      Mockito.verify(webRequest, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
      Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
    }
  }

  @Test(expected = ComicVineAdaptorException.class)
  public void testExecuteResultProcessorRaisesException()
      throws WebRequestException, ComicVineAdaptorException {

    Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
    Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
    Mockito.doNothing().when(webRequest).setVolume(Mockito.anyInt());
    Mockito.doNothing().when(webRequest).setIssueNumber(Mockito.anyString());
    Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_REQUEST_CONTENT_TEXT);
    Mockito.when(responseProcessor.process(Mockito.any(byte[].class)))
        .thenThrow(new ComicVineAdaptorException("expected"));

    try {
      adaptor.execute(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER);
    } finally {
      Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
      Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
      Mockito.verify(webRequest, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
      Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
      Mockito.verify(responseProcessor, Mockito.times(1)).process(TEST_REQUEST_CONTENT);
    }
  }

  @Test
  public void testExecute() throws WebRequestException, ComicVineAdaptorException {
    Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
    Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
    Mockito.doNothing().when(webRequest).setVolume(Mockito.anyInt());
    Mockito.doNothing().when(webRequest).setIssueNumber(Mockito.anyString());
    Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_REQUEST_CONTENT_TEXT);
    Mockito.when(responseProcessor.process(Mockito.any(byte[].class))).thenReturn(comicIssue);

    ScrapingIssue result = adaptor.execute(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertSame(comicIssue, result);

    Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
    Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(webRequest, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
    Mockito.verify(responseProcessor, Mockito.times(1)).process(TEST_REQUEST_CONTENT);
  }

  @Test
  public void testExecuteScrubLeadingZerosFromIssueNumber()
      throws WebRequestException, ComicVineAdaptorException {
    Mockito.when(webRequestFactory.getObject()).thenReturn(webRequest);
    Mockito.doNothing().when(webRequest).setApiKey(Mockito.anyString());
    Mockito.doNothing().when(webRequest).setVolume(Mockito.anyInt());
    Mockito.doNothing().when(webRequest).setIssueNumber(Mockito.anyString());
    Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_REQUEST_CONTENT_TEXT);
    Mockito.when(responseProcessor.process(Mockito.any(byte[].class))).thenReturn(comicIssue);

    ScrapingIssue result = adaptor.execute(TEST_API_KEY, TEST_VOLUME, "0" + TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertSame(comicIssue, result);

    Mockito.verify(webRequestFactory, Mockito.times(1)).getObject();
    Mockito.verify(webRequest, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(webRequest, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(webRequest);
    Mockito.verify(responseProcessor, Mockito.times(1)).process(TEST_REQUEST_CONTENT);
  }
}
