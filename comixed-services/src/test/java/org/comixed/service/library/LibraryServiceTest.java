package org.comixed.service.library;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertSame;

import java.util.Date;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.repositories.library.ComicRepository;
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

  @InjectMocks private LibraryService libraryService;
  @Mock private ComicRepository comicRepository;
  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;
  @Mock private List<Comic> comicList;
  @Mock private Date lastUpdatedDate;
  @Mock private Comic comic;
  @Mock private Page comicPage;

  @Test
  public void testGetComics() {
    Mockito.when(comicRepository.findAll(pageableArgumentCaptor.capture())).thenReturn(comicPage);
    Mockito.when(comicPage.getContent()).thenReturn(comicList);

    final List<Comic> result =
        libraryService.getComics(TEST_PAGE, TEST_COUNT, TEST_SORTABLE_FIELD, TEST_ASCENDING);

    assertSame(comicList, result);
    assertEquals(TEST_PAGE, pageableArgumentCaptor.getValue().getPageNumber());
    assertEquals(TEST_COUNT, pageableArgumentCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1)).findAll(pageableArgumentCaptor.getValue());
    Mockito.verify(comicPage, Mockito.times(1)).getContent();
  }

  @Test
  public void testGetLastUpdatedDate() {
    Mockito.when(
            comicRepository.findTopByOrderByDateLastUpdatedDesc(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);
    Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);
    Mockito.when(comic.getDateLastUpdated()).thenReturn(lastUpdatedDate);

    final Date result = libraryService.getLatestUpdatedDate();

    assertSame(lastUpdatedDate, result);

    Mockito.verify(comicRepository, Mockito.times(1))
        .findTopByOrderByDateLastUpdatedDesc(pageableArgumentCaptor.getValue());
    Mockito.verify(comicList, Mockito.times(1)).get(0);
    Mockito.verify(comic, Mockito.times(1)).getDateLastUpdated();
  }

  @Test
  public void testGetComicCount() {
    Mockito.when(comicRepository.count()).thenReturn(TEST_COMIC_COUNT);

    final long result = libraryService.getComicCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).count();
  }
}
