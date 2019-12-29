package org.comixed.service.library;

import static junit.framework.TestCase.*;

import java.util.Date;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.repositories.tasks.ProcessComicEntryRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
public class LibraryServiceTest {
  private static final int TEST_PAGE = 20;
  private static final int TEST_COUNT = 100;
  private static final String TEST_SORTABLE_FIELD = "coverDate";
  private static final boolean TEST_ASCENDING = true;
  private static final long TEST_COMIC_COUNT = 2019;
  private static final String TEST_EMAIL = "reader@comixed.org";
  private static final Date TEST_LAST_UPDATED_TIMESTAMP = new Date();
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final long TEST_LAST_COMIC_ID = 23579;
  private static final long TEST_PROCESSING_COUNT = 273L;

  @InjectMocks private LibraryService libraryService;
  @Mock private ComicRepository comicRepository;
  @Mock private ProcessComicEntryRepository processComicEntryRepository;
  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;
  @Mock private List<Comic> comicList;
  @Mock private Date lastUpdatedDate;
  @Mock private Comic comic;
  @Mock private Page comicPage;

  @Test
  public void testGetComicsUpdatedSince() {
    Mockito.when(
            comicRepository.getComicsUpdatedSinceDate(
                Mockito.any(Date.class), Mockito.anyLong(), pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    List<Comic> result =
        libraryService.getComicsUpdatedSince(
            TEST_EMAIL, TEST_LAST_UPDATED_TIMESTAMP, TEST_MAXIMUM_COMICS, TEST_LAST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(0, pageableArgumentCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageableArgumentCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getComicsUpdatedSinceDate(
            TEST_LAST_UPDATED_TIMESTAMP, TEST_LAST_COMIC_ID, pageableArgumentCaptor.getValue());
  }

  @Test
  public void testGetProcessingCount() {
    Mockito.when(processComicEntryRepository.count()).thenReturn(TEST_PROCESSING_COUNT);

    long result = libraryService.getProcessingCount();

    assertEquals(TEST_PROCESSING_COUNT, result);
  }
}
