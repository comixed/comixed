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

package org.comixedproject.repositories.metadata;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNull;
import static org.junit.Assert.assertNotNull;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
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
public class MetadataSourceRepositoryTest {
  private static final long TEST_EXISTING_ID = 1001L;
  private static final String TEST_NEW_NAME = "The New Name";
  private static final String TEST_NEW_BEAN_NAME = "The New Bean Name";

  @Autowired private MetadataSourceRepository repository;

  @Test
  public void testFindAll() {
    final List<MetadataSource> result = this.repository.loadMetadataSources();

    assertNotNull(result);
    assertNotNull(result.get(0).getProperties());
  }

  @Test
  public void testSaveAsUpdate() {
    final MetadataSource source = this.repository.getById(TEST_EXISTING_ID);

    assertNotNull(source);

    final MetadataSourceProperty property = source.getProperties().stream().findFirst().get();
    source.setName(TEST_NEW_NAME);
    source.setBeanName(TEST_NEW_BEAN_NAME);
    source.getProperties().clear();
    source
        .getProperties()
        .add(new MetadataSourceProperty(source, property.getName(), property.getValue()));

    this.repository.save(source);

    final MetadataSource record = this.repository.getById(TEST_EXISTING_ID);

    assertNotNull(record);

    assertEquals(TEST_NEW_NAME, record.getName());
    assertEquals(TEST_NEW_BEAN_NAME, record.getBeanName());
  }

  @Test
  public void testDelete() {
    final MetadataSource source = this.repository.getById(TEST_EXISTING_ID);

    assertNotNull(source);

    this.repository.delete(source);

    final MetadataSource record = this.repository.getById(TEST_EXISTING_ID);

    assertNull(record);
  }
}
