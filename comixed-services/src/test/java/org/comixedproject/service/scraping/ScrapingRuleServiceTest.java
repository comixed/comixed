/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.service.scraping;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.scraping.ScrapingRule;
import org.comixedproject.repositories.scraping.ScrapingRuleRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ScrapingRuleServiceTest {
  @InjectMocks private ScrapingRuleService service;
  @Mock private ScrapingRuleRepository scrapingRuleRepository;
  @Mock private List<ScrapingRule> scrapingRuleList;

  @Test
  public void testGetAllRules() {
    Mockito.when(scrapingRuleRepository.findAll()).thenReturn(scrapingRuleList);

    final List<ScrapingRule> result = service.getAllRules();

    assertNotNull(result);
    assertSame(scrapingRuleList, result);

    Mockito.verify(scrapingRuleRepository, Mockito.times(1)).findAll();
  }
}
