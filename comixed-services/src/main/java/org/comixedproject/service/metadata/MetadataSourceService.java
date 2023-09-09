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

package org.comixedproject.service.metadata;

import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.MetadataAdaptorRegistry;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.comixedproject.repositories.metadata.MetadataSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>MetadataSourceService</code> provides business logic for working with instances of {@link
 * MetadataSource}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class MetadataSourceService {
  @Autowired private MetadataSourceRepository metadataSourceRepository;
  @Autowired private MetadataAdaptorRegistry metadataAdaptorRegistry;

  /**
   * Retrieves the list of metadata sources.
   *
   * @return the sources
   */
  @Transactional
  public List<MetadataSource> loadMetadataSources() {
    log.debug("Loading all metadata sources");
    final List<MetadataAdaptorProvider> adaptors = this.metadataAdaptorRegistry.getAdaptors();
    this.doRegisterMissingAdaptors(adaptors);
    final List<String> adaptorNames = adaptors.stream().map(adaptor -> adaptor.getName()).toList();
    return this.metadataSourceRepository.loadMetadataSources().stream()
        .filter(metadataSource -> adaptorNames.contains(metadataSource.getAdaptorName()))
        .map(
            metadataSource -> {
              metadataSource.setAvailable(adaptorNames.contains(metadataSource.getAdaptorName()));
              return metadataSource;
            })
        .toList();
  }

  private void doRegisterMissingAdaptors(
      final List<MetadataAdaptorProvider> metadataAdaptorProviderList) {
    log.trace("Getting existing list of metadata adaptors");
    final List<String> existingAdaptorProviders =
        this.metadataSourceRepository.loadMetadataSources().stream()
            .map(MetadataSource::getAdaptorName)
            .toList();
    metadataAdaptorProviderList.stream()
        .filter(
            metadataAdaptorProvider ->
                !existingAdaptorProviders.contains(metadataAdaptorProvider.getName()))
        .forEach(
            metadataAdaptorProvider -> {
              log.trace("Adding missing metadata adaptor: {}", metadataAdaptorProvider);
              final MetadataSource metadataSource =
                  new MetadataSource(metadataAdaptorProvider.getName());
              metadataAdaptorProvider
                  .getProperties()
                  .forEach(
                      property ->
                          metadataSource
                              .getProperties()
                              .add(new MetadataSourceProperty(metadataSource, property, "")));
              this.metadataSourceRepository.save(metadataSource);
            });
  }

  /**
   * Loads a single metadata source by record id.
   *
   * @param id the record id
   * @return the source
   * @throws MetadataSourceException if the id is invalid
   */
  public MetadataSource getById(final long id) throws MetadataSourceException {
    log.debug("Loading metadata source: id={}", id);
    return this.doGetById(id);
  }

  private MetadataSource doGetById(final long id) throws MetadataSourceException {
    final MetadataSource result = this.metadataSourceRepository.getById(id);
    if (result == null) throw new MetadataSourceException("No such metadata source: id=" + id);
    return result;
  }

  /**
   * Loads a single metadata source by the adaptor name.
   *
   * @param name the adaptor name
   * @return the source
   */
  public MetadataSource getByAdaptorName(final String name) {
    log.debug("Loading metadata source: bean name={}", name);
    return this.metadataSourceRepository.getByAdaptorName(name);
  }

  /**
   * Loads a single metadata source by the source name.
   *
   * @param name the source name
   * @return the source
   */
  public MetadataSource getByName(final String name) {
    log.debug("Loading metadata source: name={}", name);
    return this.metadataSourceRepository.getByName(name);
  }

  /**
   * Creates a new source record.
   *
   * @param source the incoming source
   * @return the saved source
   * @throws MetadataSourceException if an error occurs
   */
  @Transactional
  public MetadataSource create(final MetadataSource source) throws MetadataSourceException {
    log.debug("Creating metadata source: name={} bean name={}", source.getAdaptorName());
    try {
      if (source.getPreferred()) {
        log.debug("Marking this source as preferred: clearing existing preferences");
        this.metadataSourceRepository.clearPreferredSource();
      }
      return this.metadataSourceRepository.save(this.doCopyMetadataSource(source, null));
    } catch (Exception error) {
      throw new MetadataSourceException("Failed to create metadata source", error);
    }
  }

  private MetadataSource doCopyMetadataSource(
      final MetadataSource source, final MetadataSource destination) {
    MetadataSource result = destination;
    if (result == null) {
      log.debug("Creating new metadata source object");
      result = new MetadataSource(source.getAdaptorName());
    } else {
      log.debug("Copying metadata source name");
      result.setAdaptorName(source.getAdaptorName());
    }
    result.setPreferred(source.getPreferred());
    log.debug("Filtering out removed properties");
    final Object[] existingProperties = result.getProperties().stream().toArray();
    for (int index = 0; index < existingProperties.length; index++) {
      final MetadataSourceProperty property = (MetadataSourceProperty) existingProperties[index];
      final Optional<MetadataSourceProperty> incomingProperty =
          source.getProperties().stream()
              .filter(entry -> entry.getName().equals(property.getName()))
              .findFirst();
      if (!incomingProperty.isPresent()) {
        log.debug("Removing property: {}", property.getName());
        result.getProperties().remove(property);
      }
    }
    log.debug("Updating metadata source properties");
    for (Iterator<MetadataSourceProperty> iter = source.getProperties().iterator();
        iter.hasNext(); ) {
      final MetadataSourceProperty property = iter.next();
      final String name = property.getName();
      final Optional<MetadataSourceProperty> incomingProperty =
          result.getProperties().stream().filter(entry -> entry.getName().equals(name)).findFirst();
      final String value = property.getValue().trim();
      if (incomingProperty.isPresent()) {
        log.debug("Updated property: {}={}", name, value);
        final MetadataSourceProperty existingProperty = incomingProperty.get();
        existingProperty.setValue(value);
      } else {
        log.debug("Adding property: {}={}", name, value);
        result.getProperties().add(new MetadataSourceProperty(result, name, value));
      }
    }
    return result;
  }

  /**
   * Updates an existing source record.
   *
   * @param id the record id
   * @param source the incoming source
   * @return the saved source
   * @throws MetadataSourceException if an error occurs
   */
  @Transactional
  public MetadataSource update(final long id, final MetadataSource source)
      throws MetadataSourceException {
    log.debug(
        "Updating existing metadata source: id={} name={} bean name={} preferred={}",
        id,
        source.getAdaptorName(),
        source.getPreferred());
    try {
      if (source.getPreferred()) {
        log.debug("Marking this source as preferred: clearing existing preferences");
        this.metadataSourceRepository.clearPreferredSource();
      }
      return this.metadataSourceRepository.save(
          this.doCopyMetadataSource(source, this.doGetById(id)));
    } catch (Exception error) {
      throw new MetadataSourceException("Failed to update metadata source", error);
    }
  }

  /**
   * Deletes the source with the given record id.
   *
   * @param id the record id
   * @throws MetadataSourceException if an error occurs
   */
  @Transactional
  public List<MetadataSource> delete(final long id) throws MetadataSourceException {
    final MetadataSource source = this.doGetById(id);
    try {
      log.debug("Deleting metadata source: name={}", source.getAdaptorName());
      this.metadataSourceRepository.delete(source);
      this.metadataSourceRepository.flush();
      log.debug("Loading all metadata sources");
      return loadMetadataSources();
    } catch (Exception error) {
      throw new MetadataSourceException("Failed to delete metadata source", error);
    }
  }
}
