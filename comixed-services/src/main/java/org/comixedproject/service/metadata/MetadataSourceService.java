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

import java.util.*;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.MetadataAdaptorRegistry;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.comixedproject.model.net.metadata.UpdateMetadataSourceProperty;
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
    log.debug("Identifying available metadata sources");
    final List<MetadataAdaptorProvider> adaptors = this.metadataAdaptorRegistry.getAdaptors();
    this.doRegisterMissingAdaptors(adaptors);
    final Map<String, MetadataAdaptorProvider> providerMap =
        adaptors.stream()
            .collect(Collectors.toMap(adaptor -> adaptor.getName(), adaptor -> adaptor));
    return this.metadataSourceRepository.loadMetadataSources().stream()
        .map(
            metadataSource -> {
              final MetadataAdaptorProvider provider =
                  providerMap.get(metadataSource.getAdaptorName());
              metadataSource.setAvailable(provider != null);
              if (provider != null) {
                metadataSource.setVersion(provider.getVersion());
                metadataSource.setHomepage(provider.getHomepage());
              }
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
   * @param sourceName the source name
   * @param preferred the preferred flag
   * @param properties the source properties
   * @return the saved source
   * @throws MetadataSourceException if an error occurs
   */
  @Transactional
  public MetadataSource create(
      @NonNull final String sourceName,
      @NonNull final Boolean preferred,
      @NonNull final List<UpdateMetadataSourceProperty> properties)
      throws MetadataSourceException {
    log.debug("Creating metadata source: name={} ", sourceName);
    try {
      if (preferred.booleanValue()) {
        log.debug("Marking this source as preferred");
        this.metadataSourceRepository.clearPreferredSource();
      }
      return this.metadataSourceRepository.save(
          this.doCopyMetadataSource(sourceName, preferred, properties, null));
    } catch (Exception error) {
      throw new MetadataSourceException("Failed to create metadata source", error);
    }
  }

  private MetadataSource doCopyMetadataSource(
      final String sourceName,
      final Boolean preferred,
      final List<UpdateMetadataSourceProperty> properties,
      final MetadataSource destination) {
    final MetadataSource result =
        Objects.isNull(destination) ? new MetadataSource(sourceName) : destination;
    result.setPreferred(preferred);
    final List<String> incomingPropertyNames =
        properties.stream().map(UpdateMetadataSourceProperty::getName).toList();
    log.debug("Removing properties");
    final List<MetadataSourceProperty> removed =
        result.getProperties().stream()
            .filter(entry -> !incomingPropertyNames.contains(entry.getName()))
            .toList();
    result.getProperties().removeAll(removed);
    log.debug("Adding and updating properties");
    properties.forEach(
        property -> {
          final String key = property.getName();
          final String value = property.getValue();
          final Optional<MetadataSourceProperty> entry =
              result.getProperties().stream()
                  .filter(currentProperty -> currentProperty.getName().equals(key))
                  .findFirst();
          if (entry.isPresent()) {
            log.trace("Updating metadata source property: {}=>{}", key, value);
            entry.get().setValue(value);
          } else {
            log.trace("Adding metadata source property: {}=>{}", key, value);
            result.getProperties().add(new MetadataSourceProperty(result, key, value));
          }
        });

    return result;
  }

  /**
   * Updates an existing source record.
   *
   * @param sourceId the record id
   * @param sourceName the source name
   * @param preferred the preferred flag
   * @param properties the source's properties
   * @return the saved source
   * @throws MetadataSourceException if an error occurs
   */
  @Transactional
  public MetadataSource update(
      @NonNull final Long sourceId,
      @NonNull final String sourceName,
      @NonNull final Boolean preferred,
      @NonNull final List<UpdateMetadataSourceProperty> properties)
      throws MetadataSourceException {
    log.debug(
        "Updating existing metadata source: id={} name={} bean name={} preferred={}",
        sourceId,
        sourceName,
        preferred);
    try {
      if (preferred.booleanValue()) {
        log.debug("Marking this source as preferred: clearing existing preferences");
        this.metadataSourceRepository.clearPreferredSource();
      }
      return this.metadataSourceRepository.save(
          this.doCopyMetadataSource(sourceName, preferred, properties, this.doGetById(sourceId)));
    } catch (Exception error) {
      throw new MetadataSourceException("Failed to update metadata source", error);
    }
  }

  /**
   * Deletes the source with the given record id.
   *
   * @param id the record id
   * @return the metadata sources
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
