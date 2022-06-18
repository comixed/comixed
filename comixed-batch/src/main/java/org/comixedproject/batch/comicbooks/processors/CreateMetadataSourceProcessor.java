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
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.ComicInfo;
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

  @Autowired private MetadataSourceService metadataSourceService;
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired MappingJackson2XmlHttpMessageConverter xmlConverter;

  private Pattern pattern =
      Pattern.compile("^http.*comicvine\\.gamespot\\.com.*4000-([\\d]{3,6})\\/");

  @Override
  public void afterPropertiesSet() {
    this.xmlConverter
        .getObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
  }

  @Override
  public ComicBook process(final ComicBook comicBook) throws Exception {
    log.trace("Loading ComicVine metadata source");
    final MetadataSource source = this.metadataSourceService.getByName(COMIC_VINE_METADATA_ADAPTOR);
    if (source != null) {
      try {
        log.trace("Loading ComicInfo.xml content");
        final byte[] content = this.comicBookAdaptor.loadFile(comicBook, COMIC_INFO_XML);
        if (content != null) {
          log.trace("Extracting comic metadata");
          final ComicInfo comicInfo =
              this.xmlConverter
                  .getObjectMapper()
                  .readValue(new ByteArrayInputStream(content), ComicInfo.class);
          final String web = comicInfo.getWeb();
          if (StringUtils.hasLength(web)) {
            log.trace("Checking if web address is for ComicVine: {}", web);
            final Matcher matcher = this.pattern.matcher(web);
            if (matcher.matches()) {
              log.trace("Web address matches: extracting ComicVine ID");
              final String comicVineId = matcher.group(1);
              log.trace("Creating metadata source for comic");
              comicBook.setMetadata(new ComicMetadataSource(comicBook, source, comicVineId));
            }
          }
        }
      } catch (IOException error) {
        log.error("Failed to create metadata source", error);
      }
    } else {
      log.trace("No ComicVine metadata source found");
    }
    return comicBook;
  }
}
