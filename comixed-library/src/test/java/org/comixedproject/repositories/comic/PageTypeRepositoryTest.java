package org.comixedproject.repositories.comic;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import org.comixedproject.model.comic.PageType;
import org.comixedproject.repositories.RepositoryContext;
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

@RunWith(SpringRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:application.properties")
@DatabaseSetup("classpath:test-database.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class PageTypeRepositoryTest {
  @Autowired private PageTypeRepository repository;

  @Test
  public void testGetDefaultPageType() {
    final PageType result = repository.getDefaultPageType();

    assertNotNull(result);
    assertEquals("story", result.getName());
  }

  @Test
  public void findAllPageTypes() {
    final List<PageType> result = repository.findPageTypes();

    assertNotNull(result);
    assertEquals(3, result.size());
  }
}
