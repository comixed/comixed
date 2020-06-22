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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.comixed.model.comic.Comic;
import org.comixed.model.scraping.ComicVineVolume;
import org.comixed.repositories.ComicVineVolumeRepository;
import org.comixed.scrapers.ComicVineVolumeDetailsWebRequest;
import org.comixed.scrapers.WebRequestException;
import org.comixed.scrapers.WebRequestProcessor;
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
public class ComicVineQueryForVolumeDetailsAdaptorTest {
  private static final String TEST_API_KEY = "12345";
  private static final String TEST_VOLUME_ID = "54312";
  private static final String TEST_CONTENT_TEXT = "The response body";
  private static final byte[] TEST_CONTENT = TEST_CONTENT_TEXT.getBytes();
  private static final String TEST_PUBLISHER_ID = "92134";

  @InjectMocks private ComicVineQueryForVolumeDetailsAdaptor adaptor;
  @Mock private WebRequestProcessor webRequestProcessor;
  @Mock private ObjectFactory<ComicVineVolumeDetailsWebRequest> requestFactory;
  @Mock private ComicVineVolumeDetailsWebRequest request;
  @Mock private Comic comic;
  @Mock private ComicVineVolumeDetailsResponseProcessor contentProcessor;
  @Mock private ComicVineVolume comicVineVolume;
  @Captor private ArgumentCaptor<ComicVineVolume> comicVineVolumeCaptor;
  @Mock private ComicVineVolumeRepository comicVineVolumeRepository;

  @Test(expected = ComicVineAdaptorException.class)
  public void testExecuteWebRequestProcessorRaisesException()
      throws WebRequestException, ComicVineAdaptorException {
    Mockito.when(comicVineVolumeRepository.findByVolumeId(Mockito.anyString())).thenReturn(null);
    Mockito.when(requestFactory.getObject()).thenReturn(request);
    Mockito.when(webRequestProcessor.execute(Mockito.any()))
        .thenThrow(new WebRequestException("expected"));

    try {
      adaptor.execute(TEST_API_KEY, TEST_VOLUME_ID, comic, false);
    } finally {
      Mockito.verify(comicVineVolumeRepository, Mockito.times(1)).findByVolumeId(TEST_VOLUME_ID);
      Mockito.verify(requestFactory, Mockito.times(1)).getObject();
      Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
    }
  }

  @Test
  public void testExecute() throws WebRequestException, ComicVineAdaptorException {
    Mockito.when(comicVineVolumeRepository.findByVolumeId(Mockito.anyString())).thenReturn(null);
    Mockito.when(requestFactory.getObject()).thenReturn(request);
    Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_CONTENT_TEXT);
    Mockito.when(comicVineVolumeRepository.save(this.comicVineVolumeCaptor.capture()))
        .thenReturn(comicVineVolume);
    Mockito.when(contentProcessor.process(Mockito.any(byte[].class), Mockito.any(Comic.class)))
        .thenReturn(TEST_PUBLISHER_ID);

    String result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_ID, comic, false);

    assertNotNull(result);
    assertEquals(TEST_PUBLISHER_ID, result);

    Mockito.verify(comicVineVolumeRepository, Mockito.times(1)).findByVolumeId(TEST_VOLUME_ID);
    Mockito.verify(requestFactory, Mockito.times(1)).getObject();
    Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
    Mockito.verify(comicVineVolumeRepository, Mockito.times(1))
        .save(comicVineVolumeCaptor.getValue());
    Mockito.verify(contentProcessor, Mockito.times(1)).process(TEST_CONTENT, comic);
  }

  @Test
  public void testExecuteVolumeIsInDatabase() throws ComicVineAdaptorException {
    Mockito.when(comicVineVolumeRepository.findByVolumeId(Mockito.anyString()))
        .thenReturn(comicVineVolume);
    Mockito.when(comicVineVolume.getContent()).thenReturn(TEST_CONTENT_TEXT);
    Mockito.when(contentProcessor.process(Mockito.any(byte[].class), Mockito.any(Comic.class)))
        .thenReturn(TEST_PUBLISHER_ID);

    String result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_ID, comic, false);

    assertNotNull(result);
    assertEquals(TEST_PUBLISHER_ID, result);

    Mockito.verify(comicVineVolumeRepository, Mockito.times(1)).findByVolumeId(TEST_VOLUME_ID);
    Mockito.verify(comicVineVolume, Mockito.times(1)).getContent();
    Mockito.verify(contentProcessor, Mockito.times(1)).process(TEST_CONTENT, comic);
  }

  @Test
  public void testExecuteVolumeIsInDatabaseSkipCache()
      throws WebRequestException, ComicVineAdaptorException {
    Mockito.when(comicVineVolumeRepository.findByVolumeId(Mockito.anyString()))
        .thenReturn(comicVineVolume);
    Mockito.when(requestFactory.getObject()).thenReturn(request);
    Mockito.when(webRequestProcessor.execute(Mockito.any())).thenReturn(TEST_CONTENT_TEXT);
    Mockito.doNothing().when(comicVineVolumeRepository).delete(Mockito.any(ComicVineVolume.class));
    Mockito.when(comicVineVolumeRepository.save(this.comicVineVolumeCaptor.capture()))
        .thenReturn(comicVineVolume);
    Mockito.when(contentProcessor.process(Mockito.any(byte[].class), Mockito.any(Comic.class)))
        .thenReturn(TEST_PUBLISHER_ID);

    String result = adaptor.execute(TEST_API_KEY, TEST_VOLUME_ID, comic, true);

    assertNotNull(result);
    assertEquals(TEST_PUBLISHER_ID, result);

    Mockito.verify(comicVineVolumeRepository, Mockito.times(1)).findByVolumeId(TEST_VOLUME_ID);
    Mockito.verify(requestFactory, Mockito.times(1)).getObject();
    Mockito.verify(webRequestProcessor, Mockito.times(1)).execute(request);
    Mockito.verify(comicVineVolumeRepository, Mockito.times(1)).delete(comicVineVolume);
    Mockito.verify(comicVineVolumeRepository, Mockito.times(1))
        .save(comicVineVolumeCaptor.getValue());
    Mockito.verify(contentProcessor, Mockito.times(1)).process(TEST_CONTENT, comic);
  }
}
