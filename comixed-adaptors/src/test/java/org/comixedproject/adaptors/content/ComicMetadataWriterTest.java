package org.comixedproject.adaptors.content;

import static junit.framework.TestCase.assertNotNull;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.MetadataSource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;

@RunWith(MockitoJUnitRunner.class)
public class ComicMetadataWriterTest {
  private static final String TEST_METADATA_SOURCE_NAME = "ComicVine";
  private static final String TEST_METADATA_REFERENCE_ID = "12971";
  private static final Date TEST_COVER_DATE = new Date();

  @InjectMocks private ComicMetadataWriter writer;
  @Mock private ObjectMapper objectMapper;
  @Mock MappingJackson2XmlHttpMessageConverter xmlConverter;
  @Mock private ComicDetail comicDetail;
  @Mock private MetadataSource metadataSource;
  @Mock private ComicMetadataSource comicMetadataSource;
  @Mock private ComicBook comicBook;

  @Captor private ArgumentCaptor<ComicInfo> metadataArgumentCaptor;

  private byte[] contentByte = "The encoded content".getBytes();
  private Set<ComicTag> tags = new HashSet<>();

  @Before
  public void setUp() throws JsonProcessingException {
    Mockito.when(objectMapper.writeValueAsBytes(metadataArgumentCaptor.capture()))
        .thenReturn(contentByte);
    Mockito.when(xmlConverter.getObjectMapper()).thenReturn(objectMapper);
    Mockito.when(comicDetail.getCoverDate()).thenReturn(TEST_COVER_DATE);
    for (int index = 0; index < ComicTagType.values().length; index++) {
      tags.add(new ComicTag(comicDetail, ComicTagType.values()[index], "Tag Value " + index));
    }
    Mockito.when(comicDetail.getTags()).thenReturn(tags);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(metadataSource.getAdaptorName()).thenReturn(TEST_METADATA_SOURCE_NAME);
    Mockito.when(comicMetadataSource.getMetadataSource()).thenReturn(metadataSource);
    Mockito.when(comicMetadataSource.getReferenceId()).thenReturn(TEST_METADATA_REFERENCE_ID);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    writer.afterPropertiesSet();

    Mockito.verify(objectMapper, Mockito.times(1))
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
  }

  @Test
  public void testCreateContent() throws ContentAdaptorException {
    final byte[] result = writer.createContent(comicBook);

    assertNotNull(result);
  }

  @Test
  public void testCreateContentWithMetadataContent() throws ContentAdaptorException {
    Mockito.when(comicBook.getMetadata()).thenReturn(comicMetadataSource);

    final byte[] result = writer.createContent(comicBook);

    assertNotNull(result);
  }

  @Test(expected = ContentAdaptorException.class)
  public void testCreateContentObjectWriterException() throws ContentAdaptorException, IOException {
    Mockito.when(objectMapper.writeValueAsBytes(metadataArgumentCaptor.capture()))
        .thenThrow(JsonProcessingException.class);

    writer.createContent(comicBook);
  }
}
