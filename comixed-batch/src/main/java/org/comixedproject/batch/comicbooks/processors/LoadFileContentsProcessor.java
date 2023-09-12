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

package org.comixedproject.batch.comicbooks.processors;

import static org.comixedproject.batch.comicbooks.AddComicsConfiguration.PARAM_SKIP_METADATA;

import java.io.File;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.content.ComicMetadataContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorRules;
import org.comixedproject.model.comicbooks.ComicBook;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>LoadFileContentsProcessor</code> loads metadata for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class LoadFileContentsProcessor
    implements ItemProcessor<ComicBook, ComicBook>, StepExecutionListener {
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private ComicMetadataContentAdaptor comicMetadataContentAdaptor;

  private JobParameters jobParameters;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    final ContentAdaptorRules rules = new ContentAdaptorRules();
    rules.setSkipMetadata(
        this.jobParameters.getParameters().containsKey(PARAM_SKIP_METADATA)
            ? Boolean.valueOf(this.jobParameters.getString(PARAM_SKIP_METADATA))
            : false);
    log.debug("Loading comicBook file contents: id={} rules={}", comicBook.getId(), rules);
    try {
      this.comicBookAdaptor.load(comicBook, rules);
      log.trace("Sorting comicBook pages");
      comicBook.getPages().sort((o1, o2) -> o1.getFilename().compareTo(o2.getFilename()));
      if (!rules.isSkipMetadata()) {
        final File metadataFile = new File(this.comicBookAdaptor.getMetadataFilename(comicBook));
        if (metadataFile.exists()) {
          log.trace("Loading external metadata file: {}", metadataFile.getAbsolutePath());
          this.comicMetadataContentAdaptor.loadContent(
              comicBook, "", FileUtils.readFileToByteArray(metadataFile), rules);
        }
      }
      log.trace("Returning updated comicBook");
      return comicBook;
    } catch (Exception error) {
      log.error("Error loading comic file content", error);
      return comicBook;
    }
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    this.jobParameters = stepExecution.getJobExecution().getJobParameters();
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    return null;
  }
}
