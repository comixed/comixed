/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.processors;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicbooks.processors.CreateMetadataSourceProcessor.COMIC_INFO_XML;
import static org.comixedproject.batch.comicbooks.processors.CreateMetadataSourceProcessor.COMIC_VINE_METADATA_ADAPTOR;
import static org.junit.Assert.assertArrayEquals;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.ComicInfoMetadataSource;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;

@RunWith(MockitoJUnitRunner.class)
public class CreateMetadataSourceProcessorTest {
  private static final byte[] TEST_METADATA_CONTENT = "The file content".getBytes();
  private static final String TEST_COMIC_VINE_ID = "73823";
  private static final String TEST_WEB_ADDRESS_NO_MATCH = "http://this.is.not.comicvine";
  private static final String TEST_WEB_ADDRESS =
      String.format("https://comicvine.gamespot.com/spider-man-1/4000-%s/", TEST_COMIC_VINE_ID);
  private static final String TEST_METADATA_SOURCE_NAME = "Metadata Source Name";
  private static final String TEST_METADATA_REFERENCE_ID = "R3F3R3NC31D";

  @Mock MappingJackson2XmlHttpMessageConverter xmlConverter;
  @InjectMocks private CreateMetadataSourceProcessor processor;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ObjectMapper objectMapper;
  @Mock private MetadataSource metadataSource;
  @Mock private ComicInfo comicInfo;
  @Mock private ComicInfoMetadataSource metadata;

  @Captor private ArgumentCaptor<ByteArrayInputStream> byteArrayInputStreamArgumentCaptor;
  @Captor private ArgumentCaptor<ComicMetadataSource> comicMetadataSourceArgumentCaptor;

  @Before
  public void setUp() throws AdaptorException, IOException {
    Mockito.when(xmlConverter.getObjectMapper()).thenReturn(objectMapper);
    Mockito.when(metadataSourceService.getByName(Mockito.anyString())).thenReturn(metadataSource);
    Mockito.when(metadataSourceService.getByBeanName(Mockito.anyString()))
        .thenReturn(metadataSource);
    Mockito.when(comicBookAdaptor.loadFile(Mockito.any(ComicBook.class), Mockito.anyString()))
        .thenReturn(TEST_METADATA_CONTENT);
    Mockito.when(
            objectMapper.readValue(
                byteArrayInputStreamArgumentCaptor.capture(), Mockito.any(Class.class)))
        .thenReturn(comicInfo);

    Mockito.when(metadata.getName()).thenReturn(TEST_METADATA_SOURCE_NAME);
    Mockito.when(metadata.getReferenceId()).thenReturn(TEST_METADATA_REFERENCE_ID);
    Mockito.doNothing().when(comicBook).setMetadata(comicMetadataSourceArgumentCaptor.capture());
  }

  @Test
  public void testAfterPropertiesSet() {
    processor.afterPropertiesSet();

    Mockito.verify(objectMapper, Mockito.times(1))
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
  }

  @Test
  public void testProcessNoContent() throws Exception {
    Mockito.when(comicBookAdaptor.loadFile(Mockito.any(ComicBook.class), Mockito.anyString()))
        .thenReturn(null);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadFile(comicBook, COMIC_INFO_XML);
    Mockito.verify(comicBook, Mockito.never()).setMetadata(Mockito.any());
  }

  @Test
  public void testProcessWithIOException() throws Exception {
    Mockito.when(
            objectMapper.readValue(
                byteArrayInputStreamArgumentCaptor.capture(), Mockito.any(Class.class)))
        .thenThrow(IOException.class);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ByteArrayInputStream inputStream = byteArrayInputStreamArgumentCaptor.getValue();
    assertNotNull(inputStream);
    assertArrayEquals(TEST_METADATA_CONTENT, inputStream.readAllBytes());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadFile(comicBook, COMIC_INFO_XML);
    Mockito.verify(comicBook, Mockito.never()).setMetadata(Mockito.any());
  }

  @Test
  public void testProcessMetadataSourceNotFound() throws Exception {
    Mockito.when(comicInfo.getMetadata()).thenReturn(metadata);
    Mockito.when(metadataSourceService.getByName(Mockito.anyString())).thenReturn(null);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);
    assertNull(comicBook.getMetadata());

    Mockito.verify(metadataSourceService, Mockito.times(1)).getByName(TEST_METADATA_SOURCE_NAME);
  }

  @Test
  public void testProcessMetadataSourceFound() throws Exception {
    Mockito.when(comicInfo.getMetadata()).thenReturn(metadata);
    Mockito.when(metadataSourceService.getByName(Mockito.anyString())).thenReturn(metadataSource);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ComicMetadataSource comicMetadata = comicMetadataSourceArgumentCaptor.getValue();
    assertNotNull(comicMetadata);
    assertSame(metadataSource, comicMetadata.getMetadataSource());
    assertEquals(TEST_METADATA_REFERENCE_ID, comicMetadata.getReferenceId());

    Mockito.verify(metadataSourceService, Mockito.times(1)).getByName(TEST_METADATA_SOURCE_NAME);
    Mockito.verify(comicBook, Mockito.times(1)).setMetadata(comicMetadata);
  }

  @Test
  public void testProcessNoWebAddress() throws Exception {
    Mockito.when(comicInfo.getWeb()).thenReturn(null);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ByteArrayInputStream inputStream = byteArrayInputStreamArgumentCaptor.getValue();
    assertNotNull(inputStream);
    assertArrayEquals(TEST_METADATA_CONTENT, inputStream.readAllBytes());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadFile(comicBook, COMIC_INFO_XML);
    Mockito.verify(comicInfo, Mockito.times(1)).getWeb();
    Mockito.verify(comicBook, Mockito.never()).setMetadata(Mockito.any());
  }

  @Test
  public void testProcessWebAddressDoesntMatch() throws Exception {
    Mockito.when(comicInfo.getWeb()).thenReturn(TEST_WEB_ADDRESS_NO_MATCH);

    Mockito.when(comicInfo.getWeb()).thenReturn(null);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ByteArrayInputStream inputStream = byteArrayInputStreamArgumentCaptor.getValue();
    assertNotNull(inputStream);
    assertArrayEquals(TEST_METADATA_CONTENT, inputStream.readAllBytes());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadFile(comicBook, COMIC_INFO_XML);
    Mockito.verify(comicInfo, Mockito.times(1)).getWeb();
    Mockito.verify(comicBook, Mockito.never()).setMetadata(Mockito.any());
  }

  @Test
  public void testProcessNoComicVineBean() throws Exception {
    Mockito.when(comicInfo.getWeb()).thenReturn(TEST_WEB_ADDRESS);
    Mockito.when(metadataSourceService.getByBeanName(Mockito.anyString())).thenReturn(null);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ByteArrayInputStream inputStream = byteArrayInputStreamArgumentCaptor.getValue();
    assertNotNull(inputStream);
    assertArrayEquals(TEST_METADATA_CONTENT, inputStream.readAllBytes());

    Mockito.verify(metadataSourceService, Mockito.times(1))
        .getByBeanName(COMIC_VINE_METADATA_ADAPTOR);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadFile(comicBook, COMIC_INFO_XML);
    Mockito.verify(comicInfo, Mockito.times(1)).getWeb();
    Mockito.verify(comicBook, Mockito.never()).setMetadata(Mockito.any());
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comicInfo.getWeb()).thenReturn(TEST_WEB_ADDRESS);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ByteArrayInputStream inputStream = byteArrayInputStreamArgumentCaptor.getValue();
    assertNotNull(inputStream);
    assertArrayEquals(TEST_METADATA_CONTENT, inputStream.readAllBytes());

    final ComicMetadataSource metadata = comicMetadataSourceArgumentCaptor.getValue();
    assertNotNull(metadata);
    assertSame(comicBook, metadata.getComicBook());
    assertSame(metadataSource, metadata.getMetadataSource());
    assertEquals(TEST_COMIC_VINE_ID, metadata.getReferenceId());

    Mockito.verify(metadataSourceService, Mockito.times(1))
        .getByBeanName(COMIC_VINE_METADATA_ADAPTOR);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadFile(comicBook, COMIC_INFO_XML);
    Mockito.verify(comicInfo, Mockito.times(1)).getWeb();
    Mockito.verify(comicBook, Mockito.times(1)).setMetadata(metadata);
  }
}
