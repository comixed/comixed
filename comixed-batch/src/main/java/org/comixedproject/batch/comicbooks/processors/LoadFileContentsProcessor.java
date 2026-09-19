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

import java.io.File;
import java.util.Date;
import java.util.Objects;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorRegistry;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataService;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>LoadFileContentsProcessor</code> loads metadata for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class LoadFileContentsProcessor implements ItemProcessor<Comic, Comic> {
  @Autowired private ComicAdaptor comicAdaptor;
  @Autowired private ContentAdaptorRegistry contentAdaptorRegistry;
  @Autowired private MetadataService metadataService;
  @Autowired private MetadataSourceService metadataSourceService;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;

  @Override
  public Comic process(final Comic comic) {
    if (comic.isMissing()) {
      log.debug("Comic file missing, skipping: id={}", comic.getComicId());
      return null;
    }
    if (!comic.isLoadingFileContents()) {
      log.debug("Comic book contents already loaded: id={}", comic.getComicId());
      return comic;
    }

    try {
      final ArchiveAdaptor archiveAdaptor =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comic.getFilename());
      comic.setArchiveType(archiveAdaptor.getArchiveType());

      this.comicAdaptor.load(comic);
      log.trace("Sorting comic pages");
      this.comicAdaptor.sortPages(comic);
      final File metadataFile =
          new File(this.comicAdaptor.getMetadataFilename(comic.getFilename()));
      if (metadataFile.exists()) {
        final ContentAdaptor contentAdaptor =
            this.contentAdaptorRegistry.getContentAdaptorForFilename(
                metadataFile.getAbsolutePath());
        if (contentAdaptor != null) {
          log.trace("Loading external metadata file: {}", metadataFile.getAbsolutePath());
          contentAdaptor.loadContent(comic, "", FileUtils.readFileToByteArray(metadataFile));
        }
      }
      final String metadataWebAddress = comic.getWebAddress();
      if (StringUtils.hasLength(metadataWebAddress)) {
        log.debug("Processing metadata web address: {}", metadataWebAddress);
        final MetadataAdaptorProvider provider =
            this.metadataService.findForWebAddress(metadataWebAddress);
        if (!Objects.isNull(provider)) {
          final MetadataAdaptor adaptor = provider.create();
          final MetadataSource source =
              this.metadataSourceService.getByAdaptorName(provider.getName());
          final String referenceId = adaptor.getReferenceId(metadataWebAddress);
          Date lastScrapedDate = comic.getLastScrapedDate();
          if (Objects.isNull(lastScrapedDate)) {
            // if no last scraped date is available, then use the last modified date instead.
            lastScrapedDate = comic.getLastModifiedDate();
          }
          log.debug(
              "Setting metadata source: source={} reference id={}",
              source.getAdaptorName(),
              referenceId);
          if (Objects.isNull(comic.getMetadata())) {
            comic.setMetadata(new ComicMetadataSource(comic, source, referenceId, lastScrapedDate));
          } else {
            comic.getMetadata().setMetadataSource(source);
            comic.getMetadata().setReferenceId(referenceId);
            comic.getMetadata().setLastScrapedDate(lastScrapedDate);
          }
        }
      }
      log.trace("Returning updated comic");
      return comic;
    } catch (Throwable error) {
      log.error("Error loading comic file content", error);
      return comic;
    }
  }
}
