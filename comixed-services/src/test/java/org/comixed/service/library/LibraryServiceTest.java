package org.comixed.service.library;

import static junit.framework.TestCase.*;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.comic.Comic;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.comic.ComicRepository;
import org.comixed.service.task.TaskService;
import org.comixed.task.model.ConvertComicsWorkerTask;
import org.comixed.task.runner.Worker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.data.domain.Pageable;

@RunWith(PowerMockRunner.class)
@PrepareForTest({FileUtils.class})
public class LibraryServiceTest {
  private static final String TEST_EMAIL = "reader@comixed.org";
  private static final Date TEST_LAST_UPDATED_TIMESTAMP = new Date();
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final long TEST_LAST_COMIC_ID = 23579;
  private static final int TEST_PROCESSING_COUNT = 273;
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_PHYSICAL_FILES = RANDOM.nextBoolean();
  private static final String TEST_FILENAME = "/home/comixeduser/Library/comicfile.cbz";

  @InjectMocks private LibraryService libraryService;
  @Mock private ComicRepository comicRepository;
  @Mock private ReadingListService readingListService;
  @Mock private TaskService taskService;
  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;
  @Mock private ObjectFactory<ConvertComicsWorkerTask> convertComicsWorkerTaskObjectFactory;
  @Mock private ConvertComicsWorkerTask convertComicsWorkerTask;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<List<Comic>> comicListArgumentCaptor;
  @Mock private Worker worker;
  @Mock private File file;

  private List<Comic> comicList = new ArrayList<>();
  private Comic comic1 = new Comic();
  private Comic comic2 = new Comic();
  private Comic comic3 = new Comic();
  private Comic comic4 = new Comic();
  private List<Long> comicIdList = new ArrayList<>();

  @Before
  public void setUp() {
    // updated now
    comic1.setDateLastUpdated(new Date());
    comic1.setId(1L);
    comic1.setFilename(RandomStringUtils.random(128));
    // updated yesterday
    comic2.setDateLastUpdated(new Date(System.currentTimeMillis() - 24L * 60L * 60L * 1000L));
    comic2.setId(2L);
    comic2.setFilename(RandomStringUtils.random(128));
    // updated same as previous comic
    comic3.setDateLastUpdated(comic2.getDateLastUpdated());
    comic3.setId(3L);
    comic3.setFilename(RandomStringUtils.random(128));
    //
    comic4.setDateLastUpdated(comic3.getDateLastUpdated());
    comic4.setId(4L);
    comic4.setFilename(RandomStringUtils.random(128));
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
    Mockito.verify(readingListService, Mockito.times(1))
        .getReadingListsForComics(TEST_EMAIL, result);
  }

  @Test
  public void testGetProcessingCount() {
    Mockito.when(taskService.getTaskCount(TaskType.PROCESS_COMIC))
        .thenReturn(TEST_PROCESSING_COUNT);

    long result = libraryService.getProcessingCount();

    assertEquals(TEST_PROCESSING_COUNT, result);
  }

  @Test
  public void testConvertComicArchiving() {
    for (long index = 0; index < 15; index++) {
      comicIdList.add(index);
    }
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(convertComicsWorkerTaskObjectFactory.getObject())
        .thenReturn(convertComicsWorkerTask);
    Mockito.doNothing()
        .when(convertComicsWorkerTask)
        .setComicList(comicListArgumentCaptor.capture());

    libraryService.convertComics(comicIdList, TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES);

    assertEquals(comicIdList.size(), comicListArgumentCaptor.getValue().size());

    Mockito.verify(comicRepository, Mockito.times(comicIdList.size())).getById(Mockito.anyLong());
    Mockito.verify(convertComicsWorkerTaskObjectFactory, Mockito.times(1)).getObject();
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1))
        .setComicList(comicListArgumentCaptor.getValue());
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1))
        .setTargetArchiveType(TEST_ARCHIVE_TYPE);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1)).setRenamePages(TEST_RENAME_PAGES);
    Mockito.verify(worker, Mockito.times(1)).addTasksToQueue(convertComicsWorkerTask);
  }

  @Test
  public void testConsolidateLibraryNoDeleteFile() {
    Mockito.when(comicRepository.findAllMarkedForDeletion()).thenReturn(comicList);
    Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));

    List<Comic> result = libraryService.consolidateLibrary(false);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(comicList.size())).delete(comic);
  }

  @Test
  public void testConsolidateLibraryDeleteFile() throws Exception {
    for (int index = 0; index < 25; index++) {
      comicList.add(comic);
    }

    Mockito.when(comicRepository.findAllMarkedForDeletion()).thenReturn(comicList);
    Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(comic.getFile()).thenReturn(file);
    PowerMockito.mockStatic(FileUtils.class);
    Mockito.when(FileUtils.deleteQuietly(Mockito.any(File.class))).thenReturn(true);

    List<Comic> result = libraryService.consolidateLibrary(true);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(comicList.size())).delete(comic);
    Mockito.verify(comic, Mockito.times(comicList.size())).getFilename();
    Mockito.verify(comic, Mockito.times(comicList.size())).getFile();
    PowerMockito.verifyStatic(FileUtils.class, Mockito.times(comicList.size()));
    FileUtils.deleteQuietly(file);
  }
}
