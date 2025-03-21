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

package org.comixedproject.rest.metadata;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.metadata.FilenameScrapingRule;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.service.metadata.FilenameScrapingRuleException;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FilenameScrapingRuleControllerTest {
  @InjectMocks private FilenameScrapingRuleController controller;
  @Mock private FilenameScrapingRuleService filenameScrapingRuleService;
  @Mock private List<FilenameScrapingRule> ruleList;
  @Mock private List<FilenameScrapingRule> savedRuleList;
  @Mock private DownloadDocument filenameScrapingRulesFile;

  @Test
  void loadRules() {
    Mockito.when(filenameScrapingRuleService.loadRules()).thenReturn(ruleList);

    final List<FilenameScrapingRule> result = controller.loadRules();

    assertNotNull(result);
    assertSame(ruleList, result);

    Mockito.verify(filenameScrapingRuleService, Mockito.times(1)).loadRules();
  }

  @Test
  void saveRules() {
    Mockito.when(filenameScrapingRuleService.saveRules(Mockito.anyList()))
        .thenReturn(savedRuleList);

    final List<FilenameScrapingRule> result = controller.saveRules(ruleList);

    assertNotNull(result);
    assertSame(savedRuleList, result);

    Mockito.verify(filenameScrapingRuleService, Mockito.times(1)).saveRules(ruleList);
  }

  @Test
  void downloadFiles() throws FilenameScrapingRuleException {
    Mockito.when(filenameScrapingRuleService.getFilenameScrapingRulesFile())
        .thenReturn(filenameScrapingRulesFile);

    final DownloadDocument result = controller.downloadFile();

    assertNotNull(result);
    assertSame(filenameScrapingRulesFile, result);

    Mockito.verify(filenameScrapingRuleService, Mockito.times(1)).getFilenameScrapingRulesFile();
  }
}
