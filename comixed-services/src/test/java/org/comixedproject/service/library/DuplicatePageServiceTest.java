package org.comixedproject.service.library;

import static junit.framework.TestCase.*;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DuplicatePageServiceTest {
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF";
  private static final int TEST_PAGE_NUMBER = 23;
  private static final int TEST_PAGE_SIZE = 10;
  private static final String TEST_SORT_BY = "hash";
  private static final String TEST_SORT_DIRECTION = "desc";
  private static final long TEST_COMIC_ID = 32096L;
  private static final long TEST_PAGE_COUNT = 61L;

  @InjectMocks private DuplicatePageService service;
  @Mock private ComicPageRepository comicPageRepository;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private DuplicatePage duplicatePage;
  @Mock private ComicPage comicPage;
  @Mock private DisplayableComic comic;

  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;
  @Captor private ArgumentCaptor<Set<ComicDetail>> comicDetailArgumentCaptor;

  private List<DuplicatePage> duplicatePageList = new ArrayList<>();
  private List<ComicPage> comicPageList = new ArrayList<>();

  @BeforeEach
  public void setUp() {
    when(comicBook.getComicDetail()).thenReturn(comicDetail);
    when(comicPage.getComicDetail()).thenReturn(comicDetail);
  }

  @Test
  void getDuplicatePages() {
    duplicatePageList.add(duplicatePage);
    comicPageList.add(comicPage);

    when(comicPageRepository.getDuplicatePages(pageRequestArgumentCaptor.capture()))
        .thenReturn(duplicatePageList);

    List<DuplicatePage> result =
        service.getDuplicatePages(
            TEST_PAGE_NUMBER, TEST_PAGE_SIZE, TEST_SORT_BY, TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    final PageRequest pageRequest = pageRequestArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_NUMBER, pageRequest.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageRequest.getPageSize());

    verify(comicPageRepository).getDuplicatePages(pageRequest);
  }

  @Test
  void getDuplicatePageCount() {
    when(comicPageRepository.getDuplicatePageCount()).thenReturn(TEST_PAGE_COUNT);

    assertEquals(TEST_PAGE_COUNT, service.getDuplicatePageCount());
  }

  @Test
  void getForHash_notFound() {
    when(comicPageRepository.findByHash(anyString())).thenReturn(comicPageList);

    assertThrows(DuplicatePageException.class, () -> service.getForHash(TEST_PAGE_HASH));
  }

  @Test
  void getForHash_comicNotFound() throws ComicBookException {
    comicPageList.add(comicPage);

    when(comicPageRepository.findByHash(anyString())).thenReturn(comicPageList);
    when(comicPage.getComicDetail()).thenReturn(comicDetail);
    when(comicDetail.getComicId()).thenReturn(TEST_COMIC_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenThrow(ComicBookException.class);

    assertThrows(DuplicatePageException.class, () -> service.getForHash(TEST_PAGE_HASH));

    verify(comicPageRepository).findByHash(TEST_PAGE_HASH);
    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
  }

  @Test
  void getForHash() throws DuplicatePageException, ComicBookException {
    comicPageList.add(comicPage);

    when(comicPageRepository.findByHash(anyString())).thenReturn(comicPageList);
    when(comicPage.getComicDetail()).thenReturn(comicDetail);
    when(comicDetail.getComicId()).thenReturn(TEST_COMIC_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(comic);

    final DuplicatePage result = service.getForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, result.getHash());
    assertTrue(result.getComics().contains(comic));

    verify(comicPageRepository).findByHash(TEST_PAGE_HASH);
    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
  }

  @Test
  void doCreateSort_hash_ascending() {
    final Sort sort = service.doCreateSort("hash", "asc");

    assertTrue(sort.getOrderFor("hash").getDirection().isAscending());
  }

  @Test
  void doCreateSort_comicCount_ascending() {
    final Sort sort = service.doCreateSort("comic-count", "asc");

    assertTrue(sort.getOrderFor("comicCount").getDirection().isAscending());
  }

  @Test
  void doCreateSort_hash_descending() {
    final Sort sort = service.doCreateSort("hash", "desc");

    assertTrue(sort.getOrderFor("hash").getDirection().isDescending());
  }

  @Test
  void doCreateSort_comicCount_descending() {
    final Sort sort = service.doCreateSort("comic-count", "desc");

    assertTrue(sort.getOrderFor("comicCount").getDirection().isDescending());
  }

  @Test
  void doCreateSort_default() {
    final Sort sort = service.doCreateSort("", "");

    assertTrue(sort.getOrderFor("hash").getDirection().isAscending());
  }
}
