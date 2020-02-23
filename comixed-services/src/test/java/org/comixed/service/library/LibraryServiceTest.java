package org.comixed.service.library;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.service.task.TaskService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
public class LibraryServiceTest {
  private static final String TEST_EMAIL = "reader@comixed.org";
  private static final Date TEST_LAST_UPDATED_TIMESTAMP = new Date();
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final long TEST_LAST_COMIC_ID = 23579;
  private static final int TEST_PROCESSING_COUNT = 273;

  @InjectMocks private LibraryService libraryService;
  @Mock private ComicRepository comicRepository;
  @Mock private TaskService taskService;
  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;

  private Comic comic1 = new Comic();
  private Comic comic2 = new Comic();
  private Comic comic3 = new Comic();
  private Comic comic4 = new Comic();

  @Before
  public void setUp() {
    // updated now
    comic1.setDateLastUpdated(new Date());
    comic1.setId(1L);
    // updated yesterday
    comic2.setDateLastUpdated(new Date(System.currentTimeMillis() - 24L * 60L * 60L * 1000L));
    comic2.setId(2L);
    // updated same as previous comic
    comic3.setDateLastUpdated(comic2.getDateLastUpdated());
    comic3.setId(3L);
    //
    comic4.setDateLastUpdated(comic3.getDateLastUpdated());
    comic4.setId(4L);
  }

  @Test
  public void testGetComicsUpdatedSince() {
    List<Comic> comics = new ArrayList<>();
    comics.add(comic2);
    comics.add(comic3);
    comics.add(comic4);

    Mockito.when(
            comicRepository.getLibraryUpdates(
                Mockito.any(Date.class), pageableArgumentCaptor.capture()))
        .thenReturn(comics);

    List<Comic> result =
        libraryService.getComicsUpdatedSince(
            TEST_EMAIL, comic3.getDateLastUpdated(), TEST_MAXIMUM_COMICS, 2L);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(2, result.size());
    assertTrue(result.contains(comic3));
    assertTrue(result.contains(comic4));

    assertEquals(0, pageableArgumentCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageableArgumentCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getLibraryUpdates(comic3.getDateLastUpdated(), pageableArgumentCaptor.getValue());
  }

  @Test
  public void testGetProcessingCount() {
    Mockito.when(taskService.getTaskCount(TaskType.ProcessComic)).thenReturn(TEST_PROCESSING_COUNT);

    long result = libraryService.getProcessingCount();

    assertEquals(TEST_PROCESSING_COUNT, result);
  }
}
