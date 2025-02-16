/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.service.collections;

import static junit.framework.TestCase.*;

import java.util.List;
import java.util.stream.Stream;
import org.comixedproject.model.collections.PublisherDetail;
import org.comixedproject.repositories.collections.PublisherDetailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PublisherDetailServiceTest {
  private static final int TEST_PAGE_INDEX = 32;
  private static final int TEST_PAGE_SIZE = 25;
  private static final long TEST_PUBLISHER_COUNT = 475L;

  @InjectMocks private PublisherDetailService service;
  @Mock private PublisherDetailRepository publisherDetailRepository;
  @Mock private List<PublisherDetail> publisherDetailList;
  @Mock private Stream<PublisherDetail> publisherDetailStream;
  @Mock private Page<PublisherDetail> publisherDetailPage;

  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;

  @BeforeEach
  public void setUp() {
    Mockito.when(publisherDetailStream.toList()).thenReturn(publisherDetailList);
    Mockito.when(publisherDetailPage.stream()).thenReturn(publisherDetailStream);
  }

  @Test
  void getAllPublishers_sortedByName_ascending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("name", "asc");
  }

  @Test
  void getAllPublishers_sortedByName_descending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("name", "desc");
  }

  @Test
  void getAllPublishers_sortedByIssueCount_ascending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("issue-count", "asc");
  }

  @Test
  void getAllPublishers_sortedByIssueCount_descending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("issue-count", "desc");
  }

  @Test
  void getAllPublishers_sortedBySeriesCount_ascending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("series-count", "asc");
  }

  @Test
  void getAllPublishers_sortedBySeriesCount_descending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("series-count", "desc");
  }

  @Test
  void getAllPublishers_sortedByUnknown_ascending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("series-counts", "asc");
  }

  @Test
  void getAllPublishers_sortedByUnknown_descending() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    doGetAllPublishersTest("series-counts", "desc");
  }

  @Test
  void getAllPublishers_unsorted() {
    Mockito.when(publisherDetailRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(publisherDetailPage);

    final List<PublisherDetail> result =
        service.getAllPublishers(TEST_PAGE_INDEX, TEST_PAGE_SIZE, "", "");

    assertNotNull(result);
    assertSame(publisherDetailList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertFalse(pageable.getSort().isSorted());

    Mockito.verify(publisherDetailRepository, Mockito.times(1)).findAll(pageable);
  }

  @Test
  void getPublisherCount() {
    Mockito.when(publisherDetailRepository.getPublisherCount()).thenReturn(TEST_PUBLISHER_COUNT);

    final long result = service.getPublisherCount();

    assertEquals(TEST_PUBLISHER_COUNT, result);

    Mockito.verify(publisherDetailRepository, Mockito.times(1)).getPublisherCount();
  }

  private void doGetAllPublishersTest(final String sortField, final String sortDirection) {
    List<PublisherDetail> result;
    Pageable pageable;

    result = service.getAllPublishers(TEST_PAGE_INDEX, TEST_PAGE_SIZE, sortField, sortDirection);

    assertNotNull(result);
    assertSame(publisherDetailList, result);

    pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    Mockito.verify(publisherDetailRepository, Mockito.times(1)).findAll(pageable);
  }
}
