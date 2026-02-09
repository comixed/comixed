package org.comixedproject.adaptors.content;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.*;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.PageType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.converter.xml.JacksonXmlHttpMessageConverter;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.dataformat.xml.XmlMapper;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicMetadataWriterTest {
  private static final String TEST_METADATA_SOURCE_NAME = "ComicVine";
  private static final String TEST_METADATA_REFERENCE_ID = "12971";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_LAST_SCRAPED_DATE = new Date();

  @InjectMocks private ComicMetadataWriter writer;
  @Mock JacksonXmlHttpMessageConverter xmlConverter;
  @Mock XmlMapper xmlMapper;
  @Mock XmlMapper.Builder xmlMapperBuilder;
  @Mock private ComicDetail comicDetail;
  @Mock private MetadataSource metadataSource;
  @Mock private ComicMetadataSource comicMetadataSource;
  @Mock private ComicBook comicBook;

  @Captor private ArgumentCaptor<ComicInfo> metadataArgumentCaptor;

  private byte[] contentByte = "The encoded content".getBytes();
  private Set<ComicTag> tags = new HashSet<>();
  private List<ComicPage> comicPages = new ArrayList<>();

  @BeforeEach
  void setUp() {
    Mockito.when(xmlConverter.getMapper()).thenReturn(xmlMapper);
    when(xmlMapper.rebuild()).thenReturn(xmlMapperBuilder);
    when(xmlMapperBuilder.configure(any(DeserializationFeature.class), Mockito.anyBoolean()))
        .thenReturn(xmlMapperBuilder);
    when(xmlMapperBuilder.build()).thenReturn(xmlMapper);
    Mockito.when(xmlMapper.writeValueAsBytes(metadataArgumentCaptor.capture()))
        .thenReturn(contentByte);
    Mockito.when(comicDetail.getCoverDate()).thenReturn(TEST_COVER_DATE);
    for (int index = 0; index < ComicTagType.values().length; index++) {
      tags.add(new ComicTag(comicDetail, ComicTagType.values()[index], "Tag Value " + index));
    }
    Mockito.when(comicDetail.getTags()).thenReturn(tags);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(metadataSource.getAdaptorName()).thenReturn(TEST_METADATA_SOURCE_NAME);
    Mockito.when(comicMetadataSource.getMetadataSource()).thenReturn(metadataSource);
    Mockito.when(comicMetadataSource.getReferenceId()).thenReturn(TEST_METADATA_REFERENCE_ID);
    Mockito.when(comicMetadataSource.getLastScrapedDate()).thenReturn(TEST_LAST_SCRAPED_DATE);
    for (int index = 0; index < PageType.values().length; index++) {
      final ComicPage page = mock(ComicPage.class);
      Mockito.when(page.getPageNumber()).thenReturn(index);
      Mockito.when(page.getPageType()).thenReturn(PageType.values()[index].getComicPageType());
      Mockito.when(page.getWidth()).thenReturn(index * 2048);
      Mockito.when(page.getHeight()).thenReturn(index * 1024);
      Mockito.when(page.getHash()).thenReturn(Integer.toString(index));
      comicPages.add(page);
    }
    Mockito.when(comicBook.getPages()).thenReturn(comicPages);
  }

  @Test
  void afterPropertiesSet() throws Exception {
    writer.afterPropertiesSet();

    verify(xmlMapper).rebuild();
    verify(xmlMapperBuilder).configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    verify(xmlMapperBuilder).build();
  }

  @Test
  void createContent() throws ContentAdaptorException {
    final byte[] result = writer.createContent(comicBook);

    assertNotNull(result);
  }

  @Test
  void createContent_metadataContent() throws ContentAdaptorException {
    Mockito.when(comicBook.getMetadata()).thenReturn(comicMetadataSource);

    final byte[] result = writer.createContent(comicBook);

    assertNotNull(result);
  }

  @Test
  void createContent_objectWriterException() {
    Mockito.when(xmlMapper.writeValueAsBytes(metadataArgumentCaptor.capture()))
        .thenThrow(JacksonException.class);

    assertThrows(ContentAdaptorException.class, () -> writer.createContent(comicBook));
  }
}
