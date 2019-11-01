package org.comixed.repositories;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import org.comixed.model.scraping.ComicVineVolumeQueryCacheEntry;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;

import java.util.List;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:test-application.properties")
@DatabaseSetup("classpath:test-comics.xml")
@TestExecutionListeners({DependencyInjectionTestExecutionListener.class,
                         DirtiesContextTestExecutionListener.class,
                         TransactionalTestExecutionListener.class,
                         DbUnitTestExecutionListener.class})
public class ComicVineVolumeQueryCacheRepositoryTest {
    private static final String TEST_MISSING_SERIES_NAME = "Farkle: The Series";
    private static final String TEST_SERIES_NAME = "Cached Series";

    @Autowired private ComicVineVolumeQueryCacheRepository repository;

    @Test
    public void testFindBySeriesNameNoEntries() {
        final List<ComicVineVolumeQueryCacheEntry> result = this.repository.findBySeriesNameOrderBySequence(TEST_MISSING_SERIES_NAME);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    public void testFindBySeriesName() {
        final List<ComicVineVolumeQueryCacheEntry> result = this.repository.findBySeriesNameOrderBySequence(TEST_SERIES_NAME);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        for (int index = 0;
             index < result.size();
             index++) {
            assertEquals(index,
                         result.get(index)
                               .getSequence());
        }
    }
}