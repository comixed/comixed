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

package org.comixedproject.batch.comicbooks.processors;

import com.fasterxml.jackson.databind.DeserializationFeature;
import java.io.ByteArrayInputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.ComicInfoMetadataSource;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>CreateMetadataSourceProcessor</code> creates a {@link MetadataSource} for a comic during
 * processing.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class CreateMetadataSourceProcessor
    implements ItemProcessor<ComicBook, ComicBook>, InitializingBean {
  public static final String COMIC_INFO_XML = "ComicInfo.xml";
  public static final String COMIC_VINE_METADATA_ADAPTOR = "comicVineMetadataAdaptor";
  private static final int TEST_CVID_POSITION = 2;
  private final Pattern pattern =
      Pattern.compile(
          "^http.*(comicvine\\.gamespot\\.com|www\\.comicvine\\.com).*4000-([\\d]{3,6})\\/");
  @Autowired MappingJackson2XmlHttpMessageConverter xmlConverter;
  @Autowired private MetadataSourceService metadataSourceService;
  @Autowired private ComicBookAdaptor comicBookAdaptor;

  @Override
  public void afterPropertiesSet() {
    this.xmlConverter
        .getObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
  }

  @Override
  public ComicBook process(final ComicBook comicBook) throws Exception {
    try {
      log.trace("Loading ComicInfo.xml content");
      final byte[] content = this.comicBookAdaptor.loadFile(comicBook, COMIC_INFO_XML);
      if (content != null) {
        log.trace("Extracting comic metadata");
        final ComicInfo comicInfo =
            this.xmlConverter
                .getObjectMapper()
                .readValue(new ByteArrayInputStream(content), ComicInfo.class);
        if (comicInfo.getMetadata() != null) {
          final ComicInfoMetadataSource metadata = comicInfo.getMetadata();
          final String name = metadata.getName();
          final String referenceId = metadata.getReferenceId();
          log.debug("Looking up metadata source: {}", name);
          final MetadataSource source = this.metadataSourceService.getByName(name);
          if (source != null) {
            log.debug("Creating {} metadata source reference", name);
            comicBook.setMetadata(new ComicMetadataSource(comicBook, source, referenceId));
          } else {
            log.debug("No such metadata source");
          }
        } else {
          final String web = comicInfo.getWeb();
          if (StringUtils.hasLength(web)) {
            log.trace("Loading ComicVine metadata source");
            final MetadataSource source =
                this.metadataSourceService.getByAdaptorName(COMIC_VINE_METADATA_ADAPTOR);
            if (source != null) {

              log.trace("Checking if web address is for ComicVine: {}", web);
              final Matcher matcher = this.pattern.matcher(web);
              if (matcher.matches()) {
                log.trace("Web address matches: extracting ComicVine ID");
                final String comicVineId = matcher.group(TEST_CVID_POSITION);
                log.trace("Creating ComicVine metadata source reference");
                comicBook.setMetadata(new ComicMetadataSource(comicBook, source, comicVineId));
              }
            } else {
              log.debug("ComicVine metadata source not found");
            }
          }
        }
      }
    } catch (Exception error) {
      log.error("Failed to create metadata source", error);
    }
    return comicBook;
  }
}
