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

package org.comixedproject.repositories.collections;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertTrue;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import jakarta.transaction.Transactional;
import java.util.List;
import org.comixedproject.model.collections.Issue;
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
public class IssueRepositoryTest {
  private static final String TEST_PUBLISHER = "Marvel";
  private static final String TEST_SERIES = "Steve Rogers: Captain America";
  private static final String TEST_VOLUME = "2017";

  @Autowired private IssueRepository repository;

  @Test
  public void testLoadAllForUnknownSeriesAndVolume() {
    final List<Issue> result =
        repository.getAll(TEST_PUBLISHER, TEST_SERIES.substring(1), TEST_VOLUME);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testLoadAllForKnownSeriesAndVolume() {
    final List<Issue> result = repository.getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.stream().allMatch(issue -> issue.getPublisher().equals(TEST_PUBLISHER)));
    assertTrue(result.stream().allMatch(issue -> issue.getSeries().equals(TEST_SERIES)));
    assertTrue(result.stream().allMatch(issue -> issue.getVolume().equals(TEST_VOLUME)));
    assertTrue(result.stream().anyMatch(issue -> issue.isFound()));
    assertTrue(result.stream().anyMatch(issue -> !issue.isFound()));
  }

  @Transactional
  @Test
  public void testDeleteSeriesAndVolume() {
    repository.deleteSeriesAndVolume(TEST_SERIES, TEST_VOLUME);

    final List<Issue> result = repository.getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }
}
