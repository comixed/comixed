/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.scrapers.comicvine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.IOUtils;
import org.comixed.model.comic.Comic;
import org.comixed.model.comic.Publisher;
import org.comixed.repositories.comic.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ComicVinePublisherDetailsResponseProcessor {
  private static final Map<String, String> IMPRINT_MAPPINGS = new HashMap<>();

  static {
    IMPRINT_MAPPINGS.put("2000AD", "DC Comics");
    IMPRINT_MAPPINGS.put("Adventure", "Malibu");
    IMPRINT_MAPPINGS.put("Aircel Publishing", "Malibu");
    IMPRINT_MAPPINGS.put("America's Best Comics", "DC Comics");
    IMPRINT_MAPPINGS.put("Wildstorm", "DC Comics");
    IMPRINT_MAPPINGS.put("Antimatter", "Amryl Entertainment");
    IMPRINT_MAPPINGS.put("Apparat", "Avatar Press");
    IMPRINT_MAPPINGS.put("Black Bull", "Wizard");
    IMPRINT_MAPPINGS.put("Blu Manga", "Tokyopop");
    IMPRINT_MAPPINGS.put("Chaos! Comics", "Dynamite Entertainment");
    IMPRINT_MAPPINGS.put("Cliffhanger", "DC Comics");
    IMPRINT_MAPPINGS.put("CMX", "DC Comics");
    IMPRINT_MAPPINGS.put("Comic Bom Bom", "Kodansha");
    IMPRINT_MAPPINGS.put("ComicsLit", "Nbm");
    IMPRINT_MAPPINGS.put("Curtis Magazines", "Marvel");
    IMPRINT_MAPPINGS.put("Dark Horse Books", "Dark Horse Comics");
    IMPRINT_MAPPINGS.put("Dark Horse Manga", "Dark Horse Comics");
    IMPRINT_MAPPINGS.put("Desperado Publishing", "Image");
    IMPRINT_MAPPINGS.put("Epic", "Marvel");
    IMPRINT_MAPPINGS.put("Eternity", "Malibu");
    IMPRINT_MAPPINGS.put("Focus", "DC Comics");
    IMPRINT_MAPPINGS.put("Helix", "DC Comics");
    IMPRINT_MAPPINGS.put("Hero Comics", "Heroic Publishing");
    IMPRINT_MAPPINGS.put("Homage comics", "DC Comics");
    IMPRINT_MAPPINGS.put("Hudson Street Press", "Penguin Group");
    IMPRINT_MAPPINGS.put("Icon Comics", "Marvel");
    IMPRINT_MAPPINGS.put("Impact", "DC Comics");
    IMPRINT_MAPPINGS.put("Jets Comics", "Hakusensha");
    IMPRINT_MAPPINGS.put("KiZoic", "Ape Entertainment");
    IMPRINT_MAPPINGS.put("Marvel Digital Comics Unlimited", "Marvel");
    IMPRINT_MAPPINGS.put("Marvel Knights", "Marvel");
    IMPRINT_MAPPINGS.put("Marvel Music", "Marvel");
    IMPRINT_MAPPINGS.put("Marvel Soleil", "Marvel");
    IMPRINT_MAPPINGS.put("Marvel UK", "Marvel");
    IMPRINT_MAPPINGS.put("Maverick", "Dark Horse Comics");
    IMPRINT_MAPPINGS.put("Max", "Marvel");
    IMPRINT_MAPPINGS.put("Milestone", "DC Comics");
    IMPRINT_MAPPINGS.put("Minx", "DC Comics");
    IMPRINT_MAPPINGS.put("Papercutz", "Nbm");
    IMPRINT_MAPPINGS.put("Paradox Press", "DC Comics");
    IMPRINT_MAPPINGS.put("Piranha Press", "DC Comics");
    IMPRINT_MAPPINGS.put("Razorline", "Marvel");
    IMPRINT_MAPPINGS.put("ShadowLine", "Image");
    IMPRINT_MAPPINGS.put("Sin Factory Comix", "Radio Comix");
    IMPRINT_MAPPINGS.put("Skybound", "Image");
    IMPRINT_MAPPINGS.put("Slave Labor", "Slg Publishing");
    IMPRINT_MAPPINGS.put("Star Comics", "Marvel");
    IMPRINT_MAPPINGS.put("Tangent Comics", "DC Comics");
    IMPRINT_MAPPINGS.put("Tokuma Comics", "Tokuma Shoten");
    IMPRINT_MAPPINGS.put("Ultraverse", "Malibu");
    IMPRINT_MAPPINGS.put("Vertigo", "DC Comics");
    IMPRINT_MAPPINGS.put("Zuda Comics", "DC Comics");
  }

  @Autowired private ObjectMapper objectMapper;
  @Autowired private ComicVineResponseAdaptor responseAdaptor;
  @Autowired private PublisherRepository publisherRepository;

  public void process(byte[] content, Comic comic) throws ComicVineAdaptorException {
    log.debug("Validating ComicVine response content");
    this.responseAdaptor.checkForErrors(content);

    try {
      JsonNode jsonNode = this.objectMapper.readTree(content);
      String publisher = jsonNode.get("results").get("name").asText();
      String comicVineId = jsonNode.get("results").get("id").asText();
      String comicVineUrl = jsonNode.get("results").get("site_detail_url").asText();
      String description = jsonNode.get("results").get("deck").asText();
      String thumbnailUrl = jsonNode.get("results").get("image").get("thumb_url").asText();
      String logoUrl = jsonNode.get("results").get("image").get("small_url").asText();

      if (IMPRINT_MAPPINGS.containsKey(publisher)) {
        log.debug("Publisher is an imprint");
        comic.setPublisher(IMPRINT_MAPPINGS.get(publisher));
        comic.setImprint(publisher);
      } else {
        log.debug("Publisher is not an imprint");
        comic.setPublisher(publisher);
        comic.setImprint("");
      }

      // create or update the publisher record
      log.debug("Updating publisher record");
      Publisher publisherRecord = this.publisherRepository.findByComicVineId(comicVineId);
      if (publisherRecord == null) {
        log.debug("No such publisher: creating new record");
        publisherRecord = new Publisher();
        publisherRecord.setComicVineId(comicVineId);
        publisherRecord.setComicVineUrl(comicVineUrl);
      }
      publisherRecord.setName(publisher);
      publisherRecord.setDescription(description);
      publisherRecord.setLogo(this.loadImageFromUrl(logoUrl));
      publisherRecord.setThumbnail(this.loadImageFromUrl(thumbnailUrl));
      this.publisherRepository.save(publisherRecord);
    } catch (IOException error) {
      throw new ComicVineAdaptorException("Failed to get publisher details", error);
    }
  }

  private byte[] loadImageFromUrl(String url) {
    try {
      return IOUtils.toByteArray(new URL(url));
    } catch (IOException error) {
      log.error("failed to load image from url: " + url, error);
    }
    return null;
  }
}
